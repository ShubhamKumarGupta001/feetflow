
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter, MoreHorizontal, ArrowUpDown } from 'lucide-react';

const mockData = [
  { id: "TX-1001", customer: "John Smith", date: "2024-03-24", amount: 1200.50, status: "completed", product: "Premium Plan" },
  { id: "TX-1002", customer: "Sarah Williams", date: "2024-03-23", amount: 450.00, status: "pending", product: "Standard Plan" },
  { id: "TX-1003", customer: "Michael Brown", date: "2024-03-23", amount: 2900.00, status: "completed", product: "Enterprise Bundle" },
  { id: "TX-1004", customer: "Emily Davis", date: "2024-03-22", amount: 150.75, status: "failed", product: "Add-on Module" },
  { id: "TX-1005", customer: "David Wilson", date: "2024-03-22", amount: 1200.50, status: "completed", product: "Premium Plan" },
  { id: "TX-1006", customer: "Emma Taylor", date: "2024-03-21", amount: 450.00, status: "completed", product: "Standard Plan" },
  { id: "TX-1007", customer: "Chris Anderson", date: "2024-03-21", amount: 75.00, status: "completed", product: "Support Tier 1" },
  { id: "TX-1008", customer: "Lisa Miller", date: "2024-03-20", amount: 1200.50, status: "pending", product: "Premium Plan" },
];

export default function DataTablePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = mockData.filter(item => 
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-slate-900">Transaction History</h2>
          <p className="text-slate-500">View and manage all your platform transactions and sales records.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-6 bg-white border-b flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search customers, products, or IDs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl"
            />
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Total Volume</p>
              <p className="text-sm font-bold">$12,450.75</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Total Orders</p>
              <p className="text-sm font-bold">{filteredData.length}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="w-[100px] h-14 pl-6 text-xs font-bold uppercase text-slate-500">
                  Transaction <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                </TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Customer</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Date</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Product</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Amount</TableHead>
                <TableHead className="h-14 text-xs font-bold uppercase text-slate-500">Status</TableHead>
                <TableHead className="h-14 pr-6 text-right text-xs font-bold uppercase text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="h-16 border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6 font-medium text-slate-700">{item.id}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{item.customer}</TableCell>
                  <TableCell className="text-slate-600">{item.date}</TableCell>
                  <TableCell className="text-slate-600">{item.product}</TableCell>
                  <TableCell className="font-bold text-slate-900">${item.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-3 py-0.5 font-medium border-none ${
                      item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                      item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredData.length === 0 && (
            <div className="py-20 text-center text-slate-500">
              <Search className="w-10 h-10 mx-auto text-slate-200 mb-4" />
              <p>No results found for "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
