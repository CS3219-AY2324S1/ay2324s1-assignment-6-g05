"use client";
import { CLIENT_ROUTES } from "@/common/constants";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import { useAuthContext } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutPage() {
  const { logOut } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    await logOut();
    router.push(CLIENT_ROUTES.HOME);
  };

  return <LogoLoadingComponent />;
}
