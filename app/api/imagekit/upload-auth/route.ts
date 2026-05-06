import { createHmac, randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  ForbiddenError,
  hasPermission,
  requireUser,
} from "@/src/lib/auth/permissions";

export async function POST() {
  const currentUser = await requireUser();
  const canUploadDesign =
    hasPermission(currentUser, "design_task:create") &&
    ["owner", "admin", "designer"].includes(currentUser.role);
  const canUploadDailyUpdate =
    hasPermission(currentUser, "daily_update:create") &&
    ["owner", "admin", "project_manager"].includes(currentUser.role);

  if (!canUploadDesign && !canUploadDailyUpdate) {
    throw new ForbiddenError("You do not have access to upload media.");
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
    urlEndpoint:
      process.env.IMAGEKIT_URL_ENDPOINT ??
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ??
      null,
  });
}
