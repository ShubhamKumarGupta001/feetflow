
"use client";

import { useState, useMemo } from 'react';
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
  Layers, 
  Loader2,
  Wrench,
  AlertCircle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function MaintenancePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    notes: ''
  });

  const userRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userRef);

  const roleCollection = useMemo(() => {
    if (!userProfile?.roleId) return null;
    const rid = userProfile.roleId;
    if (rid === 'dispatcher') return 'roles_dispatchers';
    if (rid === 'safety-officer') return 'roles_safetyOfficers';
    if (rid === 'financial-analyst') return 'roles_financialAnalysts';
    return 'roles_fleetManagers';
  }, [userProfile]);

  const roleFlagRef = useMemoFirebase(() => (user && roleCollection) ? doc(firestore, roleCollection, user.uid) : null, [firestore, user, roleCollection]);
  const { data: roleFlag, isLoading: isRoleFlagLoading } = useDoc(roleFlagRef);

  const isAuthorized = !!roleFlag;

  const maintenanceRef = useMemoFirebase(() => (!user || !isAuthorized) ? null : collection(firestore, 'maintenance_logs'), [firestore, user, isAuthorized]);
  const vehiclesRef = useMemoFirebase(() => (!user || !isAuthorized) ? null : collection(firestore, 'vehicles'), [firestore, user, isAuthorized]);

  const { data: logs, isLoading: isLogsLoading } = useCollection(maintenanceRef);
  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection(vehiclesRef);

  const isLoading = isProfileLoading || isRoleFlagLoading || isLogsLoading || isVehiclesLoading;

  const handleCreateService = () => {
    if (!formData.vehicleId || !formData.serviceType || !maintenanceRef) return;

    const logId = Math.floor(100 + Math.random() * 900).toString();

    addDocumentNonBlocking(maintenanceRef, {
      id: logId,
      ...formData,
      cost: Number(formData.cost) || 0,
      status: 'New',
      createdAt: serverTimestamp()
    });

    const vehicleRef = doc(firestore, 'vehicles', formData.vehicleId);
    updateDocumentNonBlocking(vehicleRef, { status: 'In Shop' });

    toast({
      title: "Service Logged",
      description: `Vehicle is now marked 'In Shop' and hidden from dispatch.`,
    });

    setFormData({
      vehicleId: '',
      serviceType: '',
      date: new Date().toISOString().split('T')[0],
      cost: '',
      notes: ''
    });
    setIsModalOpen(false);
  };

  const filteredLogs = logs?.filter(log => {
    const vehicle = vehicles?.find(v => v.id === log.vehicleId);
    const searchStr = searchTerm.toLowerCase();
    return (
      vehicle?.name?.toLowerCase().includes(searchStr) ||
      vehicle?.licensePlate?.toLowerCase().includes(searchStr) ||
      log.serviceType?.toLowerCase().includes(searchStr) ||
      log.id?.toLowerCase().includes(searchStr)
    );
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900">5. Maintenance &amp; Service Logs</h2>
          <p className="text-slate-500">Preventive &amp; Reactive Asset Tracking</p>
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
                <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 h-11 px-6">
                  Create New Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-headline">New Service</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label>Vehicle Name:</Label>
                    <Select 
                      value={formData.vehicleId} 
                      onValueChange={(val) => setFormData({...formData, vehicleId: val})}
                    >
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select Fleet Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles?.map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name} ({v.licensePlate})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Issue/service:</Label>
                    <Input 
                      placeholder="e.g. Engine Issue, Oil Change"
                      value={formData.serviceType}
                      onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Date:</Label>
                    <Input 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Estimated Cost:</Label>
                    <Input 
                      placeholder="Cost in numeric"
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({...formData, cost: e.target.value})}
                      className="rounded-xl h-11"
                    />
                  </div>
                </div>
                <DialogFooter className="flex gap-3 sm:justify-start">
                  <Button 
                    onClick={handleCreateService}
                    className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl px-8"
                  >
                    Create
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/5 rounded-xl px-8"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[100px] h-14 pl-8 text-xs font-bold uppercase text-[#FF69B4]">Log ID</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Vehicle</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Issue/Service</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Date</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-[#FF69B4]">Cost</TableHead>
                  <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-[#FF69B4]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const vehicle = vehicles?.find(v => v.id === log.vehicleId);
                  return (
                    <TableRow key={log.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-8 font-medium text-primary">{log.id}</TableCell>
                      <TableCell className="font-bold text-primary">{vehicle?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-primary">{log.serviceType}</TableCell>
                      <TableCell className="text-primary">{log.date}</TableCell>
                      <TableCell className="text-primary">{log.cost ? `${log.cost / 1000}k` : '0'}</TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge className={`rounded-full px-4 py-0.5 font-medium border-none ${
                          log.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                          log.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredLogs.length === 0 && (
            <div className="py-24 text-center">
              <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No Maintenance Records</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
