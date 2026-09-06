import { HttpError } from "./http-error";

export const getStringParam = (value: string | string[] | undefined, name: string) => {
  if (typeof value === "string") {
    return value;
  }

  throw new HttpError(400, `Route parameter ${name} is required.`, {
    code: "missing_route_param",
  });
};
