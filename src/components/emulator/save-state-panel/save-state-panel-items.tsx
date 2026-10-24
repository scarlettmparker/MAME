import { useState, useEffect, useCallback } from "react";
import { usePageData } from "@sun/ssr/react";
import { executeMutation, invalidatePageData } from "@sun/ssr";
import { Button } from "@sun/components";
import { useTranslation } from "@sun/i18n";
import { Nostalgist } from "nostalgist";
import type { KeyEntry } from "~/generated/graphql";
import type {
  GetPresignedUploadUrlResponse,
  GetPresignedDownloadUrlResponse,
} from "~/generated/graphql";
import styles from "./save-state-panel.module.css";

type SaveStatePanelItemsProps = {
  /**
   * Loaded ROM key.
   */
  romKey: string;
  /**
   * Active nostalgist instance, or null.
   */
  nostalgist: Nostalgist | null;
};

const SaveStatePanelItems = (props: SaveStatePanelItemsProps) => {
  const { romKey, nostalgist } = props;
  const { t } = useTranslation("mame");
  const { data: saves } = usePageData<KeyEntry[]>("saves", "saves", { key: romKey });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (saves?.length) {
      if (!selectedKey || !saves.some((s) => s.key === selectedKey)) {
        setSelectedKey(saves[0].key);
      }
    } else {
      setSelectedKey(null);
    }
  }, [saves, selectedKey]);

  const handleSaveNew = useCallback(async () => {
    if (!nostalgist) return;
    const { state } = await nostalgist.saveState();
    const key = `saves/${romKey}/state-${Date.now()}.state`;
    const res = await executeMutation<GetPresignedUploadUrlResponse>(
      "filestore/get-presigned-upload-url",
      { bucket: "emulator-saves", key, contentType: "application/octet-stream" },
    );
    await fetch(res.url, { method: "PUT", body: state });
    invalidatePageData();
  }, [nostalgist, romKey]);

  const handleOverwrite = useCallback(async () => {
    if (!selectedKey || !nostalgist) return;
    const { state } = await nostalgist.saveState();
    const res = await executeMutation<GetPresignedUploadUrlResponse>(
      "filestore/get-presigned-upload-url",
      { bucket: "emulator-saves", key: selectedKey, contentType: "application/octet-stream" },
    );
    await fetch(res.url, { method: "PUT", body: state });
    invalidatePageData();
  }, [nostalgist, selectedKey]);

  const handleLoad = useCallback(async () => {
    if (!selectedKey || !nostalgist) return;
    const res = await executeMutation<GetPresignedDownloadUrlResponse>(
      "filestore/get-presigned-download-url",
      { bucket: "emulator-saves", key: selectedKey },
    );
    const download = await fetch(res.url);
    const blob = await download.blob();
    await nostalgist.loadState(blob);
  }, [nostalgist, selectedKey]);

  const handleDelete = useCallback(async () => {
    if (!selectedKey) return;
    await executeMutation("filestore/delete-file", {
      bucket: "emulator-saves",
      key: selectedKey,
    });
    invalidatePageData();
  }, [selectedKey]);

  return (
    <div className={styles.body}>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={handleSaveNew} disabled={!nostalgist}>
          {t("save.save_new")}
        </Button>
        <Button
          variant="secondary"
          onClick={handleOverwrite}
          disabled={!selectedKey || !nostalgist}
        >
          {t("save.overwrite")}
        </Button>
        <Button
          variant="secondary"
          onClick={handleLoad}
          disabled={!selectedKey || !nostalgist}
        >
          {t("save.load")}
        </Button>
        <Button
          variant="secondary"
          onClick={handleDelete}
          disabled={!selectedKey}
        >
          {t("save.delete")}
        </Button>
      </div>
      <div className={styles.list}>
        {!saves?.length ? (
          <p className={styles.empty}>{t("save.none")}</p>
        ) : (
          saves.map((save) => (
            <Button
              key={save.key}
              variant={save.key === selectedKey ? "default" : "secondary"}
              className={styles.item}
              onClick={() => setSelectedKey(save.key)}
            >
              <span className={styles.item_name}>{save.name ?? save.key}</span>
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default SaveStatePanelItems;
