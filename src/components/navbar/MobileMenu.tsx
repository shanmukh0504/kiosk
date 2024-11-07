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
        className="sm:hidden justify-center flex items-center min-h-8 min-w-8 rounded-full bg-white/50 cursor-pointer"
        onClick={handleSidebar}
      >
        <MenuIcon />
      </div>

      <Sidebar open={isSidebarOpen} className="z-40 !px-0 py-6 " size={"small"}>
        <div className=" flex flex-col items-end py-2 gap-8">
          <div className="px-6 cursor-pointer">
            <CloseIcon onClick={handleSidebar} />
          </div>
          <div className={`flex flex-col text-right w-full`}>
            {Object.values(INTERNAL_ROUTES).map((route) => {
              return (
                <a
                  key={route.path}
                  href={route.path}
                  className={`px-6 py-[14px] hover:bg-white`}
                >
                  <Typography
                    size="h2"
                    weight={isCurrentRoute(route.path) ? "bold" : "medium"}
                  >
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
