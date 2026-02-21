
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
import { cn } from '@/lib/utils';

/**
 * Driver Roster & Performance Module
 * Manages personnel records and enforces license compliance rules.
 * Status logic: Expired License -> Suspended | Valid License -> Available
 */
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
    status: 'Available'
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
      status: driver.status || 'Available'
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
      status: 'Available'
    });
    setEditingDriver(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.licenseExpiryDate) {
      toast({ variant: "destructive", title: "Missing Data", description: "Name and License Expiry are required." });
      return;
    }

    const driverId = editingDriver?.id || formData.name.toLowerCase().replace(/\s+/g, '-');
    
    // License Compliance Calculation
    const expiryDate = new Date(formData.licenseExpiryDate);
    const now = new Date();
    // Reset time for date-only comparison
    now.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const isExpired = expiryDate < now;

    // BUSINESS RULE: If expired -> Suspended. If future date -> Available.
    const finalStatus = isExpired ? 'Suspended' : 'Available';

    const total = Number(formData.totalTrips) || 0;
    const completed = Number(formData.completedTrips) || 0;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    setDocumentNonBlocking(doc(firestore, 'drivers', driverId), {
      id: driverId,
      name: formData.name,
      licenseCategory: formData.licenseCategory,
      licenseExpiryDate: formData.licenseExpiryDate,
      safetyScore: Number(formData.safetyScore),
      totalTrips: total,
      completedTrips: completed,
      completionRate: rate,
      status: finalStatus, 
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast({
      title: isExpired ? "Action Required" : "Profile Synced",
      variant: isExpired ? "destructive" : "default",
      description: isExpired 
        ? `Compliance Violation: Driver "${formData.name}" has been Suspended due to an expired license.` 
        : `Personnel record synchronized. Status set to "${finalStatus}".`,
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
          <p className="text-slate-500 font-medium italic">Compliance-First Personnel Registry</p>
        </div>

        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold text-lg transition-all active:scale-95">
                <UserPlus className="w-5 h-5 mr-2" /> Onboard New Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-8 bg-white">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold font-headline uppercase tracking-tighter text-primary">
                  {editingDriver ? 'Edit Profile' : 'Personnel Intake'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6 font-body">
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">Full Name</Label>
                  <Input 
                    placeholder="e.g. Rudra"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl h-12 bg-slate-50 font-bold border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">License Category</Label>
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
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">Expiry Date</Label>
                    <Input 
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                      className={cn(
                        "rounded-xl h-12 border-slate-200",
                        formData.licenseExpiryDate && new Date(formData.licenseExpiryDate) < new Date() && "border-red-500 text-red-600 bg-red-50"
                      )}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">Safety Score (%)</Label>
                  <Input 
                    type="number"
                    value={formData.safetyScore}
                    onChange={(e) => setFormData({...formData, safetyScore: e.target.value})}
                    className="rounded-xl h-12 border-slate-200"
                  />
                </div>
                
                {formData.licenseExpiryDate && new Date(formData.licenseExpiryDate) < new Date() && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold animate-pulse">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="uppercase tracking-widest text-[9px] mb-1">Status Restriction Applied</p>
                      <p>Saving with this date will automatically mark the driver as <strong>SUSPENDED</strong>.</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 rounded-2xl h-14 font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 font-headline">
                  {editingDriver ? 'Update Roster' : 'Complete Intake'}
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-2xl h-14 font-bold text-destructive hover:bg-red-50 border-destructive border-2 font-headline uppercase text-xs tracking-widest">Discard</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManage && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-4 text-amber-800 shadow-sm">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Compliance View: Only Authorized Personnel (Safety/Manager) can modify driver status or license records.</p>
        </div>
      )}

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="p-10 bg-slate-50/50 border-b flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by driver name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 h-14 border-none bg-white shadow-xl shadow-slate-200/50 rounded-2xl text-lg font-medium font-body focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm font-headline">
            {drivers?.length || 0} Operators Verified
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 font-headline">Syncing Roster Ledger...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white border-b-2">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-20 pl-10 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Operator Identity</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">License Class</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Valid Until</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline text-center">Safety Score</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline text-center">Completion</TableHead>
                  <TableHead className="h-20 pr-10 text-right text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body">
                {filteredDrivers.map((driver) => {
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  const expiryDate = new Date(driver.licenseExpiryDate);
                  expiryDate.setHours(0,0,0,0);
                  const isExpired = expiryDate < now;

                  return (
                    <TableRow key={driver.id} className="h-24 border-slate-50 hover:bg-slate-50/50 transition-all group">
                      <TableCell className="pl-10">
                        <div className="font-black text-slate-900 text-lg tracking-tighter uppercase italic group-hover:text-primary transition-colors font-headline">{driver.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-headline">ID: {driver.id}</div>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">{driver.licenseCategory}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-2 font-mono text-xs font-bold",
                          isExpired ? "text-red-500" : "text-slate-600"
                        )}>
                          {driver.licenseExpiryDate}
                          {isExpired && <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-black text-xl font-headline italic ${driver.safetyScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {driver.safetyScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold text-slate-900 text-base">
                        {Math.round(driver.completionRate || 0)}%
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Badge className={`rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest border-none shadow-sm transition-all font-headline ${
                            driver.status === 'Suspended' ? 'bg-red-500 text-white shadow-red-200' : 
                            driver.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                            driver.status === 'On Trip' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {driver.status}
                          </Badge>
                          {canManage && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(driver)} className="h-9 w-9 text-primary rounded-xl hover:bg-primary/10 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(driver.id)} className="h-9 w-9 text-destructive rounded-xl hover:bg-red-50 transition-colors">
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
            <div className="py-40 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <Users className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tighter">Roster Isolated</h3>
              <p className="text-slate-400 mt-2 font-medium max-w-xs mx-auto text-sm font-body">No personnel records found for this query. Clear filters to restore roster.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
