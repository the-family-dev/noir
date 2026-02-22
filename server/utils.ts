import { TBaseApiResponse } from "./types";

export function getBaseResponse<T>(): TBaseApiResponse<T> {
  const response: TBaseApiResponse<T> = {
    success: false,
    message: "Unknown server error",
  };

  return response;
}
