
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ArrowUpDown, Plus, Truck, Wrench, Package, MoreHorizontal } from 'lucide-react';

const kpis = [
  { 
    title: "Active Fleet", 
    value: "220", 
    icon: Truck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  { 
    title: "Maintenance Alert", 
    value: "18", 
    icon: Wrench,
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  { 
    title: "Pending Cargo", 
    value: "20", 
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }
];

const recentTrips = [
  { id: "T-8821", vehicle: "Scania R500", driver: "John Doe", status: "On Trip" },
  { id: "T-8822", vehicle: "Volvo FH16", driver: "Sarah Miller", status: "Completed" },
  { id: "T-8823", vehicle: "DAF XF", driver: "Mike Ross", status: "Dispatched" },
  { id: "T-8824", vehicle: "MAN TGX", driver: "Emma Wilson", status: "On Trip" },
  { id: "T-8825", vehicle: "Mercedes Actros", driver: "Chris Evans", status: "Draft" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-4 rounded-2xl shadow-sm border">
        <div className="flex flex-1 items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search trips, vehicles..." 
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl w-full"
            />
          </div>
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-4">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" className="h-11 rounded-xl border-slate-200 px-4">
            Sort by <ArrowUpDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button className="flex-1 lg:flex-none h-11 bg-primary hover:bg-primary/90 rounded-xl px-6">
            <Plus className="w-4 h-4 mr-2" /> New Trip
          </Button>
          <Button variant="outline" className="flex-1 lg:flex-none h-11 border-primary text-primary hover:bg-primary/5 rounded-xl px-6">
            <Plus className="w-4 h-4 mr-2" /> New Vehicle
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kpis.map((kpi, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-2xl ${kpi.bgColor} ${kpi.color}`}>
                <kpi.icon className="w-8 h-8" />
              </div>
              <div>
                <p className={`text-3xl font-bold font-headline ${kpi.color}`}>{kpi.value}</p>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Data Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="px-6 py-4 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold font-headline">Ongoing Operations</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary font-bold">View All</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="w-[150px] h-14 pl-8 text-xs font-bold uppercase text-slate-500">Trip ID</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Vehicle</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Driver</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500 text-center">Status</TableHead>
                <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-slate-500">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTrips.map((trip) => (
                <TableRow key={trip.id} className="h-20 border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-8 font-bold text-slate-900">{trip.id}</TableCell>
                  <TableCell className="font-medium text-slate-700">{trip.vehicle}</TableCell>
                  <TableCell className="font-medium text-slate-700">{trip.driver}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={`rounded-full px-4 py-1 font-bold border-none ${
                      trip.status === 'On Trip' ? 'bg-emerald-100 text-emerald-700' : 
                      trip.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 
                      trip.status === 'Dispatched' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {trip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full">
                      <MoreHorizontal className="w-5 h-5 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
