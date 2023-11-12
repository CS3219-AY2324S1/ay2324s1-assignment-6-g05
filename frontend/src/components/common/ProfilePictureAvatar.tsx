import { cn } from "@/utils/classNameUtils";
import { Avatar } from "@nextui-org/react";
import { useEffect, useState } from "react";

interface ProfilePictureProps {
  profileUrl?: string;
  isProfileDashboard?: boolean;
  isChatAvatar?: boolean;
  isMatchingAvatar?: boolean;
  isProfileAvatar?: boolean;
}

const ProfilePictureAvatar = ({
  profileUrl,
  isProfileDashboard = false,
  isChatAvatar = false,
  isMatchingAvatar = false,
  isProfileAvatar = false,
}: ProfilePictureProps) => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    if (!isProfileDashboard) {
      return;
    }

    window.addEventListener("resize", () => setWindowWidth(window.innerWidth));

    return () => {
      window.removeEventListener("resize", () =>
        setWindowWidth(window.innerWidth)
      );
    };
  }, []);

  return (
    <Avatar
      className={cn("transition-transform w-", {
        "w-40 h-40": isProfileDashboard && windowWidth >= 1100,
        "w-32 h-32": isProfileDashboard && windowWidth < 1100,
        "w-8 h-8": isChatAvatar,
        "w-16 h-16": isMatchingAvatar,
        "w-12 h-12": isProfileAvatar,
        "w-9 h-9":
          !isProfileDashboard &&
          !isChatAvatar &&
          !isMatchingAvatar &&
          !isProfileAvatar,
      })}
      src={
        profileUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      }
    />
  );
};

export default ProfilePictureAvatar;
