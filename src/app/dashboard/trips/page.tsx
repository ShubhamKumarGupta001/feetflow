
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
  Truck
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Define the 4 tracking stages
const TRACKING_STAGES = [
  { id: 'Scheduled', label: 'Scheduled', color: 'bg-slate-200', icon: Clock },
  { id: 'Dispatched', label: 'Dispatched', color: 'bg-blue-500', icon: Navigation },
  { id: 'In Transit', label: 'In Transit', color: 'bg-amber-500', icon: Truck },
  { id: 'Completed', label: 'Delivered', color: 'bg-emerald-500', icon: CheckCircle2 },
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
      const { dismiss } = toast({ 
        variant: "destructive", 
        title: "PAYLOAD OVERLOAD DETECTED", 
        description: `CRITICAL ERROR: The entered cargo weight (${cargoWeight}kg) exceeds the ${vehicle?.name}'s maximum support limit of ${vehicleLimit}kg. This dispatch has been blocked for safety.` 
      });
      setTimeout(() => dismiss(), 20000);
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
        status: 'Scheduled', // Initial stage
        dispatchDate: new Date().toISOString(),
        createdAt: serverTimestamp()
      }, { merge: true });

      const vehicleRef = doc(firestore, 'vehicles', formData.vehicleId);
      updateDocumentNonBlocking(vehicleRef, { status: 'On Trip' });

      const driverRef = doc(firestore, 'drivers', formData.driverId);
      updateDocumentNonBlocking(driverRef, { status: 'On Trip' });

      toast({ title: "Trip Scheduled", description: `${tripId} has been added to the queue.` });
      setFormData({ vehicleId: '', driverId: '', cargoWeightKg: '', origin: '', destination: '' });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Dispatch Failed", description: "There was a problem syncing with the fleet ledger." });
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
      
      // If completed, free up the vehicle and driver
      if (nextStage.id === 'Completed') {
        updateData.completionDate = new Date().toISOString();
        
        const vehicleRef = doc(firestore, 'vehicles', trip.vehicleId);
        updateDocumentNonBlocking(vehicleRef, { status: 'Available' });

        const driverRef = doc(firestore, 'drivers', trip.driverId);
        updateDocumentNonBlocking(driverRef, { status: 'Available' });
      }

      updateDocumentNonBlocking(tripRef, updateData);
      toast({ title: "Tracking Updated", description: `Trip ${trip.id} is now ${nextStage.label}.` });
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
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Trip Command</h2>
          <p className="text-slate-500 font-medium">4-Stage Cargo Tracking & Asset Coordination</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
                    <TableHead className="w-[100px] h-14 pl-8 text-xs font-bold uppercase text-slate-400">ID</TableHead>
                    <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Route Map</TableHead>
                    <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Tracking Progress</TableHead>
                    <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => {
                    const currentStageIndex = TRACKING_STAGES.findIndex(s => s.id === trip.status);
                    const isCompleted = trip.status === 'Completed';

                    return (
                      <TableRow key={trip.id} className="h-20 border-slate-100 hover:bg-slate-50/50 transition-colors group">
                        <TableCell className="pl-8 font-black text-primary/70 text-xs">{trip.id}</TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">{trip.origin} → {trip.destination}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Weight: {trip.cargoWeightKg}kg</div>
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <div className="flex items-center gap-1 mb-2">
                            {TRACKING_STAGES.map((stage, idx) => (
                              <div 
                                key={stage.id} 
                                className={cn(
                                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                                  idx <= currentStageIndex ? stage.color : "bg-slate-100"
                                )}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500">
                              {TRACKING_STAGES[currentStageIndex]?.label || trip.status}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300">
                              Stage {currentStageIndex + 1}/4
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          {!isCompleted ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => advanceStage(trip)}
                              className="h-8 rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white font-bold text-[10px] uppercase tracking-widest"
                            >
                              Next Stage <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold uppercase text-[10px] tracking-widest px-3">
                              Delivered
                            </Badge>
                          )}
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

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b bg-primary/5">
            <CardTitle className="text-xl font-bold font-headline uppercase tracking-tighter text-primary">Deployment Hub</CardTitle>
            <CardDescription className="font-medium text-slate-500">Start new tracking lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleDispatch} className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Available Asset:</Label>
                <Select value={formData.vehicleId} onValueChange={(val) => setFormData({...formData, vehicleId: val})}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder={isVehiclesLoading ? "Loading Fleet..." : "Select Cargo Carrier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.length > 0 ? (
                      availableVehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.licensePlate} ({v.model}) - Max: {v.maxCapacityKg}kg
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        <AlertCircle className="w-4 h-4 mx-auto mb-2 opacity-50" />
                        No available assets. Check registry.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Weight className="w-4 h-4 text-slate-400" />
                  <Label className="font-bold text-slate-700">Cargo Weight (KG):</Label>
                </div>
                <Input 
                  type="number" 
                  value={formData.cargoWeightKg} 
                  onChange={(e) => setFormData({...formData, cargoWeightKg: e.target.value})} 
                  className="rounded-xl h-11" 
                  placeholder="Enter intended payload"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Verified Operator:</Label>
                <Select value={formData.driverId} onValueChange={(val) => setFormData({...formData, driverId: val})}>
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder={isDriversLoading ? "Loading Roster..." : "Assign Certified Driver"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.length > 0 ? (
                      availableDrivers.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name} ({d.licenseCategory})</SelectItem>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        <AlertCircle className="w-4 h-4 mx-auto mb-2 opacity-50" />
                        No operators on duty.
                      </div>
                    )}
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

              <Button 
                type="submit" 
                disabled={isVehiclesLoading || isDriversLoading || isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Navigation className="w-5 h-5 mr-2" /> Confirm Dispatch</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
