
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Filter, TrendingUp, Fuel, BarChart3, Receipt, Loader2, Database } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function AnalyticsPage() {
  const db = useFirestore();
  
  // Memoize collection references
  const fuelRef = useMemoFirebase(() => collection(db, 'fuel_logs'), [db]);
  const expenseRef = useMemoFirebase(() => collection(db, 'expenses'), [db]);
  const tripRef = useMemoFirebase(() => collection(db, 'trips'), [db]);
  const maintenanceRef = useMemoFirebase(() => collection(db, 'maintenance_logs'), [db]);

  const { data: fuelLogs, isLoading: fLoading } = useCollection(fuelRef);
  const { data: expenses, isLoading: eLoading } = useCollection(expenseRef);
  const { data: trips, isLoading: tLoading } = useCollection(tripRef);
  const { data: maintenance, isLoading: mLoading } = useCollection(maintenanceRef);

  const isLoading = fLoading || eLoading || tLoading || mLoading;

  // Real-time KPI Calculations
  const stats = useMemo(() => {
    const totalFuel = fuelLogs?.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0) || 0;
    const totalRevenue = trips?.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0) || 0;
    const totalExpense = expenses?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
    const totalMaintenance = maintenance?.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0) || 0;
    
    const totalCost = totalFuel + totalExpense + totalMaintenance;
    const profit = totalRevenue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return [
      { 
        title: "Total Fuel Cost", 
        value: `Rs. ${(totalFuel / 1000).toFixed(1)}k`, 
        icon: Fuel,
        color: "text-[#16A34A]",
        bgColor: "bg-[#16A34A]/5",
        borderColor: "border-[#16A34A]/20"
      },
      { 
        title: "Fleet ROI", 
        value: `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`, 
        icon: TrendingUp,
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/20"
      },
      { 
        title: "Net Profit", 
        value: `Rs. ${(profit / 1000).toFixed(1)}k`, 
        icon: BarChart3,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-100"
      }
    ];
  }, [fuelLogs, expenses, trips, maintenance]);

  // Derive Bar Chart Data from real Maintenance Logs
  const costliestVehiclesData = useMemo(() => {
    if (!maintenance) return [];
    const costsByVehicle: Record<string, number> = {};
    maintenance.forEach(log => {
      costsByVehicle[log.vehicleId] = (costsByVehicle[log.vehicleId] || 0) + (Number(log.cost) || 0);
    });
    return Object.entries(costsByVehicle).map(([name, cost]) => ({ name, cost })).sort((a, b) => b.cost - a.cost).slice(0, 5);
  }, [maintenance]);

  // Derive Line Chart Data from real Fuel Logs
  const fuelTrendData = useMemo(() => {
    if (!fuelLogs) return [];
    // Group by month for a simplified trend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCosts: Record<string, number> = {};
    
    fuelLogs.forEach(log => {
      const month = new Date(log.date).getMonth();
      const monthName = months[month];
      monthlyCosts[monthName] = (monthlyCosts[monthName] || 0) + (Number(log.cost) || 0);
    });

    return months.map(m => ({ month: m, value: monthlyCosts[m] || 0 })).filter(d => d.value > 0);
  }, [fuelLogs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Business Intelligence</h2>
          <p className="text-slate-500 font-medium">Real-Time Financial & Operational Performance Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4 mr-2" /> Filter Period
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 shadow-lg shadow-primary/20 font-bold">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((kpi, i) => (
          <Card key={i} className={`border-2 ${kpi.borderColor} shadow-sm hover:shadow-md transition-all overflow-hidden bg-white rounded-3xl`}>
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={`p-5 rounded-2xl ${kpi.bgColor} ${kpi.color}`}>
                <kpi.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{kpi.title}</h3>
                <div className={`text-4xl font-black font-headline mt-2 ${kpi.color}`}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : kpi.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/30 px-8 py-6">
            <CardTitle className="text-lg font-bold font-headline flex items-center gap-2 uppercase tracking-tighter text-slate-900">
              <TrendingUp className="w-5 h-5 text-primary" /> Monthly Fuel Expenditure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[350px]">
            {fuelTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={5} 
                    dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Database className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No fuel logs found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/30 px-8 py-6">
            <CardTitle className="text-lg font-bold font-headline flex items-center gap-2 uppercase tracking-tighter text-slate-900">
              <BarChart3 className="w-5 h-5 text-[#16A34A]" /> Asset Maintenance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[350px]">
            {costliestVehiclesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costliestVehiclesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="cost" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]} 
                    barSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Database className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No maintenance logs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b bg-[#1E40AF]/5 flex flex-col items-center justify-center py-10">
          <div className="bg-[#1E40AF] text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center gap-3">
            <Receipt className="w-4 h-4" />
            Active Operational Ledger
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-16 pl-10 text-[10px] font-black uppercase text-primary tracking-[0.2em]">Fleet Asset</TableHead>
                <TableHead className="h-16 text-[10px] font-black uppercase text-primary tracking-[0.2em]">Transaction Date</TableHead>
                <TableHead className="h-16 text-[10px] font-black uppercase text-primary tracking-[0.2em]">Ledger Category</TableHead>
                <TableHead className="h-16 pr-10 text-right text-[10px] font-black uppercase text-primary tracking-[0.2em]">Verified Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
              ) : [...(fuelLogs || []), ...(expenses || [])].length > 0 ? (
                [...(fuelLogs || []), ...(expenses || [])]
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 15)
                  .map((item: any) => (
                  <TableRow key={item.id} className="h-20 border-slate-50 hover:bg-slate-50 transition-all group">
                    <TableCell className="pl-10 font-bold text-slate-900">{item.vehicleId}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{item.date}</TableCell>
                    <TableCell className="font-bold text-slate-600 uppercase text-[10px] tracking-widest">
                      {item.category || (item.liters ? 'FUEL_REFILL' : 'OPERATIONAL')}
                    </TableCell>
                    <TableCell className="pr-10 text-right font-black text-emerald-600 text-lg">
                      Rs. {(item.cost || item.amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-24">
                    <Database className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No ledger records found</p>
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
