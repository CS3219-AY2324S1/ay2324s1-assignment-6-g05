import { Input, Button, Link, Image } from "@nextui-org/react";
import { useEffect, useState } from "react";
import bcrypt from "bcryptjs-react";
import { useAuthContext } from "@/contexts/auth";
import displayToast from "../common/Toast";
import { ToastType } from "@/types/enums";
import { AuthService } from "@/helpers/auth/auth_api_wrappers";
import { PeerPrepErrors } from "@/types/PeerPrepErrors";
interface ChangePasswordProps {
  setIsChangePassword: (isChangePassword: boolean) => void;
}

export default function ChangePassword({
  setIsChangePassword,
}: ChangePasswordProps) {
  const { user, fetchUser } = useAuthContext();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [arePasswordsEqual, setArePasswordsEqual] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isCheckPasswordVisible, setIsCheckPasswordVisible] = useState(false);

  useEffect(() => {
    setArePasswordsEqual(newPassword === confirmNewPassword);

    if (newPassword !== "" && newPassword.length < 8) {
      setErrorMsg("Password should contain 8 characters or more.");
    } else if (!arePasswordsEqual) {
      setErrorMsg("Passwords do not match.");
    } else {
      setErrorMsg("");
    }
  }, [newPassword, confirmNewPassword, arePasswordsEqual]);

  const toggleOldPasswordVisibility = () =>
    setIsOldPasswordVisible(!isOldPasswordVisible);
  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleCheckPasswordVisibility = () =>
    setIsCheckPasswordVisible(!isCheckPasswordVisible);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (errorMsg !== "") {
      displayToast(
        "Please address the errors before submitting.",
        ToastType.ERROR
      );
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    try {
      await AuthService.changePassword({
        id: user.id!,
        oldPassword: oldPassword,
        hashedNewPassword: hashedNewPassword,
      });

      await fetchUser(true);
      displayToast("Password changed successfully.", ToastType.SUCCESS);
    } catch (error) {
      if (error instanceof PeerPrepErrors.ForbiddenError) {
        displayToast(
          "Please check if the old password is correct.",
          ToastType.ERROR
        );
      } else {
        displayToast(
          "Something went wrong. Please refresh and try again.",
          ToastType.ERROR
        );
      }
    }
  };

  return (
    <div>
      <form
        onSubmit={handleChangePassword}
        className="justify-center max-w-xl space-y-4"
      >
        <Input
          variant="bordered"
          type={isOldPasswordVisible ? "text" : "password"}
          label="Old password"
          onInput={(e) => {
            setOldPassword(e.currentTarget.value);
          }}
          endContent={
            <Button
              variant="light"
              className="focus:outline-none p-2"
              size="sm"
              isIconOnly
              onClick={toggleOldPasswordVisibility}
            >
              {isOldPasswordVisible ? (
                <Image src="/assets/eye-hide.svg" alt="" />
              ) : (
                <Image src="/assets/eye-show.svg" alt="" />
              )}
            </Button>
          }
        />
        <Input
          variant="bordered"
          type={isPasswordVisible ? "text" : "password"}
          label="New password"
          onInput={(e) => {
            setNewPassword(e.currentTarget.value);
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
                <Image src="/assets/eye-hide.svg" alt="" />
              ) : (
                <Image src="/assets/eye-show.svg" alt="" />
              )}
            </Button>
          }
        />
        <Input
          variant="bordered"
          type={isCheckPasswordVisible ? "text" : "password"}
          label="Re-enter new password"
          onInput={(e) => {
            setConfirmNewPassword(e.currentTarget.value);
          }}
          endContent={
            <Button
              variant="light"
              className="focus:outline-none p-2"
              size="sm"
              isIconOnly
              onClick={toggleCheckPasswordVisibility}
            >
              {isCheckPasswordVisible ? (
                <Image src="/assets/eye-hide.svg" alt="" />
              ) : (
                <Image src="/assets/eye-show.svg" alt="" />
              )}
            </Button>
          }
        />
        <div className="text-red-500 text-center text-xs font-bold">
          {errorMsg}
        </div>
        <div className="flex flex-row justify-between">
          <Link
            className="cursor-pointer text-sky-600"
            onClick={() => {
              setIsChangePassword(false);
            }}
          >
            Back to profile
          </Link>
          <Button type="submit" className="bg-sky-600">
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
}
