"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  FileText,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  useCreateFormField,
  useDeleteFormField,
  useFormFields,
  useUpdateFormField,
} from "~/hooks/api/formField";

const fieldTypes = ["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"] as const;

const fieldLabels: Record<(typeof fieldTypes)[number], string> = {
  TEXT: "Text",
  NUMBER: "Number",
  EMAIL: "Email",
  YES_NO: "Yes / No",
  PASSWORD: "Password",
};

const formFieldSchema = z.object({
  label: z.string().trim().min(1, "Label is required.").max(100, "Label must fit in 100 chars."),
  labelKey: z
    .string()
    .trim()
    .min(1, "Label key is required.")
    .max(100, "Label key must fit in 100 chars.")
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores."),
  description: z.string().trim().max(300, "Description must be 300 characters or fewer."),
  placeholder: z.string().trim().max(160, "Placeholder must be 160 characters or fewer."),
  isRequired: z.boolean(),
  type: z.enum(fieldTypes),
});

type FormFieldValues = z.infer<typeof formFieldSchema>;

type BuilderField = ReturnType<typeof useFormFields>["fields"][number];

const emptyFieldValues: FormFieldValues = {
  label: "",
  labelKey: "",
  description: "",
  placeholder: "",
  isRequired: false,
  type: "TEXT",
};

function createLabelKey(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
}

function fieldToValues(field: BuilderField): FormFieldValues {
  return {
    label: field.label,
    labelKey: field.labelKey,
    description: field.description ?? "",
    placeholder: field.placeholder ?? "",
    isRequired: field.isRequired,
    type: field.type,
  };
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const formId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [editingField, setEditingField] = useState<BuilderField | null>(null);
  const { fields, isLoading: isFieldsLoading } = useFormFields(formId);
  const { createFormFieldAsync, isPending: isCreatingField } = useCreateFormField();
  const { updateFormFieldAsync, isPending: isUpdatingField } = useUpdateFormField();
  const { deleteFormFieldAsync, isPending: isDeletingField } = useDeleteFormField();
  const isSaving = isCreatingField || isUpdatingField;

  const form = useForm<FormFieldValues>({
    resolver: zodResolver(formFieldSchema),
    defaultValues: emptyFieldValues,
    mode: "onBlur",
  });

  const selectedType = form.watch("type");

  const resetForCreate = () => {
    setEditingField(null);
    form.reset(emptyFieldValues);
  };

  const startEditing = (field: BuilderField) => {
    setEditingField(field);
    form.reset(fieldToValues(field));
  };

  const onSubmit = async (values: FormFieldValues) => {
    const payload = {
      label: values.label,
      labelKey: values.labelKey,
      description: values.description || undefined,
      placeholder: values.placeholder || undefined,
      isRequired: values.isRequired,
      type: values.type,
      formId,
    };

    try {
      if (editingField) {
        await updateFormFieldAsync({
          id: editingField.id,
          ...payload,
          description: values.description || null,
          placeholder: values.placeholder || null,
        });
        toast.success("Field updated");
      } else {
        await createFormFieldAsync(payload);
        toast.success("Field created");
        form.reset(emptyFieldValues);
      }
    } catch {
      toast.error(editingField ? "Unable to update field" : "Unable to create field");
    }
  };

  const onDelete = async (field: BuilderField) => {
    try {
      await deleteFormFieldAsync({ id: field.id });
      if (editingField?.id === field.id) {
        resetForCreate();
      }
      toast.success("Field deleted");
    } catch {
      toast.error("Unable to delete field");
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">Form builder</h1>
            <p className="text-sm text-muted-foreground">Create and edit fields for this form.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/forms">
              <ArrowLeft className="size-4" />
              Back to forms
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="rounded-lg">
            <CardHeader className="border-b">
              <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <CardTitle>Fields</CardTitle>
              <CardDescription>Form ID: {formId}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isFieldsLoading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-md bg-muted" />
                  ))}
                </div>
              ) : fields.length > 0 ? (
                <div className="divide-y">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className="grid gap-4 p-4 md:grid-cols-[32px_minmax(0,1fr)_auto]"
                    >
                      <div className="flex size-8 items-center justify-center rounded-md border text-muted-foreground">
                        <GripVertical className="size-4" />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{field.label}</p>
                          <Badge variant="outline">{fieldLabels[field.type]}</Badge>
                          {field.isRequired ? <Badge variant="secondary">Required</Badge> : null}
                        </div>
                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                          <p className="truncate">Key: {field.labelKey}</p>
                          <p>Index: {field.index}</p>
                        </div>
                        {field.description ? (
                          <p className="text-sm text-muted-foreground">{field.description}</p>
                        ) : null}
                        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          {field.placeholder || `Preview: ${fieldLabels[field.type]} field`}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Button size="icon" variant="outline" onClick={() => startEditing(field)}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit field</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={isDeletingField}
                          onClick={() => onDelete(field)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Delete field</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-lg border bg-muted">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 font-medium">No fields yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add the first field from the editor panel.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader className="border-b">
              <CardTitle>{editingField ? "Edit field" : "Add field"}</CardTitle>
              <CardDescription>
                {editingField
                  ? "Update this field without leaving the builder."
                  : "Choose the field type and display settings."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Email address"
                            disabled={isSaving}
                            {...field}
                            onChange={(event) => {
                              field.onChange(event);
                              if (!editingField) {
                                form.setValue("labelKey", createLabelKey(event.target.value), {
                                  shouldValidate: true,
                                });
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="labelKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input placeholder="email_address" disabled={isSaving} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSaving}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {fieldLabels[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Selected: {fieldLabels[selectedType]}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placeholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" disabled={isSaving} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-24 resize-none"
                            placeholder="Brief helper text for the respondent."
                            disabled={isSaving}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4 rounded-md border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Required</FormLabel>
                          <FormDescription>Respondents must complete this field.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSaving}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Button type="button" variant="outline" onClick={resetForCreate}>
                      <Plus className="size-4" />
                      New field
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Saving
                        </>
                      ) : editingField ? (
                        <>
                          <Save className="size-4" />
                          Save field
                        </>
                      ) : (
                        <>
                          <Plus className="size-4" />
                          Add field
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
