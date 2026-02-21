
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';

export default function TripsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-headline">Trip Dispatcher</h2>
          <p className="text-slate-500">Coordinate dispatches and monitor active journeys.</p>
        </div>
        <Button className="rounded-xl bg-primary">
          <Plus className="w-4 h-4 mr-2" /> New Dispatch
        </Button>
      </div>

      <Card className="border-dashed border-2 py-20 bg-slate-50/50">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-slate-300" />
          </div>
          <div className="max-w-xs">
            <h3 className="text-lg font-bold">No Active Trips</h3>
            <p className="text-sm text-slate-500 mt-1">Your dispatch queue is empty. Create a new trip to get moving.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
