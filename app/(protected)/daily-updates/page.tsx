import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { MetricCard } from "@/components/shared/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const data = await getDailyUpdatePageData({
    projectId: getParam(params.projectId),
    healthStatus: getParam(params.healthStatus),
    updateDate: getParam(params.updateDate),
  });

  return (
    <PageContainer className="overflow-x-hidden">
      <PageHeader
        title="Daily Updates"
        description="Structured daily PM reports for progress, blockers, work completed, next action, and ImageKit-backed evidence."
        action={<DailyUpdateDialog mode="create" options={data.options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Submitted Today"
          value={data.metrics.submittedToday.toString()}
          description="PM updates"
        />
        <MetricCard
          title="With Issues"
          value={data.metrics.withIssues.toString()}
          description="Issue, blocker, or risk status"
          badge={data.metrics.withIssues > 0 ? "Check" : undefined}
        />
        <MetricCard
          title="Attachments"
          value={data.metrics.attachments.toString()}
          description="ImageKit progress media"
        />
        <MetricCard
          title="Latest Records"
          value={data.metrics.latest.toString()}
          description="Visible daily updates"
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
          <DailyUpdateFilters filters={data.filters} options={data.options} />
          <DailyUpdateTable updates={data.updates} formOptions={data.options} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

