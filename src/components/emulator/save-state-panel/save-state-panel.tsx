import { Suspense } from "react";
import { useTranslation } from "@sun/i18n";
import SaveStatePanelItems from "./save-state-panel-items";
import { SaveStatePanelSkeleton } from "./skeletons";
import styles from "./save-state-panel.module.css";
import { Nostalgist } from "nostalgist";

type SaveStatePanelProps = {
  /**
   * Loaded ROM key, or null when no ROM is running.
   */
  romKey: string | null;
  /**
   * Active nostalgist instance, or null.
   */
  nostalgist: Nostalgist | null;
};

const SaveStatePanel = (props: SaveStatePanelProps) => {
  const { romKey, nostalgist } = props;
  const { t } = useTranslation("mame");

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>{t("save.title")}</h3>
      {!romKey ? (
        <p className={styles.empty}>{t("save.no_rom")}</p>
      ) : (
        <Suspense fallback={<SaveStatePanelSkeleton />}>
          <SaveStatePanelItems romKey={romKey} nostalgist={nostalgist} />
        </Suspense>
      )}
    </div>
  );
};

export default SaveStatePanel;
