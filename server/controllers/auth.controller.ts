import { NextFunction, Request, Response } from "express";
import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";
import config from "../../config/config";
import User from "../models/user.model";
import { RequestWithUser } from "./user.controller";

const signIn = async (request: Request, response: Response) => {
  try {
    let user = await User.findOne({
      email: request.body.email,
    });
    if (!user)
      return response.status(401).json({
        error: "User not found",
      });
    if (!user.authenticate(request.body.password))
      return response.status(401).json({
        error: "Email and password don't match.",
      });

    const token = jwt.sign(
      {
        _id: user._id,
      },
      config.jwtSecret
    );
    response.cookie("t", token, { expires: new Date(Date.now() + 9999) });
    return response.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err: any) {
    return response.status(401).json({
      error: "Could not sign in",
    });
  }
};
const signOut = async (request: Request, response: Response) => {
  response.clearCookie("t");
  return response.json("200").json({
    message: "signed out",
  });
};
const requireSignIn = expressJwt({
  secret: config.jwtSecret,
  userProperty: "auth",
  algorithms: ["HS256"],
});

type RequestWithAuth = RequestWithUser & { auth: any };

const hasAuthorization = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  let req = request as RequestWithAuth;
  
  const authorized =
    req.profile && req.auth && req.profile._id == req.auth._id;

    if(!authorized){
      return response.status(403).json({
        error: "User is not authorized."
      })
    }
    next();
};

export default { signIn, signOut, requireSignIn, hasAuthorization };
