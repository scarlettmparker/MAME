import { useRef, useEffect, useState } from "react";
import { Nostalgist } from "nostalgist";
import { EventBus, PostMessageBridge } from "@sun/events";
import { FILESTORE_ORIGIN, FILESTORE_EVENTS } from "@sun/shared";
import type { FilestoreEventPayloads } from "@sun/shared";

export default function MAMEPage() {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<Nostalgist | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const bridgeRef = useRef<PostMessageBridge<FilestoreEventPayloads> | null>(
    null,
  );
  const [isRunning, setIsRunning] = useState(false);
  const [_status, setStatus] = useState("Ready");

  useEffect(() => {
    const localBus = new EventBus<FilestoreEventPayloads>();
    const remoteBus = new EventBus<FilestoreEventPayloads>();

    // Listen for file download events from the filestore iframe
    remoteBus.on(FILESTORE_EVENTS.FILE_DOWNLOAD, ({ url }) => {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "game.rom");
          loadROM(file);
        })
        .catch((err) => {
          console.error("Failed to load ROM:", err);
          setStatus("Error loading ROM");
        });
    });

    bridgeRef.current = new PostMessageBridge(localBus, remoteBus, {
      target: iframeRef.current?.contentWindow ?? window,
      origin: FILESTORE_ORIGIN,
    });

    return () => bridgeRef.current?.destroy();
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
          referrerPolicy="no-referrer-when-downgrade"
          ref={iframeRef}
          src={FILESTORE_ORIGIN}
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
