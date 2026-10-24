import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./create-page-skeleton.module.css";

const CreatePageSkeleton = () => (
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

export default CreatePageSkeleton;
