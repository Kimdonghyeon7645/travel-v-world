"use client";

import { useEffect, useRef } from "react";

export const useVWorldMap = () => {
  const isLoadedMap = useRef<boolean>(false);

  useEffect(() => {
    if (!isLoadedMap.current) {
      const options = {
        mapId: "vmap",
        initPosition: new vw.CameraPosition(new vw.CoordZ(126.949975, 37.5467447, 120), new vw.Direction(0, -40, 0)),
        logo: true,
        navigation: true,
      };

      const map = new vw.Map();
      map.setOption(options);
      map.start();

      isLoadedMap.current = true;
    }
  }, []);

  return {};
};
