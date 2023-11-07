import { ZodError, ZodIssue } from "zod";

enum Topic {
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

export const convertStringToTopic = (topic: string): Topic => {
  let enumTopic = null;
  Object.values(Topic).forEach((value) => {
    if (value == topic.toUpperCase()) {
      enumTopic = value;
      return;
    }
  });

  if (!enumTopic) {
    throw new ZodError([{ message: "Invalid topic" } as ZodIssue]);
  }

  return enumTopic;
};

export default Topic;
