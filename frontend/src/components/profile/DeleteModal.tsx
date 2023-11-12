"use client";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { UserService } from "@/helpers/user/user_api_wrappers";
import displayToast from "../common/Toast";
import { ToastType } from "@/types/enums";
import { useAuthContext } from "@/contexts/auth";

interface DeleteModalProps {
  userid: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteModal({
  userid,
  isOpen,
  onClose,
}: DeleteModalProps) {
  const { logOut } = useAuthContext();

  const handleDeleteUser = async () => {
    try {
      let res = await UserService.deleteUser(userid);
      displayToast("User deleted successfully", ToastType.SUCCESS);
      logOut(); // Push user to login/sign-up again and logout
    } catch (error) {
      displayToast(
        "Something went wrong, please try again later.",
        ToastType.ERROR
      );
    }
  };

  return (
    <>
      <Modal size="xs" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete User</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to delete this user? This action is
                  irreversible.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="bg-red-700"
                  onClick={() => {
                    handleDeleteUser();
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
