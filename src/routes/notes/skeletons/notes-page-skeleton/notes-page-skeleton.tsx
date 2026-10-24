import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./notes-page-skeleton.module.css";

/**
 * Skeleton for the notes page.
 */
const NotesPageSkeleton = () => {
  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <CardHeader>
          <Skeleton className={styles.skeleton_title} />
        </CardHeader>
        <CardBody className={styles.body}>
          <Skeleton className={styles.skeleton_block} />
        </CardBody>
      </Card>
    </div>
  );
};

export default NotesPageSkeleton;
