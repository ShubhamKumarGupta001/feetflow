
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
  LayoutGrid,
  Database,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Trip & Expense Hub: The Digital Wallet of FleetFlow
 * Tracks fuel consumption (liters/cost), maintenance/repair bills, and misc expenses
 * to calculate the total operational cost per vehicle.
 */
export default function TripExpensePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Authorization check for Financial Analyst or Fleet Manager
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc(userRef);
  const canManageExpenses = userProfile?.roleId === 'fleet-manager' || userProfile?.roleId === 'financial-analyst';

  const [formData, setFormData] = useState({
    tripId: '',
    fuelCost: '',
    fuelLiters: '',
    miscExpense: '',
    description: 'Operational Misc'
  });

  const tRef = useMemoFirebase(() => collection(firestore, 'trips'), [firestore]);
  const eRef = useMemoFirebase(() => collection(firestore, 'expenses'), [firestore]);
  const fRef = useMemoFirebase(() => collection(firestore, 'fuel_logs'), [firestore]);
  const dRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const mRef = useMemoFirebase(() => collection(firestore, 'maintenance_logs'), [firestore]);

  const { data: trips, isLoading: tLoading } = useCollection(tRef);
  const { data: expenses, isLoading: eLoading } = useCollection(eRef);
  const { data: fuelLogs, isLoading: fLoading } = useCollection(fRef);
  const { data: drivers, isLoading: dLoading } = useCollection(dRef);
  const { data: maintenance, isLoading: mLoading } = useCollection(mRef);

  const isLoading = tLoading || eLoading || fLoading || dLoading || mLoading;

  const handleCreateExpense = () => {
    if (!formData.tripId) {
      toast({ variant: "destructive", title: "Missing Trip", description: "Select a valid Trip ID to attach expenses." });
      return;
    }

    const selectedTrip = trips?.find(t => t.id === formData.tripId);
    if (!selectedTrip) return;

    const timestamp = new Date().toISOString();

    // 1. Log Fuel (Digital Wallet: Liters + Cost)
    if (Number(formData.fuelCost) > 0) {
      const fuelId = `FUEL-${Math.floor(1000 + Math.random() * 9000)}`;
      setDocumentNonBlocking(doc(firestore, 'fuel_logs', fuelId), {
        id: fuelId,
        vehicleId: selectedTrip.vehicleId,
        tripId: selectedTrip.id,
        cost: Number(formData.fuelCost),
        liters: Number(formData.fuelLiters) || 0,
        date: timestamp,
        odometerKm: selectedTrip.startOdometerKm,
        createdAt: serverTimestamp()
      }, { merge: true });
    }

    // 2. Log Misc Expense
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

    toast({ title: "Ledger Updated", description: "Expenses have been successfully synchronized with the vehicle record." });
    setIsModalOpen(false);
    setFormData({ tripId: '', fuelCost: '', fuelLiters: '', miscExpense: '', description: 'Operational Misc' });
  };

  const tripExpenses = useMemo(() => {
    if (!trips) return [];
    
    return trips.map(trip => {
      const tripFuel = fuelLogs?.filter(f => f.tripId === trip.id || (f.vehicleId === trip.vehicleId && f.date >= trip.dispatchDate && (!trip.completionDate || f.date <= trip.completionDate)))
        .reduce((sum, f) => sum + (Number(f.cost) || 0), 0) || 0;
        
      const tripMisc = expenses?.filter(e => e.tripId === trip.id || (e.vehicleId === trip.vehicleId && e.date >= trip.dispatchDate && (!trip.completionDate || e.date <= trip.completionDate)))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;

      const tripMaint = maintenance?.filter(m => m.vehicleId === trip.vehicleId && m.date >= trip.dispatchDate && (!trip.completionDate || m.date <= trip.completionDate))
        .reduce((sum, m) => sum + (Number(m.cost) || 0), 0) || 0;

      const driver = drivers?.find(d => d.id === trip.driverId);

      return {
        ...trip,
        driverName: driver?.name || 'Unknown',
        fuelCost: tripFuel,
        miscCost: tripMisc,
        maintCost: tripMaint,
        totalCost: tripFuel + tripMisc + tripMaint,
        distance: trip.distanceKm || 0
      };
    });
  }, [trips, fuelLogs, expenses, drivers, maintenance]);

  const walletStats = useMemo(() => {
    const totalFleetSpend = tripExpenses.reduce((sum, t) => sum + t.totalCost, 0);
    const vehicleSpending: Record<string, number> = {};
    
    tripExpenses.forEach(t => {
      vehicleSpending[t.vehicleId] = (vehicleSpending[t.vehicleId] || 0) + t.totalCost;
    });

    const topAssetEntry = Object.entries(vehicleSpending).sort((a, b) => b[1] - a[1])[0];
    const topAsset = topAssetEntry ? { id: topAssetEntry[0], spend: topAssetEntry[1] } : null;

    return { totalFleetSpend, topAsset };
  }, [tripExpenses]);

  const filteredTrips = tripExpenses.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.vehicleId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter italic">Fleet Digital Wallet</h2>
          <p className="text-slate-500 font-medium italic">Role: {userProfile?.roleId === 'financial-analyst' ? 'Financial Analyst (Full Access)' : 'Standard View'}</p>
        </div>
        <div className="flex items-center gap-3">
          {canManageExpenses && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-tighter font-headline">
                  <Plus className="w-5 h-5 mr-2" /> Log Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl p-8 bg-white">
                <DialogHeader className="pb-4 border-b">
                  <DialogTitle className="text-2xl font-black font-headline text-primary uppercase tracking-tighter">Digital Receipt</DialogTitle>
                  <DialogDescription className="font-medium text-slate-500 font-body">Attach operational costs (Fuel/Repair) to a specific trip ID.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6 font-body">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em] font-headline">Select Asset/Trip ID</Label>
                    <Select value={formData.tripId} onValueChange={(val) => setFormData({...formData, tripId: val})}>
                      <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Trip ID Reference" />
                      </SelectTrigger>
                      <SelectContent>
                        {trips?.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.id} ({t.vehicleId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em] font-headline">Fuel Liters</Label>
                      <div className="relative">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          placeholder="Liters" 
                          value={formData.fuelLiters}
                          onChange={(e) => setFormData({...formData, fuelLiters: e.target.value})}
                          className="pl-12 rounded-2xl h-12 bg-slate-50 border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em] font-headline">Fuel Cost (PKR)</Label>
                      <div className="relative">
                        <Fuel className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          type="number" 
                          placeholder="Cost" 
                          value={formData.fuelCost}
                          onChange={(e) => setFormData({...formData, fuelCost: e.target.value})}
                          className="pl-12 rounded-2xl h-12 bg-slate-50 border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em] font-headline">Misc / Repair Bill (PKR)</Label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        value={formData.miscExpense}
                        onChange={(e) => setFormData({...formData, miscExpense: e.target.value})}
                        className="pl-12 rounded-2xl h-12 bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-[0.2em] font-headline">Details</Label>
                    <Input 
                      placeholder="e.g. Tolls, Oil Refill, Brake Repair"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="rounded-2xl h-12 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <DialogFooter className="flex gap-4 pt-4 border-t">
                  <Button onClick={handleCreateExpense} className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 font-headline">Update Ledger</Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl h-14 font-bold border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all font-headline">Discard</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-2 border-primary/10 shadow-sm rounded-3xl bg-white overflow-hidden group">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Total Fleet Spend</p>
              <p className="text-3xl font-black font-headline text-slate-900 mt-1 italic">Rs. {walletStats.totalFleetSpend.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-amber-100 shadow-sm rounded-3xl bg-white overflow-hidden group">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-3">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-headline">Highest Spending Asset</p>
              <p className="text-3xl font-black font-headline text-slate-900 mt-1 italic">
                {walletStats.topAsset?.id || 'N/A'}
                <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-tighter mt-1">
                  Rs. {walletStats.topAsset?.spend.toLocaleString() || 0} Total
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-primary/5 rounded-3xl bg-primary text-white overflow-hidden">
          <CardContent className="p-8 flex flex-col justify-center h-full space-y-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-accent" />
              <p className="text-[10px] font-black uppercase tracking-widest font-headline">Financial Analytics Enabled</p>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90 italic">
              Financial Analysts can monitor ROI and log operational expenses to maintain ledger accuracy.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="p-10 bg-slate-50/50 border-b space-y-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative w-full lg:max-w-xl group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search trip ID, driver, or asset..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-14 border-none bg-white shadow-xl shadow-slate-200/50 rounded-[1.25rem] text-lg font-medium font-body"
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 font-headline">
              <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                <LayoutGrid className="w-4 h-4 mr-2" /> Group by Asset
              </Button>
              <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                <Filter className="w-4 h-4 mr-2" /> Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white border-b-2">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-20 pl-10 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Operational Ref</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Driver / Personnel</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Fuel Spend</TableHead>
                <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Repair / Misc</TableHead>
                <TableHead className="h-20 pr-10 text-right text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Total Trip Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-body">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary/30" />
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-headline">Syncing Wallet Ledger...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTrips.length > 0 ? (
                filteredTrips.map((trip) => (
                  <TableRow key={trip.id} className="h-24 border-slate-50 hover:bg-slate-50/50 transition-all group">
                    <TableCell className="pl-10">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-lg tracking-tighter group-hover:text-primary transition-colors font-headline uppercase italic">{trip.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-headline">ASSET: {trip.vehicleId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-slate-700 text-base">{trip.driverName}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-base italic font-headline">Rs. {trip.fuelCost.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Digital Refill Log</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-base italic font-headline">Rs. {(trip.miscCost + trip.maintCost).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Maintenance &amp; Repairs</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-10 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-primary text-2xl italic tracking-tighter font-headline">Rs. {trip.totalCost.toLocaleString()}</span>
                        <Badge variant="outline" className="mt-1 rounded-md px-2 py-0 text-[8px] font-black uppercase border-primary/20 text-primary/60">
                          {trip.status === 'Completed' ? 'DONE' : trip.status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center shadow-inner">
                        <Database className="w-10 h-10 text-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black font-headline text-slate-900 uppercase tracking-tighter">Wallet Empty</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm font-body">No expenses have been connected to active vehicles yet.</p>
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
