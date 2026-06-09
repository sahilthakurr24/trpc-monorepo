"use client";

import {
  AlertCircle,
  BarChart3,
  ClipboardList,
  Clock3,
  FileText,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Progress } from "~/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useUserForms } from "~/hooks/api/form";
import { cn } from "~/lib/utils";

type FormStatus = "active" | "draft" | "idle";
type StatusFilter = "all" | FormStatus;
type UserForm = ReturnType<typeof useUserForms>["forms"][number];

const statusLabels: Record<FormStatus, string> = {
  active: "Active",
  draft: "Draft",
  idle: "Idle",
};

const statusStyles: Record<
  FormStatus,
  {
    badge: string;
    dot: string;
    icon: string;
    bar: string;
  }
> = {
  active: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
    icon: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  draft: {
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500",
    icon: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  idle: {
    badge: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300",
    dot: "bg-slate-400",
    icon: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300",
    bar: "bg-slate-400",
  },
};

function getFormStatus(form: UserForm): FormStatus {
  if (!form.description?.trim()) return "draft";

  const lastActivity = form.updatedAt ?? form.createdAt;
  if (!lastActivity) return "idle";

  const daysSinceActivity =
    (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceActivity <= 30 ? "active" : "idle";
}

function formatDate(value: Date | string | null) {
  if (!value) return "Not updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getPercentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export default function DashboardPage() {
  const { forms, error, isLoading } = useUserForms();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [query, setQuery] = React.useState("");

  const formsWithStatus = React.useMemo(() => {
    return forms
      .map((form) => ({
        ...form,
        status: getFormStatus(form),
        lastActivity: form.updatedAt ?? form.createdAt,
      }))
      .sort((first, second) => {
        const firstTime = first.lastActivity ? new Date(first.lastActivity).getTime() : 0;
        const secondTime = second.lastActivity ? new Date(second.lastActivity).getTime() : 0;
        return secondTime - firstTime;
      });
  }, [forms]);

  const stats = React.useMemo(() => {
    const active = formsWithStatus.filter((form) => form.status === "active").length;
    const draft = formsWithStatus.filter((form) => form.status === "draft").length;
    const idle = formsWithStatus.filter((form) => form.status === "idle").length;
    const completion =
      formsWithStatus.length === 0
        ? 0
        : Math.round(((active + idle) / formsWithStatus.length) * 100);

    return {
      total: formsWithStatus.length,
      active,
      draft,
      idle,
      completion,
    };
  }, [formsWithStatus]);

  const filteredForms = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return formsWithStatus.filter((form) => {
      const matchesStatus = statusFilter === "all" || form.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        form.title.toLowerCase().includes(normalizedQuery) ||
        form.description?.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [formsWithStatus, query, statusFilter]);

  const recentForms = formsWithStatus.slice(0, 3);
  const statusBreakdown = [
    { status: "active" as const, value: stats.active },
    { status: "draft" as const, value: stats.draft },
    { status: "idle" as const, value: stats.idle },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="rounded-lg border bg-card p-5 shadow-xs md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-md border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <BarChart3 className="size-3.5" />
                Form operations
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">Dashboard</h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  Monitor form readiness, recent activity, and setup gaps across your workspace.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              <Button asChild>
                <Link href="/dashboard/forms">
                  <Plus className="size-4" />
                  New form
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <Card className="rounded-lg border-destructive/40">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error.message}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <StatusCard
            title="Total forms"
            value={stats.total}
            description="Forms in your workspace"
            icon={FileText}
            isLoading={isLoading}
            tone="neutral"
          />
          <StatusCard
            title="Active"
            value={stats.active}
            description="Updated in the last 30 days"
            icon={Sparkles}
            isLoading={isLoading}
            tone="active"
          />
          <StatusCard
            title="Draft"
            value={stats.draft}
            description="Missing a description"
            icon={ClipboardList}
            isLoading={isLoading}
            tone="draft"
          />
          <StatusCard
            title="Idle"
            value={stats.idle}
            description="No recent updates"
            icon={Clock3}
            isLoading={isLoading}
            tone="idle"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 @5xl/main:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-lg">
            <CardHeader className="gap-4 border-b">
              <div className="flex flex-col gap-3 @3xl/main:flex-row @3xl/main:items-start @3xl/main:justify-between">
                <div>
                  <CardTitle>Form status</CardTitle>
                  <CardDescription>Review forms by setup and recent activity.</CardDescription>
                </div>
                <div className="relative w-full @3xl/main:w-72">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search forms"
                    className="bg-background pl-9"
                  />
                </div>
              </div>
              <Tabs
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <TabsList className="grid w-full grid-cols-4 @3xl/main:w-fit">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="idle">Idle</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <DashboardLoadingRows />
              ) : filteredForms.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="font-medium">No forms found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create or adjust filters to see forms here.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="px-6">Form</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last activity</TableHead>
                      <TableHead className="px-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell className="max-w-[360px] px-6">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
                              <FileText className="size-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <Link
                                href={`/dashboard/forms/${form.id}`}
                                className="font-medium hover:underline"
                              >
                                {form.title}
                              </Link>
                              <p className="line-clamp-1 text-sm text-muted-foreground">
                                {form.description || "No description added"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("gap-1.5", statusStyles[form.status].badge)}
                          >
                            <span className={cn("size-1.5 rounded-full", statusStyles[form.status].dot)} />
                            {statusLabels[form.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatDate(form.lastActivity)}
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/dashboard/forms/${form.id}`}>Edit</Link>
                            </Button>
                            <Button asChild size="sm" variant="secondary">
                              <Link href={`/dashboard/forms/${form.id}/submission`}>Responses</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Readiness</CardTitle>
              <CardDescription>Forms with enough setup to share confidently.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Ready forms</span>
                  <span className="text-muted-foreground">{stats.completion}%</span>
                </div>
                <Progress value={stats.completion} />
              </div>

              <div className="space-y-3">
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  {statusBreakdown.map((item) => (
                    <div
                      key={item.status}
                      className={statusStyles[item.status].bar}
                      style={{ width: `${getPercentage(item.value, stats.total)}%` }}
                    />
                  ))}
                </div>
                <div className="grid gap-2 text-sm">
                  {statusBreakdown.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className={cn("size-2 rounded-full", statusStyles[item.status].dot)}
                        />
                        {statusLabels[item.status]}
                      </span>
                      <span className="font-medium tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Recently touched</p>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-14 animate-pulse rounded-md bg-muted" />
                    ))}
                  </div>
                ) : recentForms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No forms created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentForms.map((form) => (
                      <Link
                        key={form.id}
                        href={`/dashboard/forms/${form.id}`}
                        className="block rounded-md border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-medium">{form.title}</p>
                          <Badge
                            variant="outline"
                            className={cn("gap-1.5", statusStyles[form.status].badge)}
                          >
                            <span className={cn("size-1.5 rounded-full", statusStyles[form.status].dot)} />
                            {statusLabels[form.status]}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(form.lastActivity)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
  tone,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
  tone: "neutral" | FormStatus;
}) {
  const iconClassName =
    tone === "neutral"
      ? "border-primary/15 bg-primary/5 text-primary"
      : statusStyles[tone].icon;

  return (
    <Card className="rounded-lg shadow-xs">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-2">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {isLoading ? "-" : value}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-md border", iconClassName)}>
          <Icon className="size-5" />
        </div>
      </CardHeader>
    </Card>
  );
}

function DashboardLoadingRows() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}
