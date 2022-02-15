import { Request } from "express";
import { Params } from "./shared.types";

const hasParams = (request: Request, paramsProto: Params): boolean => {
  const body: {
    [key: string]: any;
  } = request.body;

  for (const param in paramsProto) {
    if (!body.hasOwnProperty(param)) return false;
    
    const expectedType = paramsProto[param];
    const providedParam = body[param];
    const providedParamType = typeof providedParam;

    switch (expectedType) {
      case "optional":
        continue;
      case "number":
      case "string":
        if (providedParamType !== expectedType) return false;
        break;
      case "literal":
        if (providedParamType !== "object" || providedParam instanceof Array)
          return false;
        break;
      case "array":
        if (!(providedParam instanceof Array)) return false;
        break;
      default:
        const _exhaustiveCheck: never = expectedType;
        break;
    }
  }
  return true;
};

export { hasParams };

