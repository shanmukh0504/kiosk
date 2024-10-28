import axios from "axios";
import { useEffect } from "react";
import buildIdStore from "../store/buildIdStore";
import { API } from "../constants/api";

export const useBuildIdCheck = () => {
  const currentBuildId = process.env.BUILD_ID;
  const { setBuildId } = buildIdStore();

  useEffect(() => {
    const fetchBuildId = async () => {
      try {
        const response = await axios.get<{
          buildId: string;
        }>(API().buildId);

        if (!response.data.buildId || !currentBuildId) return;

        setBuildId({
          currentId: currentBuildId,
          remoteID: response.data.buildId,
        });
      } catch (error) {
        console.error("Failed to fetch build ID from host", error);
      }
    };

    setInterval(() => {
      void fetchBuildId();
    }, 30000);
  }, [currentBuildId, setBuildId]);
};
