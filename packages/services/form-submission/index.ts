import { db } from "@repo/database";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import { submitPublicFormInput, type SubmitPublicFormInputType } from "./model";

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
}

export default FormSubmissionService;
