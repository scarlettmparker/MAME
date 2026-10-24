import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./save-state-panel-skeleton.module.css";

/**
 * Skeleton for the save-state panel.
 */
const SaveStatePanelSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className={styles.skeleton_title} />
      </CardHeader>
      <CardBody className={styles.body}>
        <Skeleton className={styles.skeleton_row} />
        <Skeleton className={styles.skeleton_row} />
      </CardBody>
    </Card>
  );
};

export default SaveStatePanelSkeleton;
