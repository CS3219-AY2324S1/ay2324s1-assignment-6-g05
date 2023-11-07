// Used in api path, value should be in small caps
export enum DOMAIN {
  QUESTION = "question",
  MATCHING = "matching",
  USER = "user",
  AUTH = "auth",
  COLLABORATION = "collaboration",
  HISTORY = "history",
}

// DEPRECIATED, changed to domain to support aws api route mapping
export enum SERVICE {
  USER = "users",
  QUESTION = "question",
  AUTH = "auth",
  MATCHING = "matching",
  COLLABORATION = "collaboration",
  HISTORY = "history",
  TOPICS = "topics",
}

export enum HTTP_METHODS {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum COMPLEXITY {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum LANGUAGE {
  PYTHON = "PYTHON",
  JAVA = "JAVA",
  CPP = "C++",
  JAVASCRIPT = "JAVASCRIPT",
}

export enum TOPIC {
  ARRAY = "ARRAY",
  STRING = "STRING",
  HASHTABLE = "HASH TABLE",
  MATH = "MATH",
  DP = "DYNAMIC PROGRAMMING",
  SORTING = "SORTING",
  GREEDY = "GREEDY",
  DFS = "DEPTH-FIRST SEARCH",
  BINARYSEARCH = "BINARY SEARCH",
  DATABASE = "DATABASE",
  BFS = "BREADTH-FIRST SEARCH",
  TREE = "TREE",
  MATRIX = "MATRIX",
  TWOPOINTERS = "TWO POINTERS",
  BINARYTREE = "BINARY TREE",
  BITMANIPULATION = "BIT MANIPULATION",
  HEAP = "HEAP (PRIORITY QUEUE)",
  STACK = "STACK",
  PREFIX_SUM = "PREFIX SUM",
  GRAPH = "GRAPH",
  BACKTRACKING = "BACKTRACKING",
  SLIDINGWINDOW = "SLIDING WINDOW",
  UNIONFIND = "UNION FIND",
  LINKEDLIST = "LINKED LIST",
  TRIE = "TRIE",
  RECURSION = "RECURSION",
  DIVIDECONQUER = "DIVIDE AND CONQUER",
  QUEUE = "QUEUE",
  MEMOIZATION = "MEMOIZATION",
  TOPOSORT = "TOPOLOGICAL SORT",
  QUICKSELECT = "QUICKSELECT",
  BRAINTEASER = "BRAIN TEASER",
}

export enum ToastType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export enum SocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  CONNECT_ERROR = "connect_error",
  JOIN_ROOM = "join_room",
  ROOM_CLOSED = "room_closed",
  CODE_CHANGE = "code_change",
  CODE_UPDATE = "code_update",
  CODE_EVENT = "code_event",
  SEND_CODE_EVENT = "send_code_event",
  SEND_CHAT_MESSAGE = "send_chat_message",
  UPDATE_CHAT_MESSAGE = "update_chat_message",
  MATCHING_REQUEST = "request_match",
  MATCHING_MATCHED = "matched",
  MATCHING_NO_MATCHED = "no_match",
  MATCHING_PARTNER_READY_CHANGE = "partner_ready_change",
  MATCHING_USER_READY_CHANGE = "user_update_ready",
  MATCHING_START_COLLABORATION = "start_collaboration",
  MATCHING_REDIRECT_COLLABORATION = "redirect_collaboration",
  SESSION_TIMER = "session_timer",
  END_SESSION = "end_session",
  PARTNER_CONNECTION = "partner_connection",
  CONFIRM_END_SESSION = "confirm_end_session",
  GET_SESSION_TIMER = "get_session_timer",
  SEND_CHAT_LIST = "send_chat_list",
  UPDATE_CHAT_LIST = "update_chat_list",
  ROOM_NOT_FOUND = "room_not_found",
  USER_NOT_VALID = "user_not_valid",
  PARTNER_LEFT = "partner_left",
  SEND_CURSOR_CHANGE = "send_cursor_change",
  CURSOR_CHANGE = "cursor_change",
  SEND_HIGHLIGHT_CHANGE = "send_highlight_change",
  HIGHLIGHT_CHANGE = "highlight_change",
}

export enum MATCHING_STAGE {
  INITIAL, // To establish socket connection
  MATCHING, // Send request to join queue, wait for update
  SUCCESS, // Partner found, waiting to start
  START, // Loading view before collab session
  FAIL, // Exceed time limit for matching
  ERROR, // Error with matching service
}
