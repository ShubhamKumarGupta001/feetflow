
"use client";

import { useState, useMemo } from 'react';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  setDocumentNonBlocking,
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
  Navigation,
  Weight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Zap,
  Calendar
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TRACKING_STAGES = [
  { id: 'Scheduled', label: 'Scheduled', color: 'bg-slate-400', icon: Calendar, actionLabel: 'Launch Dispatch' },
  { id: 'Dispatched', label: 'Dispatched', color: 'bg-blue-500', icon: Navigation, actionLabel: 'Initiate Transit' },
  { id: 'In Transit', label: 'In Transit', color: 'bg-amber-500', icon: Truck, actionLabel: 'Confirm Delivery' },
  { id: 'Completed', label: 'Delivered', color: 'bg-emerald-500', icon: CheckCircle2, actionLabel: 'Finalized' },
];

export default function TripsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeightKg: '',
    origin: '',
    destination: '',
  });

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  const vRef = useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]);
  const dRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const tRef = useMemoFirebase(() => collection(firestore, 'trips'), [firestore]);

  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection(vRef);
  const { data: drivers, isLoading: isDriversLoading } = useCollection(dRef);
  const { data: trips, isLoading: isTripsLoading } = useCollection(tRef);

  const isLoading = isProfileLoading || isVehiclesLoading || isDriversLoading || isTripsLoading;

  const availableVehicles = useMemo(() => {
    return vehicles?.filter(v => v.status === 'Available') || [];
  }, [vehicles]);

  const availableDrivers = useMemo(() => {
    // BUSINESS RULE: Driver must be strictly "Available" (No Suspensions, No Expiries)
    return drivers?.filter(d => d.status === 'Available') || [];
  }, [drivers]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.driverId) {
      toast({ variant: "destructive", title: "Missing Assignment", description: "Please select both a vehicle and a driver." });
      return;
    }

    const vehicle = vehicles?.find(v => v.id === formData.vehicleId);
    const cargoWeight = Number(formData.cargoWeightKg) || 0;
    const vehicleLimit = vehicle?.maxCapacityKg || 0;
    
    if (cargoWeight <= 0) {
      toast({ variant: "destructive", title: "Invalid Cargo", description: "Cargo weight must be a positive number." });
      return;
    }

    if (cargoWeight > vehicleLimit) {
      toast({ 
        variant: "destructive", 
        title: "PAYLOAD OVERLOAD", 
        description: `Error: ${cargoWeight}kg exceeds ${vehicle?.name}'s limit of ${vehicleLimit}kg.`,
      });
      return;
    }

    setIsSubmitting(true);
    const tripId = `TRIP-${Math.floor(1000 + Math.random() * 9000)}`;
    const tripDocRef = doc(firestore, 'trips', tripId);

    try {
      setDocumentNonBlocking(tripDocRef, {
        id: tripId,
        vehicleId: formData.vehicleId,
        driverId: formData.driverId,
        cargoWeightKg: cargoWeight,
        origin: formData.origin,
        destination: formData.destination,
        revenue: 0,
        startOdometerKm: vehicle?.odometerKm || 0,
        status: 'Scheduled',
        dispatchDate: new Date().toISOString(),
        createdAt: serverTimestamp()
      }, { merge: true });

      updateDocumentNonBlocking(doc(firestore, 'vehicles', formData.vehicleId), { status: 'On Trip' });
      updateDocumentNonBlocking(doc(firestore, 'drivers', formData.driverId), { status: 'On Trip' });

      toast({ title: "Trip Scheduled", description: `${tripId} added to queue.` });
      setFormData({ vehicleId: '', driverId: '', cargoWeightKg: '', origin: '', destination: '' });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Dispatch Failed", description: "Ledger sync error." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const advanceStage = (trip: any) => {
    const currentIndex = TRACKING_STAGES.findIndex(s => s.id === trip.status);
    if (currentIndex < TRACKING_STAGES.length - 1) {
      const nextStage = TRACKING_STAGES[currentIndex + 1];
      const tripRef = doc(firestore, 'trips', trip.id);
      
      const updateData: any = { status: nextStage.id };
      
      if (nextStage.id === 'Completed') {
        updateData.completionDate = new Date().toISOString();
        updateDocumentNonBlocking(doc(firestore, 'vehicles', trip.vehicleId), { status: 'Available' });
        updateDocumentNonBlocking(doc(firestore, 'drivers', trip.driverId), { status: 'Available' });
      }

      updateDocumentNonBlocking(tripRef, updateData);
      toast({ title: "Status Updated", description: `Trip is now ${nextStage.label}.` });
    }
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
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Trip Command Center</h2>
          <p className="text-slate-500 font-medium">Precision Cargo Tracking & Real-Time Logistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="p-8 bg-slate-50 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search by ID or destination..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-slate-200 bg-white rounded-2xl font-medium shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Fleet Monitor
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 animate-spin text-primary/50" />
                <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Updating Trip States...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white border-b">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="w-[100px] h-16 pl-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Log Ref</TableHead>
                    <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Route Details</TableHead>
                    <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Cargo Lifecycle</TableHead>
                    <TableHead className="h-16 pr-8 text-right text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Command</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => {
                    const currentStageIndex = TRACKING_STAGES.findIndex(s => s.id === trip.status);
                    const isCompleted = trip.status === 'Completed';
                    const activeStage = TRACKING_STAGES[currentStageIndex];

                    return (
                      <TableRow key={trip.id} className="h-32 border-slate-50 hover:bg-slate-50/50 transition-all group">
                        <TableCell className="pl-8">
                          <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">{trip.id}</span>
                        </TableCell>
                        <TableCell className="min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/5 rounded-2xl text-primary shadow-sm border border-primary/10 group-hover:scale-110 transition-transform">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 leading-none flex flex-col text-sm uppercase tracking-tighter">
                                <span className="text-slate-400 text-[10px] font-bold">FROM</span>
                                {trip.origin}
                                <span className="text-slate-400 text-[10px] font-bold mt-1">TO</span>
                                {trip.destination}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                                  {trip.cargoWeightKg}KG
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[420px]">
                          <div className="relative flex items-center justify-between w-full pr-12">
                            <div className="absolute top-1/2 left-0 w-full h-[6px] bg-slate-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                              {!isCompleted && (
                                <div className="absolute top-0 h-full w-40 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-[scan_4s_linear_infinite]" />
                              )}
                            </div>
                            
                            <div 
                              className={cn(
                                "absolute top-1/2 left-0 h-[6px] transition-all duration-1000 ease-in-out -translate-y-1/2 z-10 rounded-full",
                                isCompleted ? "bg-emerald-500" : "bg-primary"
                              )}
                              style={{ 
                                width: `${(currentStageIndex / (TRACKING_STAGES.length - 1)) * 100}%`
                              }}
                            />
                            
                            {TRACKING_STAGES.map((stage, idx) => {
                              const StageIcon = stage.icon;
                              const isStageCompleted = idx < currentStageIndex;
                              const isStageActive = idx === currentStageIndex;
                              
                              return (
                                <div key={stage.id} className="relative z-20 flex flex-col items-center">
                                  <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 relative",
                                    isStageCompleted ? "bg-primary border-primary text-white shadow-lg" :
                                    isStageActive ? "bg-white border-primary text-primary shadow-xl" :
                                    "bg-white border-slate-200 text-slate-300"
                                  )}>
                                    <StageIcon className={cn("w-6 h-6 relative z-10")} />
                                  </div>
                                  
                                  <div className="absolute -bottom-10 flex flex-col items-center">
                                    <span className={cn(
                                      "whitespace-nowrap text-[9px] font-black uppercase tracking-tighter transition-all duration-500",
                                      isStageActive ? "text-primary scale-110" : "text-slate-300"
                                    )}>
                                      {stage.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          {!isCompleted ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => advanceStage(trip)}
                              className="h-11 rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white font-black text-[10px] uppercase tracking-widest transition-all px-5"
                            >
                              {activeStage?.actionLabel} <ArrowRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                          ) : (
                            <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-100">
                              <Zap className="w-3.5 h-3.5 fill-emerald-600" />
                              Cycle Verified
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden self-start">
          <CardHeader className="p-8 border-b bg-primary/5">
            <CardTitle className="text-2xl font-bold font-headline uppercase tracking-tighter text-primary">Deployment Hub</CardTitle>
            <CardDescription className="font-medium text-slate-500">Initiate new cargo lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleDispatch} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Select Ready Asset</Label>
                <Select value={formData.vehicleId} onValueChange={(val) => setFormData({...formData, vehicleId: val})}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder="Asset Identity" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {availableVehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} ({v.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Intended Payload (KG)</Label>
                <div className="relative">
                  <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="number" 
                    value={formData.cargoWeightKg} 
                    onChange={(e) => setFormData({...formData, cargoWeightKg: e.target.value})} 
                    className="rounded-2xl h-12 pl-12 bg-slate-50/50 border-slate-200" 
                    placeholder="e.g. 5000"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Assign Operator (Available & Valid)</Label>
                <Select value={formData.driverId} onValueChange={(val) => setFormData({...formData, driverId: val})}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder="Driver Name" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {availableDrivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.licenseCategory})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Origin</Label>
                  <Input value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="rounded-2xl h-12 bg-slate-50/50 border-slate-200" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Destination</Label>
                  <Input value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="rounded-2xl h-12 bg-slate-50/50 border-slate-200" required />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Confirm Dispatch"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
