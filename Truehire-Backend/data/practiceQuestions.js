/**
 * Copyright © 2026 Harsh Gaikwad - harshgaikwaddev. All Rights Reserved.
 *
 * data/practiceQuestions.js
 * 
 * Question bank containing coding practice problems and test cases.
 * Categorized by difficulty: Easy, Medium, Hard.
 */

const practiceQuestions = [
  // ==========================================
  // EASY QUESTIONS
  // ==========================================
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers and a target value, return the indices of the two numbers that add up to the target.\n\nInput format:\n- First line: space-separated integers\n- Second line: target integer\n\nOutput format:\nTwo indices separated by a space (e.g. '0 1').",
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1" },
      { input: "3 2 4\n6", expectedOutput: "1 2" },
      { input: "3 3\n6", expectedOutput: "0 1" }
    ]
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    description: "Given a string, print the reversed string.\n\nInput format:\nA single string.\n\nOutput format:\nThe string in reverse.",
    testCases: [
      { input: "hello", expectedOutput: "olleh" },
      { input: "TrueHire", expectedOutput: "eriHeurT" },
      { input: "racecar", expectedOutput: "racecar" }
    ]
  },
  {
    id: "palindrome-check",
    title: "Palindrome Check",
    difficulty: "Easy",
    description: "Determine whether the given string is a palindrome (reads the same backward as forward). Print 'true' or 'false'.\n\nInput format:\nA single string.\n\nOutput format:\n'true' or 'false'.",
    testCases: [
      { input: "racecar", expectedOutput: "true" },
      { input: "hello", expectedOutput: "false" },
      { input: "madam", expectedOutput: "true" }
    ]
  },
  {
    id: "fibonacci",
    title: "Fibonacci Number",
    difficulty: "Easy",
    description: "Given a non-negative integer n, compute the n-th Fibonacci number where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2).\n\nInput format:\nA single integer n.\n\nOutput format:\nThe n-th Fibonacci number.",
    testCases: [
      { input: "5", expectedOutput: "5" },
      { input: "6", expectedOutput: "8" },
      { input: "0", expectedOutput: "0" }
    ]
  },
  {
    id: "sum-of-array",
    title: "Sum of Array",
    difficulty: "Easy",
    description: "Given space-separated integers on a single line, calculate and print their total sum.\n\nInput format:\nA single line of space-separated integers.\n\nOutput format:\nA single integer representing the sum.",
    testCases: [
      { input: "1 2 3 4 5", expectedOutput: "15" },
      { input: "10 -2 5", expectedOutput: "13" },
      { input: "100", expectedOutput: "100" }
    ]
  },
  {
    id: "find-max",
    title: "Find Maximum Element",
    difficulty: "Easy",
    description: "Given space-separated integers on a single line, find and print the maximum value.\n\nInput format:\nA single line of space-separated integers.\n\nOutput format:\nThe maximum integer in the list.",
    testCases: [
      { input: "3 9 2 15 6", expectedOutput: "15" },
      { input: "-5 -1 -10", expectedOutput: "-1" },
      { input: "42", expectedOutput: "42" }
    ]
  },

  // ==========================================
  // MEDIUM QUESTIONS
  // ==========================================
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Medium",
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.\n\nInput format:\nA single string of brackets.\n\nOutput format:\n'true' or 'false'.",
    testCases: [
      { input: "()[]{}", expectedOutput: "true" },
      { input: "(]", expectedOutput: "false" },
      { input: "{[()]}", expectedOutput: "true" }
    ]
  },
  {
    id: "longest-unique-substring",
    title: "Longest Substring Without Repeating",
    difficulty: "Medium",
    description: "Given a string, find the length of the longest substring without repeating characters.\n\nInput format:\nA single string.\n\nOutput format:\nA single integer representing the maximum length.",
    testCases: [
      { input: "abcabcbb", expectedOutput: "3" },
      { input: "bbbbb", expectedOutput: "1" },
      { input: "pwwkew", expectedOutput: "3" }
    ]
  },
  {
    id: "maximum-subarray",
    title: "Maximum Subarray (Kadane's)",
    difficulty: "Medium",
    description: "Given an integer array, find the contiguous subarray (containing at least one number) which has the largest sum and print its sum.\n\nInput format:\nA single line of space-separated integers.\n\nOutput format:\nA single integer representing the maximum subarray sum.",
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
      { input: "1", expectedOutput: "1" },
      { input: "5 4 -1 7 8", expectedOutput: "23" }
    ]
  },
  {
    id: "coin-change",
    title: "Coin Change (Fewest Coins)",
    difficulty: "Medium",
    description: "Given an array of integer coin denominations and a target amount of money, return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.\n\nInput format:\n- First line: space-separated coin denominations\n- Second line: target amount\n\nOutput format:\nAn integer representing the fewest coins, or -1.",
    testCases: [
      { input: "1 2 5\n11", expectedOutput: "3" },
      { input: "2\n3", expectedOutput: "-1" },
      { input: "1\n0", expectedOutput: "0" }
    ]
  },
  {
    id: "group-anagrams-count",
    title: "Group Anagrams Count",
    difficulty: "Medium",
    description: "Given a list of space-separated words, count how many distinct groups of anagrams exist.\nTwo words are anagrams if they contain the same characters with the same frequencies.\n\nInput format:\nA single line of space-separated words.\n\nOutput format:\nA single integer representing the number of distinct anagram groups.",
    testCases: [
      { input: "eat tea tan ate nat bat", expectedOutput: "3" },
      { input: "a", expectedOutput: "1" },
      { input: "listen silent enlist google", expectedOutput: "2" }
    ]
  },

  // ==========================================
  // HARD QUESTIONS
  // ==========================================
  {
    id: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\nInput format:\nA single line of space-separated integers representing bar heights.\n\nOutput format:\nA single integer representing the total units of trapped water.",
    testCases: [
      { input: "0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" },
      { input: "4 2 0 3 2 5", expectedOutput: "9" },
      { input: "1 2 3 4 5", expectedOutput: "0" }
    ]
  },
  {
    id: "edit-distance",
    title: "Edit Distance (Levenshtein)",
    difficulty: "Hard",
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\nYou have the following three operations permitted on a word: Insert a character, Delete a character, or Replace a character.\n\nInput format:\n- First line: word1\n- Second line: word2\n\nOutput format:\nA single integer representing the minimum operations.",
    testCases: [
      { input: "horse\nros", expectedOutput: "3" },
      { input: "intention\nexecution", expectedOutput: "5" },
      { input: "abc\nabc", expectedOutput: "0" }
    ]
  },
  {
    id: "sliding-window-maximum",
    title: "Sliding Window Maximum",
    difficulty: "Hard",
    description: "You are given an array of integers nums and a sliding window of size k which moves from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position, return the max sliding window.\n\nInput format:\n- First line: space-separated integers (nums)\n- Second line: integer k (window size)\n\nOutput format:\nSpace-separated maximum values for each window position.",
    testCases: [
      { input: "1 3 -1 -3 5 3 6 7\n3", expectedOutput: "3 3 5 5 6 7" },
      { input: "1\n1", expectedOutput: "1" },
      { input: "9 11\n2", expectedOutput: "11" }
    ]
  },
  {
    id: "n-queens-count",
    title: "N-Queens Solutions Count",
    difficulty: "Hard",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return the total number of distinct solutions.\n\nInput format:\nA single integer n.\n\nOutput format:\nA single integer representing the total number of distinct valid placements.",
    testCases: [
      { input: "4", expectedOutput: "2" },
      { input: "1", expectedOutput: "1" },
      { input: "6", expectedOutput: "4" }
    ]
  }
];

module.exports = practiceQuestions;
