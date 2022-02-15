import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { Chat } from "../models/chat.model";
import Group from "../models/group.model";
import { DialogueMessage, GroupMessage } from "../models/message.model";
import User from "../models/user.model";
import chatController, { CreateReq } from "./chat.controller";
import { hasParams } from "./shared.functions";
import SharedResponses from "./shared.responses";

import ObjectId = Types.ObjectId;

const sendToUser = async (request: Request, response: Response) => {
  if (
    !hasParams(request, {
      contentType: "string",
      text: "string",
      userId: "string",
      receiverId: "string",
    })
  )
    return SharedResponses.MissingParameters(response);

  const { contentType, text, userId, receiverId } = request.body;

  const message = new DialogueMessage({
    contentType,
    text,
    sender: userId,
    receiver: receiverId,
  });

  const sender = await User.findById(userId);
  const receiver = await User.findById(receiverId);

  if (sender === null || receiver === null)
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "User(s) do not exist",
    });

  // * <--
  const specialRequest = request as CreateReq;

  specialRequest.sender = sender;
  specialRequest.receiver = receiver;
  specialRequest.message = message._id;
  // * -->

  const chat = await chatController.create(specialRequest, response);

  message.context = chat._id;
  await message.save();

  return response.status(StatusCodes.OK).json({
    message: "Done with success !",
  });
};

const sendToChat = async (request: Request, response: Response) => {
  if (
    !hasParams(request, {
      userId: "string",
      contentType: "string",
      text: "string",
    })
  )
    return SharedResponses.MissingParameters(response);

  const { contentType, text } = request.body;
  const userId = new ObjectId(request.body.userId);
  const chatId = new ObjectId(request.params.chatId);
  const chat = await Chat.findById(chatId);

  if (chat === null)
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Chat doesn't exist !",
    });

  const receiverId = chat.user1.equals(userId) ? chat.user2 : userId;

  const message = await new DialogueMessage({
    sender: userId,
    contentType,
    receiver: receiverId,
    text,
    context: chatId,
  }).save();

  chat.messages.push(message._id);
  await chat.save();

  return response.status(StatusCodes.OK).json({
    message: "Message sent successfully !",
  });
};

const sendToGroup = async (request: Request, response: Response) => {
  const { contentType, text, userId } = request.body;

  const groupId = request.params.groupId;

  const group = await Group.findById(groupId);

  if (group === null) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "This group doesn't exists",
    });
  }

  const message = await new GroupMessage({
    contentType,
    text,
    sender: userId,
    receiver: groupId,
    context: groupId,
  }).save();

  group.messages.push(message._id);
  group.save();

  return response.status(StatusCodes.OK).json({
    message: "Message sent To Group",
  });
};

const deleteMessageMiddleware =
  (target: "group" | "chat") =>
  (request: Request, response: Response, next: NextFunction) => {
    const specialRequest = request as MessageDeletionRq;
    specialRequest.messageContext = target;
    next();
  };

const deleteChatMessage = deleteMessageMiddleware("chat");
const deleteGroupMessage = deleteMessageMiddleware("group");

export interface MessageDeletionRq extends Request {
  messageContext: "chat" | "group";
}
const deleteMessage = async (request: Request, response: Response) => {
  if (!hasParams(request, { userId: "string" }))
    return SharedResponses.MissingParameters(response);

  const specialRequest = request as MessageDeletionRq;

  const userId = new ObjectId(request.body.userId);
  const messageId = new ObjectId(request.params.messageId);

  const message =
    specialRequest.messageContext === "chat"
      ? await DialogueMessage.findById(messageId)
      : await GroupMessage.findById(messageId);

  if (message === null)
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "This message is already deleted",
    });

  if (!message.sender.equals(userId)) {
    return response.status(StatusCodes.FORBIDDEN).json({
      error: "Only sender can delete sent message !",
    });
  }
  console.log("Waiting for chat to be deleted ! 🥱");

  await message.remove();

  return response.status(StatusCodes.OK).json({
    message: "Message successfully removed !",
  });
};

export default {
  sendToUser,
  sendToChat,
  sendToGroup,
  deleteMessage,
  deleteChatMessage,
  deleteGroupMessage,
};
