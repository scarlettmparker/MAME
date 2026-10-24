import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "@sun/i18n";
import { usePageData } from "@sun/ssr/react";
import { executeMutation } from "@sun/ssr";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  Input,
  MarkdownEditor,
} from "@sun/components";
import type { LocateBlogPostQuery } from "~/generated/graphql";
import styles from "./edit.module.css";

const NoteEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("mame");
  const { data } = usePageData<LocateBlogPostQuery["blogQueries"]["locateBlogPost"]>(
    "note",
    "notes/:id/edit",
    { id },
  );
  const [saving, setSaving] = useState(false);

  if (!data) return null;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || saving) return;
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    try {
      await executeMutation("blog/update", {
        id,
        input: { title, content },
      });
      navigate(`/notes/${id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>{t("notes.edit_title")}</CardTitle>
        </CardHeader>
        <CardBody>
          <Form id="note-edit-form" onSubmit={handleSave} className={styles.editor}>
            <FormField name="title">
              <FormLabel>{t("notes.form.title")}</FormLabel>
              <FormItem>
                <Input type="text" defaultValue={data.title ?? ""} required />
              </FormItem>
            </FormField>
            <FormField name="content">
              <FormLabel>{t("notes.form.content")}</FormLabel>
              <FormItem>
                <MarkdownEditor
                  key={id}
                  value={data.content ?? ""}
                  rows={10}
                  data-testid="edit-blog-content-editor"
                  aria-label={t("notes.form.content")}
                />
              </FormItem>
            </FormField>
          </Form>
        </CardBody>
      </Card>
      <div className={styles.actions}>
        <Button variant="secondary" type="button" onClick={() => navigate(`/notes/${id}`)}>
          {t("notes.cancel")}
        </Button>
        <Button type="submit" form="note-edit-form" disabled={saving}>
          {saving ? t("notes.saving") : t("notes.save")}
        </Button>
      </div>
    </div>
  );
};

export default NoteEditPage;
