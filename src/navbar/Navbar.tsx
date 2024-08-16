import { GardenFullLogo, Typography } from "@gardenfi/garden-book";
import { INTERNAL_ROUTES } from "../common/constants";

export const Navbar = () => {
  const path = window.location.pathname;
  const isCurrentRoute = (route: string) => path === route;

  return (
    <div className={"flex items-center px-10 py-6 gap-16"}>
      <GardenFullLogo />
      <div className="flex gap-12">
        {Object.values(INTERNAL_ROUTES).map((route) => {
          return (
            <a key={route.path} href={route.path}>
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
      <div className="ml-auto">Address</div>
    </div>
  );
};
