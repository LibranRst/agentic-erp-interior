import { createHash, randomBytes } from "node:crypto";

import { and, eq } from "drizzle-orm";

import { db, schema } from ".";
import { ROLE_NAMES, type RoleName } from "@/src/lib/auth/permissions";

const roleDescriptions = {
  owner: "Full company visibility, AI summaries, users, and settings.",
  admin: "Operational admin with broad MVP access.",
  project_manager: "Project progress and daily update ownership.",
  designer: "Design, render, revision, and DED updates.",
  purchasing: "Material, vendor, urgency, and ETA updates.",
  sales: "Lead and sales snapshot updates.",
  marketing: "Content readiness and asset planning.",
} satisfies Record<RoleName, string>;

const sampleUsers = [
  {
    name: "Dekoria Owner",
    email: "owner@dekoria.local",
    phone: "081200000010",
    role: "owner",
  },
  {
    name: "Admin Dekoria",
    email: "admin@dekoria.local",
    phone: "081200000011",
    role: "admin",
  },
  {
    name: "Project Manager",
    email: "pm@dekoria.local",
    phone: "081200000012",
    role: "project_manager",
  },
  {
    name: "Interior Designer",
    email: "designer@dekoria.local",
    phone: "081200000013",
    role: "designer",
  },
  {
    name: "Purchasing Team",
    email: "purchasing@dekoria.local",
    phone: "081200000014",
    role: "purchasing",
  },
  {
    name: "Sales Consultant",
    email: "sales@dekoria.local",
    phone: "081200000015",
    role: "sales",
  },
  {
    name: "Content Strategist",
    email: "marketing@dekoria.local",
    phone: "081200000016",
    role: "marketing",
  },
] satisfies Array<{
  name: string;
  email: string;
  phone: string;
  role: RoleName;
}>;

async function seed() {
  await seedRoles();
  await seedOperationalData();
  await seedBootstrapOwnerInvite();
}

async function seedRoles() {
  await db
    .insert(schema.roles)
    .values(
      ROLE_NAMES.map((role) => ({
        name: role,
        description: roleDescriptions[role],
      })),
    )
    .onConflictDoNothing({
      target: schema.roles.name,
    });

  console.info("Seeded default roles.");
}

async function seedOperationalData() {
  const roles = await getRolesByName();
  const users = await seedSampleUsers(roles);
  const projects = await seedSampleProjects(users);
  const vendors = await seedSampleVendors();
  const dailyUpdates = await seedSampleDailyUpdates(projects, users);
  await seedSampleProjectStages(projects, users);
  await seedSampleDesignTasks(projects, users);
  await seedSampleMaterials(projects, vendors, users);
  await seedSampleLeads(projects, users);
  const contentAssets = await seedSampleContentAssets(projects, users);
  const aiRun = await seedSampleAiRun(users);
  await seedSampleAiSummary(users, aiRun.id);
  await seedSampleMediaAssets(projects, users, dailyUpdates, contentAssets);
  await seedSampleNotifications(projects, users);

  console.info("Seeded sample MVP operational data.");
}

async function getRolesByName() {
  const rows = await db.query.roles.findMany();
  const roles = new Map(rows.map((role) => [role.name, role]));

  for (const roleName of ROLE_NAMES) {
    if (!roles.has(roleName)) {
      throw new Error(`Role ${roleName} is missing after role seed.`);
    }
  }

  return roles as Map<RoleName, (typeof rows)[number]>;
}

async function seedSampleUsers(roles: Awaited<ReturnType<typeof getRolesByName>>) {
  const users = new Map<string, typeof schema.users.$inferSelect>();

  for (const user of sampleUsers) {
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });

    if (existingUser) {
      users.set(user.email, existingUser);
      continue;
    }

    const [createdUser] = await db
      .insert(schema.users)
      .values({
        name: user.name,
        email: user.email,
        phone: user.phone,
        roleId: roles.get(user.role)!.id,
      })
      .returning();

    users.set(user.email, createdUser);
  }

  return users;
}

