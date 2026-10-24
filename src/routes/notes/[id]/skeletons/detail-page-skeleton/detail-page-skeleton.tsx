import { Card, CardBody, CardHeader, Skeleton } from "@sun/components";
import styles from "./detail-page-skeleton.module.css";

const DetailPageSkeleton = () => (
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

export default DetailPageSkeleton;
