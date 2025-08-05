import {
  BottomSheet,
  DiscordIcon,
  Typography,
  XSolidIcon,
} from "@gardenfi/garden-book";
import { useState } from "react";
import {
  externalRoutes,
  routes,
  SOCIAL_LINKS,
} from "../../constants/constants";
import { isCurrentRoute } from "../../utils/utils";
import { useNotificationStore } from "../../store/notificationStore";
import { HamburgerIcon } from "../../common/HamburgerIcon";
import { MenuNotification } from "../../common/MenuNotification";
import { Link } from "react-router-dom";

export const MobileMenu = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { notification } = useNotificationStore();

  const handleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleOpenChange = (open: boolean) => {
    setSidebarOpen(open);
  };

  return (
    <>
      <div
        className={`z-[999] flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full transition-all duration-500 sm:hidden ${isSidebarOpen ? "bg-white" : "bg-white/50"}`}
        onClick={handleSidebar}
      >
        <HamburgerIcon isSidebarOpen={isSidebarOpen} />
      </div>

      <BottomSheet open={isSidebarOpen} onOpenChange={handleOpenChange}>
        <div className="flex flex-col items-end gap-8 rounded-2xl bg-white p-6">
          <div className={`flex w-full flex-col gap-4 text-left`}>
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
                  <Typography size="h3" weight={isActive ? "bold" : "medium"}>
                    {route.name}
                  </Typography>
                </a>
              );
            })}
          </div>
          <div className={`flex w-full flex-col gap-4 text-left`}>
            {externalRoutes.map(([, route]) => {
              return (
                <a
                  key={route.name}
                  href={route.path}
                  target={route.isExternal ? "_blank" : undefined}
                  rel={route.isExternal ? "noreferrer" : undefined}
                >
                  <Typography size="h3" weight="medium">
                    {route.name}
                  </Typography>
                </a>
              );
            })}
          </div>
          <div className={`flex w-full gap-6`}>
            {/* TODO: import social media Icons and links */}
            <Link to={SOCIAL_LINKS.discord} target="_blank">
              <DiscordIcon />
            </Link>
            <Link to={SOCIAL_LINKS.x} target="_blank">
              <XSolidIcon />
            </Link>
          </div>
        </div>

        {notification && <MenuNotification notification={notification} />}
      </BottomSheet>
    </>
  );
};