async function seedSampleProjects(
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const pm = users.get("pm@dekoria.local")!;
  const designer = users.get("designer@dekoria.local")!;

  const projectSeeds = [
    {
      projectName: "Sentul Modern Luxury Residence",
      clientName: "Mr. S",
      clientPhone: "081288800001",
      location: "Sentul, Bogor",
      projectType: "Residential",
      roomArea: "Master bedroom and wardrobe",
      description: "Modern luxury bedroom and wardrobe installation.",
      status: "installation",
      healthStatus: "needs_attention",
      priority: "high",
      progressPercentage: 72,
      startDate: "2026-03-02",
      deadline: "2026-05-20",
      pmId: pm.id,
      designerId: designer.id,
      estimatedValue: "380000000",
      budgetWarningStatus: "watch",
      contentReadyStatus: "footage_available",
    },
    {
      projectName: "JGC Smart Luxury Home",
      clientName: "Mr. I",
      clientPhone: "081288800002",
      location: "Jakarta Garden City",
      projectType: "Residential",
      roomArea: "Smart home interior",
      description: "Smart luxury home finishing and styling.",
      status: "finishing",
      healthStatus: "healthy",
      priority: "medium",
      progressPercentage: 88,
      startDate: "2026-02-12",
      deadline: "2026-05-12",
      pmId: pm.id,
      designerId: designer.id,
      estimatedValue: "520000000",
      budgetWarningStatus: "none",
      contentReadyStatus: "ready_to_publish",
    },
    {
      projectName: "Emerald Japandi Kitchen",
      clientName: "Mr. D",
      clientPhone: "081288800003",
      location: "Bogor",
      projectType: "Residential",
      roomArea: "Kitchen",
      description: "Bold emerald Japandi kitchen production.",
      status: "production",
      healthStatus: "urgent",
      priority: "high",
      progressPercentage: 54,
      startDate: "2026-03-18",
      deadline: "2026-05-28",
      pmId: pm.id,
      designerId: designer.id,
      estimatedValue: "260000000",
      budgetWarningStatus: "risk",
      contentReadyStatus: "ready_to_shoot",
    },
    {
      projectName: "Classic Elegant Master Suite",
      clientName: "Mrs. L",
      clientPhone: "081288800004",
      location: "South Jakarta",
      projectType: "Residential",
      roomArea: "Master suite",
      description: "Classic elegant master suite design revision.",
      status: "design_revision",
      healthStatus: "needs_attention",
      priority: "medium",
      progressPercentage: 35,
      startDate: "2026-04-03",
      deadline: "2026-06-08",
      pmId: pm.id,
      designerId: designer.id,
      estimatedValue: "190000000",
      budgetWarningStatus: "none",
      contentReadyStatus: "not_ready",
    },
    {
      projectName: "Wabi Sabi Compact Kitchen",
      clientName: "Mr. G",
      clientPhone: "081288800005",
      location: "Depok",
      projectType: "Residential",
      roomArea: "Compact kitchen",
      description: "Compact kitchen DED progress blocked by appliance dimensions.",
      status: "ded_progress",
      healthStatus: "blocked",
      priority: "high",
      progressPercentage: 42,
      startDate: "2026-04-10",
      deadline: "2026-06-15",
      pmId: pm.id,
      designerId: designer.id,
      estimatedValue: "145000000",
      budgetWarningStatus: "watch",
      contentReadyStatus: "not_ready",
    },
    {
      projectName: "Premium Dental Clinic Interior",
      clientName: "Klinik A",
      clientPhone: "081288800006",
      location: "Bogor",
      projectType: "Commercial",
      roomArea: "Reception and treatment area",
      description: "Premium calming healthcare concept design.",
      status: "concept_design",
      healthStatus: "healthy",
      priority: "medium",
      progressPercentage: 20,
      startDate: "2026-04-22",
      deadline: "2026-07-02",
      pmId: pm.id,
      designerId: designer.id,
      estimatedValue: "410000000",
      budgetWarningStatus: "none",
      contentReadyStatus: "not_ready",
    },
  ] satisfies Array<typeof schema.projects.$inferInsert>;

  const projects = new Map<string, typeof schema.projects.$inferSelect>();

  for (const project of projectSeeds) {
    const existingProject = await db.query.projects.findFirst({
      where: eq(schema.projects.projectName, project.projectName),
    });

    if (existingProject) {
      projects.set(project.projectName, existingProject);
      continue;
    }

    const [createdProject] = await db
      .insert(schema.projects)
      .values(project)
      .returning();

    projects.set(project.projectName, createdProject);
  }

  return projects;
}

