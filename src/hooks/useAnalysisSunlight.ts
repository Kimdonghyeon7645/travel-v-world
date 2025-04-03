/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";

export const useAnalysisSunlight = (sendResult: (res: any[]) => void) => {
  const result = useRef<any[]>([]);
  const selectPoint = useRef<any>(null);

  const _spotmarkerPin = "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlight/spotmarkerS.png";
  const _spotmarkerSunny = "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlight/sunny.png";

  useEffect(() => loadEnv(), []);

  const loadEnv = () => {
    setClock();
    ws3d.viewer.setting.useSunLighting = true; //태양 광원 사용 여부, true시 태양 광원을 활성화 함, false시 객체 정면을 광원방향으로 함
    ws3d.viewer.scene.sun.glowFactor = 10; // 태양 빛 증가
    ws3d.viewer.shadows = true;
    ws3d.viewer.terrainShadows = 3; // 지형 그림자 사용 활성화
  };

  const setClock = (date: any = null, time: any = null) => {
    const now = ws3d.common.JulianDate.toDate(ws3d.viewer.clock.currentTime);

    if (date && date !== null) {
      now.setFullYear(date.y);
      now.setMonth(date.m);
      now.setDate(date.d);
    } else if (time && time !== null) {
      now.setHours(time.h);
      now.setMinutes(time.m);
      now.setSeconds(time.s);
    }

    const julianDate = ws3d.common.JulianDate.fromDate(now);
    ws3d.viewer.clock.currentTime = julianDate;
    ws3d.viewer.clock.startTime = julianDate.clone();
    julianDate.secondsOfDay = julianDate.secondsOfDay + 0.1;
    ws3d.viewer.clock.stopTime = julianDate.clone();
  };

  /**
   * 1. 위치 선택 (Sun 마커 찍기)
   */

  const drawSunObject = (callback?: any) => {
    if (!selectPoint.current) return;

    ws3d.viewer.objectManager.removeGroupGeometries("SUN_OBJ");
    const ThreeDTileLayerElement = ws3d.viewer.map.getElementArray();
    ws3d.viewer.navigation.createSunMarker(
      selectPoint.current,
      {
        image: _spotmarkerPin,
        width: 32,
        height: 64,
      },
      {
        image: _spotmarkerSunny,
        width: 32,
        height: 32,
      },
      {
        text: "태양 위치",
        font: "16px S-Core Dream",
      },
      ThreeDTileLayerElement,
      "SUN_OBJ",
      callback
    );
  };

  const pickSunHandler = (windowPosition: any, ecefPosition: any, cartographic: any) => {
    selectPoint.current = new ws3d.common.OgcPoint(
      (cartographic.longitude / Math.PI) * 180,
      (cartographic.latitude / Math.PI) * 180,
      cartographic.height
    );

    drawSunObject();
    ws3d.viewer.canvas.style.cursor = "grab"; // 마우스 커서 변경
    ws3d.viewer.map.excludeTerrainModifierOnPicking = true; // 지형 수정 객체 피킹을 위해 옵션 수정
    ws3d.viewer.map.onPickingElement.removeEventListener(pickSunHandler);
  };

  const pickPoint = () => {
    ws3d.viewer.canvas.style.cursor = "pointer"; // 마우스 커서 변경
    ws3d.viewer.map.excludeTerrainModifierOnPicking = false; // 지형 수정 객체 피킹을 위해 옵션 수정
    ws3d.viewer.map.onPickingElement.addEventListener(pickSunHandler);
  };

  /**
   * 2. 분석 수행
   */

  const runSunlight = async (interval: number, stTime: number, endTime: number, callback: () => void = () => {}) => {
    if (!selectPoint.current) return;
    if (!(interval == 1 || interval == 5 || interval == 10 || interval == 15)) return;
    const baseDttm = ws3d.common.JulianDate.toDate(ws3d.viewer.clock.currentTime);

    await _sunshineProc(stTime, interval, baseDttm);
    for (let i = stTime + 1; i <= endTime; i++) await _sunshineProc(i, interval, baseDttm);
    await _sunshineProc(-1, interval, baseDttm);

    callback();
  };

  const _sunshineProc = (hours: number, interval: number, dttm: any) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        if (hours > -1) {
          let sunshine_time = 0;

          for (let minutes = interval; minutes <= 60; minutes += interval) {
            setClock(null, { h: hours, m: minutes, s: 0 });
            drawSunObject((selectPointMarker: any, sunPointMarker: any, pickFromRay: any) => {
              // 선택지점-태양 사이의 선택된 객체가 없으면 일조시간 (pickFromRay 안에 선택된 객체가 없으면 일조 시간 누적)
              if (pickFromRay.length == 0) sunshine_time += interval;
            });
          }

          result.current.push({ h0: hours - 1, h1: hours, sunLight: sunshine_time });
        } else {
          setClock(null, { h: dttm.getHours(), m: dttm.getMinutes(), s: dttm.getSeconds() });
          drawSunObject();
          console.log(result.current);
          sendResult(result.current);
          return;
        }
        resolve();
      }, 200);
    });

  return {
    pickPoint,
    runSunlight,
  };
};
