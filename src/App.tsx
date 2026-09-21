import { useEffect, useMemo, useState } from "react";
import { detectQuality } from "./lib/quality";
import { isWebGLAvailable } from "./lib/webgl";
import { Library } from "./scene/Library";
import { LibraryProvider } from "./state/library";
import { Fallback } from "./ui/Fallback";
import { Overlay } from "./ui/Overlay";

export default function App() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const quality = useMemo(() => detectQuality(), []);

  useEffect(() => {
    setWebgl(isWebGLAvailable());
  }, []);

  if (webgl === null) {
    return <div className="boot" aria-hidden="true" />;
  }

  if (!webgl) {
    return <Fallback />;
  }

  return (
    <LibraryProvider>
      <Overlay />
      <Library quality={quality} />
    </LibraryProvider>
  );
}
