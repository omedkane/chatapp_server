import { Request, Response } from "express";

type RequestHandler = <T = any>(request: Request, response: Response) => Promise<T>;