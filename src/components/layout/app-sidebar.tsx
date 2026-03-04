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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useUserRole } from "@/hooks/useUserRole";
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
  Shield,
} from "lucide-react";

// Menu items with access requirements
const allMenuItems = [
  // Navigation (everyone)
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: "nav" },
  { title: "Calendar", url: "/calendar", icon: Calendar, group: "nav" },
  
  // Content tools (content teams + general)
  { title: "Content Hub", url: "/content", icon: Newspaper, group: "content" },
  { title: "News DB", url: "/content/news", icon: Database, group: "content" },
  { title: "My Tasks", url: "/my-tasks", icon: ClipboardList, group: "content" },
  { title: "Draft Generator", url: "/draft", icon: FileEdit, group: "content" },
  { title: "Templates", url: "/templates", icon: FileText, group: "content" },
  { title: "Tools", url: "/tools", icon: Wrench, group: "content" },
  
  // HR & Team (everyone)
  { title: "HR (ลา/OT)", url: "/hr", icon: Briefcase, group: "hr" },
  { title: "Team", url: "/team", icon: UserCircle, group: "hr" },
  
  // Manager+ only
  { title: "Timesheet", url: "/timesheet", icon: Clock, group: "manager", minRole: "lead" },
  { title: "Content Calendar", url: "/content-calendar", icon: CalendarRange, group: "manager", minRole: "lead" },
  { title: "Analytics", url: "/analytics", icon: FileBarChart, group: "manager", minRole: "manager" },
  { title: "Assets", url: "/assets", icon: Package, group: "manager", minRole: "manager" },
  { title: "Reports", url: "/report", icon: FileBarChart, group: "manager", minRole: "manager" },
  { title: "YouTube", url: "/youtube", icon: Youtube, group: "manager", minRole: "manager" },
  
  // Revenue team only
  { title: "Revenue", url: "/revenue", icon: DollarSign, group: "revenue", departments: ["revenue", "management"] },
  { title: "Quotation", url: "/quotation", icon: Receipt, group: "revenue", departments: ["revenue", "management"] },
  { title: "Rate Card", url: "/ratecard", icon: FileText, group: "revenue", departments: ["revenue", "management"] },
  
  // Production team only
  { title: "Production", url: "/production", icon: Video, group: "production", departments: ["production", "creative", "management"] },
  
  // Admin only
  { title: "HR Admin", url: "/hr/admin", icon: Briefcase, group: "admin", minRole: "manager" },
  { title: "Audit Log", url: "/audit", icon: Shield, group: "admin", minRole: "admin" },
  { title: "Settings", url: "/settings", icon: Settings, group: "admin", minRole: "admin" },
];

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "bg-red-500" },
  manager: { label: "Manager", color: "bg-purple-500" },
  lead: { label: "Lead", color: "bg-blue-500" },
  member: { label: "Member", color: "bg-gray-500" },
};

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { role, department, canAccess, isLoading } = useUserRole();

  const user = session?.user ?? {
    name: "Guest",
    email: "",
    image: "",
  };

  // Filter menu items based on user permissions
  const filteredItems = allMenuItems.filter(item => canAccess(item.url));

  // Group items
  const navItems = filteredItems.filter(i => i.group === "nav");
  const contentItems = filteredItems.filter(i => i.group === "content");
  const hrItems = filteredItems.filter(i => i.group === "hr");
  const managerItems = filteredItems.filter(i => i.group === "manager");
  const revenueItems = filteredItems.filter(i => i.group === "revenue");
  const productionItems = filteredItems.filter(i => i.group === "production");
  const adminItems = filteredItems.filter(i => i.group === "admin");

  const roleInfo = roleLabels[role] || roleLabels.member;

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
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
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

        {/* Content Tools */}
        {contentItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentItems.map((item) => (
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
        )}

        {/* HR & Team */}
        {hrItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>HR & Team</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hrItems.map((item) => (
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
        )}

        {/* Revenue Team */}
        {revenueItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Revenue</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {revenueItems.map((item) => (
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
        )}

        {/* Production Team */}
        {productionItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Production</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {productionItems.map((item) => (
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
        )}

        {/* Manager Tools */}
        {managerItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managerItems.map((item) => (
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
        )}

        {/* Admin */}
        {adminItems.length > 0 && (
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
        )}
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
                    <div className="flex items-center gap-1">
                      <Badge className={`${roleInfo.color} text-white text-[10px] px-1 py-0`}>
                        {roleInfo.label}
                      </Badge>
                    </div>
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
