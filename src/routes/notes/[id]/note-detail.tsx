import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "@sun/i18n";
import { usePageData } from "@sun/ssr/react";
import { executeMutation } from "@sun/ssr";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  MarkdownViewer,
} from "@sun/components";
import type { LocateBlogPostQuery } from "~/generated/graphql";
import ConfirmDeleteNoteDialog from "./confirm-delete-note-dialog";
import styles from "./note-detail.module.css";

const NoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("mame");
  const { data } = usePageData<LocateBlogPostQuery["blogQueries"]["locateBlogPost"]>(
    "note",
    "notes/:id",
    { id },
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!data) return null;

  const handleDelete = async () => {
    if (!id) return;
    await executeMutation("blog/delete", { id });
    setDeleteOpen(false);
    window.location.assign("/notes");
  };

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader className={styles.header}>
          <CardTitle className={styles.title}>{data.title}</CardTitle>
        </CardHeader>
        <CardBody>
          <MarkdownViewer className={styles.content}>{data.content ?? ""}</MarkdownViewer>
        </CardBody>
      </Card>
      <div className={styles.actions}>
        <Link to={`/notes/${id}/edit`}>
          <Button variant="secondary">{t("notes.edit")}</Button>
        </Link>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          {t("notes.delete")}
        </Button>
      </div>
      <ConfirmDeleteNoteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default NoteDetailPage;
