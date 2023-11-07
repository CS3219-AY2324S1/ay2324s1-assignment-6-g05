export const getUserPayload = ({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}) => {
  return {
    id: userId || "test-user-id",
    name: "Test Username",
    email: email || "testusername@email.com",
    role: "ADMIN",
    image: "https://testimage.com/image.png",
    bio: "Test bio",
    gender: "MALE",
    createdOn: new Date(),
    updatedOn: new Date(),
  };
};

export const getPostUserPayload = () => {
  return {
    name: "Test Username",
    email: "username@email.com",
    password: "somehasedpassword",
    role: "USER",
    image: "https://testimage.com/image.png",
    bio: "Test bio",
    gender: "MALE",
    verificationToken: "token",
  };
};

export const getUpdateUserPayload = () => {
  return {
    name: "Test Username",
    email: "username@email.com",
    role: "USER",
    image: "https://testimage.com/image.png",
    bio: "Test bio",
    gender: "MALE",
  };
};

export const getUserPreferencesPayload = ({ userId }: { userId?: string }) => {
  return {
    userId: userId || "test-user-id",
    languages: ["PYTHON", "JAVA", "C++", "JAVASCRIPT"],
    difficulties: ["EASY", "MEDIUM", "HARD"],
    topics: ["ARRAY", "STRING", "DYNAMIC PROGRAMMING"],
  };
};

export const getUpdatePreferencesPayload = () => {
  return {
    languages: ["Python", "Java", "C++", "Javascript"],
    difficulties: ["Easy", "Medium", "Hard"],
    topics: ["Array", "String", "Dynamic Programming"],
  };
};
