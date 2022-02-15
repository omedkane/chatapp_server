import { Document, model, Schema, Types } from "mongoose";
import { DialogueMessage } from "./message.model";
import Refs from "./refs";
import User from "./user.model";

export interface IChatSchema {
  user1: Types.ObjectId;
  user2: Types.ObjectId;
  messages: Types.ObjectId[];
}

export interface ChatModel extends IChatSchema, Document {}

export const ChatSchema = new Schema<IChatSchema>({
  user1: {
    type: Types.ObjectId,
    required: true,
    ref: Refs.User,
  },
  user2: {
    type: Types.ObjectId,
    required: true,
    ref: Refs.User,
  },
  messages: [{ type: Types.ObjectId, ref: Refs.DialogueMessage }],
});

ChatSchema.index({ user1: 1, user2: 1 }, { unique: true });

ChatSchema.pre("remove", async function (this: ChatModel) {
  await User.updateMany(
    { $or: [{ _id: this.user1 }, { _id: this.user2 }] },
    { $pull: { chats: this._id } }
  );

  await DialogueMessage.deleteMany({
    $or: this.messages.map((msg) => ({ _id: msg })),
  });
});

export const Chat = model(Refs.Chat, ChatSchema);
