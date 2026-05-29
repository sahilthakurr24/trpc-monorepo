import { createFormInput, listFormByUserId } from "./model";
import type { ListFormByUserIdType, createFormInputType } from "./model";
import { formsTable } from "@repo/database/models/form";
import { db, eq } from "@repo/database";

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
        updatedAt: formsTable.createdAt,
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
}

export default FormService;
