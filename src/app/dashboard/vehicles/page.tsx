
"use client";

import { useState } from 'react';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  addDocumentNonBlocking,
  deleteDocumentNonBlocking
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  X, 
  Layers, 
  Loader2,
  Truck
} from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function VehiclesPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    licensePlate: '',
    maxCapacityKg: '',
    odometerKm: '',
    type: '',
    model: '',
    name: ''
  });

  // Fetch Vehicles
  const vehiclesRef = useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]);
  const { data: vehicles, isLoading } = useCollection(vehiclesRef);

  const filteredVehicles = vehicles?.filter(v => 
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSave = () => {
    if (!formData.licensePlate || !formData.model) return;

    // Use name as license plate if not provided, for user convenience
    const vehicleName = formData.name || `Vehicle-${formData.licensePlate}`;

    addDocumentNonBlocking(vehiclesRef, {
      ...formData,
      name: vehicleName,
      maxCapacityKg: Number(formData.maxCapacityKg),
      odometerKm: Number(formData.odometerKm),
      acquisitionCost: 0, // Default for now
      status: 'Available',
      region: 'Central', // Default for now
    });

    // Reset and Close
    setFormData({
      licensePlate: '',
      maxCapacityKg: '',
      odometerKm: '',
      type: '',
      model: '',
      name: ''
    });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const docRef = doc(firestore, 'vehicles', id);
    deleteDocumentNonBlocking(docRef);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900">Vehicle Registry</h2>
          <p className="text-slate-500">Asset Management & Tracking</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 h-11 px-6">
              <Plus className="w-5 h-5 mr-2" /> New Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-headline">New Vehicle Registration</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="plate">License Plate:</Label>
                <Input 
                  id="plate" 
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  className="rounded-xl" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payload">Max Payload (kg):</Label>
                <Input 
                  id="payload" 
                  type="number"
                  value={formData.maxCapacityKg}
                  onChange={(e) => setFormData({...formData, maxCapacityKg: e.target.value})}
                  className="rounded-xl" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="odometer">Initial Odometer (km):</Label>
                <Input 
                  id="odometer" 
                  type="number"
                  value={formData.odometerKm}
                  onChange={(e) => setFormData({...formData, odometerKm: e.target.value})}
                  className="rounded-xl" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type:</Label>
                <Input 
                  id="type" 
                  placeholder="e.g. Mini, Truck, Van"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="rounded-xl" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">Model:</Label>
                <Input 
                  id="model" 
                  placeholder="e.g. Scania 2017"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="rounded-xl" 
                />
              </div>
            </div>
            <DialogFooter className="flex gap-3 sm:justify-center">
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-primary hover:bg-primary/90 rounded-xl h-11"
              >
                Save
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl h-11 border-destructive text-destructive hover:bg-destructive/5"
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-6 bg-white border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search bar ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-slate-200">
              <Layers className="w-4 h-4 mr-2" /> Group by
            </Button>
            <Button variant="outline" className="rounded-xl border-slate-200">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button variant="outline" className="rounded-xl border-slate-200">
              Sort by <ArrowUpDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              <p className="mt-4 text-slate-500 font-medium">Loading fleet assets...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="w-[80px] h-14 pl-8 text-xs font-bold uppercase text-slate-500">NO</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Plate</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Model</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Type</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Payload</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Odometer</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Status</TableHead>
                  <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-8 font-medium text-slate-500">{index + 1}</TableCell>
                    <TableCell className="font-bold text-slate-900">{vehicle.licensePlate}</TableCell>
                    <TableCell className="text-slate-700">{vehicle.model}</TableCell>
                    <TableCell className="text-slate-700">{vehicle.type}</TableCell>
                    <TableCell className="text-slate-700">{vehicle.maxCapacityKg} kg</TableCell>
                    <TableCell className="text-slate-700 font-mono">{vehicle.odometerKm.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`rounded-full px-3 py-0.5 font-medium border-none ${
                        vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                        vehicle.status === 'On Trip' ? 'bg-blue-100 text-blue-700' : 
                        vehicle.status === 'In Shop' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {vehicle.status === 'Available' ? 'Idle' : vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(vehicle.id)}
                        className="hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredVehicles.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Vehicles Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Try adjusting your search or add your first vehicle to the fleet registry.</p>
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 rounded-xl border-primary text-primary"
              >
                Add Your First Vehicle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
