
"use client";

import { useState } from 'react';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  setDocumentNonBlocking,
  deleteDocumentNonBlocking,
  useUser,
  useDoc
} from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
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
  Loader2,
  Users,
  ShieldAlert,
  Pencil,
  X,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function PerformancePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    licenseCategory: 'Class A',
    licenseExpiryDate: '',
    safetyScore: '100',
    totalTrips: '0',
    completedTrips: '0',
    status: 'On Duty'
  });

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  const canManage = userProfile?.roleId === 'fleet-manager' || userProfile?.roleId === 'safety-officer';

  const driversRef = useMemoFirebase(() => collection(firestore, 'drivers'), [firestore]);
  const { data: drivers, isLoading: isDriversLoading } = useCollection(driversRef);

  const isLoading = isProfileLoading || isDriversLoading;

  const handleEdit = (driver: any) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || '',
      licenseCategory: driver.licenseCategory || 'Class A',
      licenseExpiryDate: driver.licenseExpiryDate || '',
      safetyScore: driver.safetyScore?.toString() || '100',
      totalTrips: driver.totalTrips?.toString() || '0',
      completedTrips: driver.completedTrips?.toString() || '0',
      status: driver.status || 'On Duty'
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      licenseCategory: 'Class A',
      licenseExpiryDate: '',
      safetyScore: '100',
      totalTrips: '0',
      completedTrips: '0',
      status: 'On Duty'
    });
    setEditingDriver(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.licenseExpiryDate) {
      toast({ variant: "destructive", title: "Missing Data", description: "Name and License Expiry are required." });
      return;
    }

    const driverId = editingDriver?.id || formData.name.toLowerCase().replace(/\s+/g, '-');
    const expiryDate = new Date(formData.licenseExpiryDate);
    const isExpired = expiryDate < new Date();

    const total = Number(formData.totalTrips) || 0;
    const completed = Number(formData.completedTrips) || 0;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    // Use formData.status directly so that the Manager's manual choice 
    // is not overridden by the system's expiry check.
    setDocumentNonBlocking(doc(firestore, 'drivers', driverId), {
      id: driverId,
      name: formData.name,
      licenseCategory: formData.licenseCategory,
      licenseExpiryDate: formData.licenseExpiryDate,
      safetyScore: Number(formData.safetyScore),
      totalTrips: total,
      completedTrips: completed,
      completionRate: rate,
      status: formData.status, 
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast({
      title: editingDriver ? "Profile Updated" : "Driver Registered",
      description: isExpired 
        ? "Warning: Driver has an expired license but was saved with selected status." 
        : "Personnel record synchronized successfully.",
    });

    resetForm();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'drivers', id));
    toast({ title: "Profile Deleted", description: "Driver has been removed from the roster." });
  };

  const filteredDrivers = drivers?.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Driver Roster & Performance</h2>
          <p className="text-slate-500 font-medium italic">Comprehensive Personnel Registry & Compliance Tracking</p>
        </div>

        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold text-lg">
                <UserPlus className="w-5 h-5 mr-2" /> Onboard New Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold font-headline uppercase tracking-tighter text-primary">
                  {editingDriver ? 'Edit Profile' : 'Personnel Intake'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Full Name</Label>
                  <Input 
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl h-12 bg-slate-50 font-bold border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">License Category</Label>
                    <Select value={formData.licenseCategory} onValueChange={(val) => setFormData({...formData, licenseCategory: val})}>
                      <SelectTrigger className="rounded-xl h-12 border-slate-200">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class A">Class A (Heavy)</SelectItem>
                        <SelectItem value="Class B">Class B (Van)</SelectItem>
                        <SelectItem value="Class C">Class C (Small)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Expiry Date</Label>
                    <Input 
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                      className="rounded-xl h-12 border-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Safety Score (%)</Label>
                    <Input 
                      type="number"
                      value={formData.safetyScore}
                      onChange={(e) => setFormData({...formData, safetyScore: e.target.value})}
                      className="rounded-xl h-12 border-slate-200"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Current Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                      <SelectTrigger className="rounded-xl h-12 border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On Duty">On Duty</SelectItem>
                        <SelectItem value="Off Duty">Off Duty</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {formData.licenseExpiryDate && new Date(formData.licenseExpiryDate) < new Date() && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Warning: License is expired. Confirm status manually.
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 rounded-2xl h-14 font-bold text-lg shadow-xl shadow-primary/20">
                  {editingDriver ? 'Save Profile' : 'Complete Onboarding'}
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl h-14 font-bold text-destructive hover:bg-destructive/5 border-destructive border-2">Discard</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wider">Restricted View: Personnel management is reserved for Fleet Managers and Safety Officers.</p>
        </div>
      )}

      <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 bg-white border-b flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search by driver name or license..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-slate-200 bg-slate-50 rounded-2xl focus:ring-primary/20 transition-all font-medium text-slate-900"
            />
          </div>
          <div className="flex gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            {drivers?.length || 0} Total Active Personnel
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 border-b">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-16 pl-8 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Operator Identity</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">License Class</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Valid Until</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Safety Score</TableHead>
                  <TableHead className="h-16 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-center">Completion</TableHead>
                  <TableHead className="h-16 pr-8 text-right text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => {
                  const isExpired = new Date(driver.licenseExpiryDate) < new Date();
                  return (
                    <TableRow key={driver.id} className="h-20 border-slate-100 hover:bg-slate-50 transition-all group">
                      <TableCell className="pl-8">
                        <div className="font-black text-slate-900 text-lg tracking-tighter">{driver.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{driver.id}</div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">{driver.licenseCategory}</TableCell>
                      <TableCell className={`font-mono text-xs font-bold flex items-center gap-1 ${isExpired ? 'text-destructive' : 'text-slate-600'}`}>
                        {driver.licenseExpiryDate}
                        {isExpired && <AlertTriangle className="w-3 h-3" />}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-black text-lg ${driver.safetyScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {driver.safetyScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-900">
                        {Math.round(driver.completionRate || 0)}%
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Badge className={`rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest border-none shadow-sm ${
                            driver.status === 'On Duty' ? 'bg-emerald-100 text-emerald-700' : 
                            driver.status === 'Suspended' ? 'bg-red-100 text-red-700' : 
                            driver.status === 'Available' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {driver.status}
                          </Badge>
                          {canManage && (
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(driver)} className="h-8 w-8 text-primary rounded-lg hover:bg-primary/10">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(driver.id)} className="h-8 w-8 text-destructive rounded-lg hover:bg-destructive/10">
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredDrivers.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center justify-center">
              <Users className="w-16 h-16 text-slate-100 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 font-headline uppercase tracking-tighter">No Drivers Onboarded</h3>
              <p className="text-slate-400 mt-2 font-medium">Add your first driver to the roster to begin trip dispatching.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
