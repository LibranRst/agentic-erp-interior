import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectForm } from "@/src/features/projects/components/project-form";
import { getProjectFormOptions } from "@/src/features/projects/queries";
import { requirePageRole } from "@/src/lib/auth/permissions";

export default async function NewProjectPage() {
  await requirePageRole(["owner", "admin"]);

  const options = await getProjectFormOptions();

  return (
    <PageContainer>
      <PageHeader
        title="New Project"
        description="Create a project record for operational tracking, assignment, health, deadlines, and owner visibility."
      />
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Keep the first record concise. Daily updates, design, materials,
            media, and AI summaries can be added from their own modules later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm mode="create" options={options} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
