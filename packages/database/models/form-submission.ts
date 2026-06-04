import { pgTable, uuid, timestamp, text, json } from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { formFieldsTable } from "./form-field";

export interface FormSubmissionValue {
  formFieldId: string;
  value: string;
}
export type FormFieldSubmissionValueRow = FormSubmissionValue[];

export const formSubmissionTable = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id").references(() => formsTable.id),
  formfiedId: uuid("form_field_id").references(() => formFieldsTable.id),
  values: json("values").$type<FormFieldSubmissionValueRow>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
