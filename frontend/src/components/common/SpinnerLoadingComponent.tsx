import { Spinner } from "@nextui-org/react";

const SpinnerLoadingComponent = ({}) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="flex justify-center">
        <Spinner size="md" color="warning" />
      </div>
      <div className="flex justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    </div>
  );
};

export default SpinnerLoadingComponent;
