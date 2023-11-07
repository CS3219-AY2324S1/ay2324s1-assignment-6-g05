import bcrypt from "bcrypt";

const getDatabaseUserWithPassword = ({ password }: { password?: string }) => ({
  id: "testUserId",
  name: "testUser",
  email: "testuser@email.com",
  password: password ? bcrypt.hashSync(password, 10) : undefined,
  isVerified: true,
  role: "USER",
  gender: "OTHER",
  bio: "test bio",
  image: "https://testimage.com/testimage.png",
  createdOn: "2023-01-01T00:00:00.000Z",
  updatedOn: "2023-01-01T00:00:00.000Z",
  preferences: {
    select: {
      languages: [],
      topics: [],
      difficulties: [],
    },
  },
});

const getUserPayloadWithoutSecrets = () => {
  const user = getDatabaseUserWithPassword({});

  delete user.password;

  return user;
};

export const Payloads = {
  getDatabaseUserWithPassword,
  getUserPayloadWithoutSecrets,
};
