import { FC } from "react";
import PeerPrepLogo from "./PeerPrepLogo";

interface LoadingProps {}

const LogoLoadingComponent: FC<LoadingProps> = ({}) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="">
        <PeerPrepLogo width="5rem" height="5rem" />
      </div>
      <div>
        <div className="mx-2">
          <div className="relative w-60 space-y-3 overflow-hidden rounded-md bg-neutral-800 p-3 shadow before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white hover:shadow-lg before:animate-[shimmer_1.5s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default LogoLoadingComponent;
