"use client";

import React, { useEffect, useState } from "react";
import { Image } from "@nextui-org/react";
import { useCollabContext } from "@/contexts/collab";

interface TimerProps {
  setSessionEnded: () => void;
  timeDifference: number;
};

const Timer = ({ setSessionEnded, timeDifference } : TimerProps) => {
  const [error, setError] = useState(false);
  const { socketService } = useCollabContext();
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [time, setTime] = useState<number>(timeDifference); 
  

  if (!socketService) setError(true);

  const formatTime = (): string => {
    if (time <= 0) {
      return "00:00:00";
    }

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  useEffect(() => {
    if (time < 0) { 
      setSessionEnded();
    }
  }, [time])

  // create timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => {

        const newTime = prevTime - 1
        localStorage.setItem("time", newTime.toString());

        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (error) {
    return <></>
  }

  return (
    <div>
      {showTimer ? (
        <div className="flex items-center space-x-2 p-1.5 cursor-pointer rounded">
          <div onClick={() => setShowTimer(false)}>{formatTime()}</div>
        </div>
      ) : (
        <div
          className="flex items-center text-white cursor-pointer rounded"
          onClick={() => {
            setShowTimer(true)
          }}
        >
          <Image src="/timer.svg" className="" />
        </div>
      )}
    </div>
  );
};

export default Timer;
