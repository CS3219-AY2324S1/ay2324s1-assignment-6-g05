export type Example = {
  input: string;
  output: string;
  explanation?: string;
};

type Question = {
  id?: string;
  title: string;
  complexity: string;
  topics: string[];
  description: string;
  url: string;

  author?: string;
  examples?: Example[];
  constraints?: string[];

  createdOn?: string;
  updatedOn?: string;
};

export default Question;
