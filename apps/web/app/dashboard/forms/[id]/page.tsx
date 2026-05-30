import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type FormBuilderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FormBuilderPage({ params }: FormBuilderPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-normal">Form builder</h1>
            <p className="text-sm text-muted-foreground">Edit fields and settings for this form.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/forms">
              <ArrowLeft className="size-4" />
              Back to forms
            </Link>
          </Button>
        </div>

        <Card className="rounded-lg">
          <CardHeader className="border-b">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <CardTitle>Builder workspace</CardTitle>
            <CardDescription>Form ID: {id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">Builder page ready</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Add field editing controls here when the form field procedures are ready.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
