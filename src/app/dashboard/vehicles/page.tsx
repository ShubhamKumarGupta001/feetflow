
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
  Pencil,
  ShieldAlert
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

/**
 * Vehicle Registry Module
 * Central asset database where fleet managers manage the lifecycle of vehicles.
 * Supports real-time editing of asset details and operational status.
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
      toast({ title: "Asset Updated", description: `${formData.licensePlate} specs have been successfully modified.` });
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Fleet Registry</h2>
          <p className="text-slate-500 font-medium italic">Global Asset Inventory & Lifecycle Command</p>
        </div>
        
        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold text-lg">
                <Plus className="w-5 h-5 mr-2" /> Register New Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold font-headline uppercase tracking-tighter text-primary">
                  {editingVehicle ? 'Edit Asset Specifications' : 'Asset Intake Protocol'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="plate" className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">License Plate Number</Label>
                  <Input 
                    id="plate" 
                    placeholder="e.g. ABC-1234"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                    className="rounded-xl h-12 bg-slate-50 font-mono text-lg border-slate-200" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Asset Category</Label>
                    <Input id="type" placeholder="Truck, Van, etc." value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="rounded-xl h-12 border-slate-200" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model" className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Model Identity</Label>
                    <Input id="model" placeholder="Scania R500" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="rounded-xl h-12 border-slate-200" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="payload" className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Payload Capacity (kg)</Label>
                    <Input id="payload" type="number" value={formData.maxCapacityKg} onChange={(e) => setFormData({...formData, maxCapacityKg: e.target.value})} className="rounded-xl h-12 border-slate-200" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="odometer" className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Odometer Reading (km)</Label>
                    <Input id="odometer" type="number" value={formData.odometerKm} onChange={(e) => setFormData({...formData, odometerKm: e.target.value})} className="rounded-xl h-12 border-slate-200" />
                  </div>
                </div>
                {editingVehicle && (
                  <div className="grid gap-2 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <Label className="font-bold text-primary uppercase text-[10px] tracking-widest mb-2">Operational State</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                      <SelectTrigger className="rounded-xl h-12 bg-white border-primary/20 shadow-sm">
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
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 rounded-2xl h-14 font-bold text-lg shadow-xl shadow-primary/20">
                  {editingVehicle ? 'Update Specification' : 'Finalize Registration'}
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl h-14 font-bold text-destructive hover:bg-destructive/5 border-destructive border-2">Discard Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wider">Restricted View: Only Fleet Managers can perform Asset Modifications or Retrials.</p>
        </div>
      )}

      <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 bg-white border-b flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search by license plate or model..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-slate-200 bg-slate-50 rounded-2xl focus:ring-primary/20 transition-all font-medium text-slate-900"
            />
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white font-bold text-xs uppercase tracking-[0.2em] px-6 text-slate-500">
              <Layers className="w-4 h-4 mr-2" /> Grouping
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white font-bold text-xs uppercase tracking-[0.2em] px-6 text-slate-500">
              <Filter className="w-4 h-4 mr-2" /> Filtration
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
              <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Fleet Data</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 border-b">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[80px] h-16 pl-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">#</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Plate Reference</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Asset Specifications</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Payload Limit</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Odometer (KM)</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Operational Status</TableHead>
                  <TableHead className="h-16 pr-8 text-right text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Management Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.id} className="h-20 border-slate-100 hover:bg-slate-50 transition-all group">
                    <TableCell className="pl-8 font-bold text-slate-300 group-hover:text-primary transition-colors">{index + 1}</TableCell>
                    <TableCell className="font-black text-slate-900 text-lg tracking-tighter">{vehicle.licensePlate}</TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-800 leading-none">{vehicle.model}</div>
                      <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{vehicle.type}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                        {vehicle.maxCapacityKg?.toLocaleString()} KG
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {vehicle.odometerKm?.toLocaleString()} KM
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border-none shadow-sm ${
                        vehicle.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                        vehicle.status === 'On Trip' ? 'bg-blue-100 text-blue-700' : 
                        vehicle.status === 'In Shop' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      {canManage ? (
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(vehicle)}
                            className="text-primary hover:bg-primary/10 rounded-2xl h-10 w-10 transition-all active:scale-90"
                            title="Edit Specification"
                          >
                            <Pencil className="w-5 h-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(vehicle.id)}
                            className="text-destructive hover:bg-destructive/10 rounded-2xl h-10 w-10 transition-all active:scale-90"
                            title="Retire Asset"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Locked</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredVehicles.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Truck className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-headline uppercase tracking-tighter">Inventory Isolated</h3>
              <p className="text-slate-400 mt-2 font-medium max-w-xs mx-auto">No assets match your current search parameters. Clear filters to see full inventory.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
