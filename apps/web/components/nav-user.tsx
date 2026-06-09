"use client";

import { IconDotsVertical, IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useLogout } from "~/hooks/api/auth";

export function NavUser({
  user,
  isLoading = false,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const { logoutAsync, isPending: isLoggingOut } = useLogout();
  const fallback = getUserFallback(user.name, user.email);

  const onLogout = async () => {
    try {
      await logoutAsync(undefined);
    } catch {
      // The local route below still clears the browser cookie if the API call is stale.
    } finally {
      try {
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Navigation still moves the user out of the dashboard.
      }
      toast.success("Logged out successfully");
      router.replace("/signin");
      router.refresh();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isLoading}
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {user.email ? (
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                ) : null}
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  {user.email ? (
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  ) : null}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isLoggingOut} onClick={onLogout}>
              <IconLogout />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function getUserFallback(name: string, email: string) {
  const source = name.trim() || email.trim();
  if (!source) return "U";

  const initials = source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "U";
}
