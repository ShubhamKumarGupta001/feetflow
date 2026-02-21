"use client";

import { useEffect, useState, useMemo } from 'react';
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
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['fleet-manager', 'dispatcher', 'safety-officer', 'financial-analyst'] },
  { icon: Truck, label: 'Vehicle Registry', href: '/dashboard/vehicles', roles: ['fleet-manager', 'dispatcher', 'safety-officer'] },
  { icon: ClipboardList, label: 'Trip Dispatcher', href: '/dashboard/trips', roles: ['fleet-manager', 'dispatcher'] },
  { icon: Wrench, label: 'Maintenance', href: '/dashboard/maintenance', roles: ['fleet-manager'] },
  { icon: Receipt, label: 'Trip & Expense', href: '/dashboard/expenses', roles: ['fleet-manager', 'financial-analyst'] },
  { icon: GaugeCircle, label: 'Performance', href: '/dashboard/performance', roles: ['fleet-manager', 'dispatcher', 'safety-officer'] },
  { icon: LineChart, label: 'Analytics', href: '/dashboard/analytics', roles: ['fleet-manager', 'financial-analyst'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isSeeding, setIsSeeding] = useState(false);

  // 1. Get User Profile to find the roleId
  const userProfileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  // 2. Self-Healing Role Provisioning
  useEffect(() => {
    if (user && userProfile && !isProfileLoading) {
      const roleId = userProfile.roleId || 'dispatcher';
      const roleCollection = 
        roleId === 'dispatcher' ? 'roles_dispatchers' :
        roleId === 'safety-officer' ? 'roles_safetyOfficers' :
        roleId === 'financial-analyst' ? 'roles_financialAnalysts' :
        'roles_fleetManagers';

      setDocumentNonBlocking(doc(db, roleCollection, user.uid), {
        id: user.uid,
        name: roleId.replace('-', ' ').toUpperCase(),
        accessScope: `Verified access for the ${roleId} role.`
      }, { merge: true });
    }
  }, [user, userProfile, isProfileLoading, db]);

  // 3. User Role Display Context
  const roleName = useMemo(() => {
    switch(userProfile?.roleId) {
      case 'fleet-manager': return 'Fleet Manager';
      case 'dispatcher': return 'Dispatcher';
      case 'safety-officer': return 'Safety Officer';
      case 'financial-analyst': return 'Financial Analyst';
      default: return 'Authorized User';
    }
  }, [userProfile]);

  // 4. Role-Based Navigation Filtering
  const filteredNavItems = useMemo(() => {
    if (!userProfile) return [];
    return navItems.filter(item => item.roles.includes(userProfile.roleId));
  }, [userProfile]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const seedDemoData = async () => {
    if (!user || isSeeding) return;
    setIsSeeding(true);
    
    try {
      const vehiclesRef = collection(db, 'vehicles');
      const vSnap = await getDocs(vehiclesRef);
      
      if (vSnap.empty) {
        const batch = writeBatch(db);
        
        // Demo Vehicles
        const vehicles = [
          { id: 'V-001', name: 'Scania Heavy R500', model: 'R500', licensePlate: 'ABC-123', maxCapacityKg: 15000, odometerKm: 45000, acquisitionCost: 1200000, status: 'Available', type: 'Truck', region: 'Central' },
          { id: 'V-002', name: 'Ford Transit', model: 'Transit', licensePlate: 'XYZ-789', maxCapacityKg: 2000, odometerKm: 12000, acquisitionCost: 450000, status: 'On Trip', type: 'Van', region: 'North' },
          { id: 'V-003', name: 'Volvo FH16', model: 'FH16', licensePlate: 'GHI-456', maxCapacityKg: 25000, odometerKm: 85000, acquisitionCost: 1800000, status: 'Available', type: 'Truck', region: 'South' },
        ];
        vehicles.forEach(v => batch.set(doc(vehiclesRef, v.id), v));

        // Demo Drivers
        const driversRef = collection(db, 'drivers');
        const drivers = [
          { id: 'D-001', name: 'Robert Miller', licenseCategory: 'Class A', licenseExpiryDate: '2026-12-30', status: 'On Duty', safetyScore: 94, totalTrips: 120, completedTrips: 118, completionRate: 98 },
          { id: 'D-002', name: 'Sarah Connor', licenseCategory: 'Class B', licenseExpiryDate: '2023-01-01', status: 'Suspended', safetyScore: 82, totalTrips: 45, completedTrips: 40, completionRate: 88 },
          { id: 'D-003', name: 'James Logan', licenseCategory: 'Class A', licenseExpiryDate: '2025-06-15', status: 'On Duty', safetyScore: 91, totalTrips: 88, completedTrips: 85, completionRate: 96 },
        ];
        drivers.forEach(d => batch.set(doc(driversRef, d.id), d));

        await batch.commit();
        toast({ title: "Environment Ready", description: "Standard demo records have been successfully injected." });
      } else {
        toast({ title: "Records Exist", description: "Your fleet environment is already populated." });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Seeding Failed", description: "Check permissions for demo generation." });
    } finally {
      setIsSeeding(false);
    }
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-body text-slate-900">
        <Sidebar className="border-r border-slate-200/50 bg-white">
          <SidebarHeader className="p-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-xl shadow-primary/20">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="font-headline text-2xl font-bold tracking-tight text-slate-900 uppercase">Fleet Flow</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-headline">Menu</SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                {filteredNavItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`h-12 rounded-2xl px-4 transition-all duration-300 ${
                        pathname === item.href 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                          : 'text-slate-500 hover:bg-slate-100 hover:text-primary'
                      }`}
                    >
                      <Link href={item.href} className="flex items-center gap-4">
                        <item.icon className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-headline">System</SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                {userProfile?.roleId === 'fleet-manager' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={seedDemoData} 
                      disabled={isSeeding}
                      className="h-12 rounded-2xl px-4 text-emerald-600 hover:bg-emerald-50 transition-all font-bold"
                    >
                      {isSeeding ? <Loader2 className="w-5 h-5 mr-4 animate-spin" /> : <Sparkles className="w-5 h-5 mr-4" />}
                      <span>{isSeeding ? 'Seeding...' : 'Quick Seed'}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-12 rounded-2xl px-4 text-slate-500 hover:bg-slate-100">
                    <Settings className="w-5 h-5 mr-4" />
                    <span className="font-bold text-sm">Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => signOut(auth).then(() => router.push('/'))}
                    className="h-12 rounded-2xl px-4 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="w-5 h-5 mr-4" />
                    <span className="font-bold text-sm">Sign Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-auto">
          <header className="h-20 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 font-headline uppercase tracking-tighter">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-8">
              <button className="relative p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-4 pl-8 border-l">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user.email?.split('@')[0]}</p>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3 h-3" />
                    {roleName}
                  </p>
                </div>
                <Avatar className="h-11 w-11 border-2 border-primary/10 shadow-lg hover:scale-105 transition-transform">
                  <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
                  <AvatarFallback className="bg-primary/5 text-primary font-bold">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <div className="p-10 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}