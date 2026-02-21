"use client";

import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Truck, 
  ClipboardList, 
  Wrench, 
  Receipt, 
  LineChart, 
  Settings, 
  LogOut, 
  Bell,
  GaugeCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Truck, label: 'Vehicle Registry', href: '/dashboard/vehicles' },
  { icon: ClipboardList, label: 'Trip Dispatcher', href: '/dashboard/trips' },
  { icon: Wrench, label: 'Maintenance', href: '/dashboard/maintenance' },
  { icon: Receipt, label: 'Trip & Expense', href: '/dashboard/expenses' },
  { icon: GaugeCircle, label: 'Performance', href: '/dashboard/performance' },
  { icon: LineChart, label: 'Analytics', href: '/dashboard/analytics' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();

  // Check for the role document to ensure the user is "provisioned" for the prototype
  const roleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_fleetManagers', user.uid);
  }, [db, user]);

  const { data: roleDoc, isLoading: isRoleLoading, error: roleError } = useDoc(roleRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  // PROTOTYPE AUTO-PROVISIONING: 
  // If the user is logged in but has no role document, create it now.
  // We use merge: true to handle upserts gracefully.
  useEffect(() => {
    if (user && !isRoleLoading && !roleDoc) {
      // Initialize User Profile
      setDocumentNonBlocking(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        roleId: 'fleet-manager'
      }, { merge: true });

      // Provision Fleet Manager role for the prototype
      setDocumentNonBlocking(doc(db, 'roles_fleetManagers', user.uid), {
        id: user.uid,
        name: 'Fleet Manager',
        accessScope: 'Full administrative access to all logistics modules.'
      }, { merge: true });
    }
  }, [user, isRoleLoading, roleDoc, db]);

  if (isUserLoading || (user && isRoleLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-slate-500 font-medium animate-pulse">
            {isRoleLoading ? "Verifying Permissions..." : "Authenticating FleetFlow..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-sidebar-border shadow-xl">
          <SidebarHeader className="p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform text-white">
                <Truck className="w-5 h-5" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight text-white">Fleet Flow</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 px-3 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">Menu</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`h-11 rounded-lg px-4 transition-all duration-200 ${pathname === item.href ? 'bg-primary text-white shadow-md' : 'hover:bg-white/10'}`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${pathname === item.href ? 'text-white' : 'text-sidebar-foreground/70'}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-11 rounded-lg px-4 hover:bg-white/10 transition-colors">
                    <Settings className="w-5 h-5 mr-3 text-sidebar-foreground/70" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleLogout}
                    className="h-11 rounded-lg px-4 hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3 text-sidebar-foreground/70" />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-auto bg-[#F8FAFC]">
          <header className="h-16 px-8 flex items-center justify-between bg-white border-b shadow-sm sticky top-0 z-30">
            <h2 className="text-lg font-bold text-slate-800 font-headline">
              {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 border-l pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Fleet Manager</p>
                </div>
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src={`https://picsum.photos/seed/${user.uid}/150/150`} />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
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

  function handleLogout() {
    signOut(auth).then(() => {
      router.push('/');
    });
  };
}