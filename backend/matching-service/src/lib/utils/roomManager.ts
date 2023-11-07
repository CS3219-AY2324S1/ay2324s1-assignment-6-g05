import Preference from "../../models/types/preference";
import Room from "../../models/types/room";
import { encodePreferences, getOverlappedPreferences, ifPreferenceOverlapped } from "./encoder";
import Partner from "../../models/types/partner";

export default class RoomManager {
    private static instance: RoomManager;
    private rooms: Room[] = [];

    public static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    findMatchElseCreateRoom(
        user: Partner,
        preferences: Preference,
        matched: (room: Room) => void,
        roomCreated: (room: Room) => void,
    ) {
        let encoded = encodePreferences(preferences)
        let room = this.rooms.find(r =>
            r.preferences.id == encoded &&
            !r.matched &&
            (r.owner as Partner).id !== user.id)

        if (room) {
            room.matched = true;
            room.partner = user;
            matched(room);
            return;
        }

        // No exact match, relax criteria
        preferences.code = encoded.preferenceId;
        preferences.languageCode = encoded.languageCode;
        preferences.difficultyCode = encoded.difficultyCode;
        preferences.topicCode = encoded.topicCode;

        room = this.rooms.find(r => ifPreferenceOverlapped(r.preferences, preferences));
        
        if (room) {
            room.matched = true;
            room.partner = user;
            room.preferences = getOverlappedPreferences(room.preferences.code, preferences.code);
            matched(room);
            return;
        }

        // No room found, create room
        const roomId = `${encoded.preferenceId}-${user.id}`
        // Ensure no duplicate room created under the same socket id
        room = this.getRoomById(roomId);
        if (!room) {
            const newRoom: Room = {
                id: roomId,
                owner: user,
                preferences: preferences,
            }
            room = newRoom;
            this.rooms.push(room);
        }
        roomCreated(room);
    }

    getRoomById(id: string) {
        return this.rooms.find(x => x.id === id);
    }

    closeRoom(id: string) {
        try {
            this.rooms = this.rooms.filter(x => x.id !== id)
        } catch (error) {
            console.log("[closeRoom] Invalid room id.");
        }
    }

    count() {
        return this.rooms.length;
    }

    list() {
        return this.rooms;
    }

    chooseRandomItem(list: string[]): string | null {
        if (list.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * list.length);
        return list[randomIndex];
    }
}