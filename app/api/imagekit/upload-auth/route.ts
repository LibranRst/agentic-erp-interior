import { createHmac, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  ForbiddenError,
  requirePermission,
  requireRole,
  requireUser,
  UnauthorizedError,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import {
  buildImageKitFolderPath,
  mediaRelatedTypeSchema,
} from "@/src/features/media/schemas";

const uploadAuthSchema = z.object({
  relatedType: mediaRelatedTypeSchema,
  projectId: z.uuid().optional().nullable(),
  relatedId: z.uuid().optional().nullable(),
});

export async function POST(request: Request) {
  const currentUser = await requireUser().catch((error: unknown) => {
    if (error instanceof UnauthorizedError) {
      return null;
    }

    throw error;
  });

  if (!currentUser) {
    return NextResponse.json(
      { message: "You must be signed in to upload media." },
      { status: 401 },
    );
  }
  const body = (await request.json().catch(() => null)) as unknown;
  const parsed = uploadAuthSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Upload context is invalid." },
      { status: 400 },
    );
  }

  try {
    await validateUploadAccess(parsed.data, currentUser);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    throw error;
  }

  const publicKey =
    process.env.IMAGEKIT_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { message: "ImageKit upload is not configured." },
      { status: 500 },
    );
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const signature = createHmac("sha1", privateKey)
    .update(`${token}${expire}`)
    .digest("hex");

  return NextResponse.json({
    token,
    expire,
    signature,
    publicKey,
    folderPath: buildImageKitFolderPath(parsed.data),
    urlEndpoint:
      process.env.IMAGEKIT_URL_ENDPOINT ??
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ??
      null,
  });
}

async function validateUploadAccess(
  context: z.infer<typeof uploadAuthSchema>,
  currentUser: Awaited<ReturnType<typeof requireUser>>,
) {
  switch (context.relatedType) {
    case "project_documentation":
      requirePermission(currentUser, "project:update");
      requireRole(currentUser, ["owner", "admin"]);
      requireProjectId(context.projectId);
      return;
    case "daily_update":
      requirePermission(currentUser, "daily_update:create");
      requireRole(currentUser, ["owner", "admin", "project_manager"]);
      await validateProjectManagerProject(context.projectId, currentUser);
      return;
    case "design_task":
      requirePermission(currentUser, "design_task:create");
      requireRole(currentUser, ["owner", "admin", "designer"]);
      requireProjectId(context.projectId);
      return;
    case "material":
      requirePermission(currentUser, "material:create");
      requireRole(currentUser, ["owner", "admin", "purchasing"]);
      requireProjectId(context.projectId);
      return;
    case "content_asset":
      requirePermission(currentUser, "content_asset:create");
      requireRole(currentUser, ["owner", "admin", "marketing"]);
      requireProjectId(context.projectId);
      return;
    case "lead_attachment":
      requirePermission(currentUser, "lead:create");
      requireRole(currentUser, ["owner", "admin", "sales"]);
      await validateLeadAccess(context.relatedId, currentUser);
      return;
    case "user_avatar":
      if (
        context.relatedId &&
        context.relatedId !== currentUser.id &&
        !["owner", "admin"].includes(currentUser.role)
      ) {
        throw new ForbiddenError("You can only upload your own avatar.");
      }
      return;
  }
}

function requireProjectId(projectId?: string | null): asserts projectId is string {
  if (!projectId) {
    throw new ForbiddenError("Select a project before uploading media.");
  }
}

async function validateProjectManagerProject(
  projectId: string | null | undefined,
  currentUser: Awaited<ReturnType<typeof requireUser>>,
) {
  requireProjectId(projectId);
  const scopedProjectId = projectId;

  if (currentUser.role !== "project_manager") {
    return;
  }

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, scopedProjectId),
    columns: {
      pmId: true,
    },
  });

  if (!project || project.pmId !== currentUser.id) {
    throw new ForbiddenError("PM users can only upload to assigned projects.");
  }
}

async function validateLeadAccess(
  leadId: string | null | undefined,
  currentUser: Awaited<ReturnType<typeof requireUser>>,
) {
  if (!leadId || currentUser.role !== "sales") {
    return;
  }

  const lead = await db.query.leads.findFirst({
    where: eq(schema.leads.id, leadId),
    columns: {
      assignedSalesId: true,
    },
  });

  if (!lead || lead.assignedSalesId !== currentUser.id) {
    throw new ForbiddenError("Sales users can only upload to assigned leads.");
  }
}
