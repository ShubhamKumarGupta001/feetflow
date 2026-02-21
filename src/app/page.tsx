
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BarChart3, ShieldCheck, Zap, BrainCircuit } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-6 lg:px-12 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <span className="font-headline text-2xl font-bold text-primary tracking-tight">InsightFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</Link>
          <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          <Link href="/auth/register">
            <Button className="bg-primary hover:bg-primary/90 rounded-full px-6">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 lg:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-primary text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-accent text-accent" />
              Next Gen Analytics
            </div>
            <h1 className="font-headline text-5xl lg:text-7xl font-bold leading-tight text-slate-900">
              Transform Data into <span className="text-primary italic">Intelligence.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              InsightFlow empowers decision-makers with real-time data visualization, predictive analytics, and AI-driven business insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-14 text-lg">
                  Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-2">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full"></div>
            <Card className="relative overflow-hidden border-none shadow-2xl rounded-2xl">
              <img 
                src="https://picsum.photos/seed/insightflow1/1200/800" 
                alt="Dashboard Preview" 
                className="w-full h-auto object-cover"
                data-ai-hint="dashboard visualization"
              />
            </Card>
          </div>
        </section>

        <section id="features" className="px-6 py-24 bg-white">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="font-headline text-4xl font-bold">Comprehensive Toolset</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Everything you need to monitor, analyze, and optimize your business performance in one unified platform.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart3 className="w-8 h-8 text-primary" />,
                  title: "Real-time Metrics",
                  desc: "Instant visibility into your most critical sales and performance data."
                },
                {
                  icon: <BrainCircuit className="w-8 h-8 text-primary" />,
                  title: "AI Insights",
                  desc: "Automated analysis using LLMs to find hidden patterns and opportunities."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-primary" />,
                  title: "Secure & Trusted",
                  desc: "Bank-grade encryption and secure access controls for all your sensitive data."
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none bg-slate-50 hover:bg-primary/5 transition-colors cursor-default group">
                  <CardContent className="pt-8 pb-8 space-y-4">
                    <div className="p-3 bg-white w-fit rounded-xl shadow-sm group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                    <p className="text-slate-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-white w-6 h-6" />
            <span className="font-headline text-xl font-bold text-white">InsightFlow</span>
          </div>
          <p className="text-sm">© 2024 InsightFlow Analytics Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Twitter</Link>
            <Link href="#" className="hover:text-white">LinkedIn</Link>
            <Link href="#" className="hover:text-white">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
