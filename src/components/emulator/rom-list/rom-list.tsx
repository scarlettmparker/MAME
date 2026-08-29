import { Button } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import { useTranslation } from "react-i18next";
import type { ListKeysQuery } from "~/generated/graphql";
import styles from "./rom-list.module.css";

type RomListProps = {
  /**
   * Called when a ROM is selected.
   */
  onSelect: (key: string) => void;
};

type RomEntry = NonNullable<
  NonNullable<ListKeysQuery["filestoreQueries"]["listKeys"]>[number]
>;

/**
 * Lists ROMs for the emulator bucket.
 */
const RomList = (props: RomListProps) => {
  const { onSelect } = props;
  const { t } = useTranslation("mame");
  const { data: roms } = usePageData<RomEntry[]>("roms", "mame", {});

  if (!roms?.length) {
    return <p className={styles.no_roms}>{t("picker.no_roms")}</p>;
  }

  return (
    <div className={styles.list_body}>
      {roms.map((rom: RomEntry) => (
        <Button
          key={rom.key}
          variant="secondary"
          className={styles.list_button}
          onClick={() => onSelect(rom.key)}
        >
          <span className={styles.list_name}>{rom.name ?? rom.key}</span>
        </Button>
      ))}
    </div>
  );
};

export default RomList;
