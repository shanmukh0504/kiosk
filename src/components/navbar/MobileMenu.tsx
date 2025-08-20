import {
  BottomSheet,
  DiscordIcon,
  Typography,
  XIcon,
} from "@gardenfi/garden-book";
import { useState } from "react";
import {
  externalRoutes,
  routes,
  SOCIAL_LINKS,
} from "../../constants/constants";
import { isCurrentRoute } from "../../utils/utils";
import { notificationStore } from "../../store/notificationStore";
import { Fade as Hamburger } from "hamburger-react";
import { MenuNotification } from "../../common/MenuNotification";
import { Link } from "react-router-dom";

export const MobileMenu = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const { notification } = notificationStore();

  const handleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
  };

  return (
    <>
      <div
        className={`z-[999] flex max-h-8 max-w-8 cursor-pointer items-center justify-center rounded-full transition-all duration-500 sm:hidden ${isSidebarOpen ? "bg-white" : "bg-white/50"}`}
        onClick={handleSidebar}
      >
        <span>
          <Hamburger toggled={isSidebarOpen} size={16} rounded />
        </span>
      </div>

      <BottomSheet open={isSidebarOpen} onOpenChange={handleOpenChange}>
        <div className="flex flex-col items-end gap-8 rounded-2xl bg-white p-6">
          <div className={`flex w-full flex-col gap-3 text-left`}>
            {routes.map(([, route]) => {
              const paths = route.path;
              const isActive = paths.some(isCurrentRoute);
              const primaryPath = paths[0];
              return (
                <a
                  key={primaryPath}
                  href={primaryPath}
                  target={route.isExternal ? "_blank" : undefined}
                  rel={route.isExternal ? "noreferrer" : undefined}
                  onClick={() => handleSidebar()}
                >
                  <Typography
                    size="h3"
                    weight={isActive ? "medium" : "regular"}
                  >
                    {route.name}
                  </Typography>
                </a>
              );
            })}
          </div>
          <div className={`flex w-full flex-col gap-3 text-left`}>
            {externalRoutes.map(([, route]) => {
              return (
                <a
                  key={route.name}
                  href={route.path}
                  target={route.isExternal ? "_blank" : undefined}
                  rel={route.isExternal ? "noreferrer" : undefined}
                >
                  <Typography size="h3" weight="regular">
                    {route.name}
                  </Typography>
                </a>
              );
            })}
          </div>
          <div className={`flex w-full gap-6 text-dark-grey`}>
            {/* TODO: import social media Icons and links */}
            <Link to={SOCIAL_LINKS.discord} target="_blank">
              <DiscordIcon />
            </Link>
            <Link to={SOCIAL_LINKS.x} target="_blank">
              <XIcon />
            </Link>
          </div>
        </div>

        {notification && <MenuNotification notification={notification} />}
      </BottomSheet>
    </>
  );
};
