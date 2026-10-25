import { useEffect, useRef } from "react";
import { executeMutation } from "@sun/ssr";
import type { Nostalgist } from "nostalgist";
import type { GetPresignedDownloadUrlResponse } from "~/generated/graphql";
import styles from "./emulator-view.module.css";

type EmulatorViewProps = {
  /**
   * ROM key to load, or null when no ROM is selected.
   */
  romKey: string | null;
  /**
   * Called with the active nostalgist instance, or null after exit.
   */
  onNostalgistChange: (nostalgist: Nostalgist | null) => void;
  /**
   * Called when ROM loading starts or finishes.
   */
  onLoadingChange: (loading: boolean) => void;
};

const EmulatorView = (props: EmulatorViewProps) => {
  const { romKey, onNostalgistChange, onLoadingChange } = props;
  const containerRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<Nostalgist | null>(null);

  useEffect(() => {
    return () => {
      if (nostalgistRef.current) {
        nostalgistRef.current.exit();
        nostalgistRef.current = null;
        onNostalgistChange(null);
      }
    };
  }, [onNostalgistChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!romKey || !container) return;

    let cancelled = false;

    const load = async () => {
      onLoadingChange(true);
      try {
        if (nostalgistRef.current) {
          nostalgistRef.current.exit();
          nostalgistRef.current = null;
          onNostalgistChange(null);
        }

        const { Nostalgist: NostalgistLoader } = await import("nostalgist");
        const res = await executeMutation<GetPresignedDownloadUrlResponse>(
          "emulator/get-presigned-download-url",
          { key: romKey },
        );
        if (!res.url || cancelled) return;

        const romRes = await fetch(res.url);
        const blob = await romRes.blob();
        if (cancelled) return;

        const file = new File([blob], romKey.split("/").pop() ?? "game.rom");
        await new Promise<void>((resolve) => {
          window.requestIdleCallback(() => resolve(), { timeout: 2000 });
        });
        if (cancelled) return;

        const nostalgistInstance = await NostalgistLoader.launch({
          core: "genesis_plus_gx",
          rom: file,
          element: container,
          respondToGlobalEvents: false,
          shader: "mix_frames_smart",
          resolveShader: () => [
            {
              fileName: "mix_frames_smart.glslp",
              fileContent: "/shaders/mix_frames_smart.glslp",
            },
            {
              fileName: "mix_frames_smart.glsl",
              fileContent: "/shaders/shaders/mix_frames_smart.glsl",
            },
          ],
          retroarchConfig: {
            rewind_enable: false,
            savestate_auto_save: false,
            savestate_auto_load: false,
            savestate_thumbnail_enable: false,
            video_vsync: false,
            video_threaded: false,
            video_smooth: false,
            video_refresh_rate: 59.92,
            video_black_frame_insertion: false,
            video_shader_enable: true,
            video_shader_delay: 0,
            audio_sync: true,
            audio_latency: 64,
            input_poll_type_behavior: 0,
          },
          async beforeLaunch(nostalgistInstanceParam) {
            nostalgistRef.current = nostalgistInstanceParam;
          },
        });

        if (cancelled) {
          nostalgistInstance.exit();
          return;
        }

        nostalgistRef.current = nostalgistInstance;
        onNostalgistChange(nostalgistInstance);
      } finally {
        if (!cancelled) onLoadingChange(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [romKey, onNostalgistChange, onLoadingChange]);

  return (
    <canvas
      ref={containerRef}
      className={styles.canvas}
      tabIndex={0}
      style={{ backgroundColor: "#000" }}
      onClick={() => containerRef.current?.focus()}
    />
  );
};

export default EmulatorView;
