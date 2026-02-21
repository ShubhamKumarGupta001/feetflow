import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Truck, ShieldCheck, Zap, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

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
          <Link href="#workflow" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Workflow</Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Sign In</Link>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90 rounded-xl px-6 h-11 font-bold shadow-md shadow-primary/10">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 lg:py-24 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center border-b">
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

        <section id="workflow" className="px-6 py-24 bg-white">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <h2 className="font-headline text-4xl font-bold text-slate-900">Operational Quick Start</h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">Master the FleetFlow lifecycle in four simple steps.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Vehicle Intake",
                  desc: "Add your assets in the Registry. Set capacity and initial mileage to start tracking lifecycle.",
                  icon: <Truck className="w-6 h-6 text-primary" />
                },
                {
                  step: "02",
                  title: "Driver Onboarding",
                  desc: "Register drivers and verify licenses. System auto-suspends expired credentials.",
                  icon: <ShieldCheck className="w-6 h-6 text-primary" />
                },
                {
                  step: "03",
                  title: "Smart Dispatch",
                  desc: "Assign available drivers to trips. System prevents overloading and scheduling conflicts.",
                  icon: <BarChart3 className="w-6 h-6 text-primary" />
                },
                {
                  step: "04",
                  title: "Maintenance",
                  desc: "Log repairs to pull assets from rotation. Keep your fleet safe and operational.",
                  icon: <Clock className="w-6 h-6 text-primary" />
                }
              ].map((item, i) => (
                <div key={i} className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="text-4xl font-black text-primary/10 font-headline">{item.step}</div>
                    <div className="p-3 bg-white rounded-2xl shadow-sm">{item.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Truck className="text-white w-6 h-6" />
              <span className="font-headline text-2xl font-bold text-white tracking-tight">FleetFlow</span>
            </div>
            <p className="max-w-xs mx-auto md:mx-0 text-slate-500 font-medium">The definitive SaaS platform for modern fleet and logistics management. Built for performance and reliability.</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Modules</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="/dashboard/vehicles" className="hover:text-primary transition-colors">Registry</Link></li>
              <li><Link href="/dashboard/trips" className="hover:text-primary transition-colors">Dispatcher</Link></li>
              <li><Link href="/dashboard/maintenance" className="hover:text-primary transition-colors">Maintenance</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold">Compliance</h4>
            <ul className="space-y-2 text-sm font-medium">
              <li><Link href="/dashboard/performance" className="hover:text-primary transition-colors">Driver Safety</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">License Engine</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm font-medium text-slate-600">© 2024 FleetFlow Logistics SaaS. All rights reserved.</p>
          <div className="flex gap-6">
            <ShieldCheck className="w-5 h-5 text-slate-600"/>
          </div>
        </div>
      </footer>
    </div>
  );
}
