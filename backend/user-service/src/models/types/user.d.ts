import Role from "../../lib/enums/Role";
import Gender from "../../lib/enums/Gender";
// import Language from "../lib/enums/Language";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role; //enum

  //optional attributes
  gender?: Gender;
  bio?: string;
  // languages?: Language[];
  image?: string;
  createdOn?: Date;
  updatedOn?: Date;

  isVerified: Boolean;
  verificationToken?: String;

  passwordResetToken?: String;
};
