import { Request, Response } from "express";
import HttpStatusCode from "../../lib/enums/HttpStatusCode";
import RoomManager from "../../lib/utils/roomManager";

export const getHealth = async (_: Request, response: Response) => {
  try {
    response.status(HttpStatusCode.OK).json({ message: "Healthy" });
  } catch (error) {
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};

export const getStatus = async (_: Request, response: Response) => {
  try {
    const rm = RoomManager.getInstance();

    const data = {
      count: rm.count(),
      rooms: rm.list()
    }

    response.status(HttpStatusCode.OK).json(data);
  } catch (error) {
    console.log(error);
    response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message: "An unexpected error has occurred.",
    });
  }
};
