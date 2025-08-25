"use client";

import { useEffect, useState, useCallback } from "react";
import sdk, { type Context } from "@farcaster/frame-sdk";
import { createStore } from "mipd";
import React from "react";

interface FrameContextType {
  isSDKLoaded: boolean;
  context: Context.MiniAppContext | undefined;
}

const FrameContext = React.createContext<FrameContextType | undefined>(
  undefined
);

export function useFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.MiniAppContext>();
  const [added, setAdded] = useState(false);
  const [lastEvent, setLastEvent] = useState("");
  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();

      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      setIsSDKLoaded(true);

      // Set up event listeners
      sdk.on("miniAppAdded", ({ notificationDetails }) => {
        console.log("Frame added", notificationDetails);
        setAdded(true);
        setLastEvent("Frame added");
      });

      sdk.on("miniAppAddRejected", ({ reason }) => {
        console.log("Frame add rejected", reason);
        setAdded(false);
        setLastEvent(`Frame add rejected: ${reason}`);
      });

      sdk.on("miniAppRemoved", () => {
        console.log("Frame removed");
        setAdded(false);
        setLastEvent("Frame removed");
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("Notifications enabled", notificationDetails);
        setLastEvent("Notifications enabled");
      });

      sdk.on("notificationsDisabled", () => {
        console.log("Notifications disabled");
        setLastEvent("Notifications disabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("Primary button clicked");
        setLastEvent("Primary button clicked");
      });

      // Call ready action
      console.log("Calling ready");
      sdk.actions.ready();

      // Set up MIPD Store
      const store = createStore();
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
      });
    };

    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  return {
    isSDKLoaded,
    context,
    added,
    lastEvent,
    addFrame,
    addFrameResult,
  };
}

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const { isSDKLoaded, context } = useFrame();

  if (!isSDKLoaded) {
    return (
      <div className="relative z-10 h-screen w-screen bg-[#E4EBF2]">
        <div
          className="fixed bottom-0 -z-10 h-full max-h-[612px] w-screen origin-bottom overflow-hidden opacity-60"
          style={{
            background:
              "linear-gradient(180deg, rgba(188, 237, 220, 0) 0%, #BCEDDC 100%)",
          }}
        />
        <div className="loader-shine absolute left-1/2 top-1/2 h-[264px] w-[424px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-gray-200/50"></div>
      </div>
    );
  }
  return (
    <FrameContext.Provider value={{ isSDKLoaded, context }}>
      {children}
    </FrameContext.Provider>
  );
}
