
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
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Driver Performance & Safety Profiles
 * Manages personnel records and enforces license compliance rules.
 * Safety scores are calculated based on accidents and trip completion rates.
 * Status logic: Expired License OR Zero Safety Score -> Forced Suspended
 */
export default function PerformancePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseCategory: 'Class A',
    licenseExpiryDate: '',
    accidents: '0',
    totalTrips: '0',
    completedTrips: '0',
    dutyStatus: 'On Duty'
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
      licenseNumber: driver.licenseNumber || '',
      licenseCategory: driver.licenseCategory || 'Class A',
      licenseExpiryDate: driver.licenseExpiryDate || '',
      accidents: driver.accidents?.toString() || '0',
      totalTrips: driver.totalTrips?.toString() || '0',
      completedTrips: driver.completedTrips?.toString() || '0',
      dutyStatus: driver.dutyStatus || 'On Duty'
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      licenseNumber: '',
      licenseCategory: 'Class A',
      licenseExpiryDate: '',
      accidents: '0',
      totalTrips: '0',
      completedTrips: '0',
      dutyStatus: 'On Duty'
    });
    setEditingDriver(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.licenseExpiryDate || !formData.licenseNumber) {
      toast({ variant: "destructive", title: "Missing Data", description: "Name, License Number, and Expiry are required." });
      return;
    }

    const driverId = editingDriver?.id || formData.name.toLowerCase().replace(/\s+/g, '-');
    
    // License Compliance Check
    const expiryDate = new Date(formData.licenseExpiryDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const isExpired = expiryDate < now;

    // Safety Score Calculation Analysis
    const total = Number(formData.totalTrips) || 0;
    const completed = Number(formData.completedTrips) || 0;
    const accidents = Number(formData.accidents) || 0;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // Calculation: Base (100) - (Accidents * 20) + (Small bonus for completion rate)
    let calculatedSafetyScore = 100 - (accidents * 20);
    if (completionRate > 90) calculatedSafetyScore += 5;
    calculatedSafetyScore = Math.max(0, Math.min(100, calculatedSafetyScore));

    const isSafetyZero = calculatedSafetyScore === 0;

    // BUSINESS RULE: If expired OR Safety Score is zero, status is ALWAYS Suspended.
    let finalStatus = formData.dutyStatus === 'On Duty' ? 'Available' : 'Off Duty';
    if (isExpired || isSafetyZero) finalStatus = 'Suspended';

    setDocumentNonBlocking(doc(firestore, 'drivers', driverId), {
      id: driverId,
      name: formData.name,
      licenseNumber: formData.licenseNumber,
      licenseCategory: formData.licenseCategory,
      licenseExpiryDate: formData.licenseExpiryDate,
      accidents: accidents,
      safetyScore: calculatedSafetyScore,
      totalTrips: total,
      completedTrips: completed,
      completionRate: completionRate,
      dutyStatus: formData.dutyStatus,
      status: finalStatus, 
      updatedAt: serverTimestamp()
    }, { merge: true });

    toast({
      title: (isExpired || isSafetyZero) ? "Action Required" : "Profile Synced",
      variant: (isExpired || isSafetyZero) ? "destructive" : "default",
      description: isExpired 
        ? `Compliance Violation: Driver "${formData.name}" has been Suspended due to an expired license.` 
        : isSafetyZero
        ? `Safety Violation: Driver "${formData.name}" has been Suspended due to a zero safety index.`
        : `Personnel record synchronized. Status: ${finalStatus}`,
    });

    resetForm();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(firestore, 'drivers', id));
    toast({ title: "Profile Deleted", description: "Driver removed from roster." });
  };

  const filteredDrivers = drivers?.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Driver Performance & Safety profiles</h2>
          <p className="text-slate-500 font-medium italic">Compliance-First Personnel Registry</p>
        </div>

        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-12 px-8 font-bold text-lg transition-all active:scale-95 font-headline">
                <UserPlus className="w-5 h-5 mr-2" /> Onboard New Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-bold font-headline uppercase tracking-tighter text-primary">
                  {editingDriver ? 'Edit Profile' : 'Safety Onboarding'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-6 font-body max-h-[60vh] overflow-y-auto px-1">
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">Full Legal Name</Label>
                  <Input 
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl h-12 bg-slate-50 font-bold border-slate-200"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">License Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="e.g. DL-998877"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      className="rounded-xl h-12 bg-slate-50 pl-12 font-mono font-bold border-slate-200 uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">License Class</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">Accidents Involved</Label>
                    <Input 
                      type="number"
                      value={formData.accidents}
                      onChange={(e) => setFormData({...formData, accidents: e.target.value})}
                      className="rounded-xl h-12 border-slate-200 font-bold"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-bold text-slate-700 uppercase text-[10px] tracking-widest font-headline">Duty Status</Label>
                    <Select value={formData.dutyStatus} onValueChange={(val) => setFormData({...formData, dutyStatus: val})}>
                      <SelectTrigger className="rounded-xl h-12 border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On Duty">On Duty</SelectItem>
                        <SelectItem value="Off Duty">Off Duty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {( (formData.licenseExpiryDate && new Date(formData.licenseExpiryDate) < new Date()) || (100 - (Number(formData.accidents) * 20) <= 0) ) && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold animate-pulse">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="uppercase tracking-widest text-[9px] mb-1">Status Restriction Applied</p>
                      <p>Compliance system will automatically mark this driver as <strong>SUSPENDED</strong>. Dispatch unavailable due to {new Date(formData.licenseExpiryDate) < new Date() ? 'License Expiry' : 'Critical Safety Score'}.</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 rounded-2xl h-14 font-black uppercase text-sm tracking-widest shadow-xl shadow-primary/20 font-headline">
                  {editingDriver ? 'Update Profile' : 'Finalize Profile'}
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
          <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Compliance View: Only Authorized Personnel (Safety/Manager) can modify safety records or duty status.</p>
        </div>
      )}

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-slate-100">
        <CardHeader className="p-10 bg-slate-50/50 border-b flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name or license..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 h-14 border-none bg-white shadow-xl shadow-slate-200/50 rounded-2xl text-lg font-medium font-body focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm font-headline">
              {drivers?.length || 0} Safety Profiles
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 font-headline">Syncing Profile Hub...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white border-b-2">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-20 pl-10 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Operator Identity</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">License / Expiry</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline text-center">Incidents</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline text-center">Safety Rating</TableHead>
                  <TableHead className="h-20 text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline text-center">Duty Status</TableHead>
                  <TableHead className="h-20 pr-10 text-right text-[10px] font-black uppercase text-primary tracking-[0.25em] font-headline">Compliance Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="font-body">
                {filteredDrivers.map((driver) => {
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  const expiryDate = new Date(driver.licenseExpiryDate);
                  expiryDate.setHours(0,0,0,0);
                  const isExpired = expiryDate < now;
                  const isCriticalSafety = driver.safetyScore === 0;

                  return (
                    <TableRow key={driver.id} className="h-24 border-slate-50 hover:bg-slate-50/50 transition-all group">
                      <TableCell className="pl-10">
                        <div className="font-black text-slate-900 text-lg tracking-tighter uppercase italic group-hover:text-primary transition-colors font-headline">{driver.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-headline">Ref: {driver.id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-xs font-mono uppercase">{driver.licenseNumber}</span>
                          <span className={cn(
                            "text-[10px] font-bold flex items-center gap-1 mt-1",
                            isExpired ? "text-red-500" : "text-slate-400"
                          )}>
                            Exp: {driver.licenseExpiryDate}
                            {isExpired && <AlertTriangle className="w-3 h-3" />}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn(
                          "rounded-lg px-3 py-1 font-black text-[10px] uppercase",
                          driver.accidents > 0 ? "border-red-200 text-red-600 bg-red-50" : "border-slate-100 text-slate-400"
                        )}>
                          {driver.accidents} Accidents
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn(
                            "font-black text-xl font-headline italic leading-none",
                            driver.safetyScore >= 90 ? 'text-emerald-600' : driver.safetyScore >= 70 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {driver.safetyScore}%
                          </span>
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Safety Index</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "rounded-full px-4 py-1 font-black text-[9px] uppercase border-none",
                          driver.dutyStatus === 'On Duty' ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {driver.dutyStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={cn(
                              "rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest border-none shadow-sm font-headline",
                              driver.status === 'Suspended' ? 'bg-red-500 text-white' : 
                              driver.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                              driver.status === 'On Trip' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                            )}>
                              {driver.status}
                            </Badge>
                            {isCriticalSafety && <span className="text-[8px] font-black text-red-600 uppercase">Safety Lock</span>}
                          </div>
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
              <h3 className="text-2xl font-black font-headline text-slate-900 uppercase tracking-tighter">No Profiles Found</h3>
              <p className="text-slate-400 mt-2 font-medium max-w-xs mx-auto text-sm font-body">Refine your search parameters to find specific operator profiles.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
