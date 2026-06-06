import { gpt4omini, inngest } from "./client";
import { z } from "zod";
import { db } from "@repo/database";
import { formsTable } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

const fieldTypeSchema = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

const generatedFormJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "fields"],
  properties: {
    title: {
      type: "string",
      minLength: 3,
      maxLength: 55,
    },
    description: {
      type: "string",
      minLength: 10,
      maxLength: 300,
    },
    fields: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "labelKey", "description", "placeholder", "isRequired", "type"],
        properties: {
          label: {
            type: "string",
            minLength: 1,
            maxLength: 100,
          },
          labelKey: {
            type: "string",
            pattern: "^[a-z0-9_]+$",
            maxLength: 100,
          },
          description: {
            type: ["string", "null"],
            maxLength: 300,
          },
          placeholder: {
            type: ["string", "null"],
            maxLength: 160,
          },
          isRequired: {
            type: "boolean",
          },
          type: {
            type: "string",
            enum: ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"],
          },
        },
      },
    },
  },
} satisfies Record<string, unknown>;

export const generatedFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(55, "Title must be 55 characters or fewer")
      .describe("Short, human-readable form title"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(300, "Description must be 300 characters or fewer")
      .describe("Clear description of the form purpose"),
    fields: z
      .array(
        z.object({
          label: z
            .string()
            .trim()
            .min(1, "Field label is required")
            .max(100, "Field label must be 100 characters or fewer")
            .describe("Human-readable field label"),
          labelKey: z
            .string()
            .trim()
            .toLowerCase()
            .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores only")
            .max(100, "Field key must be 100 characters or fewer")
            .describe("Unique snake_case key for this field"),
          description: z
            .string()
            .trim()
            .max(300, "Field description must be 300 characters or fewer")
            .nullable()
            .describe("Optional helper text for the respondent"),
          placeholder: z
            .string()
            .trim()
            .max(160, "Placeholder must be 160 characters or fewer")
            .nullable()
            .describe("Optional example value or input hint"),
          isRequired: z.boolean().describe("Whether the respondent must answer this field"),
          type: fieldTypeSchema.describe("One of the supported form field types"),
        }),
      )
      .min(1, "Generate at least one field")
      .max(20, "Generate at most 20 fields")
      .describe("Fields in display order. Do not include index."),
  })
  .superRefine((form, ctx) => {
    const seenKeys = new Set<string>();

    form.fields.forEach((field, index) => {
      if (seenKeys.has(field.labelKey)) {
        ctx.addIssue({
          code: "custom",
          path: ["fields", index, "labelKey"],
          message: "Field keys must be unique",
        });
      }
      seenKeys.add(field.labelKey);
    });
  });

export type GeneratedForm = z.infer<typeof generatedFormSchema>;

function getGeneratedFormText(response: { output?: unknown[] }) {
  for (const item of response.output ?? []) {
    if (!item || typeof item !== "object" || !("content" in item)) {
      continue;
    }

    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }

    const outputText = content.find(
      (part): part is { type: "output_text"; text: string } =>
        !!part &&
        typeof part === "object" &&
        "type" in part &&
        "text" in part &&
        part.type === "output_text" &&
        typeof part.text === "string",
    )?.text;

    if (outputText) {
      return outputText;
    }
  }

  throw new Error("AI did not return form JSON");
}

