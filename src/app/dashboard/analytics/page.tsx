
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend, ComposedChart
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const monthlyPerformance = [
  { month: 'Jul', target: 4000, actual: 4400, efficiency: 85 },
  { month: 'Aug', target: 4500, actual: 4800, efficiency: 88 },
  { month: 'Sep', target: 4800, actual: 4600, efficiency: 92 },
  { month: 'Oct', target: 5000, actual: 5200, efficiency: 90 },
  { month: 'Nov', target: 5200, actual: 6100, efficiency: 95 },
  { month: 'Dec', target: 5500, actual: 6500, efficiency: 98 },
];

const segmentPerformance = [
  { name: 'Enterprise', q1: 4500, q2: 5200, q3: 6100 },
  { name: 'SME', q1: 3200, q2: 3800, q3: 4100 },
  { name: 'Individual', q1: 2100, q2: 2400, q3: 2800 },
  { name: 'Partner', q1: 1500, q2: 1800, q3: 2100 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900">Performance Analysis</h2>
          <p className="text-slate-500">Deep dive into your business metrics and growth trends across all segments.</p>
        </div>
        <div className="flex gap-4">
          <Select defaultValue="6m">
            <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 rounded-xl">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last 30 Days</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] h-11 bg-white border-slate-200 rounded-xl">
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="sme">SME</SelectItem>
              <SelectItem value="consumer">Consumer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Target vs Actual Performance</CardTitle>
            <CardDescription>Comparison of monthly goals against real results.</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="target" stroke="hsl(var(--accent))" strokeWidth={3} dot={{fill: 'hsl(var(--accent))', r: 4}} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Growth Drivers</CardTitle>
            <CardDescription>Quarterly analysis by business segment.</CardDescription>
          </CardHeader>
          <CardContent className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="q1" stackId="a" fill="#3f51b5" radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="q2" stackId="a" fill="#7df9ff" radius={[0, 0, 0, 0]} />
                <Bar dataKey="q3" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Efficiency Metric (%)</CardTitle>
            <CardDescription>Average operational efficiency over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerformance}>
                <defs>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Area type="stepAfter" dataKey="efficiency" stroke="hsl(var(--accent))" strokeWidth={3} fill="url(#colorEfficiency)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm p-8 flex flex-col justify-center bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <Badge className="bg-accent text-primary border-none font-bold">New Report Available</Badge>
          </div>
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl font-bold font-headline leading-tight">Q4 Growth Strategy <br/><span className="text-accent italic">Recommendations</span></h3>
            <p className="text-slate-400 max-w-sm">Based on current trajectory, increasing focus on Enterprise segments could yield a 30% revenue boost by year-end.</p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors">Download Strategy PDF</button>
              <button className="px-6 py-3 border border-slate-700 font-bold rounded-xl hover:bg-slate-800 transition-colors">View All Insights</button>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
        </Card>
      </div>
    </div>
  );
}
