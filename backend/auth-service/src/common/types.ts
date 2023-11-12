export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

type Preference = {
  languages: string[];
  topics: string[];
  difficulties: string[];
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role; //enum
  image: string | null;
  bio: string | null;
  gender: Gender | null;
  createdOn: Date;
  updatedOn: Date;
  preferences: Preference | null;
  isVerified: boolean;
};

export type Source = {
  user: string;
  pass: string;
};

export type Email = {
  source: Source;
  recipient: string;
  subject: string;
  content: string;
};
