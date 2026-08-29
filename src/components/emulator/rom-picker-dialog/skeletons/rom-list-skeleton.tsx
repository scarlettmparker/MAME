import { Skeleton } from "@sun/components";
import styles from "./rom-list-skeleton.module.css";

/**
 * Placeholder while ROMs load.
 */
const RomListSkeleton = () => {
  return <Skeleton className={styles.skeleton_block} />;
};

export default RomListSkeleton;