async function seedSampleProjectStages(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const pm = users.get("pm@dekoria.local")!;
  const designer = users.get("designer@dekoria.local")!;

  const stageSeeds = [
    {
      projectName: "Sentul Modern Luxury Residence",
      stageName: "Installation",
      status: "in_progress",
      startDate: "2026-04-25",
      dueDate: "2026-05-18",
      assignedTo: pm.id,
      notes: "Wardrobe and panel installation in progress.",
    },
    {
      projectName: "JGC Smart Luxury Home",
      stageName: "Finishing",
      status: "in_progress",
      startDate: "2026-05-01",
      dueDate: "2026-05-10",
      assignedTo: pm.id,
      notes: "Final styling and touch-up before walkthrough.",
    },
    {
      projectName: "Emerald Japandi Kitchen",
      stageName: "Production",
      status: "blocked",
      startDate: "2026-04-15",
      dueDate: "2026-05-24",
      assignedTo: pm.id,
      notes: "Production is affected by delayed emerald laminate.",
    },
    {
      projectName: "Classic Elegant Master Suite",
      stageName: "Design Revision",
      status: "in_progress",
      startDate: "2026-04-28",
      dueDate: "2026-05-14",
      assignedTo: designer.id,
      notes: "Render revision requested by client.",
    },
    {
      projectName: "Wabi Sabi Compact Kitchen",
      stageName: "DED Package",
      status: "blocked",
      startDate: "2026-04-30",
      dueDate: "2026-05-17",
      assignedTo: designer.id,
      notes: "Waiting for final appliance dimensions.",
    },
    {
      projectName: "Premium Dental Clinic Interior",
      stageName: "Concept Design",
      status: "in_progress",
      startDate: "2026-04-24",
      dueDate: "2026-05-16",
      assignedTo: designer.id,
      notes: "Reception concept direction in progress.",
    },
  ] satisfies Array<
    Omit<typeof schema.projectStages.$inferInsert, "projectId"> & {
      projectName: string;
    }
  >;

  for (const stage of stageSeeds) {
    const project = projects.get(stage.projectName)!;
    const existingStage = await db.query.projectStages.findFirst({
      where: and(
        eq(schema.projectStages.projectId, project.id),
        eq(schema.projectStages.stageName, stage.stageName),
      ),
    });

    if (existingStage) {
      continue;
    }

    await db.insert(schema.projectStages).values({
      projectId: project.id,
      stageName: stage.stageName,
      status: stage.status,
      startDate: stage.startDate,
      dueDate: stage.dueDate,
      assignedTo: stage.assignedTo,
      notes: stage.notes,
    });
  }
}

