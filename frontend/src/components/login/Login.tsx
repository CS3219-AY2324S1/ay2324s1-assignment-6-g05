"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Card,
  Spacer,
  Button,
  Input,
  Link,
  CardHeader,
  Image,
} from "@nextui-org/react";
import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import { CLIENT_ROUTES } from "@/common/constants";
import { useRouter } from "next/navigation";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";
import User from "@/types/user";
import { Role } from "@/types/enums";
import displayToast from "@/components/common/Toast";
import { ToastType } from "@/types/enums";
import bcrypt from "bcryptjs-react";
import { AuthService } from "@/helpers/auth/auth_api_wrappers";
import { useAuthContext } from "@/contexts/auth";
import z from "zod";
import { getLogger } from "@/helpers/logger";
import SignUpSuccess from "./SignUpSuccess";

export function LoginComponent() {
  const { logIn } = useAuthContext();
  const router = useRouter();

  const logger = getLogger("login");

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkPassword, setCheckPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Flags
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCheckPasswordVisible, setIsCheckPasswordVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false);
  const [arePasswordsEqual, setArePasswordsEqual] = useState(false);

  // Toggles
  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleCheckPasswordVisibility = () =>
    setIsCheckPasswordVisible(!isCheckPasswordVisible);
  const toggleSignUp = () => setIsSignUp(!isSignUp);

  // Validation

  const validateEmail = (value: string) => {
    try {
      z.string().email().min(3).max(254).parse(value);
      return true;
    } catch {
      return false;
    }
  };

  const isEmailInvalid = useMemo(() => {
    if (email === "") {
      return false;
    }

    return validateEmail(email) ? false : true;
  }, [email]);

  useEffect(() => {
    setArePasswordsEqual(
      !(password !== checkPassword && password !== "" && checkPassword !== "")
    );

    if (isEmailInvalid) {
      setErrorMsg("Please enter a valid email address.");
    } else if (password !== "" && checkPassword !== "" && password.length < 8) {
      setErrorMsg("Password should contain 8 characters or more.");
    } else if (!arePasswordsEqual) {
      setErrorMsg("Passwords do not match. Please try again.");
    } else if (name !== "" && name.length < 2) {
      setErrorMsg("Name has to contain at least 2 characters");
    } else if (name.length > 20) {
      setErrorMsg("Name can only be at most 20 characters");
    } else {
      setErrorMsg("");
    }
  }, [
    name,
    password,
    checkPassword,
    setPassword,
    setCheckPassword,
    arePasswordsEqual,
    email,
  ]);

  async function submitNewUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (errorMsg !== "") {
      displayToast(
        "Sign up failed. Please address the errors before submitting.",
        ToastType.ERROR
      );
      return;
    }

    setIsSubmitted(true);

    const hashedPassword = await bcrypt.hash(password, 10);

    let user: User = {
      name: name,
      email: email,
      password: hashedPassword,
      role: Role.USER,
    };

    try {
      // call auth service POST /registerByEmail to create new user
      await AuthService.registerByEmail(user);

      displayToast("Sign up success!", ToastType.SUCCESS);

      setIsSignUpSuccess(true);
    } catch (error) {
      if (error instanceof PeerPrepErrors.ConflictError) {
        displayToast(
          "User already exists. Please login instead.",
          ToastType.ERROR
        );
      } else {
        getLogger().error(error);
        displayToast(
          "Something went wrong. Please refresh and try again.",
          ToastType.ERROR
        );
      }
    } finally {
      // Cleanup
      setIsSubmitted(false);
    }
  }

  async function getUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isEmailInvalid) {
      displayToast("Please enter a valid email address.", ToastType.ERROR);
      return;
    }

    try {
      setIsSubmitted(true);

      // TODO: hash this password to prevent sending raw password outside
      await logIn(email, password);

      displayToast("Login success!", ToastType.SUCCESS);
      router.push(CLIENT_ROUTES.HOME);
    } catch (error) {
      switch (true) {
        case error instanceof PeerPrepErrors.NotFoundError:
        case error instanceof PeerPrepErrors.UnauthorisedError:
          displayToast(
            "Incorrect email/password. Please try again.",
            ToastType.ERROR
          );
          break;

        case error instanceof PeerPrepErrors.ForbiddenError:
          displayToast(
            "Please verify your email before logging in.",
            ToastType.ERROR
          );
          break;

        default:
          logger.error(error, `[login]`);
          displayToast(
            "Something went wrong. Please refresh and try again.",
            ToastType.ERROR
          );
          break;
      }
    } finally {
      // Cleanup
      setIsSubmitted(false);
    }
  }

  return isSignUpSuccess ? (
    <SignUpSuccess email={email} setIsSignUpSuccess={setIsSignUpSuccess} />
  ) : (
    <div className="flex items-center justify-center h-screen">
      <Card className="items-center justify-center w-96 mx-auto pt-10 pb-10 bg-black">
        <form className="w-1/2" onSubmit={isSignUp ? submitNewUser : getUser}>
          <PeerPrepLogo />
          <CardHeader className="lg font-bold justify-center">
            PeerPrep
          </CardHeader>
          <Spacer y={3} />
          <Input
            type="email"
            isClearable
            isRequired
            fullWidth
            onInput={(e) => {
              setEmail(e.currentTarget.value);
            }}
            placeholder="Email"
          />
          <Spacer y={1} />
          <Input
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Password"
            isRequired
            fullWidth
            onInput={(e) => {
              setPassword(e.currentTarget.value);
            }}
            endContent={
              <Button
                variant="light"
                className="focus:outline-none p-2"
                size="sm"
                isIconOnly
                onClick={togglePasswordVisibility}
              >
                {isPasswordVisible ? (
                  <Image src="/assets/eye-hide.svg" />
                ) : (
                  <Image src="/assets/eye-show.svg" />
                )}
              </Button>
            }
          />
          {isSignUp ? (
            <div className="items-center">
              <Spacer y={1} />
              <Input
                type={isCheckPasswordVisible ? "text" : "password"}
                placeholder="Re-enter password"
                isRequired
                fullWidth
                onInput={(e) => {
                  setCheckPassword(e.currentTarget.value);
                }}
                endContent={
                  <Button
                    variant="light"
                    className="focus:outline-none p-2"
                    size="sm"
                    isIconOnly
                    onClick={() => toggleCheckPasswordVisibility()}
                  >
                    {isCheckPasswordVisible ? (
                      <Image src="/assets/eye-hide.svg" />
                    ) : (
                      <Image src="/assets/eye-show.svg" />
                    )}
                  </Button>
                }
              />
              <Spacer y={1} />
              <Input
                isClearable
                isRequired
                fullWidth
                minLength={2}
                onInput={(e) => {
                  setName(e.currentTarget.value);
                }}
                placeholder="Name"
              />
              <Spacer y={2} />
              <div className="text-red-500 text-center text-xs font-bold">
                {errorMsg}
              </div>
              <div className="flex flex-col items-center pt-5 space-y-5">
                <Button
                  isLoading={isSubmitted}
                  type="submit"
                  color="primary"
                  className="w-1/2 bg-sky-600"
                >
                  {isSubmitted ? null : <>Sign Up</>}
                </Button>
                <Link
                  size="sm"
                  className="cursor-pointer text-sky-600 hover:underline"
                  onClick={() => {
                    toggleSignUp();
                  }}
                >
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <Spacer y={2} />
              <div className="text-red-500 text-center text-xs font-bold">
                {errorMsg}
              </div>
              <div className="flex flex-col items-center pt-2">
                <Button
                  className="w-1/2 bg-sky-600"
                  type="submit"
                  isLoading={isSubmitted}
                  aria-label="Submit"
                  color="primary"
                >
                  {isSubmitted ? null : <>Log In</>}
                </Button>
              </div>
              <Spacer y={5} />
              <div className="flex justify-between">
                <Link
                  className="text-sky-600 hover:underline"
                  size="sm"
                  href="/forgotpassword"
                >
                  Forgot password?
                </Link>
                <Link
                  className="cursor-pointer text-sky-600 hover:underline"
                  size="sm"
                  onClick={() => {
                    toggleSignUp();
                  }}
                >
                  Sign Up
                </Link>
              </div>
              <Spacer y={5} />
            </>
          )}
        </form>
      </Card>
    </div>
  );
}
