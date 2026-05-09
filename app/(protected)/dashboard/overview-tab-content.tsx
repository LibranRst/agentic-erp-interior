import { AiBriefCard } from "./ai-brief-card"
import { HealthChart } from "./health-chart"
import { NextActionsCard } from "./next-actions-card"
import { ProgressProjectTable } from "./progress-project-table"
import { RowTwoCards } from "./row-two-cards"
import type { DashboardOverviewData } from "./types"

function OverviewTabContent({ overview }: { overview: DashboardOverviewData }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <AiBriefCard
          actions={overview.aiActions}
          canGenerateSummary={overview.canGenerateAiSummary}
          insights={overview.aiInsights}
          summary={overview.aiSummary}
        />
        <HealthChart data={overview.healthChartData} />
      </div>

      <ProgressProjectTable projects={overview.projectHealthRows} />
      <RowTwoCards
        contentReadyProjects={overview.contentReadyProjects}
        contentTotal={overview.contentTotal}
        materialIssues={overview.materialIssues}
        materialTotal={overview.materialTotal}
        salesSnapshot={overview.salesSnapshot}
        updates={overview.updates}
        updatesTotal={overview.updatesTotal}
      />
      <NextActionsCard actions={overview.recommendedActions} />
    </div>
  )
}

export { OverviewTabContent }
