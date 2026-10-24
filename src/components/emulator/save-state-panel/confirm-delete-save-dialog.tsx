import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
} from "@sun/components";
import { useTranslation } from "@sun/i18n";

type ConfirmDeleteSaveDialogProps = {
  /**
   * Whether the dialog is open.
   */
  open: boolean;
  /**
   * Callback to close the dialog.
   */
  onClose: () => void;
  /**
   * Callback to confirm deletion.
   */
  onConfirm: () => void;
};

const ConfirmDeleteSaveDialog = (props: ConfirmDeleteSaveDialogProps) => {
  const { open, onClose, onConfirm } = props;
  const { t } = useTranslation("mame");

  return (
    <Dialog open={open} onOpenChange={(value: boolean) => !value && onClose()}>
      <DialogHeader>
        <DialogTitle>{t("save.confirm_delete_title")}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <p>{t("save.confirm_delete_body")}</p>
      </DialogBody>
      <DialogFooter>
        <Button variant="secondary" onClick={onClose}>
          {t("save.cancel")}
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {t("save.delete")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ConfirmDeleteSaveDialog;
