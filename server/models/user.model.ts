import crypto from "crypto";
import { Date, Document, Model, model, Schema, Types } from "mongoose";

interface IUserSchema {
  // name: string;
  firstName: string;
  lastName: string;
  email: string;
  created: Date;
  updated: number;
  avatar: string;
  chats: Types.ObjectId[];
  hashed_password?: string;
  salt?: string;
  _password: string;
}

interface IMethods {
  encryptPassword: (password: string) => any;
  authenticate: (plainText: string) => any;
  makeSalt: () => string;
}

export interface UserModel extends IUserSchema, IMethods, Document {}

export const UserSchema = new Schema<UserModel, Model<UserModel>, IMethods>({
  firstName: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
  },
  avatar: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    required: [true, "Email is required"],
  },
  created: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updated: Date,
  hashed_password: {
    type: String,
    required: [true, "Password is required"],
  },
  salt: String,
  chats: [Types.ObjectId],
});

UserSchema.methods = <IMethods>{
  encryptPassword: function (this: UserModel, password: string) {
    if (!password || this.salt === undefined) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  authenticate: function (this: UserModel, plainText: string) {
    return this.encryptPassword(plainText) == this.hashed_password;
  },
  makeSalt: function (): string {
    return Math.round(new Date().valueOf() * Math.random()).toString();
  },
};

UserSchema.virtual("password")
  .set(function (this: UserModel, password: string) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function (this: UserModel) {
    return this._password;
  });

UserSchema.path("hashed_password").validate(function (this: UserModel) {
  if (this._password && this._password.length < 6) {
    this.invalidate("password", "Password must be at least six characters.");
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password is required.");
  }
});

const User = model("User", UserSchema);

export default User;
