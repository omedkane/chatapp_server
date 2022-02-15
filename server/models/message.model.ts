import { Date, Document, model, Schema, Types } from "mongoose";
import { Chat } from "./chat.model";
import Group from "./group.model";
import { MessageContentType, ReceiverType } from "./message.types";
import Refs from "./refs";

export interface IMessageSchema {
  contentType: MessageContentType;
  text: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  receiverType: ReceiverType;
  dateSent?: Date;
  isRead?: boolean;
  context: Types.ObjectId;
}

export interface MessageModel extends IMessageSchema, Document {}

export const createSchema = (receiverType: ReceiverType) => {
  const isGroupMessage = receiverType === "group";

  return new Schema<IMessageSchema>({
    contentType: {
      type: String,
      enum: ["text", "audio", "video", "voice"],
      immutable: true,
    },
    text: {
      type: String,
    },
    sender: {
      type: Types.ObjectId,
      ref: Refs.User,
      immutable: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: isGroupMessage ? Refs.Group : Refs.User,
      immutable: true,
    },
    dateSent: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    isRead: {
      type: Boolean,
      default: () => false,
    },
    context: {
      type: Types.ObjectId,
      immutable: true,
      ref: isGroupMessage ? Refs.Group : Refs.Chat,
    },
    receiverType: {
      type: String,
      enum: ["user", "group"] as ReceiverType[],
      immutable: true,
      default: () => receiverType,
    },
  });
};

export const createModel = (receiverType: ReceiverType) => {
  const modelName =
    receiverType === "user" ? Refs.DialogueMessage : Refs.GroupMessage;
  return model(modelName, createSchema(receiverType));
};

// - Dialogue Message Schema
export const DialogueMessageSchema = createSchema("user");

DialogueMessageSchema.pre("remove", async function (this: MessageModel) {
  
  console.log("Successfully removed it all ✔✔✔");
  
  await Chat.findByIdAndUpdate(this.context, {
    $pull: { messages: this._id },
  });
});

// - Group Message Schema
export const GroupMessageSchema = createSchema("group");

GroupMessageSchema.pre("remove", async function (this: MessageModel) {
  await Group.findByIdAndUpdate(this.context, {
    $pull: { messages: this._id },
  });
});

// - Exports
export const DialogueMessage = model(
  Refs.DialogueMessage,
  DialogueMessageSchema
);
export const GroupMessage = model(Refs.GroupMessage, GroupMessageSchema);
