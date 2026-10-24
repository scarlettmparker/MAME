import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "@sun/i18n";
import { Button, Card, CardBody, CardHeader, CardTitle } from "@sun/components";
import NotesListItems from "./notes-list-items";
import styles from "./notes.module.css";

const NotesPage = () => {
  const { t } = useTranslation("mame");
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target");

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader>
          <CardTitle>{t("notes.title")}</CardTitle>
        </CardHeader>
        <CardBody>
          {!target ? (
            <p className={styles.empty}>{t("notes.no_target")}</p>
          ) : (
            <Suspense fallback={null}>
              <NotesListItems target={target} />
            </Suspense>
          )}
        </CardBody>
      </Card>
      {target && (
        <div className={styles.actions}>
          <Link to={`/notes/create?target=${encodeURIComponent(target)}`}>
            <Button variant="default">{t("notes.new")}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
