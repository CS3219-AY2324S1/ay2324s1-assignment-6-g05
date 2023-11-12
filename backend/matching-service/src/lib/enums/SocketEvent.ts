export enum SocketEvent {
    CONNECTED = "connect",
    CONNECTION_ERROR = "connection_error",
    DISCONNECTING = "disconnecting",
    DISCONNECT = "disconnect",
    REQUEST_MATCH = "request_match",
    USER_UPDATE_READY = "user_update_ready",
    START_COLLABORATION = "start_collaboration",
  }
  
  export default SocketEvent;