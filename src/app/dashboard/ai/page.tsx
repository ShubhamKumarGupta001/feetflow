
"use client";

import { useState } from 'react';
import { automatedDataInsights, AutomatedDataInsightsOutput } from '@/ai/flows/automated-data-insights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Sparkles, AlertCircle, TrendingUp, Lightbulb, Loader2 } from 'lucide-react';

const mockSalesData = [
  { date: '2023-10-01', revenue: 4500, sales: 34 },
  { date: '2023-10-02', revenue: 5200, sales: 41 },
  { date: '2023-10-03', revenue: 4100, sales: 29 },
  { date: '2023-10-04', revenue: 6800, sales: 55 },
  { date: '2023-10-05', revenue: 5900, sales: 48 },
];

const mockPerformanceIndicators = [
  { metric: 'Conversion Rate', value: '3.8%' },
  { metric: 'Churn Rate', value: '1.2%' },
  { metric: 'Average Order Value', value: '$124' },
];

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AutomatedDataInsightsOutput | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const result = await automatedDataInsights({
        salesDataJson: JSON.stringify(mockSalesData),
        performanceIndicatorsJson: JSON.stringify(mockPerformanceIndicators)
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
          <h2 className="text-3xl font-bold font-headline text-slate-900">AI Intelligent Analysis</h2>
          <p className="text-slate-500">Let our advanced LLM analyze your business data to find hidden values.</p>
        </div>
        <Button 
          onClick={generateInsights} 
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-6 shadow-lg shadow-primary/20"
        >
          {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
          {loading ? "Analyzing Data..." : "Generate New Insights"}
        </Button>
      </div>

      {!insights && !loading && (
        <Card className="border-dashed border-2 border-slate-200 bg-white/50 py-16">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-primary/40" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold font-headline">Ready to Analyze</h3>
              <p className="text-slate-500 mt-2">Click the button above to run a comprehensive analysis on your recent sales performance and trends.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 w-1/4 bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-50 rounded"></div>
                <div className="h-4 w-5/6 bg-slate-50 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {insights && (
        <div className="grid gap-8">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="font-headline flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-slate-700 leading-relaxed italic font-medium">"{insights.summary}"</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-headline">Key Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {insights.trends.map((trend, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                      {trend}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-headline">Anomalies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {insights.anomalies.map((anomaly, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                      {anomaly}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-headline">Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {insights.opportunities.map((opp, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
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
