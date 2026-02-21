
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
  AlertCircle,
  Weight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Define the 4 tracking stages with professional styling
const TRACKING_STAGES = [
  { id: 'Scheduled', label: 'Scheduled', color: 'bg-slate-400', icon: Clock, actionLabel: 'Launch Dispatch' },
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
    return drivers?.filter(d => d.status === 'On Duty' || d.status === 'Available') || [];
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
        duration: 20000,
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

      toast({ title: "Trip Scheduled", description: `${tripId} has been added to the queue.` });
      setFormData({ vehicleId: '', driverId: '', cargoWeightKg: '', origin: '', destination: '' });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Dispatch Failed", description: "Could not sync with the ledger." });
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
          <p className="text-slate-500 font-medium">Precision Cargo Tracking & Real-Time Logistics Lifecycle</p>
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
                      <TableRow key={trip.id} className="h-28 border-slate-50 hover:bg-slate-50/50 transition-all group">
                        <TableCell className="pl-8">
                          <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">{trip.id}</span>
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/5 rounded-2xl text-primary shadow-sm border border-primary/10">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-black text-slate-900 leading-none flex items-center gap-1.5 text-sm">
                                {trip.origin} <ChevronRight className="w-3 h-3 text-slate-300" /> {trip.destination}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                                  {trip.cargoWeightKg}KG
                                </span>
                                {isCompleted && (
                                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[320px]">
                          <div className="relative flex items-center justify-between w-full pr-4">
                            {/* The background track line */}
                            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
                            {/* The progress line */}
                            <div 
                              className="absolute top-1/2 left-0 h-[3px] bg-primary transition-all duration-700 -translate-y-1/2 z-0 rounded-full" 
                              style={{ width: `${(currentStageIndex / (TRACKING_STAGES.length - 1)) * 100}%` }}
                            />
                            
                            {TRACKING_STAGES.map((stage, idx) => {
                              const StageIcon = stage.icon;
                              const isStageCompleted = idx < currentStageIndex;
                              const isStageActive = idx === currentStageIndex;
                              
                              return (
                                <div key={stage.id} className="relative z-10 flex flex-col items-center">
                                  <div className={cn(
                                    "w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                                    isStageCompleted ? "bg-primary border-primary text-white shadow-md" :
                                    isStageActive ? "bg-white border-primary text-primary shadow-lg scale-110 ring-4 ring-primary/5" :
                                    "bg-white border-slate-200 text-slate-300"
                                  )}>
                                    <StageIcon className={cn("w-4 h-4", isStageActive && "animate-pulse")} />
                                  </div>
                                  <span className={cn(
                                    "absolute -bottom-6 whitespace-nowrap text-[9px] font-black uppercase tracking-tighter transition-colors",
                                    isStageActive ? "text-primary" : isStageCompleted ? "text-slate-600" : "text-slate-300"
                                  )}>
                                    {stage.label}
                                  </span>
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
                              className="h-10 rounded-xl border-primary/20 text-primary hover:bg-primary hover:text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 px-4 group/btn"
                            >
                              {activeStage?.actionLabel} <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                          ) : (
                            <div className="flex items-center justify-end gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] bg-emerald-50 px-4 py-2 rounded-xl">
                              <Zap className="w-3 h-3 fill-emerald-600" />
                              Cycle Complete
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {!isLoading && filteredTrips.length === 0 && (
              <div className="py-32 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <ClipboardList className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-headline uppercase tracking-tighter">No Active Deployments</h3>
                <p className="text-slate-400 mt-2 font-medium max-w-xs mx-auto text-sm">Initiate your first cargo lifecycle in the Deployment Hub.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden self-start">
          <CardHeader className="p-8 border-b bg-primary/5">
            <CardTitle className="text-2xl font-bold font-headline uppercase tracking-tighter text-primary">Deployment Hub</CardTitle>
            <CardDescription className="font-medium text-slate-500">Initiate new cargo tracking lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleDispatch} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Select Ready Asset</Label>
                <Select value={formData.vehicleId} onValueChange={(val) => setFormData({...formData, vehicleId: val})}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder={isVehiclesLoading ? "Syncing Fleet..." : "Asset Identity"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {availableVehicles.length > 0 ? (
                      availableVehicles.map(v => (
                        <SelectItem key={v.id} value={v.id} className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{v.name} ({v.licensePlate})</span>
                            <span className="text-[10px] text-slate-400 uppercase font-black">Limit: {v.maxCapacityKg}KG</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 italic">No available assets.</div>
                    )}
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
                <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Assign Operator</Label>
                <Select value={formData.driverId} onValueChange={(val) => setFormData({...formData, driverId: val})}>
                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-slate-50/50">
                    <SelectValue placeholder={isDriversLoading ? "Syncing Roster..." : "Driver Name"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {availableDrivers.length > 0 ? (
                      availableDrivers.map(d => (
                        <SelectItem key={d.id} value={d.id} className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{d.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-black">{d.licenseCategory} Certified</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 italic">No drivers on duty.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Origin</Label>
                  <Input value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} className="rounded-2xl h-12 bg-slate-50/50 border-slate-200" placeholder="Source Hub" required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Destination</Label>
                  <Input value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} className="rounded-2xl h-12 bg-slate-50/50 border-slate-200" placeholder="Target Point" required />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isVehiclesLoading || isDriversLoading || isSubmitting}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95 group"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Navigation className="w-5 h-5 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    Confirm Dispatch
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

