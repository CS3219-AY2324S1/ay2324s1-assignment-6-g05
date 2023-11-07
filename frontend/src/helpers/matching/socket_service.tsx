import { SocketEvent } from "@/types/enums";
import { Socket, io } from "socket.io-client";
import { getMatchingSocketConfig } from "./matching_api_wrappers";
import Preference from "@/types/preference";
import Partner from "@/types/partner";

class SocketService {
  private static instance: SocketService;
  private socket: Socket;
  private partner?: Partner;
  private preferences?: Preference;

  constructor(endpoint: string, path: string) {
    this.socket = io(endpoint, { path: path, transports: ["polling"] });
  }

  public static async getInstance(): Promise<SocketService> {
    if (!SocketService.instance) {
      const config = await getMatchingSocketConfig();
      SocketService.instance = new SocketService(config.endpoint, config.path);
    }
    SocketService.instance.socket.connect();
    return SocketService.instance;
  }

  onConnect(listener: (...args: any[]) => void) {
    this.socket.once(SocketEvent.CONNECT, listener);
  }

  onDisconnect(listener: (...args: any[]) => void) {
    this.socket.once(SocketEvent.DISCONNECT, listener);
  }

  onConnectError(listener: (...args: any[]) => void) {
    this.socket.once(SocketEvent.CONNECT_ERROR, listener);
  }

  onMatched(listener: (...args: any[]) => void) {
    // Socket service holds room data globally.
    this.socket.on(SocketEvent.MATCHING_MATCHED, (res) => {
      this.partner = res.partner;
      this.preferences = res.preferences;
      listener(res.owner);
    });
  }

  onNoMatched(listener: (...args: any[]) => void) {
    this.socket.on(SocketEvent.MATCHING_NO_MATCHED, listener);
  }

  onRoomClosed(listener: (...args: any[]) => void) {
    this.socket.on(SocketEvent.ROOM_CLOSED, listener);
  }

  onPartnerReadyChange(listener: (...args: any[]) => void) {
    this.socket.on(SocketEvent.MATCHING_PARTNER_READY_CHANGE, listener);
  }

  onRedirectCollaboration(listener: (...args: any[]) => void) {
    this.socket.on(SocketEvent.MATCHING_REDIRECT_COLLABORATION, listener);
  }

  off(event: string) {
    this.socket.removeAllListeners(event);
  }

  requestMatching(request: any) {
    // Reset room info for new matching request.
    this.partner = undefined;
    this.preferences = undefined;
    this.socket.emit(SocketEvent.MATCHING_REQUEST, request);
  }

  notifyUserReadyChange(ready: boolean) {
    this.socket.emit(SocketEvent.MATCHING_USER_READY_CHANGE, ready);
  }

  requestStartCollaboration(questionId: string, language: string) {
    this.socket.emit(SocketEvent.MATCHING_START_COLLABORATION, {
      questionId: questionId,
      language: language
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  id() {
    return this.socket.id;
  }

  getRoomPartner() {
    return this.partner ?? null;
  }

  getRoomPreference() {
    return this.preferences ?? null;
  }
}

export default SocketService;
