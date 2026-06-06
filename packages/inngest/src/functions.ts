import { inngest } from "./client";

export const generateFormWithAi = inngest.createFunction(
  {
    id: "ai-form-create",
    triggers: [{ event: "form/generate.requested" }],
  },
  async ({ event }) => {
    return {
      prompt: event.data.prompt,
      createdBy: event.data.createdBy,
    };
  }
);
