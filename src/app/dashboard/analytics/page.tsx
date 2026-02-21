
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  // Formatting helpers for readability
  const currencyFormatter = (value: number) => `Rs. ${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`;

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
    return Object.entries(costsByVehicle)
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [maintenance]);

  // Derive Line Chart Data from real Fuel Logs
  const fuelTrendData = useMemo(() => {
    if (!fuelLogs) return [];
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
          <p className="text-slate-500 font-medium">Financial Visibility & Asset Profitability</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 text-xs font-bold uppercase tracking-wider h-11 px-6">
            <Filter className="w-4 h-4 mr-2" /> Filter Period
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 shadow-lg shadow-primary/20 font-bold uppercase tracking-tighter">
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
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{kpi.title}</h3>
                <div className={`text-4xl font-black font-headline mt-2 ${kpi.color}`}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : kpi.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/30 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold font-headline flex items-center gap-2 uppercase tracking-tighter text-slate-900">
              <TrendingUp className="w-5 h-5 text-primary" /> Monthly Fuel Expenditure
            </CardTitle>
            <Badge variant="outline" className="rounded-lg border-primary/10 text-primary font-black text-[10px] uppercase">Trend Analysis</Badge>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            {fuelTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}}
                    tickFormatter={currencyFormatter}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontWeight: '800', color: 'hsl(var(--primary))' }}
                    labelStyle={{ marginBottom: '8px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(val: number) => [`Rs. ${val.toLocaleString()}`, 'Expenditure']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={6} 
                    dot={{ r: 7, fill: 'hsl(var(--primary))', strokeWidth: 4, stroke: '#fff' }}
                    activeDot={{ r: 10, shadow: '0 0 20px rgba(30,64,175,0.4)' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Database className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">No fuel trend data detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/30 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold font-headline flex items-center gap-2 uppercase tracking-tighter text-slate-900">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> Asset Maintenance Distribution
            </CardTitle>
            <Badge variant="outline" className="rounded-lg border-emerald-100 text-emerald-600 font-black text-[10px] uppercase">Asset Breakdown</Badge>
          </CardHeader>
          <CardContent className="p-8 h-[400px]">
            {costliestVehiclesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costliestVehiclesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}}
                    tickFormatter={currencyFormatter}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc', radius: 12}}
                    contentStyle={{ 
                      borderRadius: '20px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                      padding: '16px'
                    }}
                    itemStyle={{ fontWeight: '800', color: 'hsl(var(--primary))' }}
                    labelStyle={{ marginBottom: '8px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    formatter={(val: number) => [`Rs. ${val.toLocaleString()}`, 'Service Cost']}
                  />
                  <Bar 
                    dataKey="cost" 
                    radius={[12, 12, 0, 0]} 
                    barSize={50}
                    animationDuration={1500}
                  >
                    {costliestVehiclesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Database className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">No maintenance allocation data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="border-b bg-slate-50/50 flex flex-col items-center justify-center py-12">
          <div className="bg-primary text-white px-10 py-4 rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/30 flex items-center gap-4">
            <Receipt className="w-5 h-5" />
            Verified Operational Ledger
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-20 pl-12 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Fleet Asset</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Ledger Timestamp</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Operational Category</TableHead>
                <TableHead className="h-20 pr-12 text-right text-[10px] font-black uppercase text-primary tracking-[0.25em]">Verified Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-32"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary/30" /></TableCell></TableRow>
              ) : [...(fuelLogs || []), ...(expenses || [])].length > 0 ? (
                [...(fuelLogs || []), ...(expenses || [])]
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 15)
                  .map((item: any) => (
                  <TableRow key={item.id} className="h-24 border-slate-50 hover:bg-slate-50 transition-all group">
                    <TableCell className="pl-12">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-lg uppercase italic tracking-tighter">{item.vehicleId}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Asset Reference</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 font-medium">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg px-3 py-1 font-black text-[9px] uppercase border-slate-200 text-slate-500 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                        {item.category || (item.liters ? 'Fuel Refill' : 'Misc Operational')}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-12 text-right">
                      <span className="font-black text-emerald-600 text-2xl tracking-tighter italic">
                        Rs. {(item.cost || item.amount).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-32">
                    <Database className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">No ledger entries found</p>
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
