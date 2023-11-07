"use client";

import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import NavBar from "@/components/common/NavBar";
import { AuthService } from "@/helpers/auth/auth_api_wrappers";
import { getLogger } from "@/helpers/logger";
import { Role } from "@/types/enums";
import User from "@/types/user";
import { createContext, useContext, useEffect, useState } from "react";

interface IAuthContext {
  user: User;
  fetchUser: (preventLoading: boolean) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const defaultUser: User = {
  id: "",
  name: "",
  email: "",
  role: Role.USER,
  image: "",
  preferences: {
    languages: [],
    difficulties: [],
    topics: [],
  },
};

const AuthContext = createContext<IAuthContext>({
  user: defaultUser,
  fetchUser: () => Promise.resolve(),
  logIn: (email: string, password: string) => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

interface IAuthProvider {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: IAuthProvider) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchUser();
  }, []);

  //fetch user using JWT cookie
  const fetchUser = async (preventLoading?: boolean) => {
    !preventLoading && setIsLoading(true);
    try {
      // POST /validate will not return password
      const rawUser = await AuthService.validateUser();
      updateUser(rawUser);
    } catch (error) {
      getLogger().error(error);
      setUser(defaultUser);
    } finally {
      !preventLoading && setIsLoading(false);
    }
  };

  //formats preferences and sets user in state
  const updateUser = (rawUser: User) => {
    formatPreferences(rawUser);
    setUser(rawUser);
  };

  const formatPreferences = (rawUser: User) => {
    rawUser.preferences = {
      languages: rawUser.preferences?.languages || [],
      difficulties: rawUser.preferences?.difficulties || [],
      topics: rawUser.preferences?.topics || [],
    };
  };

  const logIn = async (email: string, password: string) => {
    const user = await AuthService.logInByEmail(email, password);
    updateUser(user!);
  };

  const logOut = async () => {
    setUser(defaultUser);
    await AuthService.logOut();
  };

  const renderComponents = () => {
    if (isLoading) {
      // this is the loading component that will render in every page when fetching user auth status
      return <LogoLoadingComponent />;
    }

    return children;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        fetchUser,
        logIn,
        logOut,
      }}
    >
      {!!user.id && <NavBar />}
      {renderComponents()}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => useContext(AuthContext);

export { useAuthContext, AuthProvider };
