import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePageData } from "@sun/ssr/react";
import { executeMutation, invalidatePageData } from "@sun/ssr";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@sun/components";
import { MoreVertical } from "lucide-preact";
import { useTranslation } from "@sun/i18n";
import type { ListBlogPostsByRemoteObjectsQuery } from "~/generated/graphql";
import ConfirmDeleteNoteDialog from "./confirm-delete-note-dialog";
import styles from "./notes-panel.module.css";

type NotesPanelItemsProps = {
  /**
   * Remote object target for the loaded ROM.
   */
  target: string;
};

type NoteEntry = NonNullable<
  NonNullable<ListBlogPostsByRemoteObjectsQuery["blogQueries"]["listByRemoteObjects"]>[number]
>;

const NotesPanelItems = (props: NotesPanelItemsProps) => {
  const { target } = props;
  const { t } = useTranslation("mame");
  const navigate = useNavigate();
  const { data: notes } = usePageData<NoteEntry[]>("notes", "notes", { target });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    await executeMutation("blog/delete", { id: deleteId });
    setConfirmOpen(false);
    setDeleteId(null);
    invalidatePageData();
  };

  return (
    <div className={styles.list}>
      {!notes?.length ? (
        <p className={styles.empty}>{t("notes.none")}</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className={styles.item}>
            <div className={styles.item_header}>
              <div className={styles.title_group}>
                <Link
                  to={`/notes/${note.id}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.title_link}
                >
                  {note.title}
                </Link>
                {note.createdAt && (
                  <span className={styles.item_date}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
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
                    <DropdownMenuItem onClick={() => navigate(`/notes/${note.id}`)}>
                      {t("notes.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => requestDelete(note.id)}
                    >
                      {t("notes.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </div>
            {note.content && <div className={styles.item_content}>{note.content}</div>}
          </div>
        ))
      )}
      <ConfirmDeleteNoteDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default NotesPanelItems;
