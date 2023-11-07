"use client";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Divider,
  Spacer,
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import { CLIENT_ROUTES } from "@/common/constants";
import { useSearchParams, useRouter } from "next/navigation";
import { ToastType } from "@/types/enums";
import displayToast from "@/components/common/Toast";
import { AuthService } from "@/helpers/auth/auth_api_wrappers";

export default function VerifyComponent() {
  // flags
  const [isSuccessfulVerification, setIsSuccessfulVerification] =
    useState(false);
  const [isVerifiedLoading, setIsVerifiedLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  async function verifyEmail(email: string, token: string) {
    try {
      const res = await AuthService.verifyEmail(email, token);
      if (res) {
        setIsSuccessfulVerification(true);
      }
    } catch (error) {
      setIsSuccessfulVerification(false);
    } finally {
      setIsVerifiedLoading(false);
    }
  }

  useEffect(() => {
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      router.push(CLIENT_ROUTES.HOME);
    } else {
      verifyEmail(email, token);
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      {isVerifiedLoading ? (
        <LogoLoadingComponent />
      ) : isSuccessfulVerification ? (
        <Card className="items-center justify-center w-96 mx-auto pt-10 pb-10">
          <div className="w-1/2">
            <PeerPrepLogo />
            <CardHeader className="justify-center font-bold">
              Verification Success
            </CardHeader>
            <CardBody className="flex flex-col">
              <Divider />
              <Spacer y={5} />
              <p className="flex text-center">
                You can now login to access our services.
              </p>
              <Spacer y={5} />
              <Button
                className="bg-sky-600"
                onClick={() => {
                  router.push(CLIENT_ROUTES.LOGIN);
                }}
              >
                Login now
              </Button>
            </CardBody>
          </div>
        </Card>
      ) : (
        <Card className="items-center justify-center w-96 mx-auto pt-10 pb-10">
          <div className="w-1/2">
            <PeerPrepLogo />
            <CardHeader className="justify-center font-bold">
              Verification Failed
            </CardHeader>
            <CardBody className="flex flex-col">
              <Divider />
              <Spacer y={5} />
              <p className="flex text-center">
                Please retry the latest link from your email.
              </p>
              <Spacer y={5} />
              <p className="flex text-center text-xs text-red-500">
                If this problem persists, please contact admin.
              </p>
              <Spacer y={5} />

              <Button
                className="bg-sky-600"
                onClick={() => {
                  router.push(CLIENT_ROUTES.LOGIN);
                }}
              >
                Back to login
              </Button>
            </CardBody>
          </div>
        </Card>
      )}
    </div>
  );
}
