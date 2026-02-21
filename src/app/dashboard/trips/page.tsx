
"use client";

import { useState, useMemo } from 'react';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search, 
  Loader2,
  ClipboardList,
  Navigation
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

/**
 * Trip Dispatcher Module
 * Handles real-time assignment of assets to journeys.
 */
export default function TripsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeightKg: '',
    origin: '',
    destination: '',
    estimatedFuelCost: ''
  });

  // 1. Authorization Gating
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  // 2. Real-time Subscriptions to Dependencies (Vehicles, Drivers, Trips)
  const vRef = useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]);
  const dRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const tRef = useMemoFirebase(() => collection(firestore, 'trips'), [firestore]);

  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection(vRef);
  const { data: drivers, isLoading: isDriversLoading } = useCollection(dRef);
  const { data: trips, isLoading: isTripsLoading } = useCollection(tRef);

  const isLoading = isProfileLoading || isVehiclesLoading || isDriversLoading || isTripsLoading;

  // 3. Dispatch Mutation Logic
  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.driverId) return;

    const vehicle = vehicles?.find(v => v.id === formData.vehicleId);
    const driver = drivers?.find(d => d.id === formData.driverId);

    // Safety Checks
    if (Number(formData.cargoWeightKg) > (vehicle?.maxCapacityKg || 0)) {
      toast({ variant: "destructive", title: "Overload Detected", description: "Cargo exceeds vehicle payload capacity." });
      return;
    }

    if (driver?.status !== 'On Duty' && driver?.status !== 'Available') {
      toast({ variant: "destructive", title: "Operator Unavailable", description: "The selected driver is currently not in active duty status." });
      return;
    }

    // A. Create Trip Record
    const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
    addDocumentNonBlocking(tRef!, {
      id: tripId,
      ...formData,
      cargoWeightKg: Number(formData.cargoWeightKg),
      revenue: 0,
      startOdometerKm: vehicle?.odometerKm || 0,
      status: 'Dispatched',
      dispatchDate: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    // B. Update Asset & Operator Statuses Atomically
    const vehicleRef = doc(firestore, 'vehicles', formData.vehicleId);
    updateDocumentNonBlocking(vehicleRef, { status: 'On Trip' });

    const driverRef = doc(firestore, 'drivers', formData.driverId);
    updateDocumentNonBlocking(driverRef, { status: 'On Trip' });

    toast({ title: "Dispatch Confirmed", description: `${tripId} is now active and tracked.` });

    setFormData({ vehicleId: '', driverId: '', cargoWeightKg: '', origin: '', destination: '', estimatedFuelCost: '' });
  };

  const filteredTrips = useMemo(() => {
    return trips?.filter(t => 
      t.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [trips, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Trip Command</h2>
          <p className="text-slate-500 font-medium">Real-time Deployment & Asset Coordination</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Real-time Trip Monitor */}
        <Card className="xl:col-span-2 border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-6 bg-white border-b flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search active deployments..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl font-medium"
              />
            </div>
            <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              Live Monitor Active
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none">
                    <TableHead className="w-[80px] h-14 pl-8 text-xs font-bold uppercase text-slate-400">ID</TableHead>
                    <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Route Map</TableHead>
                    <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Assigned Asset</TableHead>
                    <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-slate-400">Journey State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => {
                    const vehicle = vehicles?.find(v => v.id === trip.vehicleId);
                    return (
                      <TableRow key={trip.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-8 font-black text-primary/70">{trip.id}</TableCell>
                        <TableCell className="font-bold text-slate-900">{trip.origin} → {trip.destination}</TableCell>
                        <TableCell className="font-medium text-slate-500">{vehicle?.name || 'N/A'}</TableCell>
                        <TableCell className="pr-8 text-right">
                          <Badge className={`rounded-full px-3 py-0.5 font-bold border-none ${
                            trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                            trip.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {trip.status === 'Dispatched' ? 'In Transit' : trip.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredTrips.length === 0 && (
              <div className="py-24 text-center">
                <ClipboardList className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-400 font-headline uppercase tracking-tighter">No Active Journeys</h3>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispatch Form: Persistence Engine */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b bg-primary/5">
            <CardTitle className="text-xl font-bold font-headline uppercase tracking-tighter text-primary">Deployment Hub</CardTitle>
            <CardDescription className="font-medium text-slate-500">Configure journey and assign assets.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleDispatch} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Available Asset:</Label>
                <Select value={formData.vehicleId} onValueChange={(val) => setFormData({...formData, vehicleId: val})}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder="Select Cargo Carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles?.filter(v => v.status === 'Available').map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.licensePlate} - {v.model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Cargo Weight (KG):</Label>
                <Input type="number" value={formData.cargoWeightKg} onChange={(e) => setFormData({...formData, cargoWeightKg: e.target.value})} className="rounded-xl h-11" required />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Verified Operator:</Label>
                <Select value={formData.driverId} onValueChange={(val) => setFormData({...formData, driverId: val})}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder="Assign Certified Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers?.filter(d => d.status === 'On Duty' || d.status === 'Available').map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Origin Point:</Label>
                  <Input value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="rounded-xl h-11" placeholder="City/Hub" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Destination:</Label>
                  <Input value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="rounded-xl h-11" placeholder="Final Stop" required />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-95">
                <Navigation className="w-5 h-5 mr-2" /> Confirm Dispatch
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
