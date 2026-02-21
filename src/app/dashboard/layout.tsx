
"use client";

import { useEffect, useState } from 'react';
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
  Loader2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase, useCollection, addDocumentNonBlocking } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, collection, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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
  const [isSeeding, setIsSeeding] = useState(false);

  // Check for the role document to ensure the user is "provisioned" for the prototype
  const roleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'roles_fleetManagers', user.uid);
  }, [db, user]);

  const { data: roleDoc, isLoading: isRoleLoading } = useDoc(roleRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  // PROTOTYPE AUTO-PROVISIONING: 
  useEffect(() => {
    if (user && !isRoleLoading && !roleDoc) {
      setDocumentNonBlocking(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        roleId: 'fleet-manager'
      }, { merge: true });

      setDocumentNonBlocking(doc(db, 'roles_fleetManagers', user.uid), {
        id: user.uid,
        name: 'Fleet Manager',
        accessScope: 'Full administrative access to all logistics modules.'
      }, { merge: true });
    }
  }, [user, isRoleLoading, roleDoc, db]);

  // DEMO SEEDING LOGIC
  const seedDemoData = async () => {
    if (!user || isSeeding) return;
    setIsSeeding(true);
    
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const driversRef = collection(db, 'drivers');
      
      const vSnap = await getDocs(vehiclesRef);
      if (vSnap.empty) {
        // Vehicles
        const v1 = { id: 'V-001', name: 'Scania Heavy', model: 'R500', licensePlate: 'ABC-123', maxCapacityKg: 15000, odometerKm: 45000, acquisitionCost: 1200000, status: 'Available', type: 'Truck', region: 'Central' };
        const v2 = { id: 'V-002', name: 'Ford Delivery', model: 'Transit', licensePlate: 'XYZ-789', maxCapacityKg: 2000, odometerKm: 12000, acquisitionCost: 450000, status: 'On Trip', type: 'Van', region: 'North' };
        const v3 = { id: 'V-003', name: 'Hiace Mini', model: 'Toyota 2022', licensePlate: 'LMN-456', maxCapacityKg: 1000, odometerKm: 8000, acquisitionCost: 350000, status: 'In Shop', type: 'Mini', region: 'South' };
        
        await Promise.all([
          addDocumentNonBlocking(vehiclesRef, v1),
          addDocumentNonBlocking(vehiclesRef, v2),
          addDocumentNonBlocking(vehiclesRef, v3)
        ]);

        // Drivers
        const d1 = { id: 'D-001', name: 'John Doe', licenseCategory: 'Class A', licenseExpiryDate: '2025-12-01', status: 'On Trip', safetyScore: 98, totalTrips: 45, completedTrips: 44, completionRate: 97 };
        const d2 = { id: 'D-002', name: 'Sarah Miller', licenseCategory: 'Class B', licenseExpiryDate: '2026-05-15', status: 'On Duty', safetyScore: 92, totalTrips: 12, completedTrips: 10, completionRate: 83 };
        const d3 = { id: 'D-003', name: 'Mike Ross', licenseCategory: 'Class A', licenseExpiryDate: '2023-01-01', status: 'Suspended', safetyScore: 75, totalTrips: 2, completedTrips: 1, completionRate: 50 };
        
        await Promise.all([
          addDocumentNonBlocking(driversRef, d1),
          addDocumentNonBlocking(driversRef, d2),
          addDocumentNonBlocking(driversRef, d3)
        ]);

        // Trips
        const tripsRef = collection(db, 'trips');
        await addDocumentNonBlocking(tripsRef, {
          id: 'T-8821', vehicleId: 'V-002', driverId: 'D-001', cargoWeightKg: 500, origin: 'Mumbai', destination: 'Pune', revenue: 15000, startOdometerKm: 11500, status: 'Dispatched', dispatchDate: new Date().toISOString()
        });

        // Maintenance
        const maintenanceRef = collection(db, 'maintenance_logs');
        await addDocumentNonBlocking(maintenanceRef, {
          id: 'M-321', vehicleId: 'V-003', serviceType: 'Engine Overhaul', cost: 15000, date: '2024-03-24', status: 'New', notes: 'Unusual noise reported'
        });

        toast({ title: "Demo Seeded", description: "Fresh logistics data injected into your system." });
      } else {
        toast({ title: "Data Exists", description: "Your fleet already has records." });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

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
                  <SidebarMenuButton 
                    onClick={seedDemoData} 
                    disabled={isSeeding}
                    className="h-11 rounded-lg px-4 hover:bg-white/10 transition-colors text-emerald-400 font-bold"
                  >
                    {isSeeding ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Sparkles className="w-5 h-5 mr-3" />}
                    <span>{isSeeding ? "Seeding..." : "Seed Demo Data"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
