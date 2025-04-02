"use client";

import { useVWorldMap } from "@/hooks/useVWorldMap";

export default function MapPage() {
  useVWorldMap();

  return (
    <div>
      <div id="vmap" className="w-full h-[1000px]"></div>
    </div>
  );
}
