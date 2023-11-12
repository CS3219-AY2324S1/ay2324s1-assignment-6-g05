"use client";
import ProfileComponent from "@/components/profile/Profile";
import { useAuthContext } from "@/contexts/auth";

export default function ProfilePage() {
  const { user } = useAuthContext();

  return <div>{user && <ProfileComponent user={user} />}</div>;
}