async function seedSampleDailyUpdates(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const pm = users.get("pm@dekoria.local")!;
  const updateSeeds = [
    {
      projectName: "Sentul Modern Luxury Residence",
      updateDate: "2026-05-06",
      progressSummary: "Installation cabinet area master bedroom sudah berjalan.",
      workCompleted: "Wardrobe frame installed, panel alignment checked.",
      issueNotes: "Beberapa hardware soft-close belum lengkap.",
      blockerNotes: "Menunggu tambahan hardware dari vendor.",
      nextAction: "Follow up vendor dan lanjut install panel samping.",
      healthStatus: "needs_attention",
      progressPercentage: 72,
    },
    {
      projectName: "Emerald Japandi Kitchen",
      updateDate: "2026-05-06",
      progressSummary: "Produksi cabinet kitchen masih berjalan.",
      workCompleted: "Cutting panel dan finishing beberapa modul bawah.",
      issueNotes: "Material emerald laminate datang terlambat.",
      blockerNotes: "Vendor belum confirm ETA final.",
      nextAction: "Purchasing follow up vendor hari ini.",
      healthStatus: "urgent",
      progressPercentage: 54,
    },
    {
      projectName: "JGC Smart Luxury Home",
      updateDate: "2026-05-06",
      progressSummary: "Final styling dan pengecekan detail.",
      workCompleted: "LED checked, cabinet cleaned, furniture positioned.",
      issueNotes: "Minor touch up di area pantry.",
      blockerNotes: "None.",
      nextAction: "Final walkthrough preparation.",
      healthStatus: "healthy",
      progressPercentage: 88,
    },
  ] satisfies Array<
    Omit<typeof schema.dailyUpdates.$inferInsert, "projectId" | "updatedBy"> & {
      projectName: string;
    }
  >;

  const updates = new Map<string, typeof schema.dailyUpdates.$inferSelect>();

  for (const update of updateSeeds) {
    const project = projects.get(update.projectName)!;
    const existingUpdate = await db.query.dailyUpdates.findFirst({
      where: and(
        eq(schema.dailyUpdates.projectId, project.id),
        eq(schema.dailyUpdates.updateDate, update.updateDate),
      ),
    });

    if (existingUpdate) {
      updates.set(`${update.projectName}:${update.updateDate}`, existingUpdate);
      continue;
    }

    const [createdUpdate] = await db
      .insert(schema.dailyUpdates)
      .values({
        projectId: project.id,
        updatedBy: pm.id,
        updateDate: update.updateDate,
        progressSummary: update.progressSummary,
        workCompleted: update.workCompleted,
        issueNotes: update.issueNotes,
        blockerNotes: update.blockerNotes,
        nextAction: update.nextAction,
        healthStatus: update.healthStatus,
        progressPercentage: update.progressPercentage,
      })
      .returning();

    updates.set(`${update.projectName}:${update.updateDate}`, createdUpdate);
  }

  return updates;
}

async function seedSampleDesignTasks(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const designer = users.get("designer@dekoria.local")!;
  const taskSeeds = [
    {
      projectName: "Classic Elegant Master Suite",
      taskName: "Master Bedroom Render Revision",
      designType: "render",
      status: "revision",
      approvalStatus: "revision_needed",
      revisionCount: 2,
      dueDate: "2026-05-14",
      notes: "Client wants softer wall panel detail and warmer lighting.",
    },
    {
      projectName: "Wabi Sabi Compact Kitchen",
      taskName: "Kitchen DED Package",
      designType: "ded",
      status: "blocked",
      approvalStatus: "waiting_approval",
      revisionCount: 1,
      dueDate: "2026-05-17",
      notes: "Waiting for final appliance dimensions.",
    },
    {
      projectName: "Premium Dental Clinic Interior",
      taskName: "Reception Area Concept",
      designType: "concept",
      status: "concept_progress",
      approvalStatus: "not_submitted",
      revisionCount: 0,
      dueDate: "2026-05-16",
      notes: "Need premium but calming healthcare atmosphere.",
    },
  ] satisfies Array<
    Omit<typeof schema.designTasks.$inferInsert, "projectId" | "designerId"> & {
      projectName: string;
    }
  >;

  for (const task of taskSeeds) {
    const project = projects.get(task.projectName)!;
    const existingTask = await db.query.designTasks.findFirst({
      where: and(
        eq(schema.designTasks.projectId, project.id),
        eq(schema.designTasks.taskName, task.taskName),
      ),
    });

    if (existingTask) {
      continue;
    }

    await db.insert(schema.designTasks).values({
      projectId: project.id,
      designerId: designer.id,
      taskName: task.taskName,
      designType: task.designType,
      status: task.status,
      approvalStatus: task.approvalStatus,
      revisionCount: task.revisionCount,
      dueDate: task.dueDate,
      notes: task.notes,
    });
  }
}

