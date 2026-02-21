"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Truck, 
  Wrench, 
  Package, 
  Loader2, 
  Filter, 
  MapPin
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Main Dashboard Module
 * Displays real-time operational status, KPI summaries, and a live dispatch ledger.
 */
export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // 1. Authorization Context
  const userRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  // 2. Data Gating
  const canSeeOperationalData = useMemo(() => {
    if (!userProfile) return false;
    const roles = ['fleet-manager', 'dispatcher', 'safety-officer', 'financial-analyst'];
    return roles.includes(userProfile.roleId);
  }, [userProfile]);

  // 3. Subscriptions
  const vRef = useMemoFirebase(() => canSeeOperationalData ? collection(db, 'vehicles') : null, [db, canSeeOperationalData]);
  const tRef = useMemoFirebase(() => canSeeOperationalData ? collection(db, 'trips') : null, [db, canSeeOperationalData]);
  const dRef = useMemoFirebase(() => canSeeOperationalData ? collection(db, 'drivers') : null, [db, canSeeOperationalData]);

  const { data: vehicles, isLoading: vLoading } = useCollection(vRef);
  const { data: trips, isLoading: tLoading } = useCollection(tRef);
  const { data: drivers, isLoading: dLoading } = useCollection(dRef);

  // 4. KPI Calculations
  const stats = useMemo(() => {
    const active = vehicles?.filter(v => v.status === 'On Trip').length || 0;
    const inShop = vehicles?.filter(v => v.status === 'In Shop').length || 0;
    const pending = trips?.filter(t => t.status !== 'Completed').length || 0;

    return [
      { title: "Active Fleet", value: active, icon: Truck, color: "text-[#16A34A]", bg: "bg-[#16A34A]/5" },
      { title: "Maintenance Alert", value: inShop, icon: Wrench, color: "text-[#DC2626]", bg: "bg-[#DC2626]/5" },
      { title: "Active Cargo", value: pending, icon: Package, color: "text-[#1E40AF]", bg: "bg-[#1E40AF]/5" }
    ];
  }, [vehicles, trips]);

  const isLoading = isProfileLoading || (canSeeOperationalData && (vLoading || tLoading || dLoading));

  // 5. Search Filtering
  const filteredTrips = useMemo(() => {
    return trips?.filter(t => 
      t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [trips, searchTerm]);

  if (isProfileLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-3xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search active trips, assets, or destinations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-11 border-slate-200 bg-white shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {(userProfile?.roleId === 'fleet-manager' || userProfile?.roleId === 'dispatcher') && (
          <Link href="/dashboard/trips">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20">
              Trip Command Center
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((kpi, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white hover:border-primary/20 transition-all group">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <h3 className="text-xl font-headline font-bold text-slate-700">{kpi.title}</h3>
              <div className={cn("text-5xl font-black font-headline", kpi.color)}>
                {vLoading || tLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-16 pl-8 text-sm font-black uppercase text-primary tracking-tighter">Route Monitoring</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-primary tracking-tighter text-center">Assigned Asset</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-primary tracking-tighter text-center">Current Stage</TableHead>
                <TableHead className="h-16 pr-8 text-right text-sm font-black uppercase text-primary tracking-tighter">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/50" />
                  </TableCell>
                </TableRow>
              ) : filteredTrips.length > 0 ? (
                filteredTrips.map((trip: any) => {
                  const vehicle = vehicles?.find(v => v.id === trip.vehicleId);
                  const driver = drivers?.find(d => d.id === trip.driverId);
                  
                  return (
                    <TableRow key={trip.id} className="h-20 border-slate-50 hover:bg-slate-50/80 transition-all group">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="font-bold text-slate-900 tracking-tight">{trip.origin} → {trip.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold text-slate-700">{vehicle?.name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{vehicle?.licensePlate || '---'}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                          trip.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                          trip.status === 'In Transit' ? "bg-amber-100 text-amber-700" :
                          trip.status === 'Dispatched' ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {trip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex flex-col items-end">
                          <span className={cn(
                            "font-bold text-sm",
                            trip.status === 'Completed' ? 'text-emerald-600' : 'text-primary'
                          )}>
                            {trip.status === 'Completed' ? 'Finished' : 'Active'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center flex flex-col items-center justify-center py-20">
                    <Package className="w-12 h-12 text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold">No active operational journeys recorded.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
