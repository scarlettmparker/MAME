import { useCallback, useState } from "react";
import { Suspense } from "react";
import { executeMutation, invalidatePageData } from "@sun/ssr";
import { Button } from "@sun/components";
import { useTranslation } from "@sun/i18n";
import { Nostalgist } from "nostalgist";
import type { GetPresignedUploadUrlResponse } from "~/generated/graphql";
import SaveStatePanelItems from "./save-state-panel-items";
import { SaveStatePanelSkeleton } from "./skeletons";
import styles from "./save-state-panel.module.css";

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
  const [loadedSaveKey, setLoadedSaveKey] = useState<string | null>(null);

  const handleSaveNew = useCallback(async () => {
    if (!romKey || !nostalgist) return;
    const { state } = await nostalgist.saveState();
    const key = `saves/${romKey}/state-${Date.now()}.state`;
    const res = await executeMutation<GetPresignedUploadUrlResponse>(
      "filestore/get-presigned-upload-url",
      { bucket: "emulator-saves", key, contentType: "application/octet-stream" },
    );
    await fetch(res.url, { method: "PUT", body: state });
    invalidatePageData();
  }, [romKey, nostalgist]);

  const handleSaveCurrent = useCallback(async () => {
    if (!loadedSaveKey || !nostalgist) return;
    const { state } = await nostalgist.saveState();
    const res = await executeMutation<GetPresignedUploadUrlResponse>(
      "filestore/get-presigned-upload-url",
      { bucket: "emulator-saves", key: loadedSaveKey, contentType: "application/octet-stream" },
    );
    await fetch(res.url, { method: "PUT", body: state });
    invalidatePageData();
  }, [loadedSaveKey, nostalgist]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t("save.title")}</h3>
        {romKey && (
          <div className={styles.header_actions}>
            <Button variant="secondary" onClick={handleSaveNew} disabled={!nostalgist}>
              {t("save.save_new")}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSaveCurrent}
              disabled={!nostalgist || !loadedSaveKey}
            >
              {t("save.save_current")}
            </Button>
          </div>
        )}
      </div>
      {!romKey ? (
        <p className={styles.empty}>{t("save.no_rom")}</p>
      ) : (
        <Suspense fallback={<SaveStatePanelSkeleton />}>
          <SaveStatePanelItems
            romKey={romKey}
            nostalgist={nostalgist}
            loadedSaveKey={loadedSaveKey}
            onLoadedSaveKey={setLoadedSaveKey}
          />
        </Suspense>
      )}
    </div>
  );
};

export default SaveStatePanel;
