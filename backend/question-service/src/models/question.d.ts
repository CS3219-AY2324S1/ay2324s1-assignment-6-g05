import Topic from "../lib/enums/Topic";
import Complexity from "../lib/enums/Complexity";

type Example = {
  input: string;
  output: string;
  explanation?: string;
};

type Question = {
  // id: string;
  title: string;
  description: string;
  topics: Topic[]; // enum
  complexity: Complexity; // enum
  url: string;
  // optional attributes
  examples?: Example[];
  constraints?: string[];
  createdOn?: number;
  updatedOn?: number;
  author?: string;
};
