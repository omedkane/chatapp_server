import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { extend } from "lodash";
import DbErrorHandler from "../helpers/dbErrorHandler";
import User, { UserModel } from "../models/user.model";
import { hasParams } from "./shared.functions";
import SharedResponses from "./shared.responses";
import multer from "multer";
import path from "path";
import { rename, unlink } from "fs";
import { __srcDir } from "../core/constants/directories";

const create = async (request: Request, response: Response) => {
  if (
    !hasParams(request, {
      firstName: "string",
      lastName: "string",
      email: "string",
      password: "string",
    })
  )
    return SharedResponses.MissingParameters(response);
  const { firstName, lastName, email, password, avatar } = request.body;
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    avatar: "",
  });
  try {
    await user.save();
    return response.status(200).json({
      message: "Successfully Signed Up",
    });
  } catch (error: any) {
    return response.status(400).json({
      error: DbErrorHandler.getErrorMessage(error),
    });
  }
};
const list = async (request: Request, response: Response) => {
  try {
    let users = await User.find().select(
      "firstName lastName email updated created"
    );
    response.json(users);
  } catch (error: any) {
    return response.status(400).json({
      error: DbErrorHandler.getErrorMessage(error),
    });
  }
};
export interface RequestWithUser extends Request {
  profile: UserModel;
}

const userById = async (
  request: Request,
  response: Response,
  next: NextFunction,
  id: string
) => {
  try {
    let user = await User.findById(id);

    if (!user) {
      return response.status(400).json({
        error: "User not found",
      });
    }
    const req = request as RequestWithUser;

    req.profile = user;

    next();
  } catch (error) {
    return response.status(400).json({
      error: "Could not retrieve user",
    });
  }
};
const read = (request: Request, response: Response) => {
  const req = request as RequestWithUser;

  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;

  response.status(StatusCodes.OK).json(req.profile);
};

const update = async (request: Request, response: Response) => {
  try {
    let user = (request as RequestWithUser).profile;

    user = extend(user, request.body);
    user.updated = Date.now();

    await user.save();

    user.hashed_password = undefined;
    user.salt = undefined;

    response.json(user);
  } catch (error: any) {
    return response.status(400).json({
      error: DbErrorHandler.getErrorMessage(error),
    });
  }
};

const updateAvatar = async (request: Request, response: Response) => {
  if (request.file === undefined) {
    console.log("it messed here !");
    console.log(request.files?.length);
    console.log(request.body.avatar);
    console.log(JSON.stringify(request.body));

    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Avatar must be a valid image file",
    });
  }

  const imageFile = request.file;
  const imageName = request.file.originalname;
  const imageExt = path.extname(imageName).toLowerCase();
  const imageNameMod = Date.now().toString() + "_" + imageName;

  const imageOldPath = imageFile.path;
  const imageNewPath = `${__srcDir}/uploads/users/avatars/${imageNameMod}`;

  if (imageExt !== ".png" && imageExt !== ".jpg")
    return unlink(imageOldPath, (error) => {
      console.log({ error });

      return response.status(StatusCodes.BAD_REQUEST).json({
        error: "Avatar must be a valid image file",
      });
    });

  return rename(imageOldPath, imageNewPath, async (error) => {
    if (error) {
      return response
        .status(StatusCodes.BAD_REQUEST)
        .json({
          error: "An error occured while renaming the image !",
        })
        .end();
    }

    const user = (request as RequestWithUser).profile;
    user.avatar = imageNameMod;

    await user.save();

    return response.status(StatusCodes.OK).json({
      message: "success really happened !",
    });
  });
};

const getAvatar = async (request: Request, response: Response) => {
  const avatar = (request as RequestWithUser).profile.avatar;

  if (avatar !== null && avatar !== undefined) {
    return response
      .setHeader("Cross-Origin-Resource-Policy", "same-site")
      .sendFile(__srcDir + "./uploads/users/avatars/" + avatar);
  } else
    return response
      .setHeader("Cross-Origin-Resource-Policy", "same-site")
      .sendFile(__srcDir + "/assets/images/default_avatar.png");
};

const remove = async (request: Request, response: Response) => {
  try {
    let user = (request as RequestWithUser).profile;
    let deletedUser = await user.remove();
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    response.json(deletedUser);
  } catch (error: any) {
    return response.status(400).json({
      error: DbErrorHandler.getErrorMessage(error),
    });
  }
};

export default {
  create,
  list,
  userById,
  read,
  update,
  remove,
  updateAvatar,
  getAvatar,
};
