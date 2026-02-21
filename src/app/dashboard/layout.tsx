
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { BarChart3, LayoutDashboard, PieChart, Table, Settings, User, LogOut, BrainCircuit, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: PieChart, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Table, label: 'Data Tables', href: '/dashboard/data' },
  { icon: BrainCircuit, label: 'AI Insights', href: '/dashboard/ai' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-sidebar-border shadow-xl">
          <SidebarHeader className="p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
                <BarChart3 className="text-sidebar-background w-5 h-5" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight">InsightFlow</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 px-3 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Main Menu</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`h-11 rounded-lg px-4 transition-all duration-200 ${pathname === item.href ? 'bg-accent text-sidebar-background shadow-md' : 'hover:bg-white/10'}`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Support</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-11 rounded-lg px-4 hover:bg-white/10 transition-colors">
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-11 rounded-lg px-4 hover:bg-white/10 transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-auto bg-[#F0F2F5]">
          <header className="h-16 px-8 flex items-center justify-between bg-white border-b shadow-sm sticky top-0 z-30">
            <h2 className="text-lg font-semibold text-slate-800">
              {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 border-l pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">Alex Johnson</p>
                  <p className="text-xs text-slate-500">Premium Account</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src="https://picsum.photos/seed/user123/150/150" />
                  <AvatarFallback>AJ</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <div className="p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
