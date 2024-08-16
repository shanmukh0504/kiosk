import { Footer, Opacity } from "@gardenfi/garden-book";
import { FC } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../common/utils";
import { Navbar } from "../navbar/Navbar";

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const theme = getCurrentTheme();
  return (
    <Opacity
      level={"medium"}
      className={`${theme} swap z-10 relative bg-primary overflow-hidden`}
    >
      <Navbar />
      <div className="min-h-[100vh]">{children}</div>
      <Footer className={"mt-auto"} />
      <Orb />
    </Opacity>
  );
};
