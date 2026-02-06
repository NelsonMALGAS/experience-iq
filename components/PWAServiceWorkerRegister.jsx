"use client";

import { useEffect } from "react";

const PWAServiceWorkerRegister = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) =>
          console.log("Service worker registered:", registration),
        )
        .catch((error) =>
          console.error("Service worker registration failed:", error),
        );
    }
  }, []);

  return null;
};

export default PWAServiceWorkerRegister;
