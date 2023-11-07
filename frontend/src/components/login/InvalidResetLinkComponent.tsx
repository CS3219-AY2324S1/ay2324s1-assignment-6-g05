import { CLIENT_ROUTES } from "@/common/constants";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import PeerPrepLogo from "../common/PeerPrepLogo";

const InvalidResetLinkComponent = () => {
  return (
    <div className="flex w-screen h-screen bg-background items-center justify-center space-x-5">
      <PeerPrepLogo width="15%" />
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <p className="text-3xl font-bold">Link is INVALID</p>
          <p className="text-l font-light">
            Please contact the admins or try again later.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            color="warning"
            href={CLIENT_ROUTES.HOME}
            as={Link}
            variant="solid"
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvalidResetLinkComponent;
