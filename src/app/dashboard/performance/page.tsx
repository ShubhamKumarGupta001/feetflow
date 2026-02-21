
"use client";

import { useState } from 'react';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  addDocumentNonBlocking,
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
  Loader2,
  Users,
  ShieldAlert,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function PerformancePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    licenseCategory: 'Class A',
    licenseExpiryDate: '',
    safetyScore: '100',
    totalTrips: '0',
    completedTrips: '0',
    complaints: '0'
  });

  // Role Verification
  const roleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'roles_fleetManagers', user.uid);
  }, [firestore, user]);
  const { data: roleDoc, isLoading: isRoleLoading } = useDoc(roleRef);

  // Collections
  const driversRef = useMemoFirebase(() => (!user || !roleDoc) ? null : collection(firestore, 'drivers'), [firestore, user, roleDoc]);
  const { data: drivers, isLoading: isDriversLoading } = useCollection(driversRef);

  const isLoading = isRoleLoading || isDriversLoading;

  const handleCreateDriver = () => {
    if (!formData.name || !formData.licenseExpiryDate || !driversRef) return;

    const expiryDate = new Date(formData.licenseExpiryDate);
    const today = new Date();
    const isExpired = expiryDate < today;

    const total = Number(formData.totalTrips) || 0;
    const completed = Number(formData.completedTrips) || 0;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    addDocumentNonBlocking(driversRef, {
      id: crypto.randomUUID(),
      ...formData,
      safetyScore: Number(formData.safetyScore),
      totalTrips: total,
      completedTrips: completed,
      completionRate: rate,
      complaints: Number(formData.complaints),
      status: isExpired ? 'Suspended' : 'On Duty',
      createdAt: serverTimestamp()
    });

    toast({
      title: "Driver Registered",
      description: isExpired ? "License expired! Driver marked as Suspended." : "New driver added to active roster.",
    });

    setFormData({
      name: '',
      licenseCategory: 'Class A',
      licenseExpiryDate: '',
      safetyScore: '100',
      totalTrips: '0',
      completedTrips: '0',
      complaints: '0'
    });
    setIsModalOpen(false);
  };

  const filteredDrivers = drivers?.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.licenseCategory?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900">7. Driver Performance &amp; Safety Profiles</h2>
          <p className="text-slate-500">Compliance &amp; Operational Efficiency Tracking</p>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
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
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl border-slate-200">Group by</Button>
            <Button variant="outline" className="rounded-xl border-slate-200">Filter</Button>
            <Button variant="outline" className="rounded-xl border-slate-200">Sort by...</Button>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 h-11 px-6 font-bold">
                  Onboard New Driver
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-headline">New Driver Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label>Full Name:</Label>
                    <Input 
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>License Cat:</Label>
                      <Select 
                        value={formData.licenseCategory} 
                        onValueChange={(val) => setFormData({...formData, licenseCategory: val})}
                      >
                        <SelectTrigger className="rounded-xl h-11">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Class A">Class A</SelectItem>
                          <SelectItem value="Class B">Class B</SelectItem>
                          <SelectItem value="Class C">Class C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Expiry Date:</Label>
                      <Input 
                        type="date"
                        value={formData.licenseExpiryDate}
                        onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>Total Trips:</Label>
                      <Input 
                        type="number"
                        value={formData.totalTrips}
                        onChange={(e) => setFormData({...formData, totalTrips: e.target.value})}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Completed:</Label>
                      <Input 
                        type="number"
                        value={formData.completedTrips}
                        onChange={(e) => setFormData({...formData, completedTrips: e.target.value})}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Complaints:</Label>
                      <Input 
                        type="number"
                        value={formData.complaints}
                        onChange={(e) => setFormData({...formData, complaints: e.target.value})}
                        className="rounded-xl h-11"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex gap-3 sm:justify-start">
                  <Button 
                    onClick={handleCreateDriver}
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl px-10 font-bold"
                  >
                    Create Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="border-destructive text-destructive hover:bg-destructive/5 rounded-xl px-10 font-bold"
                  >
                    Discard
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="h-14 pl-8 text-xs font-bold uppercase text-[#FF69B4]">Name</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">License#</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Expiry</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Completion Rate</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Saftey Score</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Complaints</TableHead>
                  <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-[#FF69B4]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => {
                  const isExpired = new Date(driver.licenseExpiryDate) < new Date();
                  return (
                    <TableRow key={driver.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-8 font-bold text-slate-900">{driver.name}</TableCell>
                      <TableCell className="font-medium text-slate-500">{driver.licenseCategory}</TableCell>
                      <TableCell className={`font-medium ${isExpired ? 'text-destructive font-bold' : 'text-slate-600'}`}>
                        {driver.licenseExpiryDate}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {driver.completionRate ? Math.round(driver.completionRate) : 0}%
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        <span className={`${driver.safetyScore < 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {driver.safetyScore}%
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {driver.complaints || 0}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge className={`rounded-full px-4 py-0.5 font-bold border-none ${
                          driver.status === 'On Duty' ? 'bg-emerald-100 text-emerald-700' : 
                          driver.status === 'Suspended' ? 'bg-red-100 text-red-700' : 
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {driver.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredDrivers.length === 0 && (
            <div className="py-24 text-center">
              <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 font-headline">No Driver Profiles Found</h3>
              <p className="text-slate-400 mt-2">Add your first driver to start tracking safety and performance metrics.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 pb-8">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" /> Compliance Rule Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm p-3 bg-white rounded-xl border">
              <span className="font-medium text-slate-600">License Expiry Logic</span>
              <Badge className="bg-emerald-500">ACTIVE</Badge>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drivers with an expiry date earlier than today are automatically marked as <b>Suspended</b> and removed from the active dispatch pool.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-headline flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" /> Upcoming Renewals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4 text-center">
               <p className="text-sm text-slate-400">All licenses currently active. <br/>Next review in 14 days.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
