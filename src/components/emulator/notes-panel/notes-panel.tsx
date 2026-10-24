import { Suspense } from "react";
import { useTranslation } from "@sun/i18n";
import NotesPanelItems from "./notes-panel-items";
import { NotesPanelSkeleton } from "./skeletons";
import styles from "./notes-panel.module.css";

type NotesPanelProps = {
  /**
   * Loaded ROM key, or null when no ROM is running.
   */
  romKey: string | null;
};

const NotesPanel = (props: NotesPanelProps) => {
  const { romKey } = props;
  const { t } = useTranslation("mame");
  const target = romKey ? `mame:rom:${romKey}` : null;

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>{t("notes.title")}</h3>
      {!target ? (
        <p className={styles.empty}>{t("notes.no_rom")}</p>
      ) : (
        <Suspense fallback={<NotesPanelSkeleton />}>
          <NotesPanelItems target={target} />
        </Suspense>
      )}
    </div>
  );
};

export default NotesPanel;
