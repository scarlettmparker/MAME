import { useRef, useEffect, useState } from "react";
import { Nostalgist } from "nostalgist";
import { Button } from "@sun/components";
import { executeMutation } from "@sun/ssr";
import { useTranslation } from "react-i18next";
import type { GetPresignedDownloadUrlResponse } from "~/generated/graphql";
import RomPickerDialog from "~/components/emulator/rom-picker-dialog";
import styles from "./mame.module.css";

/**
 * Emulator page with canvas and ROM picker.
 */
const MAMEPage = () => {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<Nostalgist | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { t } = useTranslation("mame");

  useEffect(() => {
    fetch("/cores/genesis_plus_gx.wasm", { cache: "force-cache" }).catch(
      () => {},
    );
    fetch("/cores/genesis_plus_gx.js", { cache: "force-cache" }).catch(
      () => {},
    );
  }, []);

  useEffect(() => {
    if (isRunning) containerRef.current?.focus();
  }, [isRunning]);

  useEffect(() => {
    return () => {
      if (nostalgistRef.current) {
        nostalgistRef.current.exit();
      }
    };
  }, []);

  const loadROM = async (file: File) => {
    if (!containerRef.current) return;

    try {
      if (nostalgistRef.current) {
        nostalgistRef.current.exit();
      }
      const nostalgist = await Nostalgist.launch({
        core: "genesis_plus_gx",
        rom: file,
        element: containerRef.current,
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
        async beforeLaunch(nostalgistInstance) {
          nostalgistRef.current = nostalgistInstance;
        },
      });
      nostalgistRef.current = nostalgist;
      setIsRunning(true);
    } catch {
      setIsRunning(false);
    }
  };

  const handleSelect = async (key: string) => {
    setPickerOpen(false);
    const res = await executeMutation<GetPresignedDownloadUrlResponse>(
      "emulator/get-presigned-download-url",
      { key },
    );
    if (!res.url) return;
    const romRes = await fetch(res.url);
    const blob = await romRes.blob();
    const file = new File([blob], key.split("/").pop() ?? "game.rom");
    await loadROM(file);
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={containerRef}
        className={styles.canvas}
        tabIndex={0}
        onClick={() => containerRef.current?.focus()}
      />
      <Button onClick={() => setPickerOpen(true)}>
        {isRunning ? t("change-rom") : t("select-rom")}
      </Button>
      <RomPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default MAMEPage;
