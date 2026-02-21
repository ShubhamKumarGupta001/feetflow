
"use client";

import { useState, useMemo } from 'react';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useUser,
  useDoc
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  X, 
  Layers, 
  Loader2,
  Truck,
  Pencil
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

/**
 * Vehicle Registry Module
 * Central asset database where fleet managers manage the lifecycle of vehicles.
 * Now supports real-time editing of asset details and operational status.
 */
export default function VehiclesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    licensePlate: '',
    maxCapacityKg: '',
    odometerKm: '',
    type: '',
    model: '',
    name: '',
    status: 'Available'
  });

  // 1. Authorization Gating
  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  const canManage = userProfile?.roleId === 'fleet-manager';

  // 2. Real-time Subscription to Vehicle Assets
  const vehiclesRef = useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]);
  const { data: vehicles, isLoading: isCollectionLoading } = useCollection(vehiclesRef);

  const isLoading = isProfileLoading || isCollectionLoading;

  // 3. Search Filter Logic
  const filteredVehicles = useMemo(() => {
    return vehicles?.filter(v => 
      v.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [vehicles, searchTerm]);

  // 4. Open Modal for Edit
  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate || '',
      maxCapacityKg: vehicle.maxCapacityKg?.toString() || '',
      odometerKm: vehicle.odometerKm?.toString() || '',
      type: vehicle.type || '',
      model: vehicle.model || '',
      name: vehicle.name || '',
      status: vehicle.status || 'Available'
    });
    setIsModalOpen(true);
  };

  // 5. Reset Form
  const resetForm = () => {
    setFormData({ licensePlate: '', maxCapacityKg: '', odometerKm: '', type: '', model: '', name: '', status: 'Available' });
    setEditingVehicle(null);
  };

  // 6. Mutation: Save (Create or Update) Asset
  const handleSave = () => {
    if (!formData.licensePlate || !formData.model) {
      toast({ variant: "destructive", title: "Validation Error", description: "Plate and Model are required." });
      return;
    }

    if (editingVehicle) {
      // Update existing document
      const docRef = doc(firestore, 'vehicles', editingVehicle.id);
      updateDocumentNonBlocking(docRef, {
        licensePlate: formData.licensePlate.toUpperCase(),
        maxCapacityKg: Number(formData.maxCapacityKg),
        odometerKm: Number(formData.odometerKm),
        type: formData.type,
        model: formData.model,
        name: formData.name || `Asset-${formData.licensePlate}`,
        status: formData.status
      });
      toast({ title: "Asset Updated", description: `${formData.licensePlate} details have been refreshed.` });
    } else {
      // Create new document
      const vehicleId = formData.licensePlate.toUpperCase();
      const vehicleName = formData.name || `Asset-${formData.licensePlate}`;

      addDocumentNonBlocking(vehiclesRef, {
        id: vehicleId,
        ...formData,
        name: vehicleName,
        licensePlate: formData.licensePlate.toUpperCase(),
        maxCapacityKg: Number(formData.maxCapacityKg),
        odometerKm: Number(formData.odometerKm),
        acquisitionCost: 0,
        status: 'Available',
        region: 'Central',
      });
      toast({ title: "Asset Registered", description: `${vehicleName} added to inventory.` });
    }

    resetForm();
    setIsModalOpen(false);
  };

  // 7. Mutation: Retire Asset
  const handleDelete = (id: string) => {
    const docRef = doc(firestore, 'vehicles', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Asset Retired", description: "The vehicle has been removed from active inventory." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Fleet Registry</h2>
          <p className="text-slate-500 font-medium">Global Asset Inventory & Lifecycle Tracking</p>
        </div>
        
        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="rounded-xl bg-primary shadow-lg shadow-primary/20 h-11 px-6 font-bold">
                <Plus className="w-5 h-5 mr-2" /> Register Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold font-headline uppercase tracking-tighter">
                  {editingVehicle ? 'Modify Asset' : 'New Asset Intake'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="plate" className="font-bold text-slate-700">License Plate#</Label>
                  <Input 
                    id="plate" 
                    placeholder="e.g. ABC-1234"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                    className="rounded-xl h-11" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="font-bold text-slate-700">Asset Type</Label>
                    <Input id="type" placeholder="Truck, Van, etc." value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="rounded-xl h-11" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model" className="font-bold text-slate-700">Model/Year</Label>
                    <Input id="model" placeholder="Scania R500" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="rounded-xl h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payload" className="font-bold text-slate-700">Max Payload (kg)</Label>
                    <Input id="payload" type="number" value={formData.maxCapacityKg} onChange={(e) => setFormData({...formData, maxCapacityKg: e.target.value})} className="rounded-xl h-11" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="odometer" className="font-bold text-slate-700">Odometer (km)</Label>
                    <Input id="odometer" type="number" value={formData.odometerKm} onChange={(e) => setFormData({...formData, odometerKm: e.target.value})} className="rounded-xl h-11" />
                  </div>
                </div>
                {editingVehicle && (
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700">Operational Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="On Trip">On Trip</SelectItem>
                        <SelectItem value="In Shop">In Shop</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 rounded-xl h-11 font-bold">
                  {editingVehicle ? 'Update Asset' : 'Save Asset'}
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl h-11 font-bold text-destructive hover:bg-destructive/5 border-destructive">Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 bg-white border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by plate, model, or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl font-medium"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest"><Layers className="w-4 h-4 mr-2" /> Group</Button>
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              <p className="mt-4 text-slate-500 font-bold">Synchronizing Assets...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="w-[80px] h-14 pl-8 text-xs font-bold uppercase text-slate-400 tracking-widest">Index</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400 tracking-widest">Plate#</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400 tracking-widest">Specification</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400 tracking-widest text-center">Payload</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400 tracking-widest">Usage</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400 tracking-widest text-center">Status</TableHead>
                  <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-slate-400 tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="pl-8 font-bold text-slate-400">{index + 1}</TableCell>
                    <TableCell className="font-black text-slate-900">{vehicle.licensePlate}</TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-700">{vehicle.model}</div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase">{vehicle.type}</div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-600">{vehicle.maxCapacityKg?.toLocaleString()} KG</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">{vehicle.odometerKm?.toLocaleString()} KM</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`rounded-full px-3 py-0.5 font-bold border-none ${
                        vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                        vehicle.status === 'On Trip' ? 'bg-blue-100 text-blue-700' : 
                        vehicle.status === 'In Shop' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(vehicle)}
                            className="hover:bg-primary/5 text-slate-300 hover:text-primary rounded-full h-8 w-8 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(vehicle.id)}
                            className="hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full h-8 w-8 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredVehicles.length === 0 && (
            <div className="py-24 text-center">
              <Truck className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 font-headline uppercase tracking-tighter">No Assets Found</h3>
              <p className="text-slate-400 mt-2 font-medium">Add your first vehicle to begin tracking your logistics fleet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
