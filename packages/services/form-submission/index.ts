import { db, desc, eq } from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import {
  getFormSubmissionsByFormIdInput,
  submitPublicFormInput,
  type GetFormSubmissionsByFormIdInputType,
  type SubmitPublicFormInputType,
} from "./model";

class FormSubmissionService {
  public async submitPublicForm(payload: SubmitPublicFormInputType) {
    const { formId, values } = await submitPublicFormInput.parseAsync(payload);

    const result = await db
      .insert(formSubmissionTable)
      .values({
        formId,
        values,
      })
      .returning({
        id: formSubmissionTable.id,
      });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Something went wrong while submitting the form");
    }

    return { id: result[0].id };
  }

  public async getFormSubmissionsByFormId(payload: GetFormSubmissionsByFormIdInputType) {
    const { formId } = await getFormSubmissionsByFormIdInput.parseAsync(payload);

    const submissions = await db
      .select({
        id: formSubmissionTable.id,
        formId: formSubmissionTable.formId,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
        updatedAt: formSubmissionTable.updatedAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    return { submissions };
  }
}

export default FormSubmissionService;
