import { asc, db, eq, sql } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import {
  createFieldInput,
  deleteFieldInput,
  getFieldInput,
  listFieldsByFormIdInput,
  updateFieldInput,
  type CreateFieldInputType,
  type DeleteFieldInputType,
  type GetFieldInputType,
  type ListFieldsByFormIdInputType,
  type UpdateFieldInputType,
} from "./model";

class FormFieldService {
  public async createField(payload: CreateFieldInputType) {
    const { label, labelKey, description, placeholder, isRequired, type, formId } =
      await createFieldInput.parseAsync(payload);
    const [indexResult] = await db
      .select({
        maxIndex: sql<string | null>`max(${formFieldsTable.index})`,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));
    const index = Number(indexResult?.maxIndex ?? 0) + 1;

    const result = await db
      .insert(formFieldsTable)
      .values({
        label,
        label_key: labelKey,
        description,
        placeholder,
        isRequired,
        index: index.toString(),
        type,
        formId,
      })
      .returning({
        id: formFieldsTable.id,
      });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error("Something went wrong while creating the form field");
    }

    return { id: result[0].id };
  }

  public async updateField(payload: UpdateFieldInputType) {
    const { id, labelKey, ...fieldPayload } = await updateFieldInput.parseAsync(payload);
    if (
      labelKey === undefined &&
      Object.values(fieldPayload).every((value) => value === undefined)
    ) {
      throw new Error("At least one field must be provided for update");
    }

    const result = await db
      .update(formFieldsTable)
      .set({
        ...fieldPayload,
        ...(labelKey !== undefined ? { label_key: labelKey } : {}),
      })
      .where(eq(formFieldsTable.id, id))
      .returning({
        id: formFieldsTable.id,
      });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error(`Form field with ${id} does not exist`);
    }

    return { id: result[0].id };
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { id } = await deleteFieldInput.parseAsync(payload);

    const result = await db.delete(formFieldsTable).where(eq(formFieldsTable.id, id)).returning({
      id: formFieldsTable.id,
    });

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error(`Form field with ${id} does not exist`);
    }

    return { id: result[0].id };
  }

  public async getField(payload: GetFieldInputType) {
    const { id } = await getFieldInput.parseAsync(payload);

    const result = await db
      .select({
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
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, id));

    if (!result || result.length === 0 || !result[0]?.id) {
      throw new Error(`Form field with ${id} does not exist`);
    }

    return result[0];
  }

  public async listFieldsByFormId(payload: ListFieldsByFormIdInputType) {
    const { formId } = await listFieldsByFormIdInput.parseAsync(payload);

    const fields = await db
      .select({
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
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index));

    return { fields };
  }
}

export default FormFieldService;
