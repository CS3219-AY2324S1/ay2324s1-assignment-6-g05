import Complexity from "../lib/enums/Complexity";

export const questionsData = [
  {
    id: "1",
    title: "Reverse String",
    description:
      "Write a function that reverses a string. The input string is given as an array of characters s.",
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: 's = ["o","l","l","e","h"]',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: 's = ["h","a","n","n","a","H"]',
      },
    ],
    constraints: [
      "1 <= s.length <= 10^5",
      "s[i] is a printable ascii character.",
    ],
    complexity: "easy",
    topics: ["Strings", "Algorithms"],
    url: "https://leetcode.com/problems/reverse-string/",
    author: "LeetCode",
    createdOn: Date.now(),
    updatedOn: Date.now(),
  },
  {
    id: "2",
    title: "Linked List Cycle Detection",
    description:
      "Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Internally, pos is used to denote the index of the node that tail's next pointer is connected to. Note that pos is not passed as a parameter. Return true if there is a cycle in the linked list. Otherwise, return false.",
    examples: [
      {
        input: "head = [3,2,0,-4], pos = 1",
        output: "true",
      },
      {
        input: "head = [1,2], pos = 0",
        output: "true",
      },
    ],
    constraints: [
      "The number of the nodes in the list is in the range [0, 10^4].",
      "-10^5 <= Node.val <= 10^5",
      "pos is -1 or a valid index in the linked-list.",
    ],
    complexity: "easy",
    topics: ["Data Structures", "Algorithms"],
    url: "https://leetcode.com/problems/linked-list-cycle/",
    author: "LeetCode",
    createdOn: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "3",
    title: "Repeated DNA Sequences",
    description:
      "The DNA sequence is composed of a series of nucleotides abbreviated as 'A', 'C', 'G', and 'T'. For example, \"ACGAATTCCG\" is a DNA sequence. When studying DNA, it is useful to identify repeated sequences within the DNA. Given a string s that represents a DNA sequence, return all the 10-letter-long sequences (substrings) that occur more than once in a DNA molecule. You may return the answer in any order.",
    examples: [
      {
        input: 's = "AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"',
        output: '["AAAAACCCCC","CCCCCAAAAA"]',
        explanation: "There are two repeated sequences.",
      },
      {
        input: 's = "AAAAAAAAAAAAA"',
        output: '["AAAAAAAAAA"]',
      },
    ],
    constraints: [
      "1 <= s.length <= 10^5",
      "s[i] is either 'A', 'C', 'G', or 'T'.",
    ],
    complexity: "medium",
    topics: ["Algorithms", "Bit Manipulation"],
    url: "https://leetcode.com/problems/repeated-dna-sequences/",
    author: "LeetCode",
  },
  {
    id: "4",
    title: "N-Queen Problem",
    description:
      "The N Queen is the problem of placing N chess queens on an NxN chessboard so that no two queens attack each other. For example, following is a solution for 4 Queen problem. The expected output is a binary matrix which has 1s for the blocks where queens are placed. For example, following is the output matrix for above 4 queen solution.",
    examples: [
      {
        input: "N = 4",
        output: '[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
      },
      {
        input: "N = 1",
        output: "[[Q]]",
      },
    ],
    constraints: ["1 <= N <= 9"],
    complexity: "hard",
    topics: ["Algorithms"],
    url: "https://leetcode.com/problems/n-queens/",
    author: "LeetCode",
  },
];
