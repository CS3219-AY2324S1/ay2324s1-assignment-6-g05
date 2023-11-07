// Default error page used by NextJS for any runtime errors

"use client"; // Error components must be Client Components

import { CLIENT_ROUTES } from "@/common/constants";
import PeerPrepLogo from "@/components/common/PeerPrepLogo";
import { getLogger } from "@/helpers/logger";
import { Button, Link } from "@nextui-org/react";
import { useEffect } from "react";

const logger = getLogger("error");

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error(error);
  }, [error]);

  return (
    <div className="flex w-screen h-screen bg-background items-center justify-center space-x-5">
      <PeerPrepLogo width="15%" />
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <p className="text-3xl font-bold">Internal Server Error</p>
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
}
