import Lottie from "react-lottie-player";
import Spinner from "./../constants/spinner.json";
import { FC } from "react";

type LoaderProps = {
  width?: number;
  height?: number;
  speed?: number;
};

export const Loader: FC<LoaderProps> = ({
  width = 26,
  height = 26,
  speed = 2,
}) => {
  return (
    <Lottie
      loop
      animationData={Spinner}
      play
      speed={speed}
      style={{ width: width, height: height }}
    />
  );
};
