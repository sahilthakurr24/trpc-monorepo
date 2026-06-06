"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import {
  useCreateForm,
  useDeleteForm,
  useGenerateFormWithAi,
  useUserForms,
} from "~/hooks/api/form";

const createFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(55, "Title must be 55 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters.")
    .max(300, "Description must be 300 characters or fewer."),
});

type CreateFormValues = z.infer<typeof createFormSchema>;
type AiGenerationStatus = "idle" | "starting" | "generating" | "rendering";
type FormDeleteTarget = {
  id: string;
  title: string;
};

const defaultValues: CreateFormValues = {
  title: "",
  description: "",
};

function formatDate(value: Date | string | null) {
  if (!value) return "Not updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function FormsPage() {
  const router = useRouter();
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [submittedAiPrompt, setSubmittedAiPrompt] = useState("");
  const [aiGenerationStatus, setAiGenerationStatus] = useState<AiGenerationStatus>("idle");
  const [aiProgress, setAiProgress] = useState(0);
  const [deletingFormId, setDeletingFormId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FormDeleteTarget | null>(null);
  const { createFormAsync, error, isPending } = useCreateForm();
  const { deleteFormAsync, isPending: isDeletingForm } = useDeleteForm();
  const { generateFormWithAiAsync, isPending: isGeneratingWithAi } = useGenerateFormWithAi();
  const {
    forms,
    error: formsError,
    isLoading: isFormsLoading,
    refetch: refetchForms,
  } = useUserForms();
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  const descriptionValue = form.watch("description");
  const isAiWorking = isGeneratingWithAi || aiGenerationStatus !== "idle";
  const aiStatusCopy =
    aiGenerationStatus === "starting"
      ? "Sending your request to AI"
      : aiGenerationStatus === "generating"
        ? "Generating and saving your form"
        : aiGenerationStatus === "rendering"
          ? "Rendering the new form in your dashboard"
          : "Ready for your request";

  const resetAiBuilder = () => {
    setAiPrompt("");
    setSubmittedAiPrompt("");
    setAiGenerationStatus("idle");
    setAiProgress(0);
  };

  const onSubmit = async (values: CreateFormValues) => {
    try {
      await createFormAsync(values);

      toast.success("Form created successfully");
      form.reset(defaultValues);
      setIsCreatingForm(false);
      router.refresh();
    } catch {
      toast.error("Unable to create form");
    }
  };

  const onAiPromptSubmit = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      toast.error("Describe the form you want first");
      return;
    }

    setSubmittedAiPrompt(prompt);
    setAiGenerationStatus("starting");
    setAiProgress(16);

    try {
      const existingFormIds = new Set(forms.map((userForm) => userForm.id));

      await generateFormWithAiAsync({
        prompt,
      });

      setAiGenerationStatus("generating");
      setAiProgress(38);
      setAiPrompt("");

      const startedAt = Date.now();
      const timeoutMs = 90_000;
      let generatedFormId: string | undefined;

      while (Date.now() - startedAt < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const elapsedRatio = Math.min((Date.now() - startedAt) / timeoutMs, 1);
        setAiProgress(Math.min(88, 38 + Math.round(elapsedRatio * 48)));

        const result = await refetchForms();
        const updatedForms = result.data ?? [];
        generatedFormId = updatedForms.find((userForm) => !existingFormIds.has(userForm.id))?.id;

        if (generatedFormId) {
          break;
        }
      }

      if (!generatedFormId) {
        setAiGenerationStatus("idle");
        setAiProgress(0);
        toast.error(
          "AI is still generating. Stay on this page and refresh the forms list shortly.",
        );
        return;
      }

      setAiGenerationStatus("rendering");
      setAiProgress(100);
      await refetchForms();
      setIsAskingAi(false);
      setSubmittedAiPrompt("");
      setAiGenerationStatus("idle");
      setAiProgress(0);
      toast.success("AI form generated");
      router.refresh();
    } catch {
      setAiGenerationStatus("idle");
      setAiProgress(0);
      toast.error("Unable to start AI form generation");
    }
  };

  const onConfirmDeleteForm = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingFormId(deleteTarget.id);

    try {
      await deleteFormAsync({ id: deleteTarget.id });
      toast.success("Form deleted");
      setDeleteTarget(null);
      await refetchForms();
      router.refresh();
    } catch {
      toast.error("Unable to delete form");
    } finally {
      setDeletingFormId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">Forms</h1>
            <p className="text-sm text-muted-foreground">
              {isCreatingForm
                ? "Start a new form with a clear title and description."
                : isAskingAi
                  ? "Describe the form you want and refine it with AI."
                  : "Create, manage, and edit your workspace forms."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={isAskingAi ? "default" : "outline"}
              disabled={isAiWorking}
              onClick={() => {
                if (!isAskingAi) {
                  form.reset(defaultValues);
                  resetAiBuilder();
                }
                setIsCreatingForm(false);
                setIsAskingAi((current) => !current);
              }}
            >
              {isAskingAi ? (
                "View forms"
              ) : (
                <>
                  <Bot className="size-4" />
                  Ask AI to create
                </>
              )}
            </Button>
            <Button
              type="button"
              variant={isCreatingForm ? "outline" : "default"}
              disabled={isAiWorking}
              onClick={() => {
                if (isCreatingForm) {
                  form.reset(defaultValues);
                }
                setIsAskingAi(false);
                setIsCreatingForm((current) => !current);
              }}
            >
              {isCreatingForm ? (
                "View forms"
              ) : (
                <>
                  <Plus className="size-4" />
                  Create form
                </>
              )}
            </Button>
          </div>
        </div>

        {isAskingAi ? (
          <Card className="overflow-hidden rounded-lg">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <Bot className="size-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle>AI form studio</CardTitle>
                    <CardDescription>
                      Describe the outcome you need. AI will generate the form and publish it to
                      this dashboard.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                  {isAiWorking ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="size-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{aiStatusCopy}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-4 md:p-6">
              <div className="min-h-[320px] space-y-4 rounded-lg border bg-background p-4">
                <div className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <Sparkles className="size-4 text-muted-foreground" />
                  </div>
                  <div className="max-w-[760px] rounded-lg border bg-muted/30 px-4 py-3 text-sm leading-6">
                    Share the form purpose, audience, and any fields you already have in mind. I
                    will create a polished first draft with the right field types.
                  </div>
                </div>

                {submittedAiPrompt ? (
                  <div className="flex justify-end">
                    <div className="max-w-[760px] rounded-lg bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                      {submittedAiPrompt}
                    </div>
                  </div>
                ) : null}

                {isAiWorking ? (
                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                    <div className="w-full max-w-[760px] space-y-3 rounded-lg border bg-muted/30 px-4 py-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium">{aiStatusCopy}</span>
                        <span className="text-muted-foreground">{aiProgress}%</span>
                      </div>
                      <Progress value={aiProgress} />
                      <p className="text-sm text-muted-foreground">
                        This page will return to your forms only after the generated form is
                        available in the dashboard.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <Textarea
                  value={aiPrompt}
                  disabled={isAiWorking}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  className="min-h-32 resize-none"
                  placeholder="Create a customer onboarding form for a B2B SaaS product. Include company details, role, team size, goals, timeline, and consent to be contacted."
                />
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isAiWorking}
                      onClick={() => {
                        resetAiBuilder();
                        setIsAskingAi(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isAiWorking}
                      onClick={resetAiBuilder}
                    >
                      Clear
                    </Button>
                  </div>
                  <Button type="button" disabled={isAiWorking} onClick={onAiPromptSubmit}>
                    {isAiWorking ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Generating
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Generate form
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !isCreatingForm ? (
          <Card className="rounded-lg">
            <CardHeader className="border-b">
              <CardTitle>Your forms</CardTitle>
              <CardDescription>
                Open a form to continue building fields, layout, and response settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {formsError?.message ? (
                <div className="border-b px-6 py-4 text-sm font-medium text-destructive">
                  {formsError.message}
                </div>
              ) : null}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[34%] px-6">Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden w-36 md:table-cell">Created</TableHead>
                    <TableHead className="hidden w-36 lg:table-cell">Updated</TableHead>
                    <TableHead className="w-48 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isFormsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="px-6">
                          <div className="h-4 w-40 rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-full max-w-md rounded bg-muted" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="h-4 w-24 rounded bg-muted" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="h-4 w-24 rounded bg-muted" />
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="ml-auto h-8 w-16 rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : forms.length > 0 ? (
                    forms.map((userForm) => (
                      <TableRow key={userForm.id}>
                        <TableCell className="px-6 font-medium">
                          <Link
                            href={`/dashboard/forms/${userForm.id}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {userForm.title}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-[420px] truncate text-muted-foreground">
                          {userForm.description || "No description"}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatDate(userForm.createdAt)}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {formatDate(userForm.updatedAt)}
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={isDeletingForm}
                              onClick={() =>
                                setDeleteTarget({ id: userForm.id, title: userForm.title })
                              }
                            >
                              {deletingFormId === userForm.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                              Delete
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/dashboard/forms/${userForm.id}`}>
                                Edit
                                <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 px-6 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                          <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                            <FileText className="size-5 text-muted-foreground" />
                          </div>
                          <p className="font-medium">No forms yet</p>
                          <p className="text-sm text-muted-foreground">
                            Click Create form to start your first form.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="rounded-lg">
              <CardHeader className="border-b">
                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <CardTitle>Create a new form</CardTitle>
                <CardDescription>
                  Start with a clear title and a short description for respondents.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Form title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Customer feedback survey"
                              autoComplete="off"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use a specific name that is easy to recognize later.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between gap-3">
                            <FormLabel>Description</FormLabel>
                            <span className="text-xs text-muted-foreground">
                              {descriptionValue.length}/300
                            </span>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Collect feedback about the latest product experience, support quality, and next improvements."
                              className="min-h-32 resize-none"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Tell respondents what this form is for in one or two sentences.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error?.message ? (
                      <p className="text-sm font-medium text-destructive" role="alert">
                        {error.message}
                      </p>
                    ) : null}

                    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => {
                          form.reset(defaultValues);
                          setIsCreatingForm(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isPending}>
                        {isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Creating
                          </>
                        ) : (
                          <>
                            <Plus className="size-4" />
                            Create form
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="text-base">Publishing checklist</CardTitle>
                  <CardDescription>
                    Keep the first draft focused before adding fields.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <Sparkles className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Write for respondents</p>
                      <p className="text-muted-foreground">
                        Make the purpose obvious before they start answering.
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <ArrowRight className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Next step</p>
                      <p className="text-muted-foreground">
                        After creation, add fields and configure response settings.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-lg border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">Form endpoint</CardTitle>
                  <CardDescription>
                    This page submits through the protected tRPC procedure.
                  </CardDescription>
                  <CardAction className="text-xs font-medium text-muted-foreground">
                    form.createForm
                  </CardAction>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}
      </div>
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingForm) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.title}" with its fields and submissions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingForm}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingForm}
              onClick={(event) => {
                event.preventDefault();
                void onConfirmDeleteForm();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeletingForm ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
