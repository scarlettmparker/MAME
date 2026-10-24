import { Suspense } from "react";
import { Link } from "react-router-dom";
import { usePageData } from "@sun/ssr/react";
import { Button } from "@sun/components";
import { useTranslation } from "@sun/i18n";
import type { ListBlogPostsByRemoteObjectsQuery } from "~/generated/graphql";
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
  const { data: notes } = usePageData<NoteEntry[]>("notes", "notes", { target });

  return (
    <div className={styles.body}>
      <div className={styles.list}>
        {!notes?.length ? (
          <p className={styles.empty}>{t("notes.none")}</p>
        ) : (
          notes.map((note) => (
            <Link
              key={note.id}
              to={`/notes/${note.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              <Button variant="secondary" className={styles.item}>
                <span className={styles.item_name}>{note.title}</span>
              </Button>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default NotesPanelItems;
