import { create } from "zustand";

type BuildId = {
  currentId: string;
  remoteID: string;
};

type BuildIdStoreState = {
  buildId: BuildId;
  newVersionAvailable: boolean;
  setBuildId: (buildId: BuildId) => void;
};

const buildIdStore = create<BuildIdStoreState>((set) => ({
  buildId: {
    currentId: "",
    remoteID: "",
  },
  newVersionAvailable: false,
  setBuildId: (buildId) => {
    if (buildId.currentId !== buildId.remoteID) {
      return set({ buildId, newVersionAvailable: true });
    }
    return set({ buildId, newVersionAvailable: false });
  },
}));

export default buildIdStore;