const systemPrompt = `You are an expert form designer for a form-builder application.

Generate one production-ready form as strict JSON only.

You may receive:
- userName: the authenticated user's name.
- prompt: the user's request, including the form purpose and requested fields.

Generation behavior:
- The user may provide only a short idea like "I want to create a feedback form".
- Do not ask follow-up questions.
- Always infer a complete form from the user's request.
- Automatically create a suitable title, description, and practical fields.
- If the request is broad, choose common fields for that form category.
- If the request is specific, follow the user's requested context closely.
- If the prompt is only a greeting like "hi", use userName if available and generate a sensible general feedback form.

User-name behavior:
- userName identifies the signed-in builder, not the respondent and not the client.
- Do not create a userName field.
- Do not force userName into the generated form title.
- If the user only greets the assistant, use userName to understand the user is starting an AI form request, then create a neutral feedback form.

Output rules:
- Return only JSON matching the requested schema.
- Do not include markdown, code fences, comments, explanations, or extra keys.
- Do not include ids, formId, userId, createdAt, updatedAt, index, or database fields.

Form quality rules:
- Make the title short, specific, and user-facing.
- Make the description clear enough to explain why the respondent is filling the form.
- Prefer 3 to 10 useful fields unless the user asks for more.
- Use the user's requested fields when they are provided.
- If the user gives a broad form idea but not exact fields, infer practical fields for that form type.
- For feedback forms, usually include name, email, rating or satisfaction score, experience feedback, recommendation intent, and additional comments.
- For job application forms, usually include applicant name, email, phone, experience, portfolio, salary expectation, relocation preference, and cover note.
- For contact forms, usually include name, email, subject, message, and preferred contact method.
- Keep labels human-readable and concise.
- Make labelKey unique, lowercase, snake_case, and based on the label.
- Use helpful placeholders only when they add value; otherwise use null.
- Use field descriptions only when helper text would reduce confusion; otherwise use null.
- Mark essential fields as required and optional fields as not required.

Supported field types:
- TEXT: names, phone numbers, URLs, addresses, paragraphs, short text, long text, comments, notes, and general answers.
- EMAIL: email address fields only.
- NUMBER: numeric-only values such as age, quantity, budget, score, or years of experience.
- YES_NO: binary yes/no questions only.
- PASSWORD: password fields only.

Unsupported field types:
- Never use SELECT, DATE, FILE, PHONE, URL, CHECKBOX, RADIO, TEXTAREA, TIME, IMAGE, SIGNATURE, or any other type.
- Map unsupported concepts to the closest supported type, usually TEXT or YES_NO.

Schema shape:
{
  "title": "string",
  "description": "string",
  "fields": [
    {
      "label": "string",
      "labelKey": "string",
      "description": "string | null",
      "placeholder": "string | null",
      "isRequired": true,
      "type": "TEXT | NUMBER | EMAIL | YES_NO | PASSWORD"
    }
  ]
}`;
export const generateFormWithAi = inngest.createFunction(
  {
    id: "ai-form-create",
    triggers: [{ event: "form/generate.requested" }],
  },
  async ({ step, event }) => {
    const userName =
      typeof event.data.userName === "string" && event.data.userName.trim().length > 0
        ? event.data.userName.trim()
        : null;

    const aiResponse = await step.ai.infer("generate-form", {
      model: gpt4omini,
      body: {
        store: false,
        temperature: 0.2,
        max_output_tokens: 2500,
        text: {
          format: {
            type: "json_schema",
            name: "generated_form",
            strict: true,
            schema: generatedFormJsonSchema,
          },
        },
        input: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify({
              userName,
              prompt: String(event.data.prompt ?? ""),
            }),
          },
        ],
      },
    });

    const generatedForm = await step.run("validate-generated-form", () => {
      const outputText = getGeneratedFormText(aiResponse);
      return generatedFormSchema.parse(JSON.parse(outputText));
    });

    const createdForm = await step.run("create-generated-form", async () => {
      return db.transaction(async (tx) => {
        const createdBy = String(event.data.createdBy ?? "");

        if (!createdBy) {
          throw new Error("createdBy is required to create an AI generated form");
        }

        const [form] = await tx
          .insert(formsTable)
          .values({
            title: generatedForm.title,
            description: generatedForm.description,
            createdBy,
          })
          .returning({ id: formsTable.id });

        if (!form?.id) {
          throw new Error("Failed to create form");
        }

        const insertedFields = await tx
          .insert(formFieldsTable)
          .values(
            generatedForm.fields.map((field, index) => ({
              label: field.label,
              label_key: field.labelKey,
              description: field.description,
              placeholder: field.placeholder,
              isRequired: field.isRequired,
              index: String(index + 1),
              type: field.type,
              formId: form.id,
            })),
          )
          .returning({ id: formFieldsTable.id });

        if (insertedFields.length !== generatedForm.fields.length) {
          throw new Error("Failed to create all generated form fields");
        }

        return {
          id: form.id,
          fieldIds: insertedFields.map((field) => field.id),
        };
      });
    });

    return {
      formId: createdForm.id,
      fieldIds: createdForm.fieldIds,
      form: generatedForm,
    };
  },
);
