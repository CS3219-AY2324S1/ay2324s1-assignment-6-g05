"use client";

import ProfilePictureAvatar from "@/components/common/ProfilePictureAvatar";
import { useRouter } from "next/navigation";
import { CLIENT_ROUTES } from "@/common/constants";
import { useAuthContext } from "@/contexts/auth";
import { Badge, Card } from "@nextui-org/react";
import { useState } from "react";
import { Icons } from "../common/Icons";

const ProfileDashboardCard = () => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [showBadge, setShowBadge] = useState(false);

  const handleEditProfileButtonPress = () => {
    router.push(CLIENT_ROUTES.PROFILE);
  };

  return (
    <Card className="flex flex-col h-full justify-center items-center bg-black rounded-lg p-6 overflow-hidden">
      <div
        className="gap-4 flex flex-col overflow-hidden justify-center items-center"
        onMouseEnter={() => setShowBadge(true)}
        onMouseLeave={() => setShowBadge(false)}
      >
        <Badge
          isInvisible={!showBadge}
          content={<Icons.FiEdit />}
          placement="bottom-right"
        >
          <div
            onClick={handleEditProfileButtonPress}
            className="hover:cursor-pointer"
          >
            <ProfilePictureAvatar profileUrl={user.image!} isProfileDashboard />
          </div>
        </Badge>
        <p className="break-words w-full text-white text-3l font-semibold text-center">
          {user.name}
        </p>
        <p className="break-words w-full text-white text-sm font-light text-center">
          {user.bio}
        </p>
      </div>
    </Card>
  );
};

export default ProfileDashboardCard;
