import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export default abstract class SharedResponses {
  static MissingParameters = (response: Response) => {
    return response.status(StatusCodes.BAD_REQUEST).json({
      error: "An Error occured, missing parameters",
    });
  };
}