async function seedSampleVendors() {
  const vendorSeeds = [
    {
      vendorName: "Premium Panel Supplier",
      category: "board_material",
      contactPerson: "Budi",
      phone: "081200000001",
    },
    {
      vendorName: "LED & Lighting Partner",
      category: "lighting",
      contactPerson: "Rina",
      phone: "081200000002",
    },
    {
      vendorName: "Hardware Soft-Close Supplier",
      category: "hardware",
      contactPerson: "Andi",
      phone: "081200000003",
    },
    {
      vendorName: "Marble & Stone Vendor",
      category: "stone",
      contactPerson: "Dimas",
      phone: "081200000004",
    },
  ] satisfies Array<typeof schema.vendors.$inferInsert>;

  const vendors = new Map<string, typeof schema.vendors.$inferSelect>();

  for (const vendor of vendorSeeds) {
    const existingVendor = await db.query.vendors.findFirst({
      where: eq(schema.vendors.vendorName, vendor.vendorName),
    });

    if (existingVendor) {
      vendors.set(vendor.vendorName, existingVendor);
      continue;
    }

    const [createdVendor] = await db
      .insert(schema.vendors)
      .values(vendor)
      .returning();

    vendors.set(vendor.vendorName, createdVendor);
  }

  return vendors;
}

async function seedSampleMaterials(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  vendors: Awaited<ReturnType<typeof seedSampleVendors>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const purchasing = users.get("purchasing@dekoria.local")!;
  const materialSeeds = [
    {
      projectName: "Emerald Japandi Kitchen",
      materialName: "Emerald Green Laminate",
      category: "laminate",
      vendorName: "Premium Panel Supplier",
      status: "delayed",
      urgencyLevel: "critical",
      quantity: "24",
      unit: "sheet",
      etaDate: "2026-05-07",
      issueNotes: "Vendor has not confirmed final delivery schedule.",
    },
    {
      projectName: "Sentul Modern Luxury Residence",
      materialName: "Soft-Close Hinge Set",
      category: "hardware",
      vendorName: "Hardware Soft-Close Supplier",
      status: "problem",
      urgencyLevel: "high",
      quantity: "36",
      unit: "set",
      etaDate: "2026-05-13",
      issueNotes: "Quantity received is incomplete.",
    },
    {
      projectName: "JGC Smart Luxury Home",
      materialName: "Warm LED Strip 3000K",
      category: "lighting",
      vendorName: "LED & Lighting Partner",
      status: "arrived",
      urgencyLevel: "low",
      quantity: "30",
      unit: "meter",
      etaDate: "2026-05-03",
      issueNotes: "Ready for final installation.",
    },
  ] satisfies Array<
    Omit<
      typeof schema.materials.$inferInsert,
      "projectId" | "updatedBy" | "vendorId"
    > & {
      projectName: string;
      vendorName: string;
    }
  >;

  for (const material of materialSeeds) {
    const project = projects.get(material.projectName)!;
    const existingMaterial = await db.query.materials.findFirst({
      where: and(
        eq(schema.materials.projectId, project.id),
        eq(schema.materials.materialName, material.materialName),
      ),
    });

    if (existingMaterial) {
      continue;
    }

    await db.insert(schema.materials).values({
      projectId: project.id,
      materialName: material.materialName,
      category: material.category,
      vendorId: vendors.get(material.vendorName)!.id,
      status: material.status,
      urgencyLevel: material.urgencyLevel,
      quantity: material.quantity,
      unit: material.unit,
      etaDate: material.etaDate,
      issueNotes: material.issueNotes,
      updatedBy: purchasing.id,
    });
  }
}

