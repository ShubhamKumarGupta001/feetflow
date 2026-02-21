
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Filter, TrendingUp, Fuel, BarChart3, Receipt } from 'lucide-react';

const kpis = [
  { 
    title: "Total Fuel Cost", 
    value: "Rs. 2.6 L", 
    icon: Fuel,
    color: "text-[#16A34A]",
    bgColor: "bg-[#16A34A]/5",
    borderColor: "border-[#16A34A]/20"
  },
  { 
    title: "Fleet ROI", 
    value: "+ 12.5%", 
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20"
  },
  { 
    title: "Utilization Rate", 
    value: "82%", 
    icon: BarChart3,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100"
  }
];

const fuelEfficiencyData = [
  { month: 'Jan', value: 5 },
  { month: 'Feb', value: 25 },
  { month: 'Mar', value: 45 },
  { month: 'Apr', value: 15 },
  { month: 'May', value: 35 },
  { month: 'Jun', value: 55 },
  { month: 'Jul', value: 75 },
  { month: 'Aug', value: 85 },
  { month: 'Sep', value: 95 },
];

const costliestVehiclesData = [
  { name: 'VAN-03', cost: 12 },
  { name: 'TRK-01', cost: 22 },
  { name: 'TRK-04', cost: 45 },
  { name: 'TRK-02', cost: 82 },
  { name: 'TRK-05', cost: 110 },
];

const financialSummary = [
  { month: 'Jan', revenue: 17, fuel: 6, maintenance: 2, profit: 9 },
  { month: 'Feb', revenue: 19, fuel: 5.5, maintenance: 1.5, profit: 12 },
  { month: 'Mar', revenue: 22, fuel: 7, maintenance: 3, profit: 12 },
  { month: 'Apr', revenue: 15, fuel: 4.2, maintenance: 2.1, profit: 8.7 },
  { month: 'May', revenue: 25, fuel: 8, maintenance: 4, profit: 13 },
];

export default function AnalyticsPage() {
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

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {kpis.map((kpi, i) => (
          <Card key={i} className={`border-2 ${kpi.borderColor} shadow-sm hover:shadow-md transition-all overflow-hidden bg-white rounded-2xl`}>
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className={`p-4 rounded-2xl ${kpi.bgColor} ${kpi.color}`}>
                <kpi.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{kpi.title}</h3>
                <p className={`text-3xl font-black font-headline mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
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
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/30">
            <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#16A34A]" /> Top 5 Costliest Vehicles
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
                  fill="#0F172A" 
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary Section */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b bg-[#1E40AF]/5 flex flex-col items-center justify-center py-8">
          <div className="bg-[#1E40AF] text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Financial Summary of Month
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-16 pl-8 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Month</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Revenue</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Fuel Cost</TableHead>
                <TableHead className="h-16 text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Maintenance</TableHead>
                <TableHead className="h-16 pr-8 text-right text-sm font-black uppercase text-[#FF69B4] tracking-tighter">Net Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialSummary.map((item) => (
                <TableRow key={item.month} className="h-20 border-slate-100 hover:bg-slate-50 transition-colors">
                  <TableCell className="pl-8 font-bold text-slate-900 text-lg">{item.month}</TableCell>
                  <TableCell className="font-bold text-slate-700 text-lg">Rs. {item.revenue}L</TableCell>
                  <TableCell className="font-bold text-slate-700 text-lg">Rs. {item.fuel}L</TableCell>
                  <TableCell className="font-bold text-slate-700 text-lg">Rs. {item.maintenance}L</TableCell>
                  <TableCell className="pr-8 text-right font-black text-[#16A34A] text-xl">
                    Rs. {item.profit}L
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
