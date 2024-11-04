import { useViewport } from "../hooks/useViewport";
import { getCurrentTheme } from "../utils/utils";

const ORB_COLORS = {
  swap: "#9BC8FF",
  quests: "#FFD89C",
};

export const Orb = () => {
  const { width } = useViewport();
  const dimension = width > 1600 ? "170%" : "2024";
  const orbColor = ORB_COLORS[getCurrentTheme()];

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 2024 2024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute z-0 top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-10%]`}
    >
      <circle
        cx="1012"
        cy="1012"
        r="1012"
        fill="url(#paint0_radial_12455_11020)"
      />
      <defs>
        <radialGradient
          id="paint0_radial_12455_11020"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1012 1012) rotate(90) scale(1012)"
        >
          <stop offset="0.526115" stopColor={orbColor} />
          <stop offset="1" stopColor={orbColor} stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
};
