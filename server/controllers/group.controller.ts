import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import Group from "../models/group.model";
import { hasParams } from "./shared.functions";
import SharedResponses from "./shared.responses";

import ObjectId = Types.ObjectId;

const create = async (request: Request, response: Response) => {
  if (!hasParams(request, { name: "string", userId: "string" }))
    return SharedResponses.MissingParameters(response);

  const name = request.body.name;
  const userId = new ObjectId(request.body.userId);

  await new Group({
    name,
    createdBy: userId,
    administrators: [userId],
    members: [userId],
  }).save();

  return response.status(StatusCodes.OK).json({
    message: "Group created successfully !",
  });
};

const remove = async (request: Request, response: Response) => {
  const groupId = request.params.groupId;

  await Group.findByIdAndDelete(groupId);

  return response.status(StatusCodes.OK).json({
    message: "Group deleted successfully",
  });
};

const isGroupMember = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const userId = new ObjectId(request.body.userId);
  const groupId = request.params.groupId;

  const group = await Group.findById(groupId);

  if (group === null) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "Group doesn't exist !",
    });
  }

  if (group.members.includes(userId)) {
    const specialRequest = request as AdminVerificationRequest;
    specialRequest.isAdministrator = group.administrators.includes(userId);

    next();
  } else {
    return response.status(StatusCodes.FORBIDDEN).json({
      error: "Not authorized, user not member of group !",
    });
  }
};

interface AdminVerificationRequest extends Request {
  isAdministrator: boolean;
}
const isAdministrator = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const specialRequest = request as AdminVerificationRequest;

  if (specialRequest.isAdministrator === true) {
    next();
  } else {
    return response.status(StatusCodes.FORBIDDEN).json({
      message: "Not authorized, user doesn't have necessary rights !",
    });
  }
};

const addAdministrator = async (request: Request, response: Response) => {
  if (!hasParams(request, { userId: "string", targetUserId: "string" }))
    return SharedResponses.MissingParameters(response);

  const groupId = new ObjectId(request.params.groupId);
  const targetUserId = request.body.targetUserId;

  try {
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { administrators: new ObjectId(targetUserId) },
    });
  } catch (err) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: err,
    });
  }

  return response.status(StatusCodes.OK).json({
    message: "Group administrator set successully !",
  });
};

const removeAdministrator = async (request: Request, response: Response) => {
  if (!hasParams(request, { userId: "string", targetUserId: "string" }))
    return SharedResponses.MissingParameters(response);

  const targetUserId = new ObjectId(request.body.targetUserId);
  const groupId = new ObjectId(request.params.groupId);

  try {
    await Group.findByIdAndUpdate(groupId, {
      $pull: { administrators: targetUserId },
    });
    return response.status(StatusCodes.OK).json({
      message: "User successfully removed from administrators !",
    });
  } catch (err) {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: err,
    });
  }
};

const addMembers = async (request: Request, response: Response) => {
  if (!hasParams(request, { userId: "string", targetUsers: "array" }))
    return SharedResponses.MissingParameters(response);

  const targetUsers = (request.body.targetUsers as string[]).map(
    (id) => new ObjectId(id)
  );
  const groupId = request.params.groupId;

  const group = await Group.findById(groupId);

  if (group === null)
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "This group doesn't exist !",
    });

  await group.updateOne({
    $addToSet: { members: targetUsers },
  });

  return response.status(StatusCodes.OK).json({
    message: `Successfully added to "${group.name}"`,
  });
};

const removeMembers = async (request: Request, response: Response) => {
  if (
    !hasParams(request, {
      targetUsers: "array",
    })
  )
    return SharedResponses.MissingParameters(response);

  const targetUsers = (request.body.targetUsers as string[]).map(
    (id) => new ObjectId(id)
  );

  const groupId = request.params.groupId;

  const group = await Group.findById(groupId);

  if (group === null)
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "This group doesn't exist !",
    });

  await group.updateOne({
    $pullAll: { members: targetUsers },
  });

  return response.status(StatusCodes.OK).json({
    message: `User removed from ${group.name} successfully !`,
  });
};

export default {
  create,
  remove,
  isGroupMember,
  isAdministrator,
  addMembers,
  removeMembers,
  addAdministrator,
  removeAdministrator,
};
