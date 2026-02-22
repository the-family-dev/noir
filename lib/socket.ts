"use-client";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/server/types";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