async function seedSampleLeads(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const sales = users.get("sales@dekoria.local")!;
  const leadSeeds = [
    {
      leadName: "Mrs. Nadia",
      phone: "081299900001",
      email: "nadia@example.local",
      source: "Instagram Ads",
      interest: "Modern luxury kitchen and living room",
      estimatedProjectValue: "250000000",
      status: "consultation_scheduled",
      nextFollowUpDate: "2026-05-07",
      notes: "Interested in bold but warm luxury direction.",
    },
    {
      leadName: "Mr. Raymond",
      phone: "081299900002",
      email: "raymond@example.local",
      source: "Referral",
      interest: "Full home interior",
      estimatedProjectValue: "450000000",
      status: "proposal_sent",
      nextFollowUpDate: "2026-05-13",
      notes: "Proposal sent, follow up after family review.",
    },
    {
      leadName: "Mrs. Amira",
      phone: "081299900003",
      email: "amira@example.local",
      source: "Instagram Organic",
      interest: "Master bedroom renovation",
      estimatedProjectValue: "120000000",
      status: "new",
      nextFollowUpDate: "2026-05-06",
      notes: "Needs first consultation scheduling.",
    },
    {
      leadName: "Mr. D",
      phone: "081288800003",
      email: "mr-d@example.local",
      source: "Referral",
      interest: "Japandi kitchen",
      estimatedProjectValue: "260000000",
      status: "converted",
      convertedProjectId: projects.get("Emerald Japandi Kitchen")!.id,
      notes: "Converted to Emerald Japandi Kitchen.",
    },
  ] satisfies Array<
    Omit<typeof schema.leads.$inferInsert, "assignedSalesId"> & {
      projectName?: string;
    }
  >;

  for (const lead of leadSeeds) {
    const existingLead = await db.query.leads.findFirst({
      where: eq(schema.leads.leadName, lead.leadName),
    });

    if (existingLead) {
      continue;
    }

    await db.insert(schema.leads).values({
      leadName: lead.leadName,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      interest: lead.interest,
      estimatedProjectValue: lead.estimatedProjectValue,
      status: lead.status,
      assignedSalesId: sales.id,
      nextFollowUpDate: lead.nextFollowUpDate,
      notes: lead.notes,
      convertedProjectId: lead.convertedProjectId,
    });
  }
}

async function seedSampleContentAssets(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const marketing = users.get("marketing@dekoria.local")!;
  const contentSeeds = [
    {
      projectName: "JGC Smart Luxury Home",
      roomArea: "Pantry",
      visualStatus: "final_visual_available",
      footageStatus: "footage_available",
      contentOpportunity: "luxury_feature",
      suggestedAngle:
        "Pocket door pantry system yang bikin ruangan clean dan hidden.",
      contentStatus: "ready_to_publish",
      publishUrl: "https://dekoria.local/content/jgc-smart-luxury-pantry",
      notes: "Strong candidate for short-form premium storage content.",
    },
    {
      projectName: "Sentul Modern Luxury Residence",
      roomArea: "Master Bedroom",
      visualStatus: "progress_visual_available",
      footageStatus: "footage_available",
      contentOpportunity: "detail_craftsmanship",
      suggestedAngle:
        "Detail wardrobe dan lighting yang bikin bedroom terasa expensive.",
      contentStatus: "editing",
      notes: "Use progress footage and detail shots.",
    },
    {
      projectName: "Emerald Japandi Kitchen",
      roomArea: "Kitchen",
      visualStatus: "render_available",
      footageStatus: "needs_shooting",
      contentOpportunity: "before_after",
      suggestedAngle:
        "Emerald kitchen yang bikin rumah terlihat bold tapi tetap elegant.",
      contentStatus: "ready_to_shoot",
      notes: "Schedule shoot once laminate issue is resolved.",
    },
  ] satisfies Array<
    Omit<typeof schema.contentAssets.$inferInsert, "projectId" | "assignedTo"> & {
      projectName: string;
    }
  >;

  const contentAssets = new Map<string, typeof schema.contentAssets.$inferSelect>();

  for (const content of contentSeeds) {
    const project = projects.get(content.projectName)!;
    const existingContent = await db.query.contentAssets.findFirst({
      where: and(
        eq(schema.contentAssets.projectId, project.id),
        eq(schema.contentAssets.roomArea, content.roomArea),
      ),
    });

    if (existingContent) {
      contentAssets.set(`${content.projectName}:${content.roomArea}`, existingContent);
      continue;
    }

    const [createdContent] = await db
      .insert(schema.contentAssets)
      .values({
        projectId: project.id,
        roomArea: content.roomArea,
        visualStatus: content.visualStatus,
        footageStatus: content.footageStatus,
        contentOpportunity: content.contentOpportunity,
        suggestedAngle: content.suggestedAngle,
        contentStatus: content.contentStatus,
        assignedTo: marketing.id,
        publishUrl: content.publishUrl,
        notes: content.notes,
      })
      .returning();

    contentAssets.set(`${content.projectName}:${content.roomArea}`, createdContent);
  }

  return contentAssets;
}

