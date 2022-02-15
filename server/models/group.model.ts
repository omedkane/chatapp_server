import { Date, Document, model, Schema, Types } from "mongoose";
import { GroupMessage } from "./message.model";
import Refs from "./refs";

interface IGroupSchema {
  name: string;
  members: Types.ObjectId[];
  dateCreated: Date;
  createdBy: Types.ObjectId;
  administrators: [Types.ObjectId];
  messages: Types.ObjectId[];
}

export interface GroupModel extends IGroupSchema, Document {}

export const GroupSchema = new Schema<IGroupSchema>({
  name: String,
  members: {
    type: [Types.ObjectId],
    ref: Refs.User,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  createdBy: {
    type: Types.ObjectId,
    ref: Refs.User,
  },
  administrators: {
    type: [Types.ObjectId],
    ref: Refs.User,
    validate: [
      {
        validator: (arr: Types.ObjectId[]) => arr.length <= 3,
        message: "Group can only have 3 administrators at most !",
      },
      {
        validator: (arr: Types.ObjectId[]) => arr.length >= 1,
        message: "Group must have at least one administrator !",
      },
    ],
  },
  messages: {
    type: [Types.ObjectId],
    ref: Refs.GroupMessage,
    default: () => [],
  },
});

GroupSchema.index({ creator: 1, name: 1 }, { unique: true });

GroupSchema.pre("remove", async function (this: GroupModel) {
  await GroupMessage.deleteMany({
    context: this._id
  });
  console.log("removed all the messages");
});

const Group = model(Refs.Group, GroupSchema);

export default Group;
