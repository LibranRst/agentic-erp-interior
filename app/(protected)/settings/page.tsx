import { Alert02Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requirePageRole } from "@/src/lib/auth/permissions"

const requiredEnvironmentVariables = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
] as const

const optionalEnvironmentVariables = [
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL_UNPOOLED",
  "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
  "IMAGEKIT_URL_ENDPOINT",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "MASTRA_TELEMETRY_DISABLED",
] as const

type EnvironmentStatus = {
  name: string
  required: boolean
  isConfigured: boolean
}

export default async function SettingsPage() {
  await requirePageRole(["owner", "admin"])

  const requiredStatuses = requiredEnvironmentVariables.map((name) =>
    getEnvironmentStatus(name, true),
  )
  const optionalStatuses = optionalEnvironmentVariables.map((name) =>
    getEnvironmentStatus(name, false),
  )
  const missingRequired = requiredStatuses.filter((item) => !item.isConfigured)

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Owner/admin environment status for the MVP runtime. Secrets are only shown as configured or missing."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Runtime Status</CardTitle>
            <CardDescription>
              Required configuration needed for local app startup and protected routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <StatusRow
              label="Database"
              description="Neon Postgres connection for Drizzle and Better Auth."
              isConfigured={isEnvironmentConfigured("DATABASE_URL")}
            />
            <StatusRow
              label="Better Auth"
              description="Session and credential runtime configuration."
              isConfigured={
                isEnvironmentConfigured("BETTER_AUTH_SECRET") &&
                isEnvironmentConfigured("BETTER_AUTH_URL")
              }
            />
            <StatusRow
              label="ImageKit"
              description="Media upload features require ImageKit keys."
              isConfigured={
                isEnvironmentConfigured("IMAGEKIT_PRIVATE_KEY") &&
                isEnvironmentConfigured("NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY") &&
                isEnvironmentConfigured("NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT")
              }
              optional
            />
            <StatusRow
              label="Gemini / Mastra"
              description="AI summary generation requires the Google API key."
              isConfigured={isEnvironmentConfigured("GOOGLE_GENERATIVE_AI_API_KEY")}
              optional
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              Missing required values should be added to `.env.local`; see `docs/ENV_SETUP.md`.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <EnvironmentGroup title="Required" items={requiredStatuses} />
            <EnvironmentGroup
              title="Optional MVP Services"
              items={optionalStatuses}
            />
            {missingRequired.length > 0 ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                Missing required environment variables:{" "}
                {missingRequired.map((item) => item.name).join(", ")}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function EnvironmentGroup({
  title,
  items,
}: {
  title: string
  items: EnvironmentStatus[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="rounded-lg border">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
          >
            <span className="min-w-0 truncate font-mono text-xs">
              {item.name}
            </span>
            <Badge
              variant={
                item.isConfigured
                  ? "secondary"
                  : item.required
                    ? "destructive"
                    : "outline"
              }
            >
              {item.isConfigured
                ? "Configured"
                : item.required
                  ? "Missing"
                  : "Optional"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusRow({
  label,
  description,
  isConfigured,
  optional = false,
}: {
  label: string
  description: string
  isConfigured: boolean
  optional?: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <HugeiconsIcon
        icon={isConfigured ? CheckmarkCircle02Icon : Alert02Icon}
        strokeWidth={2}
        className={isConfigured ? "text-muted-foreground" : "text-destructive"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">{label}</div>
          {optional ? <Badge variant="outline">Optional</Badge> : null}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  )
}

function getEnvironmentStatus(
  name:
    | (typeof requiredEnvironmentVariables)[number]
    | (typeof optionalEnvironmentVariables)[number],
  required: boolean,
): EnvironmentStatus {
  return {
    name,
    required,
    isConfigured: isEnvironmentConfigured(name),
  }
}

function isEnvironmentConfigured(name: string) {
  return Boolean(process.env[name]?.trim())
}
