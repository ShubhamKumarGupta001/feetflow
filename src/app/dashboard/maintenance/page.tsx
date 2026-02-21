
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

  const maintenanceRef = useMemoFirebase(() => collection(firestore, 'maintenance_logs'), [firestore]);
  const vehiclesRef = useMemoFirebase(() => collection(firestore, 'vehicles'), [firestore]);

  const { data: logs, isLoading: isLogsLoading } = useCollection(maintenanceRef);
  const { data: vehicles, isLoading: isVehiclesLoading } = useCollection(vehiclesRef);

  const isLoading = isProfileLoading || isLogsLoading || isVehiclesLoading;

  const handleCreateService = () => {
    if (!formData.vehicleId || !formData.serviceType) {
      toast({ variant: "destructive", title: "Incomplete Data", description: "Vehicle and Service type are required." });
      return;
    }

    const logId = `MAINT-${Math.floor(1000 + Math.random() * 9000)}`;
    const logDocRef = doc(firestore, 'maintenance_logs', logId);

    setDocumentNonBlocking(logDocRef, {
      id: logId,
      vehicleId: formData.vehicleId,
      serviceType: formData.serviceType,
      date: formData.date,
      cost: Number(formData.cost) || 0,
      notes: formData.notes,
      status: 'New',
      createdAt: serverTimestamp()
    }, { merge: true });

    // Update vehicle to 'In Shop'
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
          <h2 className="text-3xl font-bold font-headline text-slate-900">Maintenance &amp; Service Logs</h2>
          <p className="text-slate-500">Preventive &amp; Reactive Asset Tracking</p>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 bg-white border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search maintenance logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 h-11 px-6 font-bold">
                  Log New Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-headline">New Service Log</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label>Select Vehicle:</Label>
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
                    <Label>Service Type:</Label>
                    <Input 
                      placeholder="e.g. Engine Issue, Oil Change"
                      value={formData.serviceType}
                      onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Scheduled Date:</Label>
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
                      placeholder="Cost (numeric)"
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
                    className="bg-primary hover:bg-primary/90 text-white rounded-xl px-10 font-bold"
                  >
                    Confirm Log
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="border-destructive text-destructive hover:bg-destructive/5 rounded-xl px-10 font-bold"
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
                  <TableHead className="w-[120px] h-14 pl-8 text-xs font-bold uppercase text-slate-400">Log ID</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Vehicle</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Service Type</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Date</TableHead>
                  <TableHead className="h-14 text-xs font-bold uppercase text-slate-400">Cost</TableHead>
                  <TableHead className="h-14 pr-8 text-right text-xs font-bold uppercase text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const vehicle = vehicles?.find(v => v.id === log.vehicleId);
                  return (
                    <TableRow key={log.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="pl-8 font-black text-primary/70 text-xs">{log.id}</TableCell>
                      <TableCell className="font-bold text-slate-900">{vehicle?.name || 'Unknown'}</TableCell>
                      <TableCell className="font-medium text-slate-600">{log.serviceType}</TableCell>
                      <TableCell className="text-slate-500">{log.date}</TableCell>
                      <TableCell className="font-bold text-slate-900">Rs. {log.cost?.toLocaleString()}</TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge className={`rounded-full px-4 py-0.5 font-bold border-none ${
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
              <Wrench className="w-12 h-12 text-slate-100 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400 font-headline uppercase tracking-tighter">No Maintenance History</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
