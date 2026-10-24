import { useState, Suspense, useCallback } from "react";
import type { Nostalgist } from "nostalgist";
import { Button } from "@sun/components";
import { useTranslation } from "@sun/i18n";
import RomPickerDialog from "~/components/emulator/rom-picker-dialog";
import EmulatorView from "~/components/emulator/emulator-view";
import { EmulatorViewSkeleton } from "~/components/emulator/emulator-view/skeletons";
import SaveStatePanel from "~/components/emulator/save-state-panel";
import NotesPanel from "~/components/emulator/notes-panel";
import styles from "./mame.module.css";

const MAMEPage = () => {
  const [nostalgist, setNostalgist] = useState<Nostalgist | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [currentRomKey, setCurrentRomKey] = useState<string | null>(null);
  const [isLoadingRom, setIsLoadingRom] = useState(false);
  const { t } = useTranslation("mame");

  const handleSelect = (key: string) => {
    setPickerOpen(false);
    setCurrentRomKey(key);
    setIsRunning(true);
  };

  const handleNostalgistChange = useCallback((instance: Nostalgist | null) => {
    setNostalgist(instance);
    if (!instance) setIsRunning(false);
  }, []);

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <Suspense fallback={<EmulatorViewSkeleton />}>
          <EmulatorView
            romKey={currentRomKey}
            onNostalgistChange={handleNostalgistChange}
            onLoadingChange={setIsLoadingRom}
          />
        </Suspense>
        <Button
          className={styles.select_button}
          onClick={() => setPickerOpen(true)}
          disabled={isLoadingRom}
        >
          {isLoadingRom ? t("loading-rom") : isRunning ? t("change-rom") : t("select-rom")}
        </Button>
        <RomPickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelect}
        />
      </div>
      <aside className={styles.sidebar}>
        <SaveStatePanel romKey={currentRomKey} nostalgist={nostalgist} />
        <NotesPanel romKey={currentRomKey} />
      </aside>
    </div>
  );
};

export default MAMEPage;
