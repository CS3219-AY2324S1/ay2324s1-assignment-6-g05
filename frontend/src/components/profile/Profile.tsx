"use client";
import React, { useState } from "react";
import ProfileCard from "./ProfileCard";
import {
  Card,
  CardBody,
  Button,
  Link,
  useDisclosure,
} from "@nextui-org/react";
import Information from "./Information";
import ChangePassword from "./ChangePassword";
import DeleteModal from "./DeleteModal";
import User from "@/types/user";
import { useRouter } from "next/navigation";
import { CLIENT_ROUTES } from "@/common/constants";
import displayToast from "../common/Toast";
import { ToastType } from "@/types/enums";
import { Icons } from "../common/Icons";

interface ProfileComponentProps {
  user: User;
}

export default function ProfileComponent({ user }: ProfileComponentProps) {
  // Flags
  const [isChangePassword, setIsChangePassword] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [imageUrl, setImageUrl] = useState<string>("");

  function openModal() {
    if (user.id) {
      onOpen();
    } else {
      displayToast("Unable to perform this action right now.", ToastType.ERROR);
    }
  }

  return (
    <div className="flex flex-col items-center align-middle justify-center h-[94vh]">
      <div className="flex p-2 w-unit-8xl">
        <Link
            className="text-white hover:text-sky-700 flex gap-2"
            as={Link}
            href={CLIENT_ROUTES.HOME}
          >
          <Icons.BiArrowBack/>
          <p>Back to dashboard</p>
        </Link>
      </div>
      <Card className="flex w-unit-8xl bg-black mb-0">
        <CardBody className="justify-center space-y-5">
          {isChangePassword ? (
            <ChangePassword setIsChangePassword={setIsChangePassword} />
          ) : (
            <>
              <ProfileCard user={user} setImageUrl={setImageUrl} />
              <Information
                setIsChangePassword={setIsChangePassword}
                imageUrl={imageUrl}
                user={user}
              />
            </>
          )}
        </CardBody>
      </Card>
      <div className="flex flex-row justify-end gap-2 m-4">
        <Button
          startContent={<Icons.FiTrash/>}
          className="bg-transparent hover:bg-red-700 transition-transform flex justify-end"
          onClick={() => {
            openModal();
          }}
        >
          Delete Account
        </Button>
      </div>

      {user.id && (
        <DeleteModal userid={user.id} isOpen={isOpen} onClose={onClose} />
      )}
    </div>
  );
}
