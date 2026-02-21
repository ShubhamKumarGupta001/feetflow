
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const metrics = [
  { 
    title: "Total Revenue", 
    value: "$128,430", 
    change: "+12.5%", 
    isPositive: true,
    icon: DollarSign,
    color: "bg-blue-500/10 text-blue-600"
  },
  { 
    title: "Active Users", 
    value: "2,543", 
    change: "+18.2%", 
    isPositive: true,
    icon: Users,
    color: "bg-indigo-500/10 text-indigo-600"
  },
  { 
    title: "Total Sales", 
    value: "1,240", 
    change: "-4.1%", 
    isPositive: false,
    icon: ShoppingCart,
    color: "bg-emerald-500/10 text-emerald-600"
  },
  { 
    title: "Conversion Rate", 
    value: "3.24%", 
    change: "+2.4%", 
    isPositive: true,
    icon: TrendingUp,
    color: "bg-purple-500/10 text-purple-600"
  }
];

const salesData = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
  { name: 'Jul', sales: 3490, revenue: 4300 },
];

const performanceData = [
  { name: 'Direct', value: 400 },
  { name: 'Organic', value: 300 },
  { name: 'Referral', value: 200 },
  { name: 'Paid', value: 278 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <Badge variant={metric.isPositive ? "default" : "destructive"} className={`rounded-full px-2 py-0 h-6 ${metric.isPositive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}`}>
                  {metric.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {metric.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{metric.title}</p>
                <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Revenue Performance</CardTitle>
              <CardDescription>Monthly growth and sales volume analysis</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                Sales
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-full bg-accent"></span>
                Revenue
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--accent))" strokeWidth={3} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline">Traffic Sources</CardTitle>
            <CardDescription>User acquisition breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="font-headline">Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00", initials: "OM" },
                { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00", initials: "JL" },
                { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$299.00", initials: "IN" },
                { name: "William Kim", email: "will@email.com", amount: "+$99.00", initials: "WK" },
                { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00", initials: "SD" },
              ].map((sale, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700">{sale.initials}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{sale.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{sale.email}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{sale.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader>
            <CardTitle className="font-headline text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-accent" />
              Quick AI Insights
            </CardTitle>
            <CardDescription className="text-white/70">Powered by automated data agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <h4 className="font-bold mb-1">Growth Anomaly Detected</h4>
              <p className="text-sm text-white/80">Revenue spiked by 24% in the last 48 hours. Most sales came from the 'Direct' channel in the US region.</p>
            </div>
            <div className="p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <h4 className="font-bold mb-1">Opportunity Alert</h4>
              <p className="text-sm text-white/80">Customer retention for 'Direct' users is 15% higher than average. Consider shifting 10% of paid ad budget to referral incentives.</p>
            </div>
            <button className="w-full py-3 px-4 bg-accent text-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4">
              Explore All AI Insights <ArrowRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
