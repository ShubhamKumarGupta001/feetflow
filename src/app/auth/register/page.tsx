
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';

const ROLES = [
  { id: 'fleet-manager', collection: 'roles_fleetManagers', label: 'Fleet Manager' },
  { id: 'dispatcher', collection: 'roles_dispatchers', label: 'Dispatcher' },
  { id: 'safety-officer', collection: 'roles_safetyOfficers', label: 'Safety Officer' },
  { id: 'financial-analyst', collection: 'roles_financialAnalysts', label: 'Financial Analyst' },
];

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('fleet-manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsEmailInUse(false);
    
    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Find selected role metadata
      const selectedRole = ROLES.find(r => r.id === roleId) || ROLES[0];

      // 3. Initialize User Profile (Non-blocking)
      setDocumentNonBlocking(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        roleId: roleId
      }, { merge: true });

      // 4. Provision Specific Role Collection (Non-blocking)
      setDocumentNonBlocking(doc(db, selectedRole.collection, user.uid), {
        id: user.uid,
        name: selectedRole.label,
        accessScope: `Standard access for ${selectedRole.label} role.`
      }, { merge: true });

      // 5. Redirect immediately
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setIsEmailInUse(true);
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-body">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform text-white shadow-lg shadow-primary/20">
          <Truck className="w-6 h-6" />
        </div>
        <span className="font-headline text-2xl font-bold text-primary tracking-tight">Fleet Flow</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="space-y-2 pb-8 pt-8 text-center">
          <CardTitle className="text-2xl font-bold font-headline">Join FleetFlow</CardTitle>
          <CardDescription className="text-slate-500">
            Select your professional role and start optimizing today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Professional Role</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-slate-200">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
              <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Permissions are strictly governed by your selected role.
              </p>
            </div>

            {error && (
              <div className={`p-4 rounded-xl border flex gap-3 ${isEmailInUse ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold leading-relaxed">{error}</p>
                  {isEmailInUse && (
                    <Link href="/auth/login" className="text-xs font-bold underline block mt-1">
                      Go to Sign In →
                    </Link>
                  )}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-slate-50/50 p-6 space-y-4">
          <p className="text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
