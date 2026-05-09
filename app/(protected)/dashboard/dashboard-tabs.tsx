import { HugeiconsIcon } from "@hugeicons/react"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { dashboardTabs } from "./constants"
import { OverviewTabContent } from "./overview-tab-content"
import type { DashboardOverviewData } from "./types"

function DashboardTabs({ overview }: { overview: DashboardOverviewData }) {
  return (
    <Tabs defaultValue="overview" className="gap-4">
      <div className="overflow-x-auto border-b border-border">
        <TabsList variant="line" className="w-max justify-start gap-2">
          {dashboardTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2 px-3">
              <HugeiconsIcon icon={tab.icon} strokeWidth={2} className="size-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="overview">
        <OverviewTabContent overview={overview} />
      </TabsContent>

      {dashboardTabs.slice(1).map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <Card className="p-8 text-center text-sm text-muted-foreground">
            {tab.label} dashboard view siap dikembangkan dari struktur Owner Overview.
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}

export { DashboardTabs }
