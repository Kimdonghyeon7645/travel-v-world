/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAnalysisSunlight } from "@/hooks/useAnalysisSunlight";
import { useVWorldMap } from "@/hooks/useVWorldMap";
import { useState } from "react";

export default function MapPage() {
  const [res, setRes] = useState<any[]>([]);
  const {} = useVWorldMap();
  const { pickPoint, runSunlight } = useAnalysisSunlight(setRes);

  return (
    <div className="relative flex">
      <div className="h-[100vh] w-[20vw] bg-white shadow-[2px_15px_30px_0px_#11111155] !border-[#aaa] !border-r-[1.5px] z-10 !py-2 !px-4">
        <div className="flex tracking-tighter justify-between items-start !mb-1">
          <div className="flex font-bold text-[1.6rem] leading-7.5 text-[#444]">V-World 실험실</div>
          <div className="flex flex-col gap-1">
            <div
              className="flex justify-center items-center !border-sky-700 !border text-sky-700 font-medium rounded-full h-[35px] w-[115px] cursor-pointer text-[0.95rem]"
              onClick={pickPoint}
            >
              분석지점 선택
            </div>
            <div
              className="flex justify-center items-center bg-sky-700 text-white font-medium rounded-full h-[35px] w-[115px] cursor-pointer text-[0.95rem]"
              onClick={() => runSunlight(15, 5, 20)}
            >
              분석수행
            </div>
             
          </div>
        </div>

        <div>일조량 분석결과</div>
        <div className="tracking-tight">
          {res.map((e, i) => (
            <div key={i} className="flex justify-between !px-2 !py-0.5 !border-[#ddd] !border-b">
              <div>
                {e.h0}시 ~ {e.h1}시
              </div>
              <div>{e.sunLight}</div>
            </div>
          ))}
        </div>
      </div>
      <div id="vmap" className="w-[80vw] h-[100vh]"></div>
    </div>
  );
}
