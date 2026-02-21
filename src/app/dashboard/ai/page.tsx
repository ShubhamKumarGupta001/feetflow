
"use client";

import { useState, useMemo } from 'react';
import { automatedDataInsights, AutomatedDataInsightsOutput } from '@/ai/flows/automated-data-insights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Sparkles, AlertCircle, TrendingUp, Lightbulb, Loader2, Database } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function AIInsightsPage() {
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AutomatedDataInsightsOutput | null>(null);

  // Fetch real data to feed the AI
  const tripsRef = useMemoFirebase(() => collection(db, 'trips'), [db]);
  const expensesRef = useMemoFirebase(() => collection(db, 'expenses'), [db]);
  const fuelRef = useMemoFirebase(() => collection(db, 'fuel_logs'), [db]);

  const { data: trips, isLoading: tLoading } = useCollection(tripsRef);
  const { data: expenses, isLoading: eLoading } = useCollection(expensesRef);
  const { data: fuelLogs, isLoading: fLoading } = useCollection(fuelRef);

  const isDataLoading = tLoading || eLoading || fLoading;

  const generateInsights = async () => {
    if (!trips || !expenses || !fuelLogs) return;
    
    setLoading(true);
    try {
      // Prepare real operational context for the AI
      const salesData = trips.map(t => ({ date: t.dispatchDate, revenue: t.revenue, route: `${t.origin}-${t.destination}` }));
      const costData = [
        ...expenses.map(e => ({ type: 'expense', amount: e.amount, category: e.category })),
        ...fuelLogs.map(f => ({ type: 'fuel', amount: f.cost, liters: f.liters }))
      ];

      const result = await automatedDataInsights({
        salesDataJson: JSON.stringify(salesData),
        performanceIndicatorsJson: JSON.stringify(costData)
      });
      setInsights(result);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">AI Fleet Intelligence</h2>
          <p className="text-slate-500 font-medium">Advanced LLM Analysis of Real-Time Logistics Data</p>
        </div>
        <Button 
          onClick={generateInsights} 
          disabled={loading || isDataLoading || !trips?.length}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
          {loading ? "Analyzing Live Data..." : "Run Global Analysis"}
        </Button>
      </div>

      {!insights && !loading && (
        <Card className="border-dashed border-2 border-slate-200 bg-white/50 py-20">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center">
              <Database className="w-10 h-10 text-primary/30" />
            </div>
            <div className="max-w-md">
              <h3 className="text-2xl font-bold font-headline uppercase tracking-tighter text-slate-900">Live Data Ready</h3>
              <p className="text-slate-500 mt-2 font-medium">
                {trips && trips.length > 0 
                  ? `Found ${trips.length} active records. Click above to identify trends and hidden business opportunities.`
                  : "No operational data found. Seed the environment or dispatch trips to enable AI analysis."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse border-none shadow-sm rounded-2xl overflow-hidden">
              <div className="h-20 bg-slate-50 w-full mb-4"></div>
              <CardContent className="p-6 space-y-4">
                <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-50 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {insights && (
        <div className="grid gap-8">
          <Card className="border-none shadow-xl shadow-primary/5 bg-white overflow-hidden rounded-3xl">
            <CardHeader className="bg-primary/5 border-b border-primary/10 py-6">
              <CardTitle className="font-headline flex items-center gap-2 uppercase tracking-tighter text-primary">
                <BrainCircuit className="w-5 h-5" />
                Executive Operational Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <p className="text-xl text-slate-800 leading-relaxed font-semibold italic">"{insights.summary}"</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center gap-3 border-b bg-emerald-50/50">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-headline uppercase tracking-tighter">Growth Trends</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {insights.trends.map((trend, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                      {trend}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center gap-3 border-b bg-red-50/50">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-headline uppercase tracking-tighter">Risk Anomalies</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {insights.anomalies.map((anomaly, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                      {anomaly}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center gap-3 border-b bg-blue-50/50">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg font-headline uppercase tracking-tighter">Strategic Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {insights.opportunities.map((opp, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></div>
                      {opp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
