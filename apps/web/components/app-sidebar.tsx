"use client";

import * as React from "react";
import { IconClipboardText, IconDashboard, IconInnerShadowTop } from "@tabler/icons-react";
import Link from "next/link";

import { NavMain } from "~/components/nav-main";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { useUser } from "~/hooks/api/auth";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Forms",
      url: "/dashboard/forms",
      icon: IconClipboardText,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading } = useUser();
  const displayName = getUserDisplayName(user?.fullName, user?.email);
  const sidebarUser = {
    name: displayName || (isLoading ? "Loading..." : "Account"),
    email: user?.email ?? "",
    avatar: user?.profileImageUrl ?? "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">formU</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} isLoading={isLoading} />
      </SidebarFooter>
    </Sidebar>
  );
}

function getUserDisplayName(fullName?: string, email?: string) {
  const trimmedName = fullName?.trim();
  if (trimmedName) return trimmedName;

  const emailName = email?.split("@")[0]?.trim();
  return emailName || "";
}
