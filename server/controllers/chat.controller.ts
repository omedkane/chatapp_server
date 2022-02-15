import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { Chat } from "../models/chat.model";
import { UserModel } from "../models/user.model";
import { hasParams } from "./shared.functions";
import SharedResponses from "./shared.responses";

import ObjectId = Types.ObjectId;

type CreateReq = Request & {
  sender: UserModel;
  receiver: UserModel;
  message: Types.ObjectId;
};
const create = async (request: CreateReq, response: Response) => {
  const { sender, receiver, message } = request;

  const chat = await new Chat({
    user1: sender._id,
    user2: receiver._id,
    messages: [message],
  }).save();

  const userUpdates = {
    $addToSet: { chats: chat._id },
  };
  await sender.updateOne(userUpdates);
  await receiver.updateOne(userUpdates);

  return chat;
};

const remove = async (request: Request, response: Response) => {
  if (!hasParams(request, { userId: "string" }))
    return SharedResponses.MissingParameters(response);

  const chatId = new ObjectId(request.params.chatId);

  const chat = await Chat.findById(chatId);

  const userId = new ObjectId(request.body.userId);

  if (chat === null)
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "This chat does not exist !",
    });

  const isAuthorized =
    chat.user1.equals(userId) || chat.user2.equals(userId);

  if (!isAuthorized)
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "User doesn't have the rights necessary perform such actions !",
    });

  await chat.remove();

  return response.status(StatusCodes.OK).json({
    message: "Chat deleted successfully !",
  });
};

export default { create, remove };
export type { CreateReq };
