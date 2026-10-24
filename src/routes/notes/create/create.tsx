import { Suspense, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "@sun/i18n";
import { Button, Card, CardBody, Form } from "@sun/components";
import { executeMutation } from "@sun/ssr";
import CreateForm from "./create-form";
import styles from "./create.module.css";

const NoteCreatePage = () => {
  const { t } = useTranslation("mame");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") ?? "");
    const content = String(formData.get("content") ?? "");
    const typeId = String(formData.get("typeId") ?? "");
    try {
      const res = await executeMutation<{ post: { id: string } }>("blog/create", {
        title,
        input: {
          content,
          ...(typeId ? { typeId } : {}),
          ...(target ? { remoteObject: [target] } : {}),
        },
      });
      if (res.post?.id) {
        navigate(`/notes/${res.post.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card>
        <CardBody>
          <Form id="note-create-form" onSubmit={handleSubmit}>
            <Suspense fallback={null}>
              <CreateForm />
            </Suspense>
          </Form>
        </CardBody>
      </Card>
      <div className={styles.actions}>
        <Button type="submit" form="note-create-form" disabled={loading}>
          {loading ? t("notes.form.creating") : t("notes.form.create")}
        </Button>
      </div>
    </div>
  );
};

export default NoteCreatePage;
