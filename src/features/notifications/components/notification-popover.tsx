"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BellDotIcon,
  CheckmarkCircle02Icon,
  PackageIcon,
  PencilEdit02Icon,
  Building02Icon,
  UserAdd02Icon,
  Robot01Icon,
  Settings02Icon,
  Image01Icon,
  Folder01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/src/server/actions/notifications";
import type { NotificationItem } from "@/src/features/notifications/schemas";

type IconData = typeof BellDotIcon;

const iconByType: Record<string, IconData> = {
  material: PackageIcon,
  design: PencilEdit02Icon,
  project: Building02Icon,
  lead: UserAdd02Icon,
  ai: Robot01Icon,
  system: Settings02Icon,
  content: Image01Icon,
  daily_update: Folder01Icon,
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationPopover({
  userId,
  initialUnreadCount,
  initialNotifications,
}: {
  userId: string;
  initialUnreadCount: number;
  initialNotifications: NotificationItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState(initialNotifications);

  async function handleMarkRead(notificationId: string) {
    const result = await markNotificationRead(notificationId);
    if (result.status === "success") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      startTransition(() => router.refresh());
    }
  }

  async function handleMarkAllRead() {
    const result = await markAllNotificationsRead();
    if (result.status === "success") {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      startTransition(() => router.refresh());
    }
  }

  function handleItemClick(notification: NotificationItem) {
    if (!notification.isRead) {
      handleMarkRead(notification.id);
    }
    if (notification.projectId) {
      router.push(`/projects/${notification.projectId}`);
    }
  }

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative"
        >
          {unreadCount > 0 ? (
            <>
              <HugeiconsIcon icon={BellDotIcon} strokeWidth={2} />
              <Badge
                variant="destructive"
                className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px] leading-none"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </>
          ) : (
            <HugeiconsIcon icon={BellDotIcon} strokeWidth={2} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex max-h-[480px] w-80 flex-col overflow-hidden p-0"
      >
        <PopoverHeader className="flex shrink-0 flex-row items-center justify-between px-4 py-3">
          <PopoverTitle className="text-sm font-semibold">
            Notifications
          </PopoverTitle>
          {unread.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="mr-1 size-3.5"
              />
              Mark all read
            </Button>
          ) : null}
        </PopoverHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <HugeiconsIcon
                icon={BellDotIcon}
                strokeWidth={1.5}
                className="size-8 text-muted-foreground/50"
              />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {unread.length > 0 && (
                <div className="flex flex-col">
                  <div className="px-4 py-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Unread
                    </span>
                  </div>
                  {unread.map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}
              {read.length > 0 && unread.length > 0 && (
                <div className="mx-4 border-t border-border" />
              )}
              {read.length > 0 && (
                <div className="flex flex-col">
                  <div className="px-4 py-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Earlier
                    </span>
                  </div>
                  {read.slice(0, 10).map((item) => (
                    <NotificationRow
                      key={item.id}
                      item={item}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: (item: NotificationItem) => void;
}) {
  const iconData = item.type
    ? (iconByType[item.type] ?? Folder01Icon)
    : Folder01Icon;

  return (
    <button
      type="button"
      className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/50 ${
        !item.isRead ? "bg-muted/20" : ""
      }`}
      onClick={() => onClick(item)}
    >
      <div
        className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border ${
          !item.isRead
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-muted/50 text-muted-foreground"
        }`}
      >
        <HugeiconsIcon icon={iconData} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm ${!item.isRead ? "font-medium" : ""}`}
          >
            {item.title}
          </p>
          {!item.isRead && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {item.message}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <HugeiconsIcon
            icon={Clock01Icon}
            strokeWidth={1.5}
            className="size-3 text-muted-foreground/60"
          />
          <span className="text-[11px] text-muted-foreground/80">
            {formatTimeAgo(item.createdAt)}
          </span>
          {item.project?.projectName ? (
            <span className="truncate text-[11px] text-muted-foreground/60">
              · {item.project.projectName}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
