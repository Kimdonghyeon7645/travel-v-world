"use client";

import { useVWorldMap } from "@/hooks/useVWorldMap";

export default function MapPage() {
  const { clickBtn } = useVWorldMap();

  return (
    <div className="relative flex">
      <div className="h-[100vh] w-[20vw] bg-white shadow-[2px_15px_30px_0px_#11111155] z-10" style={{ padding: "8px 16px" }}>
        <div className="flex tracking-tighter justify-between items-center mb-2">
          <div className="font-bold text-[1.6rem] text-[#444]">V-World 실험실</div>
          <div
            className="flex justify-center items-center bg-sky-700 text-white font-medium rounded-full h-[36px] w-[115px] cursor-pointer text-[0.95rem]"
            onClick={clickBtn}
          >
            분석지점 선택
          </div>
        </div>
        <div>일조량</div>
      </div>
      <div id="vmap" className="w-[80vw] h-[100vh]"></div>
    </div>
  );
}
