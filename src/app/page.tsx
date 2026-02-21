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
  Lock,
  Sparkles,
  Layers,
  Calendar
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
          <Link href="#capabilities" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors font-headline">Capabilities</Link>
          <Link href="#roles" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors font-headline">Command Roles</Link>
          <Link href="/auth/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors font-headline">Internal Access</Link>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-bold shadow-2xl shadow-primary/30 uppercase text-xs tracking-widest font-headline transition-all active:scale-95">
              Register Hub
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* --- HERO SECTION: THE COMMAND CORE --- */}
        <section className="px-6 py-24 lg:py-40 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center overflow-hidden">
          <div className="space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-6">
              <Badge className="bg-primary/5 text-primary border-primary/10 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] font-headline">
                <Sparkles className="w-3 h-3 mr-2" /> Unified Fleet Intelligence v2.0
              </Badge>
              <h1 className="font-headline text-6xl lg:text-8xl font-black leading-[0.85] text-slate-900 uppercase tracking-tighter">
                The Logistics <br />
                <span className="text-primary italic">Operating</span> <br />
                System.
              </h1>
            </div>
            <p className="text-xl text-slate-500 max-w-xl leading-relaxed font-medium border-l-8 border-primary/20 pl-8 italic">
              A military-grade command environment for high-stakes logistics. Manage asset lifecycles, real-time cargo movement, and AI-driven ROI analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-[2rem] px-12 h-20 text-xl font-black shadow-2xl shadow-primary/30 uppercase tracking-tight group font-headline">
                  Initialize Dashboard <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-3 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="rounded-[2rem] px-10 h-20 text-xl font-bold border-4 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all font-headline">
                  Onboard Fleet
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-16 pt-12">
              <div className="space-y-2">
                <p className="text-5xl font-black text-slate-900 tracking-tighter">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-headline">Zero-Latency Sync</p>
              </div>
              <div className="w-px h-16 bg-slate-200"></div>
              <div className="space-y-2">
                <p className="text-5xl font-black text-slate-900 tracking-tighter">AES-256</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] font-headline">RBAC Hardened</p>
              </div>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000">
            <div className="absolute -inset-20 bg-primary/20 blur-[160px] rounded-full opacity-60 animate-pulse"></div>
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
              <Card className="relative overflow-hidden border-none shadow-[0_60px_120px_-20px_rgba(30,64,175,0.4)] rounded-[3rem] bg-slate-900 ring-8 ring-white/10 group">
                <div className="absolute top-0 left-0 w-full h-14 bg-slate-800/80 backdrop-blur-md flex items-center px-8 gap-3 border-b border-slate-700/50 z-20">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <div className="ml-6 h-7 w-64 bg-slate-700/50 rounded-lg flex items-center px-3">
                    <div className="w-2 h-2 rounded-full bg-primary mr-2 animate-ping"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-headline">fleet-monitor.ff_os</span>
                  </div>
                </div>
                <div className="relative overflow-hidden pt-14">
                  <img 
                    src="https://picsum.photos/seed/fleetflow-main/1200/800" 
                    alt="FleetFlow Command Center Interface" 
                    className="w-full h-auto object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    data-ai-hint="logistics command center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest font-headline">Active Dispatch</p>
                    <p className="text-xl font-black text-white tracking-tighter uppercase font-headline">Route 9002 In Transit</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* --- CAPABILITIES: THE INTELLIGENCE CORE --- */}
        <section id="capabilities" className="bg-slate-900 py-32 border-y border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(30,64,175,0.1),transparent)]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-3 gap-24">
              <div className="space-y-8">
                <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-2 border-primary/20 shadow-2xl shadow-primary/20">
                  <Cpu className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-5xl font-headline font-black text-white uppercase tracking-tighter leading-none">
                  Reactive <br /> Intelligence.
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed text-lg border-l-2 border-slate-700 pl-6">
                  Not just a database. FleetFlow monitors every mile, expense, and driver behavior to surface hidden profitability gaps automatically.
                </p>
                <div className="pt-4">
                  <Button variant="link" className="text-primary font-black uppercase text-xs tracking-widest p-0 font-headline hover:gap-3 transition-all">
                    Explore AI Module <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-10">
                {[
                  { icon: Globe, title: "Global Registry", desc: "A centralized digital twin for every truck, van, and specialty vehicle with deep maintenance history." },
                  { icon: Navigation, title: "Route Dynamics", desc: "Adaptive 4-stage tracking (Scheduled to Delivered) with real-time ETA recalculations." },
                  { icon: Lock, title: "Role Isolation", desc: "Deep RBAC architecture. Financials for analysts, dispatch controls for the Command Center." },
                  { icon: Database, title: "Operational Ledger", desc: "Immutable tracking of fuel refills and trip expenses into a verifiable organizational audit trail." }
                ].map((cap, i) => (
                  <div key={i} className="p-10 rounded-[3rem] bg-slate-800/30 border-2 border-slate-700/30 hover:bg-slate-800/60 transition-all group hover:border-primary/40 hover:translate-y-[-10px]">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-colors">
                      <cap.icon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter font-headline">{cap.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- CARGO PULSE: THE LIFECYCLE --- */}
        <section className="bg-primary py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-white/5 skew-x-[-25deg] translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 text-white relative z-10">
              <div className="space-y-4">
                <Badge className="bg-white/10 text-accent border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest font-headline">
                  Live Dispatch Pulse
                </Badge>
                <h2 className="text-6xl lg:text-8xl font-headline font-black uppercase tracking-tighter leading-[0.85]">
                  Watch It <br /> <span className="text-accent italic">Move.</span>
                </h2>
              </div>
              <p className="text-primary-foreground/80 text-2xl font-medium leading-relaxed italic">
                A visually verifiable 4-stage cargo lifecycle designed for zero-error operations.
              </p>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { label: "Atomic Status Updates", icon: Zap },
                  { label: "Overload Enforcement", icon: ShieldCheck },
                  { label: "Driver Availability Sync", icon: Users },
                  { label: "Projected ETA Hub", icon: Clock }
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-tight">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                      <f.icon className="w-5 h-5 text-accent" />
                    </div>
                    {f.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-10 bg-white/10 blur-[100px] rounded-full group-hover:bg-accent/10 transition-colors"></div>
              <Card className="bg-slate-900 border-none rounded-[4rem] p-16 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.5)] space-y-16 ring-1 ring-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-primary"></div>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-headline">Operational Ledger Ref</p>
                    <p className="text-3xl font-black text-white tracking-tighter font-headline">TRIP-GLOBAL-9002</p>
                  </div>
                  <Badge className="bg-accent text-slate-900 font-black px-6 py-2 rounded-xl text-xs font-headline animate-pulse">IN TRANSIT</Badge>
                </div>
                
                <div className="relative py-12 flex justify-between">
                  <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
                  <div className="absolute top-1/2 left-0 w-2/3 h-1.5 bg-accent -translate-y-1/2 z-0 rounded-full shadow-[0_0_20px_rgba(182,100,74,0.5)]"></div>
                  {[Calendar, Navigation, Truck, CheckCircle2].map((Icon, idx) => (
                    <div key={idx} className={`relative z-10 w-16 h-16 rounded-3xl flex items-center justify-center border-2 transition-all duration-700 ${
                      idx < 2 ? 'bg-accent border-accent text-slate-900 shadow-2xl' : 
                      idx === 2 ? 'bg-slate-900 border-accent text-accent ring-8 ring-accent/10' : 
                      'bg-slate-800 border-slate-700 text-slate-600'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-12 text-white">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-headline">Origin Hub</p>
                    <p className="text-2xl font-black font-headline uppercase tracking-tighter">Central Hub A</p>
                  </div>
                  <div className="space-y-2 text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-headline">Arrival Projection</p>
                    <p className="text-2xl font-black font-headline uppercase tracking-tighter text-accent">14:00 GMT</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* --- ROLES: THE COMMAND HIERARCHY --- */}
        <section id="roles" className="py-32 px-6">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
              <Badge className="bg-slate-100 text-slate-500 border-none px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] font-headline">Institutional Hierarchy</Badge>
              <h2 className="font-headline text-5xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">Command Roles.</h2>
              <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium italic">FleetFlow adapts its posture based on your mission in the organization.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                {
                  role: "Fleet Manager",
                  desc: "Organizational Architect. Controls asset intake, personnel onboarding, and overall strategy.",
                  icon: <Layers className="w-10 h-10" />,
                  color: "bg-blue-600",
                  shadow: "shadow-blue-500/20"
                },
                {
                  role: "Dispatcher",
                  desc: "Operational Pulse. Manages the Command Center, initiates lifecycles, and monitors routes.",
                  icon: <Navigation className="w-10 h-10" />,
                  color: "bg-amber-600",
                  shadow: "shadow-amber-500/20"
                },
                {
                  role: "Safety Officer",
                  desc: "Compliance Guardian. Verifies licenses, safety scores, and enforces operational standards.",
                  icon: <ShieldCheck className="w-10 h-10" />,
                  color: "bg-emerald-600",
                  shadow: "shadow-emerald-500/20"
                },
                {
                  role: "Financial Analyst",
                  desc: "ROI Engine. Analyzes fuel logs, profit trends, and trip expenses to optimize the bottom line.",
                  icon: <Receipt className="w-10 h-10" />,
                  color: "bg-slate-900",
                  shadow: "shadow-slate-500/20"
                }
              ].map((role, i) => (
                <div key={i} className="flex flex-col h-full bg-white rounded-[3.5rem] border-2 border-slate-50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] p-12 space-y-10 hover:translate-y-[-12px] transition-all duration-700 group">
                  <div className={`w-20 h-20 ${role.color} ${role.shadow} rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform`}>
                    {role.icon}
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-3xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none">{role.role}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {role.desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-auto">
                    <Link href="/auth/register" className="text-[11px] font-black uppercase tracking-[0.25em] text-primary group-hover:gap-4 flex items-center gap-2 font-headline transition-all">
                      ACCESS SCOPE <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER: SYSTEM TERMINUS --- */}
      <footer className="bg-slate-950 text-slate-500 py-32 px-6 lg:px-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20">
          <div className="col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
                <Truck className="text-white w-7 h-7" />
              </div>
              <span className="font-headline text-4xl font-black text-white tracking-tighter uppercase">FleetFlow</span>
            </div>
            <p className="max-w-md text-slate-500 text-lg font-medium leading-relaxed italic">
              The definitive Logistics OS for high-performance fleet organizations. Precision tracking. Verifiable safety. AI-driven profitability.
            </p>
            <div className="flex gap-6">
              <Button size="icon" variant="ghost" className="rounded-full bg-slate-900 border border-slate-800 text-white hover:bg-primary transition-all"><Globe className="w-5 h-5"/></Button>
              <Button size="icon" variant="ghost" className="rounded-full bg-slate-900 border border-slate-800 text-white hover:bg-primary transition-all"><Database className="w-5 h-5"/></Button>
              <Button size="icon" variant="ghost" className="rounded-full bg-slate-900 border border-slate-800 text-white hover:bg-primary transition-all"><Cpu className="w-5 h-5"/></Button>
            </div>
          </div>
          <div className="space-y-8">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] font-headline">Platform Core</h4>
            <ul className="space-y-5 text-sm font-bold font-headline">
              <li><Link href="/dashboard/vehicles" className="hover:text-primary transition-colors flex items-center gap-2">FLEET REGISTRY <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div></Link></li>
              <li><Link href="/dashboard/trips" className="hover:text-primary transition-colors">COMMAND CENTER</Link></li>
              <li><Link href="/dashboard/performance" className="hover:text-primary transition-colors">COMPLIANCE HUB</Link></li>
              <li><Link href="/dashboard/analytics" className="hover:text-primary transition-colors">INTELLIGENCE</Link></li>
            </ul>
          </div>
          <div className="space-y-8">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] font-headline">System Auth</h4>
            <ul className="space-y-5 text-sm font-bold font-headline">
              <li><Link href="/auth/login" className="hover:text-primary transition-colors">OPERATOR SIGN IN</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary transition-colors">PROVISION WORKSPACE</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API TERMINAL</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors text-emerald-500">SYSTEM STATUS: NOMINAL</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 font-headline">© 2024 FleetFlow Intelligence SaaS Engine. Build v2.04.12</p>
          <div className="flex gap-12 text-slate-700">
            <ShieldCheck className="w-6 h-6 hover:text-primary cursor-pointer transition-colors"/>
            <Globe className="w-6 h-6 hover:text-primary cursor-pointer transition-colors"/>
            <Lock className="w-6 h-6 hover:text-primary cursor-pointer transition-colors"/>
          </div>
        </div>
      </footer>
    </div>
  );
}
