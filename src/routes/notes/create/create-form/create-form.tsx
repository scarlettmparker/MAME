import { usePageData } from "@sun/ssr/react";
import { useTranslation } from "@sun/i18n";
import {
  FormField,
  FormItem,
  FormLabel,
  Input,
  MarkdownEditor,
  Select,
  SelectOption,
} from "@sun/components";
import type { BlogPostTypesQuery } from "~/generated/graphql";
import styles from "./create-form.module.css";

const CreateForm = () => {
  const { t } = useTranslation("mame");
  const { data: types } = usePageData<BlogPostTypesQuery["blogQueries"]["blogPostTypes"]>(
    "noteTypes",
    "noteTypes",
    {},
  );

  return (
    <div className={styles.form}>
      <FormField name="title">
        <FormLabel>{t("notes.form.title")}</FormLabel>
        <FormItem>
          <Input type="text" required />
        </FormItem>
      </FormField>
      <FormField name="typeId">
        <FormLabel>{t("notes.form.type")}</FormLabel>
        <FormItem>
          <Select name="typeId">
            <SelectOption value="">{t("notes.form.type_none")}</SelectOption>
            {(types ?? []).map((type) => (
              <SelectOption key={type.id} value={type.id}>
                {type.name}
              </SelectOption>
            ))}
          </Select>
        </FormItem>
      </FormField>
      <FormField name="content">
        <FormLabel>{t("notes.form.content")}</FormLabel>
        <FormItem>
          <MarkdownEditor rows={10} />
        </FormItem>
      </FormField>
    </div>
  );
};

export default CreateForm;
