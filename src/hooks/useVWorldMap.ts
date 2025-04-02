/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

export const useVWorldMap = () => {
  const isLoadedMap = useRef<boolean>(false);
  const curMode = useRef<number>(0);

  useEffect(() => {
    if (!isLoadedMap.current) {
      const options = {
        mapId: "vmap",
        initPosition: new vw.CameraPosition(new vw.CoordZ(126.949975, 37.5467447, 100), new vw.Direction(0, -40, 0)),
        logo: true,
        navigation: true,
      };

      const map = new vw.Map();
      map.setOption(options);
      map.start();

      // sunlightAnalysis.createSunObject();

      isLoadedMap.current = true;
    }
  }, []);

  const clickBtn = () => {
    switch (curMode.current) {
      case 0:
        sunlightAnalysis.drawPointOnMap();
        curMode.current = 1;
        break;
      case 1:
        sunlightAnalysis.runSunlight(15, 5, 20, function (e: any) {
          console.log("성공 : " + "clickeddata.selected");
          console.log(e);
        });
        curMode.current = 2;
        break;
    }
  };

  return { clickBtn };
};
