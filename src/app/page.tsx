import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Users, 
  Navigation, 
  Receipt, 
  Wrench,
  Cpu,
  Globe,
  Database,
  Lock
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body">
      {/* --- GLOBAL NAVIGATION --- */}
      <header className="px-6 py-6 lg:px-12 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
            <Truck className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-black text-slate-900 tracking-tighter uppercase">FleetFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          <Link href="#capabilities" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors">Capabilities</Link>
          <Link href="#roles" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors">Roles</Link>
          <Link href="/auth/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors">Internal Access</Link>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-bold shadow-2xl shadow-primary/30 uppercase text-xs tracking-widest">
              Register Hub
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* --- HERO SECTION: THE MULTI-ROLE OS --- */}
        <section className="px-6 py-24 lg:py-32 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 animate-in fade-in slide-in-from-left-4 duration-1000">
            <div className="space-y-4">
              <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                Version 2.0 Operational
              </Badge>
              <h1 className="font-headline text-6xl lg:text-8xl font-black leading-[0.9] text-slate-900 uppercase tracking-tighter">
                The Logistics <span className="text-primary">Operating</span> System.
              </h1>
            </div>
            <p className="text-xl text-slate-500 max-w-xl leading-relaxed font-medium border-l-4 border-primary/20 pl-8">
              A unified command environment designed for high-stakes fleet operations. From asset intake to real-time cargo lifecycle tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 text-lg font-black shadow-2xl shadow-primary/30 uppercase tracking-tight group">
                  Initialize Dashboard <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="rounded-2xl px-10 h-16 text-lg font-bold border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all">
                  Onboard Assets
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-12 pt-8">
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-900 tracking-tighter">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Live Data Sync</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-slate-900 tracking-tighter">SECURE</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">RBAC Provisioned</p>
              </div>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="absolute -inset-10 bg-primary/10 blur-[120px] rounded-full opacity-50"></div>
            <Card className="relative overflow-hidden border-none shadow-[0_48px_100px_-12px_rgba(30,64,175,0.2)] rounded-[2.5rem] bg-slate-900">
              <div className="absolute top-0 left-0 w-full h-12 bg-slate-800/50 flex items-center px-6 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/50"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400/50"></div>
                <div className="ml-4 h-6 w-48 bg-slate-700/50 rounded-md"></div>
              </div>
              <img 
                src="https://picsum.photos/seed/fleetflow-main/1200/800" 
                alt="FleetFlow Command Center Interface" 
                className="w-full h-auto object-cover opacity-90 mt-12"
                data-ai-hint="logistics command center"
              />
            </Card>
          </div>
        </section>

        {/* --- CAPABILITIES SECTION --- */}
        <section id="capabilities" className="bg-slate-900 py-32 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-16">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-4xl font-headline font-black text-white uppercase tracking-tighter leading-none">The Intelligence Core</h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  FleetFlow isn't just a database; it's a real-time reactive engine that monitors every mile, every expense, and every driver behavior autonomously.
                </p>
              </div>
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                {[
                  { icon: Globe, title: "Global Registry", desc: "A centralized asset hub for trucks, vans, and specialty vehicles with full maintenance history." },
                  { icon: Zap, title: "Cargo Pulse", desc: "A 4-stage tracking lifecycle (Scheduled to Delivered) with real-time status propagation." },
                  { icon: Lock, title: "Security First", desc: "Role-Based Access Control (RBAC) ensures financial analysts see numbers while dispatchers see routes." },
                  { icon: Database, title: "Atomic Ledger", desc: "Every fuel refill and trip expense is logged into an immutable operational audit trail." }
                ].map((cap, i) => (
                  <div key={i} className="p-8 rounded-[2rem] bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all group">
                    <cap.icon className="w-6 h-6 text-primary mb-6 group-hover:scale-125 transition-transform" />
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{cap.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- ROLE-BASED ACCESS (RBAC) OVERVIEW --- */}
        <section id="roles" className="py-32 px-6">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <Badge className="bg-slate-100 text-slate-500 border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">Organizational Ecosystem</Badge>
              <h2 className="font-headline text-5xl font-black text-slate-900 uppercase tracking-tighter">Specialized Command Roles</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">FleetFlow adapts its interface and security posture based on who is at the helm.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  role: "Fleet Manager",
                  desc: "The organizational architect. Controls asset intake, personnel onboarding, and overall operational strategy.",
                  icon: <Users className="w-8 h-8" />,
                  color: "bg-blue-600",
                  shadow: "shadow-blue-500/20"
                },
                {
                  role: "Dispatcher",
                  desc: "The operational heartbeat. Manages the Command Center, initiates cargo lifecycles, and monitors routes.",
                  icon: <Navigation className="w-8 h-8" />,
                  color: "bg-amber-600",
                  shadow: "shadow-amber-500/20"
                },
                {
                  role: "Safety Officer",
                  desc: "The compliance guardian. Verifies driver licenses, monitors safety scores, and enforces operational standards.",
                  icon: <ShieldCheck className="w-8 h-8" />,
                  color: "bg-emerald-600",
                  shadow: "shadow-emerald-500/20"
                },
                {
                  role: "Financial Analyst",
                  desc: "The profitability engine. Analyzes fuel logs, ROI trends, and trip expenses to optimize the bottom line.",
                  icon: <Receipt className="w-8 h-8" />,
                  color: "bg-slate-900",
                  shadow: "shadow-slate-500/20"
                }
              ].map((role, i) => (
                <div key={i} className="flex flex-col h-full bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-xl shadow-slate-200/50 p-10 space-y-8 hover:translate-y-[-8px] transition-all duration-500 group">
                  <div className={`w-16 h-16 ${role.color} ${role.shadow} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
                    {role.icon}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black font-headline uppercase tracking-tighter text-slate-900">{role.role}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {role.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-auto">
                    <Link href="/auth/register" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary group-hover:underline">
                      View Access Scope →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- THE CARGO PULSE VISUAL --- */}
        <section className="bg-primary py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10 text-white relative z-10">
              <h2 className="text-5xl lg:text-7xl font-headline font-black uppercase tracking-tighter leading-[0.9]">
                Real-Time <br /> <span className="text-accent italic">Cargo Tracking</span> Lifecycle.
              </h2>
              <p className="text-primary-foreground/80 text-xl font-medium leading-relaxed">
                Watch shipments evolve from "Scheduled" to "Delivered" with FleetFlow's unique segmented tracking visual.
              </p>
              <div className="space-y-6">
                {[
                  "Automated Status Propagation",
                  "Asset & Driver Availability Updates",
                  "Overload Safety Enforcement",
                  "Projected ETA Intelligence"
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm font-bold">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-white/10 blur-[80px] rounded-full"></div>
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-[3rem] p-12 shadow-2xl space-y-12">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Active Dispatch</p>
                    <p className="text-2xl font-black text-white tracking-tighter">TRIP-9002</p>
                  </div>
                  <Badge className="bg-accent text-slate-900 font-black">IN TRANSIT</Badge>
                </div>
                
                <div className="relative py-12 flex justify-between">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0"></div>
                  <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-accent -translate-y-1/2 z-0"></div>
                  {[Navigation, Truck, Zap, CheckCircle2].map((Icon, idx) => (
                    <div key={idx} className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                      idx < 2 ? 'bg-accent border-accent text-slate-900' : 
                      idx === 2 ? 'bg-slate-900 border-accent text-accent animate-pulse' : 
                      'bg-slate-900 border-white/10 text-white/20'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-8 text-white">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Origin</p>
                    <p className="font-bold">Berlin Hub</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Destination</p>
                    <p className="font-bold">Munich Central</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-24 px-6 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <Truck className="text-white w-8 h-8" />
              <span className="font-headline text-3xl font-black text-white tracking-tighter uppercase">FleetFlow</span>
            </div>
            <p className="max-w-sm text-slate-500 font-medium leading-relaxed">
              The definitive Logistics OS for high-performance fleet organizations. Built for precision, provisioned for multi-role operations.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase text-xs tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/dashboard/vehicles" className="hover:text-primary transition-colors">Fleet Registry</Link></li>
              <li><Link href="/dashboard/trips" className="hover:text-primary transition-colors">Command Center</Link></li>
              <li><Link href="/dashboard/performance" className="hover:text-primary transition-colors">Compliance Hub</Link></li>
              <li><Link href="/dashboard/analytics" className="hover:text-primary transition-colors">Intelligence</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Ledger</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">System Status</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API Documentation</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">© 2024 FleetFlow Intelligence SaaS. Ver 2.04</p>
          <div className="flex gap-8">
            <ShieldCheck className="w-5 h-5 text-slate-700"/>
            <Globe className="w-5 h-5 text-slate-700"/>
            <Lock className="w-5 h-5 text-slate-700"/>
          </div>
        </div>
      </footer>
    </div>
  );
}