async function seedSampleAiRun(
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const owner = users.get("owner@dekoria.local")!;
  const existingRun = await db.query.aiRuns.findFirst({
    where: and(
      eq(schema.aiRuns.agentName, "OwnerOpsAgent"),
      eq(schema.aiRuns.workflowName, "generateMorningSummary"),
      eq(schema.aiRuns.reasoningLevel, "high"),
      eq(schema.aiRuns.createdBy, owner.id),
    ),
  });

  if (existingRun) {
    return existingRun;
  }

  const [createdRun] = await db
    .insert(schema.aiRuns)
    .values({
      agentName: "OwnerOpsAgent",
      workflowName: "generateMorningSummary",
      modelProvider: "google",
      modelName: "gemini-3-flash",
      reasoningLevel: "high",
      inputTokens: 1840,
      outputTokens: 420,
      totalTokens: 2260,
      status: "success",
      startedAt: new Date("2026-05-06T08:00:00+07:00"),
      completedAt: new Date("2026-05-06T08:00:08+07:00"),
      createdBy: owner.id,
    })
    .returning();

  return createdRun;
}

async function seedSampleAiSummary(
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
  aiRunId: string,
) {
  const owner = users.get("owner@dekoria.local")!;
  const existingSummary = await db.query.aiSummaries.findFirst({
    where: and(
      eq(schema.aiSummaries.summaryType, "morning_summary"),
      eq(schema.aiSummaries.summaryDate, "2026-05-06"),
      eq(schema.aiSummaries.generatedForUserId, owner.id),
    ),
  });

  if (existingSummary) {
    return;
  }

  await db.insert(schema.aiSummaries).values({
    summaryType: "morning_summary",
    summaryDate: "2026-05-06",
    generatedForUserId: owner.id,
    content:
      "Hari ini ada 6 project aktif. Project Emerald Japandi Kitchen perlu perhatian utama karena material emerald laminate terlambat dan berpotensi menghambat produksi. Project Sentul juga perlu follow-up hardware soft-close. Dari sisi konten, JGC Smart Luxury Home dan Sentul memiliki footage yang siap diproses menjadi Reels.",
    sourceData: {
      activeProjects: 6,
      urgentProjects: ["Emerald Japandi Kitchen", "Wabi Sabi Compact Kitchen"],
      materialIssues: ["Emerald Green Laminate", "Soft-Close Hinge Set"],
      contentReady: ["JGC Smart Luxury Home", "Sentul Modern Luxury Residence"],
    },
    aiRunId,
  });
}

