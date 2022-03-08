import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import groupRoutes from "./routes/group.routes";
import userRoutes from "./routes/user.routes";
import multer from "multer";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(compress());
app.use(cors());

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/groups", groupRoutes)
app.use("/auth", authRoutes);

app.use(
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    if (error.name === "UnauthorizedError") {
      response.status(401).json({
        error: `error.name : ${error.message}`,
      });
    } else if (error) {
      response.status(400).json({
        error: `error.name : ${error.message}`,
      });
      console.log(error);
    }
  }
);

export default app;
