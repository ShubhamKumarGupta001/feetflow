import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Truck, ShieldCheck, Zap, BarChart3, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="px-6 py-6 lg:px-12 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Truck className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-bold text-primary tracking-tight">FleetFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Features</Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Sign In</Link>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90 rounded-xl px-6 h-11 font-bold shadow-md shadow-primary/10">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-6 py-24 lg:py-32 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-primary" />
              Advanced Fleet Management
            </div>
            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold leading-tight text-slate-900">
              Control Your <span className="text-primary italic">Fleet</span> with Precision.
            </h1>
            <p className="text-xl text-slate-600 max-w-xl leading-relaxed font-medium">
              Optimize vehicle lifecycles, enforce driver compliance, and monitor financial performance with FleetFlow's centralized logistics engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-10 h-16 text-lg font-bold shadow-xl shadow-primary/20">
                  Launch Command Center <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="rounded-xl px-10 h-16 text-lg font-bold border-2 border-slate-200 bg-white">
                  Register Assets
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-4 grayscale opacity-50">
              <div className="flex items-center gap-2 font-bold text-slate-900"><ShieldCheck className="w-5 h-5"/> RBAC SECURE</div>
              <div className="flex items-center gap-2 font-bold text-slate-900"><Clock className="w-5 h-5"/> REAL-TIME LOGS</div>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="absolute -inset-10 bg-primary/5 blur-3xl rounded-full"></div>
            <Card className="relative overflow-hidden border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-3xl">
              <img 
                src="https://picsum.photos/seed/fleetflow1/1200/800" 
                alt="FleetFlow Command Center" 
                className="w-full h-auto object-cover"
                data-ai-hint="logistics dashboard"
              />
            </Card>
          </div>
        </section>

        <section id="features" className="px-6 py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <h2 className="font-headline text-4xl font-bold text-slate-900">Enterprise Logistics Toolkit</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Everything you need to replace manual logbooks with a rule-based digital system.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  icon: <Truck className="w-8 h-8 text-primary" />,
                  title: "Vehicle Registry",
                  desc: "Comprehensive CRUD management for your assets with real-time status tracking and lifecycle optimization."
                },
                {
                  icon: <BarChart3 className="w-8 h-8 text-primary" />,
                  title: "Trip Dispatcher",
                  desc: "Smart lifecycle management from Draft to Complete with cargo capacity and license compliance checks."
                },
                {
                  icon: <Zap className="w-8 h-8 text-primary" />,
                  title: "Financial Analytics",
                  desc: "Automatic cost-per-km calculations, ROI monitoring, and fuel consumption tracking per asset."
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-default group rounded-3xl p-4">
                  <CardContent className="pt-8 pb-8 space-y-6">
                    <div className="p-4 bg-white w-fit rounded-2xl shadow-sm group-hover:scale-110 transition-transform shadow-slate-200/50">{feature.icon}</div>
                    <h3 className="text-2xl font-bold font-headline text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Truck className="text-white w-6 h-6" />
              <span className="font-headline text-2xl font-bold text-white tracking-tight">FleetFlow</span>
            </div>
            <p className="max-w-xs text-slate-500 font-medium">The definitive SaaS platform for modern fleet and logistics management. Built for performance and reliability.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Product</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/vehicles" className="hover:text-primary transition-colors">Vehicle Registry</Link></li>
              <li><Link href="/dashboard/trips" className="hover:text-primary transition-colors">Trip Dispatcher</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Company</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-slate-600">© 2024 FleetFlow Logistics SaaS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-600 hover:text-white transition-colors"><ShieldCheck className="w-5 h-5"/></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}