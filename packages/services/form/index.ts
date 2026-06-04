import { createFormInput, getPublicFormByIdInput, listFormByUserId } from "./model";
import type {
  GetPublicFormByIdInputType,
  ListFormByUserIdType,
  createFormInputType,
} from "./model";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { asc, db, eq } from "@repo/database";

class FormService {
  public async createForm(payload: createFormInputType) {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload);
    const result = await db.insert(formsTable).values({ title, description, createdBy }).returning({
      id: formsTable.id,
    });
    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Something went wrong while creating the form");
    }
    return { id: result[0]?.id };
  }

  public async listFormByUserId(payload: ListFormByUserIdType) {
    const { id } = await listFormByUserId.parseAsync(payload);

    const result = await db
      .select({
        id: formsTable.id,
        title: formsTable.title,
        description: formsTable.description,
        createdAt: formsTable.createdAt,
        updatedAt: formsTable.updatedAt,
      })
      .from(formsTable)
      .where(eq(formsTable.createdBy, id));

    if (!result || result.length === 0) {
      return {
        forms: [],
      };
    }

    return {
      forms: result,
    };
  }

  public async getPublicFormById(payload: GetPublicFormByIdInputType) {
    const { formId } = await getPublicFormByIdInput.parseAsync(payload);

    const rows = await db
      .select({
        form: {
          id: formsTable.id,
          title: formsTable.title,
          description: formsTable.description,
          createdAt: formsTable.createdAt,
          updatedAt: formsTable.updatedAt,
        },
        field: {
          id: formFieldsTable.id,
          label: formFieldsTable.label,
          labelKey: formFieldsTable.label_key,
          description: formFieldsTable.description,
          placeholder: formFieldsTable.placeholder,
          isRequired: formFieldsTable.isRequired,
          index: formFieldsTable.index,
          type: formFieldsTable.type,
          formId: formFieldsTable.formId,
          createdAt: formFieldsTable.createdAt,
          updatedAt: formFieldsTable.updatedAt,
        },
      })
      .from(formsTable)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
      .where(eq(formsTable.id, formId))
      .orderBy(asc(formFieldsTable.index));

    const form = rows[0]?.form;
    if (!form) {
      throw new Error(`Form with ${formId} does not exist`);
    }

    const fields = rows.flatMap((row) => (row.field ? [row.field] : []));

    return {
      form: {
        ...form,
        fields,
      },
    };
  }
}

export default FormService;
