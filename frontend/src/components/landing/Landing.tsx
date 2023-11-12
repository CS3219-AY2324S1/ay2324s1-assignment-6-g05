"use client";
import { useRouter } from "next/navigation";
import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import { Button } from "@nextui-org/react";
import { CLIENT_ROUTES } from "@/common/constants";

const Landing = () => {
  const router = useRouter();
  const handleLogInButtonPress = () => {
    router.push(CLIENT_ROUTES.LOGIN);
  };


  return (
    <div className="grid grid-cols-2 gap-5 pt-50 h-[100vh] bg-black">
      <div className="grid-col-1 flex relative self-center justify-center items-center -left-1/4">
        <PeerPrepLogo width="100%"/>
      </div>
      <div className="grid-col-2 self-center">
        <div className="flex flex-col items-left"> {/* Flex the children in a column */}
          <p className="text-[500%] font-semibold"> PeerPrep </p>
          <p className="ml-1"> Real-time code collaboration with others</p>
          <div className="flex flex-row justify-left gap-4 mt-10 ml-1">
            <Button
              className="bg-gradient-to-l from-amber-500 to-yellow text-black w-[150px] shadow-md"
              onPress={handleLogInButtonPress}
            >
              <p className="font-semibold">Start Now</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
