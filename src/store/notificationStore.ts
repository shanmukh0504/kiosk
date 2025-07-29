import { create } from "zustand";
import axios from "axios";
import { API } from "../constants/api";

export type NotificationProps = {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
};

type NotificationState = {
  notification: NotificationProps | null;
  isLoading: boolean;
  error: string | null;
  fetchNotification: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,
  isLoading: false,
  error: null,
  fetchNotification: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(API().data.notification().toString());
      if (response.data) {
        set({ notification: response.data.result, isLoading: false });
      } else {
        set({ notification: null, isLoading: false });
      }
    } catch (error) {
      console.log("Error getting notification", error);
      set({ error: "Failed to fetch notification", isLoading: false });
    }
  },
}));
