
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Truck, Wrench, Package, MoreHorizontal, Loader2, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  
  const userRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  const roleCollection = useMemo(() => {
    if (!userProfile?.roleId) return null;
    const rid = userProfile.roleId;
    if (rid === 'dispatcher') return 'roles_dispatchers';
    if (rid === 'safety-officer') return 'roles_safetyOfficers';
    if (rid === 'financial-analyst') return 'roles_financialAnalysts';
    return 'roles_fleetManagers';
  }, [userProfile]);

  const roleFlagRef = useMemoFirebase(() => (user && roleCollection) ? doc(db, roleCollection, user.uid) : null, [db, user, roleCollection]);
  const { data: roleFlag, isLoading: isRoleFlagLoading } = useDoc(roleFlagRef);

  const isAuthorized = !!roleFlag;

  const canSeeTrips = isAuthorized && (userProfile?.roleId === 'fleet-manager' || userProfile?.roleId === 'dispatcher');
  const canSeeVehicles = isAuthorized && (userProfile?.roleId === 'fleet-manager' || userProfile?.roleId === 'dispatcher' || userProfile?.roleId === 'safety-officer');

  const vRef = useMemoFirebase(() => canSeeVehicles ? collection(db, 'vehicles') : null, [db, canSeeVehicles]);
  const tRef = useMemoFirebase(() => canSeeTrips ? collection(db, 'trips') : null, [db, canSeeTrips]);

  const { data: vehicles, isLoading: vLoading } = useCollection(vRef);
  const { data: trips, isLoading: tLoading } = useCollection(tRef);

  const stats = useMemo(() => {
    const active = vehicles?.filter(v => v.status === 'On Trip').length || 0;
    const inShop = vehicles?.filter(v => v.status === 'In Shop').length || 0;
    const pending = trips?.filter(t => t.status === 'Dispatched').length || 0;

    return [
      { title: "Live Deployments", value: active, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Asset Maintenance", value: inShop, icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
      { title: "Active Logistics", value: pending, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" }
    ];
  }, [vehicles, trips]);

  const isLoading = isProfileLoading || isRoleFlagLoading || (isAuthorized && (vLoading || tLoading));

  if (isProfileLoading || isRoleFlagLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleName = userProfile?.roleId?.replace('-', ' ').toUpperCase() || 'AUTHORIZED USER';

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="relative p-10 rounded-3xl bg-slate-900 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Truck className="w-40 h-40 -rotate-12" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-[10px] font-black tracking-widest uppercase">
            <ShieldCheck className="w-3 h-3" />
            Verified {roleName} Session
          </div>
          <h1 className="text-4xl font-black font-headline">Welcome to your Dashboard</h1>
          <p className="text-slate-400 max-w-xl font-medium">
            Your workspace has been automatically provisioned with tools for **{roleName}** operations.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative w-full lg:max-w-xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search assets, drivers, or active routes..." 
            className="pl-12 h-14 border-none bg-white shadow-sm rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-lg"
          />
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {canSeeTrips && (
            <Link href="/dashboard/trips" className="flex-1 lg:flex-none">
              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 font-bold shadow-xl shadow-primary/20 group">
                Start New Trip <Plus className="ml-2 w-5 h-5 transition-transform group-hover:rotate-90" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden group">
            <CardContent className="p-8 flex items-center gap-6">
              <div className={`p-5 rounded-2xl ${kpi.bg} ${kpi.color} transition-transform group-hover:scale-110 duration-500`}>
                <kpi.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-4xl font-black font-headline text-slate-900">
                  {vLoading || tLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpi.value}
                </p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {canSeeTrips && (
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="px-8 py-8 border-b border-slate-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black font-headline">Operational Ledger</CardTitle>
              <p className="text-sm text-slate-400 mt-1 font-medium">Real-time tracking of active dispatch cycles</p>
            </div>
            <Link href="/dashboard/trips">
              <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-xl">
                Explorer View <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="h-16 pl-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identifier</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-widest">Logistics Route</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Lifecycle</TableHead>
                  <TableHead className="h-16 pr-8 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Dispatch Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips?.slice(0, 6).map((trip: any) => (
                  <TableRow key={trip.id} className="h-20 border-slate-50 hover:bg-slate-50/80 transition-all group">
                    <TableCell className="pl-8">
                      <div className="font-bold text-slate-900">#{trip.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[10px] font-bold text-slate-400">CARGO: {trip.cargoWeightKg}KG</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">{trip.origin}</span>
                        <ArrowUpRight className="w-3 h-3 text-slate-300" />
                        <span className="font-bold text-slate-900">{trip.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`rounded-full px-4 py-1.5 font-bold border-none text-[10px] tracking-widest uppercase ${
                        trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                        trip.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right font-mono text-xs text-slate-500 font-bold">
                      {new Date(trip.dispatchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isLoading && (!trips || trips.length === 0) && (
              <div className="py-20 text-center flex flex-col items-center">
                <Package className="w-12 h-12 text-slate-100 mb-4" />
                <p className="text-slate-400 font-bold">No active operations detected.</p>
                <p className="text-xs text-slate-300 mt-1">Start a new trip to populate your command center.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {userProfile?.roleId === 'financial-analyst' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm rounded-3xl bg-emerald-50 p-8 flex items-center gap-6">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Financial Reports Ready</h3>
              <p className="text-sm text-emerald-700/70">Your monthly profitability audit is available.</p>
              <Link href="/dashboard/analytics">
                <Button variant="link" className="p-0 h-auto text-emerald-600 font-black mt-2">Open Reports →</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
