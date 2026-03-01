import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

let lastVersion = -1;

export async function captureCanvas(
  api: ExcalidrawImperativeAPI
): Promise<Blob | null> {
  const { exportToBlob, getSceneVersion } = await import(
    "@excalidraw/excalidraw"
  );

  const elements = api.getSceneElements();
  const currentVersion = getSceneVersion(elements);

  if (currentVersion === lastVersion || elements.length === 0) {
    return null;
  }

  lastVersion = currentVersion;

  const blob = await exportToBlob({
    elements,
    appState: {
      ...api.getAppState(),
      exportWithDarkMode: false,
      exportBackground: true,
    },
    files: api.getFiles(),
    mimeType: "image/png",
  });

  return blob;
}

export function resetCaptureState() {
  lastVersion = -1;
}
