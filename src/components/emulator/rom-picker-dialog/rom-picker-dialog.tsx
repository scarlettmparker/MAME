import { Suspense } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@sun/components";
import { useTranslation } from "react-i18next";
import RomList from "../rom-list";
import { RomListSkeleton } from "./skeletons";

type RomPickerDialogProps = {
  /**
   * Whether the dialog is visible.
   */
  open: boolean;
  /**
   * Called when the dialog requests close.
   */
  onClose: () => void;
  /**
   * Called with the selected ROM key.
   */
  onSelect: (key: string) => void;
};

/**
 * Dialog for selecting a ROM from the emulator bucket.
 */
const RomPickerDialog = (props: RomPickerDialogProps) => {
  const { open, onClose, onSelect } = props;
  const { t } = useTranslation("mame");

  return (
    <Dialog open={open} onOpenChange={(value: boolean) => !value && onClose()}>
      <DialogHeader>
        <DialogTitle>{t("picker.title")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Suspense fallback={<RomListSkeleton />}>
          <RomList onSelect={onSelect} />
        </Suspense>
      </DialogBody>
    </Dialog>
  );
};

export default RomPickerDialog;
