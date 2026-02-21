
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
  Sparkles,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, collection, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Truck, label: 'Fleet Registry', href: '/dashboard/vehicles' },
  { icon: ClipboardList, label: 'Trip Dispatch', href: '/dashboard/trips' },
  { icon: Wrench, label: 'Maintenance', href: '/dashboard/maintenance' },
  { icon: Receipt, label: 'Financials', href: '/dashboard/expenses' },
  { icon: GaugeCircle, label: 'Safety Hub', href: '/dashboard/performance' },
  { icon: LineChart, label: 'Intelligence', href: '/dashboard/analytics' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isSeeding, setIsSeeding] = useState(false);

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
        // Seeding logic here...
        const vehicles = [
          { id: 'V-001', name: 'Scania Heavy R500', model: 'R500', licensePlate: 'ABC-123', maxCapacityKg: 15000, odometerKm: 45000, acquisitionCost: 1200000, status: 'Available', type: 'Truck', region: 'Central' },
          { id: 'V-002', name: 'Ford Transit', model: 'Transit', licensePlate: 'XYZ-789', maxCapacityKg: 2000, odometerKm: 12000, acquisitionCost: 450000, status: 'On Trip', type: 'Van', region: 'North' },
        ];
        await Promise.all(vehicles.map(v => addDocumentNonBlocking(vehiclesRef, v)));
        toast({ title: "Environment Ready", description: "Demo records have been successfully injected." });
      } else {
        toast({ title: "Records Exist", description: "Your fleet environment is already populated." });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
        <Sidebar className="border-r border-slate-200/50 bg-white">
          <SidebarHeader className="p-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-xl shadow-primary/20">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="font-headline text-2xl font-bold tracking-tight text-slate-900">FleetFlow</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Command Center</SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.href}
                      className={`h-12 rounded-2xl px-4 transition-all duration-300 ${
                        pathname === item.href 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                          : 'text-slate-500 hover:bg-slate-100'
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

            <SidebarGroup className="mt-12">
              <SidebarGroupLabel className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">System</SidebarGroupLabel>
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={seedDemoData} 
                    className="h-12 rounded-2xl px-4 text-emerald-600 hover:bg-emerald-50 transition-all font-bold"
                  >
                    <Sparkles className="w-5 h-5 mr-4" />
                    <span>Quick Seed</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
              <h2 className="text-xl font-bold text-slate-900 font-headline">
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
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Fleet Chief</p>
                </div>
                <Avatar className="h-11 w-11 border-2 border-primary/10 shadow-lg">
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
