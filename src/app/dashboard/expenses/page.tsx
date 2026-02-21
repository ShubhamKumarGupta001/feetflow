"use client";

import { useState, useMemo } from 'react';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  setDocumentNonBlocking,
  useUser,
  useDoc
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Search, 
  Receipt, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Loader2,
  Fuel,
  Wallet,
  MoreHorizontal,
  LayoutGrid,
  Database
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function TripExpensePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    tripId: '',
    fuelCost: '',
    miscExpense: '',
    description: 'Operational Misc'
  });

  const tRef = useMemoFirebase(() => collection(firestore, 'trips'), [firestore]);
  const eRef = useMemoFirebase(() => collection(firestore, 'expenses'), [firestore]);
  const fRef = useMemoFirebase(() => collection(firestore, 'fuel_logs'), [firestore]);
  const dRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);

  const { data: trips, isLoading: tLoading } = useCollection(tRef);
  const { data: expenses, isLoading: eLoading } = useCollection(eRef);
  const { data: fuelLogs, isLoading: fLoading } = useCollection(fRef);
  const { data: drivers, isLoading: dLoading } = useCollection(dRef);

  const isLoading = tLoading || eLoading || fLoading || dLoading;

  const handleCreateExpense = () => {
    if (!formData.tripId) {
      toast({ variant: "destructive", title: "Missing Trip", description: "Select a valid Trip ID to attach expenses." });
      return;
    }

    const selectedTrip = trips?.find(t => t.id === formData.tripId);
    if (!selectedTrip) return;

    const timestamp = new Date().toISOString();

    // 1. Handle Fuel Expense if provided
    if (Number(formData.fuelCost) > 0) {
      const fuelId = `FUEL-${Math.floor(1000 + Math.random() * 9000)}`;
      setDocumentNonBlocking(doc(firestore, 'fuel_logs', fuelId), {
        id: fuelId,
        vehicleId: selectedTrip.vehicleId,
        tripId: selectedTrip.id,
        cost: Number(formData.fuelCost),
        liters: 0, // Placeholder
        date: timestamp,
        odometerKm: selectedTrip.startOdometerKm,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Handle Misc Expense if provided
    if (Number(formData.miscExpense) > 0) {
      const expId = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
      setDocumentNonBlocking(doc(firestore, 'expenses', expId), {
        id: expId,
        vehicleId: selectedTrip.vehicleId,
        tripId: selectedTrip.id,
        amount: Number(formData.miscExpense),
        description: formData.description,
        category: 'Miscellaneous',
        date: timestamp,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    toast({ title: "Ledger Updated", description: "Expenses have been successfully synchronized with the trip record." });
    setIsModalOpen(false);
    setFormData({ tripId: '', fuelCost: '', miscExpense: '', description: 'Operational Misc' });
  };

  const tripExpenses = useMemo(() => {
    if (!trips) return [];
    
    return trips.map(trip => {
      const tripFuel = fuelLogs?.filter(f => f.tripId === trip.id || (f.vehicleId === trip.vehicleId && f.date >= trip.dispatchDate && (!trip.completionDate || f.date <= trip.completionDate)))
        .reduce((sum, f) => sum + (Number(f.cost) || 0), 0) || 0;
        
      const tripMisc = expenses?.filter(e => e.tripId === trip.id || (e.vehicleId === trip.vehicleId && e.date >= trip.dispatchDate && (!trip.completionDate || e.date <= trip.completionDate)))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

      const driver = drivers?.find(d => d.id === trip.driverId);

      return {
        ...trip,
        driverName: driver?.name || 'Unknown',
        fuelCost: tripFuel,
        miscCost: tripMisc,
        distance: trip.distanceKm || 0
      };
    });
  }, [trips, fuelLogs, expenses, drivers]);

  const filteredTrips = tripExpenses.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter italic">Fleet Flow Expense Hub</h2>
          <p className="text-slate-500 font-medium">Trip-Based Financial Reconciliation & Ledger Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-tighter">
                <Plus className="w-5 h-5 mr-2" /> Add an Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-8 bg-white">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-black font-headline text-primary uppercase tracking-tighter">New Expense Log</DialogTitle>
                <DialogDescription>Attach operational costs to a specific trip ID.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em]">Select Active Trip ID</Label>
                  <Select value={formData.tripId} onValueChange={(val) => setFormData({...formData, tripId: val})}>
                    <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Trip ID Reference" />
                    </SelectTrigger>
                    <SelectContent>
                      {trips?.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.id} ({t.origin} → {t.destination})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em]">Fuel Cost (PKR)</Label>
                    <div className="relative">
                      <Fuel className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.fuelCost}
                        onChange={(e) => setFormData({...formData, fuelCost: e.target.value})}
                        className="pl-12 rounded-2xl h-12 bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em]">Misc Expense (PKR)</Label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={formData.miscExpense}
                        onChange={(e) => setFormData({...formData, miscExpense: e.target.value})}
                        className="pl-12 rounded-2xl h-12 bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em]">Misc Description</Label>
                  <Input 
                    placeholder="e.g. Tolls, Parking, Maintenance"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="rounded-2xl h-12 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-4 pt-4 border-t">
                <Button onClick={handleCreateExpense} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20">Create Record</Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl h-14 font-bold border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all">Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="p-10 bg-slate-50/50 border-b space-y-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:max-w-xl group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search trip ID, driver, or route..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-14 border-none bg-white shadow-xl shadow-slate-200/50 rounded-[1.25rem] text-lg font-medium"
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
              <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                <LayoutGrid className="w-4 h-4 mr-2" /> Group by
              </Button>
              <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
              <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                <ArrowUpDown className="w-4 h-4 mr-2" /> Sort by...
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-20 pl-10 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Trip ID</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Driver</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Distance</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Fuel Expense</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em]">Misc. Expense</TableHead>
                <TableHead className="h-20 pr-10 text-right text-[10px] font-black uppercase text-primary tracking-[0.25em]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary/30" />
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Financial Ledger...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTrips.length > 0 ? (
                filteredTrips.map((trip) => (
                  <TableRow key={trip.id} className="h-24 border-slate-50 hover:bg-slate-50/50 transition-all group">
                    <TableCell className="pl-10">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-lg tracking-tighter group-hover:text-primary transition-colors">{trip.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{trip.origin} → {trip.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700 text-base">{trip.driverName}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
                        {trip.distanceKm || '---'} KM
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Fuel className="w-4 h-4 text-emerald-500 opacity-50" />
                        <span className="font-black text-slate-900 text-base italic">Rs. {trip.fuelCost.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-500 opacity-50" />
                        <span className="font-black text-slate-900 text-base italic">Rs. {trip.miscCost.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      <Badge className={cn(
                        "rounded-xl px-5 py-1.5 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                        trip.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                        trip.status === 'In Transit' ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {trip.status === 'Completed' ? 'Done' : trip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center shadow-inner">
                        <Database className="w-10 h-10 text-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black font-headline text-slate-900 uppercase tracking-tighter">No Financial Data</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">Initiate a trip and log operational expenses to populate the ledger.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
