import logger from '../../lib/utils/logger';
import { redis } from '../../models/db';

const EXPIRY = 3610; // 1 hour 10 seconds

/**
 * Getters
 */

async function getEditorContent(roomId: string) {
    try {
        let data = await redis.get(`${roomId}_content`);
        return data;
    } catch (error) {
        logger.debug(`[getEditorContent]: ${error}`);
        return "";
    }
}

async function getSessionEndTime(roomId: string) {
    try {
        let data = await redis.hget(`${roomId}`, `sessionEndTime`);
        return data;
    } catch (error) {
        logger.debug(`[getSessionEndTime]: ${error}`);
        return ""
    }
}

async function getMessages(roomId: string) {   
    try { 
        // Retrieve the whole list
        let data = await redis.lrange(`${roomId}_messages`, 0, -1);
        return data;
    } catch (error) {
        logger.debug(`[getMessages]: ${error}`);
        return [];
    }
}

async function getSessionDetails(roomId: string) {
    // Returns { sessionEndTime: string, users: string[] }
    try {
        return await redis.hgetall(roomId); 
    } catch (error) {
        logger.debug(`[getSessionDetails]: ${error}`);
        return {};
    }
}

async function getUserIds(roomId: string) {
    // Returns "userId1,userId2" 
    return await redis.hget(roomId, 'users');
}

/**
 * Setters
 */

function setSessionDetails(roomId: string, sessionDetails: { sessionEndTime: string, users: string[] }) {
    redis.hset(roomId, sessionDetails);
    redis.expire(roomId, EXPIRY, 'XX'); 
}

function setUserIds(roomId: string, userIds: string) {
    redis.hset(roomId, 'users', userIds);
}
  
function setCodeChange(roomId: string, content: string) {
    redis.set(`${roomId}_content`, content);    
    redis.expire(`${roomId}_messages`, EXPIRY, 'NX');
}

function appendMessage(roomId: string, message: string) {
    redis.lpush(`${roomId}_messages`, message);
    redis.expire(`${roomId}_messages`, EXPIRY, 'NX');
}

/**
 * Deletes
 */

function delCodeChange(roomId: string) {
    redis.del(`${roomId}_content`);
}

function delMessages(roomId: string) {
    redis.del(`${roomId}_messages`)
}

function delSessionDetails(roomId: string) {
    redis.del(roomId);
}

/**
 * Checks
 */
function doesRoomIdExist(roomId: string) {
    return redis.exists(roomId);
}

export const RedisHandler = {
    getSessionEndTime,
    getEditorContent,
    getMessages,
    getSessionDetails,
    getUserIds,
    setSessionDetails,
    setCodeChange,
    setUserIds,
    appendMessage,
    delCodeChange,
    delMessages,
    delSessionDetails,
    doesRoomIdExist
}
