"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardList,
  Newspaper,
  DollarSign,
  Video,
  Settings,
  LogOut,
  ChevronUp,
  Calendar,
  Users,
  Database,
  Youtube,
  FileText,
  FileEdit,
  FileBarChart,
  Receipt,
  Wrench,
  Briefcase,
  Clock,
  Package,
  CalendarRange,
  UserCircle,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Activity Log",
    url: "/activity",
    icon: ClipboardList,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
];

const departmentItems = [
  {
    title: "Content Hub",
    url: "/content",
    icon: Newspaper,
  },
  {
    title: "News DB",
    url: "/content/news",
    icon: Database,
  },
  {
    title: "My Tasks",
    url: "/my-tasks",
    icon: ClipboardList,
  },
  {
    title: "Draft Generator",
    url: "/draft",
    icon: FileEdit,
  },
  {
    title: "YouTube",
    url: "/youtube",
    icon: Youtube,
  },
  {
    title: "Revenue",
    url: "/revenue",
    icon: DollarSign,
  },
  {
    title: "Quotation",
    url: "/quotation",
    icon: Receipt,
  },
  {
    title: "Rate Card",
    url: "/ratecard",
    icon: FileText,
  },
  {
    title: "Production",
    url: "/production",
    icon: Video,
  },
  {
    title: "HR (ลา/OT)",
    url: "/hr",
    icon: Briefcase,
  },
  {
    title: "Timesheet",
    url: "/timesheet",
    icon: Clock,
  },
  {
    title: "Team",
    url: "/team",
    icon: UserCircle,
  },
  {
    title: "Assets",
    url: "/assets",
    icon: Package,
  },
  {
    title: "Content Calendar",
    url: "/content-calendar",
    icon: CalendarRange,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: FileBarChart,
  },
  {
    title: "Reports",
    url: "/report",
    icon: FileBarChart,
  },
  {
    title: "Tools",
    url: "/tools",
    icon: Wrench,
  },
];

const adminItems = [
  {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
  {
    title: "Audit Log",
    url: "/audit",
    icon: ClipboardList,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user ?? {
    name: "Guest",
    email: "",
    image: "",
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            iM
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">iMoD Portal</span>
            <span className="text-xs text-muted-foreground">Internal System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Department Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {departmentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>
                      {user.name?.split(" ").map((n) => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-56">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
