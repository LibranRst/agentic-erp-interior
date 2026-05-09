import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requirePageRole } from "@/src/lib/auth/permissions";
import { ArchivedProjectsTab } from "./archived-projects-tab";
import { ArchivedDesignTab } from "./archived-design-tab";
import { ArchivedMaterialsTab } from "./archived-materials-tab";
import { ArchivedLeadsTab } from "./archived-leads-tab";
import { ArchivedContentTab } from "./archived-content-tab";
import { ArchivedDailyUpdatesTab } from "./archived-daily-updates-tab";
import { ArchivedVendorsTab } from "./archived-vendors-tab";

export default async function ArchivedPage() {
  await requirePageRole(["owner", "admin"]);

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Archived"
        description="Review and restore soft-archived records from all modules."
      />
      <Card>
        <CardHeader>
          <CardTitle>Archived Records</CardTitle>
          <CardDescription>
            Items archived from projects, design, materials, sales, content,
            daily updates, and vendors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="projects">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="pt-4">
              <ArchivedProjectsTab />
            </TabsContent>
            <TabsContent value="design" className="pt-4">
              <ArchivedDesignTab />
            </TabsContent>
            <TabsContent value="materials" className="pt-4">
              <ArchivedMaterialsTab />
            </TabsContent>
            <TabsContent value="leads" className="pt-4">
              <ArchivedLeadsTab />
            </TabsContent>
            <TabsContent value="content" className="pt-4">
              <ArchivedContentTab />
            </TabsContent>
            <TabsContent value="updates" className="pt-4">
              <ArchivedDailyUpdatesTab />
            </TabsContent>
            <TabsContent value="vendors" className="pt-4">
              <ArchivedVendorsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
