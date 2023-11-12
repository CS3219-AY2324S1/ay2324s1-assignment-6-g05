import { Status, Role } from "./enums";
import Preference from "./preference";

type User = {
  id?: string; //this is optional because when we create user, we don't need to provide the user id
  image?: string;
  name: string;
  email: string;
  bio?: string;
  gender?: string;
  password?: string; //this is optional because if the user is logged in via OAuth, there is no need for password field
  role: Role; // (admin, user)
  status?: Status; // (active, inactive) this is optional because by default status is active, so we don't always provide the status
  createdOn?: Date; // this is optional because we don't need to provide this field when we create the user
  preferences?: Preference;
};

export default User;
