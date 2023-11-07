"use client";
import React, { useState, useRef } from "react";
import { Badge, Card, CardHeader, Spacer } from "@nextui-org/react";
import User from "@/types/user";
import displayToast from "../common/Toast";
import { HTTP_METHODS, ToastType } from "@/types/enums";
import ProfilePictureAvatar from "../common/ProfilePictureAvatar";
import { getLogger } from "@/helpers/logger";
import { Icons } from "../common/Icons";
import SpinnerLoadingComponent from "../common/SpinnerLoadingComponent";

interface ProfileCardProps {
  user: User;
  setImageUrl: (url: string) => void;
}

export default function ProfileCard({ user, setImageUrl }: ProfileCardProps) {
  const [currImage, setCurrImage] = useState<string | undefined>(user.image);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const inputFile = useRef<HTMLInputElement>(null);

  const onImageClick = () => {
    if (inputFile.current !== null) inputFile.current.click();
  };

  const handleFileUpload = async (file: File) => {
    try {
      if (user.id === undefined || file === undefined) {
        throw Error("User ID is undefined, or no file received properly");
      }
      setIsUploading(true);
      const fileKey = `users/${user.id}/image/${file.name}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileKey", fileKey);
      formData.append("userId", user.id);

      const imageUrlResponse = await fetch(`/api/profile/upload/image`, {
        method: HTTP_METHODS.POST,
        body: formData,
      });

      const { imageUrl } = await imageUrlResponse.json();

      if (!imageUrl) {
        throw Error("No image url returned from S3");
      }

      localStorage.setItem("filename", file.name);

      setCurrImage(imageUrl);
      setImageUrl(imageUrl);
    } catch (error) {
      console.log(error);
      throw Error("File failed to upload, please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const maxSizeInBytes = 3 * 1024 * 1024; // 3 MB

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement> | undefined
  ) => {
    try {
      if (!event) return;

      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        if (!isImgValid(selectedFile)) {
          throw Error("File type not supported.");
        }
        if (selectedFile.size > maxSizeInBytes) {
          throw Error("File size exceeds the limit.");
        }

        await handleFileUpload(selectedFile);
      }
    } catch (error: any) {
      getLogger().error(error);
      displayToast(error.message, ToastType.ERROR);
    } finally {
      if (inputFile.current) {
        inputFile.current.value = "";
      }
    }
  };

  function isImgValid(file: File): boolean {
    return file.type === "image/jpeg" || file.type === "image/png";
  }

  return (
    <>
      <Card className="align-middle items-center justify-center w-full max-h-24 h-24 bg-black">
        <CardHeader className="flex">
          <div className="flex flex-row items-center">
            <div className="w-1/3 items-center">
              <div
                className="hover:cursor-pointer hover:scale-110"
                onClick={() => {
                  onImageClick();
                }}
              >
                {isUploading ? (
                  <SpinnerLoadingComponent />
                ) : (
                  <>
                    <Badge
                      content={<Icons.AiFillEdit />}
                      className="bg-sky-600"
                      size="md"
                      placement="bottom-right"
                      shape="circle"
                    >
                      <ProfilePictureAvatar
                        isProfileAvatar
                        profileUrl={
                          currImage
                            ? currImage
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                      />
                    </Badge>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                id="file"
                ref={inputFile}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <Spacer x={5} />
            <div className="flex flex-col align-left w-full">
              <text className="text-xl font-bold">{user.name}</text>
              <text className="text-m">{user.email}</text>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
}
