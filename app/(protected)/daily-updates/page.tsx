import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { MetricCard } from "@/components/shared/metric-card";
import {
  Alert02Icon,
  FileImageIcon,
  Task01Icon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArchivedToggle } from "@/components/shared/archived-toggle";
import { DailyUpdateDialog } from "@/src/features/daily-updates/components/daily-update-dialog";
import { DailyUpdateFilters } from "@/src/features/daily-updates/components/daily-update-filters";
import { DailyUpdateTable } from "@/src/features/daily-updates/components/daily-update-table";
import { getDailyUpdatePageData } from "@/src/server/actions/daily-updates";

type DailyUpdatesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DailyUpdatesPage({
  searchParams,
}: DailyUpdatesPageProps) {
  const params = await searchParams;
  const showArchived = getParam(params.archived) === "true";
  const data = await getDailyUpdatePageData({
    projectId: getParam(params.projectId),
    healthStatus: getParam(params.healthStatus),
    updateDate: getParam(params.updateDate),
  }, showArchived);

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Daily Updates"
        description="Structured daily PM reports for progress, blockers, work completed, next action, and ImageKit-backed evidence."
        action={<DailyUpdateDialog mode="create" options={data.options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Submitted Today"
          value={data.metrics.submittedToday.toString()}
          badge="PM updates"
          icon={Task01Icon}
        />
        <MetricCard
          label="With Issues"
          value={data.metrics.withIssues.toString()}
          badge={data.metrics.withIssues > 0 ? "Check" : "Issue, blocker, or risk status"}
          tone={data.metrics.withIssues > 0 ? "danger" : "primary"}
          icon={Alert02Icon}
        />
        <MetricCard
          label="Attachments"
          value={data.metrics.attachments.toString()}
          badge="ImageKit progress media"
          icon={FileImageIcon}
        />
        <MetricCard
          label="Latest Records"
          value={data.metrics.latest.toString()}
          badge="Visible daily updates"
          icon={Task01Icon}
        />
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>PM Update Timeline</CardTitle>
          <CardDescription>
            Filter daily progress reports by project, date, and health signal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <DailyUpdateFilters filters={data.filters} options={data.options} />
            <ArchivedToggle />
          </div>
          <DailyUpdateTable updates={data.updates} formOptions={data.options} showArchived={showArchived} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