async function seedSampleMediaAssets(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
  dailyUpdates: Awaited<ReturnType<typeof seedSampleDailyUpdates>>,
  contentAssets: Awaited<ReturnType<typeof seedSampleContentAssets>>,
) {
  const pm = users.get("pm@dekoria.local")!;
  const marketing = users.get("marketing@dekoria.local")!;
  const sentulUpdate = dailyUpdates.get(
    "Sentul Modern Luxury Residence:2026-05-06",
  )!;
  const jgcContent = contentAssets.get("JGC Smart Luxury Home:Pantry")!;

  const mediaSeeds = [
    {
      projectName: "Sentul Modern Luxury Residence",
      relatedType: "daily_update",
      relatedId: sentulUpdate.id,
      fileName: "sentul-master-bedroom-progress.jpg",
      fileType: "image",
      mimeType: "image/jpeg",
      fileSize: 428000,
      imagekitFileId: "seed_sentul_master_bedroom_progress",
      imagekitUrl: "https://ik.imagekit.io/example/project-progress.jpg",
      thumbnailUrl: "https://ik.imagekit.io/example/project-progress-thumb.jpg",
      folderPath: "dekoria-erp/projects/sentul-modern-luxury/daily-updates",
      uploadedBy: pm.id,
    },
    {
      projectName: "JGC Smart Luxury Home",
      relatedType: "content_asset",
      relatedId: jgcContent.id,
      fileName: "jgc-pantry-thumbnail.jpg",
      fileType: "video_thumbnail",
      mimeType: "image/jpeg",
      fileSize: 312000,
      imagekitFileId: "seed_jgc_pantry_thumbnail",
      imagekitUrl: "https://ik.imagekit.io/example/pantry-thumbnail.jpg",
      thumbnailUrl: "https://ik.imagekit.io/example/pantry-thumbnail-small.jpg",
      folderPath: "dekoria-erp/projects/jgc-smart-luxury/content",
      uploadedBy: marketing.id,
    },
  ] satisfies Array<
    Omit<typeof schema.mediaAssets.$inferInsert, "projectId"> & {
      projectName: string;
    }
  >;

  for (const media of mediaSeeds) {
    const existingMedia = await db.query.mediaAssets.findFirst({
      where: eq(schema.mediaAssets.imagekitFileId, media.imagekitFileId),
    });

    if (existingMedia) {
      continue;
    }

    await db.insert(schema.mediaAssets).values({
      projectId: projects.get(media.projectName)!.id,
      relatedType: media.relatedType,
      relatedId: media.relatedId,
      fileName: media.fileName,
      fileType: media.fileType,
      mimeType: media.mimeType,
      fileSize: media.fileSize,
      imagekitFileId: media.imagekitFileId,
      imagekitUrl: media.imagekitUrl,
      thumbnailUrl: media.thumbnailUrl,
      folderPath: media.folderPath,
      uploadedBy: media.uploadedBy,
    });
  }
}

async function seedSampleNotifications(
  projects: Awaited<ReturnType<typeof seedSampleProjects>>,
  users: Awaited<ReturnType<typeof seedSampleUsers>>,
) {
  const owner = users.get("owner@dekoria.local")!;
  const notificationSeeds = [
    {
      projectName: "Emerald Japandi Kitchen",
      title: "Material Issue Detected",
      message:
        "Emerald Green Laminate for Emerald Japandi Kitchen is delayed and marked critical.",
      type: "material",
      isRead: false,
    },
    {
      projectName: "JGC Smart Luxury Home",
      title: "Content Ready",
      message: "JGC Smart Luxury Home has footage available and is ready to publish.",
      type: "content",
      isRead: false,
    },
  ] satisfies Array<
    Omit<typeof schema.notifications.$inferInsert, "userId" | "projectId"> & {
      projectName: string;
    }
  >;

  for (const notification of notificationSeeds) {
    const existingNotification = await db.query.notifications.findFirst({
      where: and(
        eq(schema.notifications.userId, owner.id),
        eq(schema.notifications.title, notification.title),
      ),
    });

    if (existingNotification) {
      continue;
    }

    await db.insert(schema.notifications).values({
      userId: owner.id,
      projectId: projects.get(notification.projectName)!.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
    });
  }
}

async function seedBootstrapOwnerInvite() {
  const email = process.env.BOOTSTRAP_OWNER_EMAIL?.toLowerCase();
  const name = process.env.BOOTSTRAP_OWNER_NAME ?? "Dekoria Owner";

  if (!email) {
    console.info("Skipped owner invite. Set BOOTSTRAP_OWNER_EMAIL to create it.");
    return;
  }

  const ownerRole = await db.query.roles.findFirst({
    where: eq(schema.roles.name, "owner"),
  });

  if (!ownerRole) {
    throw new Error("Owner role is missing after role seed.");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.email, email),
  });

  if (existingUser) {
    console.info(`Skipped owner invite. User already exists for ${email}.`);
    return;
  }

  const existingInvite = await db.query.userInvites.findFirst({
    where: and(
      eq(schema.userInvites.email, email),
      eq(schema.userInvites.status, "pending"),
    ),
  });

  if (existingInvite) {
    console.info(`Skipped owner invite. Pending invite already exists for ${email}.`);
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.insert(schema.userInvites).values({
    email,
    name,
    roleId: ownerRole.id,
    tokenHash,
    expiresAt,
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    "http://localhost:3000";

  console.info("Bootstrap owner invite created:");
  console.info(new URL(`/invite/${token}`, baseUrl).toString());
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
