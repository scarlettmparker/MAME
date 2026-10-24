import { useState, useEffect, useCallback } from "react";
import { usePageData } from "@sun/ssr/react";
import { executeMutation, invalidatePageData } from "@sun/ssr";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@sun/components";
import { MoreVertical } from "lucide-preact";
import { useTranslation } from "@sun/i18n";
import { Nostalgist } from "nostalgist";
import type { KeyEntry } from "~/generated/graphql";
import type { GetPresignedDownloadUrlResponse } from "~/generated/graphql";
import ConfirmDeleteSaveDialog from "./confirm-delete-save-dialog";
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
  /**
   * Currently loaded save key, or null.
   */
  loadedSaveKey: string | null;
  /**
   * Updates the currently loaded save key.
   */
  onLoadedSaveKey: (key: string | null) => void;
};

const SaveStatePanelItems = (props: SaveStatePanelItemsProps) => {
  const { romKey, nostalgist, loadedSaveKey, onLoadedSaveKey } = props;
  const { t } = useTranslation("mame");
  const { data: saves } = usePageData<KeyEntry[]>("saves", "saves", { key: romKey });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (saves?.length) {
      if (!selectedKey || !saves.some((s) => s.key === selectedKey)) {
        setSelectedKey(saves[0].key);
      }
    } else {
      setSelectedKey(null);
    }
  }, [saves, selectedKey]);

  const handleLoad = useCallback(
    async (key: string) => {
      if (!nostalgist) return;
      const res = await executeMutation<GetPresignedDownloadUrlResponse>(
        "filestore/get-presigned-download-url",
        { bucket: "emulator-saves", key },
      );
      const download = await fetch(res.url);
      const blob = await download.blob();
      await nostalgist.loadState(blob);
      onLoadedSaveKey(key);
    },
    [nostalgist, onLoadedSaveKey],
  );

  const requestDelete = useCallback((key: string) => {
    setDeleteKey(key);
    setConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteKey) return;
    await executeMutation("filestore/delete-file", {
      bucket: "emulator-saves",
      key: deleteKey,
    });
    if (deleteKey === loadedSaveKey) {
      onLoadedSaveKey(null);
    }
    setConfirmOpen(false);
    setDeleteKey(null);
    invalidatePageData();
  }, [deleteKey, loadedSaveKey, onLoadedSaveKey]);

  return (
    <div className={styles.body}>
      <div className={styles.list}>
        {!saves?.length ? (
          <p className={styles.empty}>{t("save.none")}</p>
        ) : (
          saves.map((save) => (
            <Button
              key={save.key}
              variant="secondary"
              className={styles.item}
              onClick={() => setSelectedKey(save.key)}
            >
              <span className={styles.item_name}>{save.name ?? save.key}</span>
              <span className={styles.item_actions}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e: MouseEvent) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <MoreVertical width={16} height={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleLoad(save.key)}>
                      {t("save.load")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => requestDelete(save.key)}
                    >
                      {t("save.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </Button>
          ))
        )}
      </div>
      <ConfirmDeleteSaveDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default SaveStatePanelItems;
