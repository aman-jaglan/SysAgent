"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useState } from "react";

interface ExcalidrawEditorProps {
  onApiReady?: (api: ExcalidrawImperativeAPI) => void;
}

export function ExcalidrawEditor({ onApiReady }: ExcalidrawEditorProps) {
  const [, setApi] = useState<ExcalidrawImperativeAPI | null>(null);

  return (
    <div className="h-full w-full">
      <Excalidraw
        theme="dark"
        excalidrawAPI={(api) => {
          setApi(api);
          onApiReady?.(api);
        }}
        UIOptions={{
          canvasActions: {
            loadScene: false,
          },
        }}
      />
    </div>
  );
}
