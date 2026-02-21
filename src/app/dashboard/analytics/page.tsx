
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Filter, TrendingUp, Fuel, BarChart3, Receipt, Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function AnalyticsPage() {
  const db = useFirestore();
  
  // Memoize collection references with stable dependencies to prevent infinite loops
  const fuelRef = useMemoFirebase(() => collection(db, 'fuel_logs'), [db]);
  const expenseRef = useMemoFirebase(() => collection(db, 'expenses'), [db]);
  const tripRef = useMemoFirebase(() => collection(db, 'trips'), [db]);

  const { data: fuelLogs, isLoading: fLoading } = useCollection(fuelRef);
  const { data: expenses, isLoading: eLoading } = useCollection(expenseRef);
  const { data: trips, isLoading: tLoading } = useCollection(tripRef);

  const stats = useMemo(() => {
    const totalFuel = fuelLogs?.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0) || 0;
    const totalRevenue = trips?.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0) || 0;
    const totalExpense = expenses?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
    
    const profit = totalRevenue - (totalFuel + totalExpense);
    const roi = totalRevenue > 0 ? (profit / (totalFuel + totalExpense)) * 100 : 0;

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
  }, [fuelLogs, expenses, trips]);

  const isLoading = fLoading || eLoading || tLoading;

  const fuelEfficiencyData = [
    { month: 'Jan', value: 5 }, { month: 'Feb', value: 7 }, { month: 'Mar', value: 6.5 },
    { month: 'Apr', value: 8 }, { month: 'May', value: 9 }, { month: 'Jun', value: 8.5 }
  ];

  const costliestVehiclesData = [
    { name: 'V-001', cost: 12000 },
    { name: 'V-002', cost: 4500 },
    { name: 'V-003', cost: 15000 },
    { name: 'V-004', cost: 0 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900">8. Operational Analytics & Financial Reports</h2>
          <p className="text-slate-500">Business Intelligence & Profitability Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Filter className="w-4 h-4 mr-2" /> Filter Period
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((kpi, i) => (
          <Card key={i} className={`border-2 ${kpi.borderColor} shadow-sm hover:shadow-md transition-all overflow-hidden bg-white rounded-2xl`}>
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-2xl ${kpi.bgColor} ${kpi.color}`}>
                <kpi.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{kpi.title}</h3>
                <div className={`text-3xl font-black font-headline mt-1 ${kpi.color}`}>
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : kpi.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/30">
            <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Fuel Efficiency Trend (kmL)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/30">
            <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#16A34A]" /> Asset Maintenance Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costliestVehiclesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="cost" 
                  fill="#1E40AF" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b bg-[#1E40AF]/5 flex flex-col items-center justify-center py-8">
          <div className="bg-[#1E40AF] text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Active Fleet Ledger (Fuel & Expense)
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-16 pl-8 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Asset</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Date</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Category</TableHead>
                <TableHead className="h-16 pr-8 text-right text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : (
                [...(fuelLogs || []), ...(expenses || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item: any) => (
                  <TableRow key={item.id} className="h-16 border-slate-100 hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-8 font-bold text-slate-900">{item.vehicleId}</TableCell>
                    <TableCell className="text-slate-600">{item.date}</TableCell>
                    <TableCell className="font-medium text-slate-700">{item.category || (item.liters ? 'Fuel' : 'General')}</TableCell>
                    <TableCell className="pr-8 text-right font-black text-[#16A34A]">
                      Rs. {(item.cost || item.amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
