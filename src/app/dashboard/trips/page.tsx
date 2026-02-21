
"use client";

import { useState } from 'react';
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
  Plus, 
  Filter, 
  ArrowUpDown, 
  Layers, 
  Loader2,
  ClipboardList,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function TripsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    cargoWeightKg: '',
    origin: '',
    destination: '',
    estimatedFuelCost: ''
  });

  // Role Verification
  const roleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'roles_fleetManagers', user.uid);
  }, [firestore, user]);
  const { data: roleDoc, isLoading: isRoleLoading } = useDoc(roleRef);

  // Collections
  const vehiclesRef = useMemoFirebase(() => (!user || !roleDoc) ? null : collection(firestore, 'vehicles'), [firestore, user, roleDoc]);
  const driversRef = useMemoFirebase(() => (!user || !roleDoc) ? null : collection(firestore, 'drivers'), [firestore, user, roleDoc]);
  const tripsRef = useMemoFirebase(() => (!user || !roleDoc) ? null : collection(firestore, 'trips'), [firestore, user, roleDoc]);

  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection(vehiclesRef);
  const { data: drivers, isLoading: isDriversLoading } = useCollection(driversRef);
  const { data: trips, isLoading: isTripsLoading } = useCollection(tripsRef);

  const isLoading = isRoleLoading || isVehiclesLoading || isDriversLoading || isTripsLoading;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripsRef || !formData.vehicleId || !formData.driverId) return;

    const vehicle = vehicles?.find(v => v.id === formData.vehicleId);
    const driver = drivers?.find(d => d.id === formData.driverId);

    // PRD Validation Logic
    if (Number(formData.cargoWeightKg) > (vehicle?.maxCapacityKg || 0)) {
      toast({
        variant: "destructive",
        title: "Overload Detected",
        description: `Cargo weight (${formData.cargoWeightKg}kg) exceeds vehicle capacity (${vehicle?.maxCapacityKg}kg).`
      });
      return;
    }

    if (driver?.status !== 'On Duty') {
      toast({
        variant: "destructive",
        title: "Driver Unavailable",
        description: "The selected driver is not currently On Duty."
      });
      return;
    }

    // 1. Create Trip
    const tripId = crypto.randomUUID();
    addDocumentNonBlocking(tripsRef, {
      id: tripId,
      ...formData,
      cargoWeightKg: Number(formData.cargoWeightKg),
      revenue: 0, // In a real app, this might be calculated
      startOdometerKm: vehicle?.odometerKm || 0,
      status: 'Dispatched',
      dispatchDate: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    // 2. Update Vehicle Status
    const vehicleRef = doc(firestore, 'vehicles', formData.vehicleId);
    updateDocumentNonBlocking(vehicleRef, { status: 'On Trip' });

    // 3. Update Driver Status
    const driverRef = doc(firestore, 'drivers', formData.driverId);
    updateDocumentNonBlocking(driverRef, { status: 'On Trip' });

    toast({
      title: "Trip Dispatched",
      description: "Asset and driver have been successfully deployed.",
    });

    setFormData({
      vehicleId: '',
      driverId: '',
      cargoWeightKg: '',
      origin: '',
      destination: '',
      estimatedFuelCost: ''
    });
  };

  const filteredTrips = trips?.filter(t => 
    t.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900">4. Trip Dispatcher &amp; Management</h2>
          <p className="text-slate-500">Coordinate dispatches and monitor active journeys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Trip List Section */}
        <Card className="xl:col-span-2 border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-6 bg-white border-b flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search bar ......" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl border-slate-200">Group by</Button>
              <Button variant="outline" className="rounded-xl border-slate-200">Filter</Button>
              <Button variant="outline" className="rounded-xl border-slate-200">Sort by...</Button>
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
                    <TableHead className="w-[80px] h-14 pl-8 text-xs font-bold uppercase text-slate-500">#</TableHead>
                    <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Trip Fleet Type</TableHead>
                    <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Origin</TableHead>
                    <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Destination</TableHead>
                    <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-slate-500">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip, index) => {
                    const vehicle = vehicles?.find(v => v.id === trip.vehicleId);
                    return (
                      <TableRow key={trip.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-8 font-medium text-slate-500">{index + 1}</TableCell>
                        <TableCell className="font-bold text-slate-900">{vehicle?.type || 'Standard'} {vehicle?.model}</TableCell>
                        <TableCell className="text-slate-700">{trip.origin}</TableCell>
                        <TableCell className="text-slate-700">{trip.destination}</TableCell>
                        <TableCell className="pr-8 text-right">
                          <Badge className={`rounded-full px-3 py-0.5 font-medium border-none ${
                            trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                            trip.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {trip.status === 'Dispatched' ? 'On way' : trip.status}
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
                <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No Active Trips</h3>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispatch Form Section */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-xl font-bold font-headline text-primary">New Trip Form</CardTitle>
            <CardDescription>Setup a new logistics deployment</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleDispatch} className="space-y-6">
              <div className="space-y-2">
                <Label>Select Vehicle:</Label>
                <Select 
                  value={formData.vehicleId} 
                  onValueChange={(val) => setFormData({...formData, vehicleId: val})}
                >
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder="Available Vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles?.filter(v => v.status === 'Available').map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.licensePlate} - {v.type} ({v.maxCapacityKg}kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cargo Weight (Kg):</Label>
                <Input 
                  type="number"
                  value={formData.cargoWeightKg}
                  onChange={(e) => setFormData({...formData, cargoWeightKg: e.target.value})}
                  className="rounded-xl h-11 border-slate-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Select Driver:</Label>
                <Select 
                  value={formData.driverId} 
                  onValueChange={(val) => setFormData({...formData, driverId: val})}
                >
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder="On Duty Drivers" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers?.filter(d => d.status === 'On Duty').map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.licenseCategory})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Origin Address:</Label>
                <Input 
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                  className="rounded-xl h-11 border-slate-200"
                  placeholder="e.g. Mumbai"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Destination:</Label>
                <Input 
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  className="rounded-xl h-11 border-slate-200"
                  placeholder="e.g. Pune"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Estimated Fuel Cost:</Label>
                <Input 
                  type="number"
                  value={formData.estimatedFuelCost}
                  onChange={(e) => setFormData({...formData, estimatedFuelCost: e.target.value})}
                  className="rounded-xl h-11 border-slate-200"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200"
              >
                Confirm &amp; Dispatch Trip
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
