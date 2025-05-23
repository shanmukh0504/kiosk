import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode, useEffect, useState } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification, NotificationProps } from "../common/Notification";
import { ViewPortListener } from "../common/ViewPortListener";
import { assetInfoStore } from "../store/assetInfoStore";
import axios from "axios";
import { API } from "../constants/api";
import { notificationId } from "../constants/constants";

type LayoutProps = {
  children: ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { fetchAndSetAssetsAndChains } = assetInfoStore();
  const theme = getCurrentTheme();
  const [notification, setNotification] = useState<NotificationProps | null>(
    null
  );

  useEffect(() => {
    fetchAndSetAssetsAndChains();
    const fetchNotification = async () => {
      try {
        const response = await axios.get(
          API().data.notification(notificationId).toString()
        );
        if (response.data) {
          setNotification(response.data.result);
        }
      } catch (error) {
        console.log("Error fetching notification", error);
      }
    };
    fetchNotification();
  }, [fetchAndSetAssetsAndChains]);

  return (
    <div className={`${theme} relative overflow-hidden bg-opacity-50`}>
      <div className="absolute inset-0 z-[-30] bg-primary"></div>
      <Orb />
      <ViewPortListener />
      <div className="relative z-10 bg-white bg-opacity-50">
        <Modal />
        <div className="min-h-[100vh]">
          <Navbar />
          {children}
        </div>
        {notification && <Notification {...notification} />}
        <Footer className={"mt-auto"} />
      </div>
    </div>
  );
};
