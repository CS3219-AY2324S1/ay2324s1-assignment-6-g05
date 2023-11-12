import logger from "../../lib/utils/logger";
import { RedisHandler } from "./redis-handler";

function handleRedisMessage(channel: string, message: string) {
    const data = JSON.parse(message);
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const sessionDetails: { sessionEndTime: string, users: string[]} = {
        sessionEndTime: now.toISOString(),
        users: [data.user1, data.user2]
    }
    RedisHandler.setSessionDetails(data.roomId, sessionDetails);
}

export const PubSubHandler = {
    handleRedisMessage
}