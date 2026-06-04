import { useRef, useEffect, useState } from "react";
import { Nostalgist } from "nostalgist";

export default function MAMEPage() {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<Nostalgist | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;

      if (event.data.startsWith("filestore:")) {
        const fileUrl = event.data.replace("filestore:", "");
        fetch(fileUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "game.rom");
            loadROM(file);
          })
          .catch((err) => {
            console.error("Failed to load ROM:", err);
            setStatus("Error loading ROM");
          });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (nostalgistRef.current) {
        nostalgistRef.current.exit();
      }
    };
  }, []);

  // Load and start a ROM
  const loadROM = async (file: File) => {
    if (!containerRef.current) return;

    setStatus("Loading...");

    try {
      const nostalgist = await Nostalgist.launch({
        core: "genesis_plus_gx",
        rom: file,
        element: containerRef.current,

        retroarchConfig: {
          rewind_enable: true,
          savestate_auto_save: true,
          savestate_auto_load: false,
        },

        // Called after launch but before emulation starts
        async beforeLaunch(nostalgistInstance) {
          nostalgistRef.current = nostalgistInstance;
          console.log(
            "Emulator ready. FS available:",
            nostalgistInstance.getEmscriptenFS(),
          );
        },
      });

      nostalgistRef.current = nostalgist;
      setIsRunning(true);
      setStatus("Running");
    } catch (err) {
      console.error(err);
      setStatus("Error");
    }
  };

  return (
    <div>
      {!isRunning && (
        <iframe
          src="https://filestore.int.scarlettparker.co.uk"
          style={{
            width: "640px",
            height: "480px",
          }}
        />
      )}
      <canvas
        ref={containerRef}
        style={{
          width: "640px",
          height: "480px",
          background: "#000",
          margin: "20px 0",
        }}
      />
    </div>
  );
}
