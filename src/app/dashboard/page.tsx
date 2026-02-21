"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Truck, 
  Wrench, 
  Package, 
  Loader2, 
  ArrowUpRight, 
  Filter, 
  SortAsc,
  User
} from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
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
  const dRef = useMemoFirebase(() => isAuthorized ? collection(db, 'drivers') : null, [db, isAuthorized]);

  const { data: vehicles, isLoading: vLoading } = useCollection(vRef);
  const { data: trips, isLoading: tLoading } = useCollection(tRef);
  const { data: drivers, isLoading: dLoading } = useCollection(dRef);

  const stats = useMemo(() => {
    const active = vehicles?.filter(v => v.status === 'On Trip').length || 0;
    const inShop = vehicles?.filter(v => v.status === 'In Shop').length || 0;
    const pending = trips?.filter(t => t.status === 'Dispatched').length || 0;

    return [
      { title: "Active Fleet", value: active, icon: Truck, color: "text-[#16A34A]", bg: "bg-[#16A34A]/5" },
      { title: "Maintenance Alert", value: inShop, icon: Wrench, color: "text-[#DC2626]", bg: "bg-[#DC2626]/5" },
      { title: "Pending Cargo", value: pending, icon: Package, color: "text-[#1E40AF]", bg: "bg-[#1E40AF]/5" }
    ];
  }, [vehicles, trips]);

  const isLoading = isProfileLoading || isRoleFlagLoading || (isAuthorized && (vLoading || tLoading || dLoading));

  const filteredTrips = useMemo(() => {
    return trips?.filter(t => 
      t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [trips, searchTerm]);

  if (isProfileLoading || isRoleFlagLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:max-w-3xl group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search bar ......" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-11 border-slate-200 bg-white shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-wider">
            <SortAsc className="w-4 h-4 mr-2" /> Sort by...
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {userProfile?.roleId === 'fleet-manager' || userProfile?.roleId === 'dispatcher' ? (
          <>
            <Link href="/dashboard/trips">
              <Button className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#1E40AF]/20">
                New Trip
              </Button>
            </Link>
          </>
        ) : null}
        {userProfile?.roleId === 'fleet-manager' && (
          <Link href="/dashboard/vehicles">
            <Button className="bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-[#1E40AF]/20">
              New Vehicle
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((kpi, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white hover:border-primary/20 transition-all group">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <h3 className="text-xl font-headline font-bold text-slate-700">{kpi.title}</h3>
              <div className={`text-5xl font-black font-headline ${kpi.color}`}>
                {vLoading || tLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Operational Ledger Table */}
      <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-16 pl-8 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Trip</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-[#FF69B4] tracking-tighter text-center">Vehicle</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-[#FF69B4] tracking-tighter text-center">Driver</TableHead>
                <TableHead className="h-16 pr-8 text-right text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Status</TableHead>
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
                          <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-primary transition-colors"></div>
                          <span className="font-bold text-slate-900">{trip.origin} → {trip.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-bold text-slate-700">{vehicle?.name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{vehicle?.licensePlate || '---'}</div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-700">
                        {driver?.name || 'Unassigned'}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold text-sm ${
                            trip.status === 'Completed' ? 'text-emerald-600' : 
                            trip.status === 'Dispatched' ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {trip.status === 'Dispatched' ? 'On Trip' : trip.status}
                          </span>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center flex flex-col items-center justify-center py-20">
                    <Package className="w-12 h-12 text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold">No operational data found.</p>
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