import { BottomSheet, Typography } from "@gardenfi/garden-book";
import { useState } from "react";
import { externalRoutes, routes } from "../../constants/constants";
import { isCurrentRoute } from "../../utils/utils";
import { Link } from "react-router-dom";
import { useNotificationStore } from "../../store/notificationStore";
import { motion } from "framer-motion";

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
        <div className="flex h-8 w-8 cursor-pointer flex-col justify-center gap-[3px] rounded-full p-2 backdrop-blur-md">
          <motion.span
            animate={
              isSidebarOpen
                ? {
                    y: 4.5,
                    rotate: 45,
                  }
                : {
                    y: 0,
                    rotate: 0,
                  }
            }
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              y: { delay: isSidebarOpen ? 0.1 : 0.2 },
              rotate: { delay: isSidebarOpen ? 0.2 : 0.1 },
            }}
            className="block h-[1.5px] min-h-[1.5px] w-full origin-center overflow-hidden rounded-full bg-dark-grey"
          />
          <motion.span
            animate={
              isSidebarOpen
                ? {
                    width: 0,
                    x: 8,
                  }
                : {
                    width: "100%",
                    x: 0,
                  }
            }
            transition={{
              duration: 0.2,
              ease: "easeInOut",
              delay: isSidebarOpen ? 0 : 0.4,
            }}
            className="block h-[1.5px] min-h-[1.5px] origin-center overflow-hidden rounded-full bg-dark-grey"
          />
          <motion.span
            animate={
              isSidebarOpen
                ? {
                    y: -4.5,
                    rotate: -45,
                  }
                : {
                    y: 0,
                    rotate: 0,
                  }
            }
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              y: { delay: isSidebarOpen ? 0.1 : 0.2 },
              rotate: { delay: isSidebarOpen ? 0.2 : 0.1 },
            }}
            className="block h-[1.5px] min-h-[1.5px] w-full origin-center overflow-hidden rounded-full bg-dark-grey"
          />
        </div>
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
                  onClick={() => handleSidebar()}
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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.9419 5.29661C17.6473 4.69088 16.263 4.25066 14.8157 4C14.638 4.32134 14.4304 4.75355 14.2872 5.09738C12.7487 4.86601 11.2245 4.86601 9.7143 5.09738C9.57116 4.75355 9.3588 4.32134 9.17947 4C7.73067 4.25066 6.3448 4.6925 5.05016 5.29982C2.43887 9.24582 1.73099 13.0938 2.08493 16.8872C3.81688 18.1805 5.49534 18.9662 7.14548 19.4804C7.55291 18.9196 7.91628 18.3235 8.22931 17.6953C7.63313 17.4688 7.06211 17.1892 6.52256 16.8647C6.6657 16.7586 6.80571 16.6478 6.94098 16.5337C10.2318 18.0729 13.8074 18.0729 17.0589 16.5337C17.1958 16.6478 17.3358 16.7586 17.4774 16.8647C16.9362 17.1908 16.3637 17.4704 15.7675 17.697C16.0805 18.3235 16.4423 18.9212 16.8513 19.4819C18.503 18.9678 20.183 18.1822 21.915 16.8872C22.3303 12.4897 21.2056 8.67705 18.9419 5.29661ZM8.67765 14.5543C7.68977 14.5543 6.87963 13.632 6.87963 12.509C6.87963 11.3859 7.67247 10.4621 8.67765 10.4621C9.68285 10.4621 10.493 11.3843 10.4757 12.509C10.4772 13.632 9.68285 14.5543 8.67765 14.5543ZM15.3223 14.5543C14.3344 14.5543 13.5243 13.632 13.5243 12.509C13.5243 11.3859 14.3171 10.4621 15.3223 10.4621C16.3275 10.4621 17.1376 11.3843 17.1203 12.509C17.1203 13.632 16.3275 14.5543 15.3223 14.5543Z"
                fill="#817A90"
              />
            </svg>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.81818 2C2.81364 2 2 2.81364 2 3.81818V20.1818C2 21.1864 2.81364 22 3.81818 22H20.1818C21.1864 22 22 21.1864 22 20.1818V3.81818C22 2.81364 21.1864 2 20.1818 2H3.81818ZM6.22585 6.54545H10.418L12.8647 10.0433L15.892 6.54545H17.2113L13.4577 10.892L18.0494 17.4545H13.8572L11.1424 13.5732L7.79013 17.4545H6.44957L10.5458 12.7227L6.22585 6.54545ZM8.25355 7.62145L14.3935 16.3732H16.0199L9.8782 7.62145H8.25355Z"
                fill="#817A90"
              />
            </svg>
          </div>
        </div>

        {notification && (
          <div className="flex gap-2 rounded-2xl bg-white/50 p-2">
            <Link to={notification.link} target="_blank" rel="noreferrer">
              <img
                src={notification.image}
                className="h-16 w-16 rounded-lg object-cover"
              />
            </Link>
            <div className={`flex grow gap-1`}>
              <Link
                to={notification.link}
                target="_blank"
                rel="noreferrer"
                className="flex w-fit flex-col gap-1 leading-4"
              >
                <Typography size="h5" weight="bold">
                  {notification.title}
                </Typography>
                <Typography
                  className="whitespace-wrap mb-1 inline-block overflow-hidden text-ellipsis text-[10px] text-mid-grey"
                  weight="medium"
                >
                  {notification.description}
                </Typography>
              </Link>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
};
