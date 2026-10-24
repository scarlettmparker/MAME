import { Skeleton } from "@sun/components";

/**
 * Skeleton for the save-state list.
 */
const SaveStatePanelSkeleton = () => {
  return (
    <div className="save_state_skeleton">
      <Skeleton />
      <Skeleton />
    </div>
  );
};

export default SaveStatePanelSkeleton;
