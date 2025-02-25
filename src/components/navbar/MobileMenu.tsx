import {
  CloseIcon,
  MenuIcon,
  Sidebar,
  Typography,
} from "@gardenfi/garden-book";
import { useState } from "react";
import { INTERNAL_ROUTES } from "../../constants/constants";
import { isCurrentRoute } from "../../utils/utils";

export const MobileMenu = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div
        className="flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full bg-white/50 sm:hidden"
        onClick={handleSidebar}
      >
        <MenuIcon />
      </div>

      <Sidebar open={isSidebarOpen} className="z-40 !px-0 py-6" size={"small"}>
        <div className="flex flex-col items-end gap-8 py-2">
          <div className="cursor-pointer px-6">
            <CloseIcon onClick={handleSidebar} />
          </div>
          <div className={`flex w-full flex-col text-right`}>
            {Object.values(INTERNAL_ROUTES).map((route) => {
              const paths = route.path;
              const isActive = paths.some(isCurrentRoute);
              const primaryPath = paths[0];
              return (
                <a
                  key={primaryPath}
                  href={primaryPath}
                  className="px-6 py-[14px] hover:bg-white"
                >
                  <Typography size="h2" weight={isActive ? "bold" : "medium"}>
                    {route.name}
                  </Typography>
                </a>
              );
            })}
          </div>
        </div>
      </Sidebar>
    </>
  );
};
