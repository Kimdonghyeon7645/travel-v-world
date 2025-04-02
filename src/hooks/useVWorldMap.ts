"use client";

import { useEffect } from "react";

export const useVWorldMap = () => {
  useEffect(() => {
    function vwmap() {
      const options = {
        mapId: "vmap",
        initPosition: new vw.CameraPosition(new vw.CoordZ(126.949975, 37.5467447, 100), new vw.Direction(0, -40, 0)),
        logo: true,
        navigation: true,
      };

      const map = new vw.Map();
      map.setOption(options);
      map.start();
    }
    vwmap();
  }, []);

  return {};
};
