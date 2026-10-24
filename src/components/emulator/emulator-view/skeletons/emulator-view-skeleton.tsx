import { Skeleton } from "@sun/components";
import styles from "./emulator-view-skeleton.module.css";

const EmulatorViewSkeleton = () => {
  return <Skeleton className={styles.skeleton} />;
};

export default EmulatorViewSkeleton;
