/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Cursor from "@/components/icon/Cursor";
import Pin from "@/components/icon/Pin";
import { useAnalysisSunlight } from "@/hooks/useAnalysisSunlight";
import { useVWorldMap } from "@/hooks/useVWorldMap";
import { useState } from "react";

export default function MapPage() {
  const [res, setRes] = useState<any[]>([]);
  const {} = useVWorldMap();
  const { pickPoint, runSunlight, canclePickMode, clearMap, isPickMode, isSelectMode } = useAnalysisSunlight(setRes);

  return (
    <div className="relative flex">
      <div className="h-[100vh] w-[380px] bg-white shadow-[2px_15px_30px_0px_#11111155] !border-[#aaa] !border-r-[1.5px] z-10 !py-2 !px-4">
        <div className="flex tracking-tighter justify-between items-start !my-1 w-full">
          <div className="flex flex-col justify-center">
            <div className="flex font-bold text-[1.6rem] leading-7 text-[#444]">V-World 실험실</div>
            <div className="!mt-[-3px] !ml-[2px] font-medium text-[#888]">NINEWATT Dev.</div>
          </div>
        </div>

        <div className="!mt-4 !mb-1 text-[#444] text-[1.25rem] font-semibold tracking-tight flex gap-1 items-center">
          1. 일조량 분석
          {isSelectMode ? <Pin /> : isPickMode ? <Cursor /> : <></>}
        </div>
        <div className="!pl-1 flex gap-1 flex-wrap">
          <div
            className="flex justify-center items-center !border-sky-700 !border text-sky-700 font-medium rounded-full h-[37px] w-[122px] cursor-pointer text-[0.92rem]"
            onClick={isSelectMode ? clearMap : isPickMode ? canclePickMode : pickPoint}
          >
            {isSelectMode ? "초기화" : isPickMode ? "선택 취소" : "분석지점 선택"}
          </div>
          <div
            className="flex justify-center items-center bg-sky-700 text-white font-medium rounded-full h-[37px] w-[122px] cursor-pointer text-[0.92rem]"
            onClick={() => runSunlight(15, 5, 20)}
          >
            분석수행
          </div>
        </div>
        <div className="tracking-tight !pt-2 !px-1">
          {res.length > 0 && (
            <div className="flex justify-between !px-2 !py-[2.5px] !border-[#ddd] !border-b font-medium">
              <div>시간대</div>
              <div>일조량</div>
            </div>
          )}
          {res.map((e, i) => (
            <div key={i} className="flex justify-between !px-2 !py-1 !border-[#ddd] !border-b">
              <div className="text-[#444]">
                {e.h0}시 - {e.h1}시
              </div>
              <div className="font-medium">{e.sunLight}</div>
            </div>
          ))}
        </div>
      </div>
      <div id="vmap" className="w-[calc(100vw-380px)] h-[100vh]"></div>
    </div>
  );
}
