import React, { useRef, useEffect, useState } from "react";
import { Nostalgist } from "nostalgist";

export default function MAMEPage() {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Ready");

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadROM(file);
  };

  // Save state
  const saveState = async () => {
    if (!nostalgistRef.current) return;
    const { state } = await nostalgistRef.current.saveState();

    console.log("Save state captured");
    const blob = new Blob([state]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "genesis-save.state";
    a.click();
  };

  // Load state
  const loadState = async (stateFile: File) => {
    if (!nostalgistRef.current) return;
    const arrayBuffer = await stateFile.arrayBuffer();
    await nostalgistRef.current.loadState(new Uint8Array(arrayBuffer));
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (nostalgistRef.current) {
        nostalgistRef.current.exit();
      }
    };
  }, []);

  return (
    <div>
      <input
        type="file"
        accept=".bin,.gen,.md,.zip"
        onChange={handleFileChange}
      />

      <div style={{ margin: "10px 0" }}>
        <button onClick={saveState} disabled={!isRunning}>
          Save State
        </button>
        <label>
          Load State:{" "}
          <input
            type="file"
            accept=".state"
            onChange={(e) =>
              e.target.files?.[0] && loadState(e.target.files[0])
            }
          />
        </label>
      </div>
      <canvas
        ref={containerRef}
        style={{
          width: "640px",
          height: "480px",
          background: "#000",
          margin: "20px 0",
        }}
      />

      <p>Status: {status}</p>
    </div>
  );
}
