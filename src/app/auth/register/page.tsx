"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Truck, Loader2, KeyRound, AlertCircle, Info } from 'lucide-react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';

const ROLE_METADATA = {
  'fleet-manager': { collection: 'roles_fleetManagers', label: 'Fleet Manager' },
  'dispatcher': { collection: 'roles_dispatchers', label: 'Dispatcher' },
  'safety-officer': { collection: 'roles_safetyOfficers', label: 'Safety Officer' },
  'financial-analyst': { collection: 'roles_financialAnalysts', label: 'Financial Analyst' },
};

// The "Gatekeeper" key for administrative access
const ADMIN_SECRET_KEY = "FLEET-ADMIN-2024";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authKey, setAuthKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  /**
   * Secure Role Determination Logic
   * - Fleet Manager: Strictly requires the ADMIN_SECRET_KEY.
   * - Specialist Roles: Automatic sorting via keywords (safety, finance, etc.)
   * - Default: Dispatcher
   */
  const determineRole = (email: string, key: string) => {
    const lowEmail = email.toLowerCase();
    
    // 1. Strict Authorization Check for Fleet Manager
    if (key.trim() === ADMIN_SECRET_KEY) {
      return 'fleet-manager';
    }
    
    // 2. Automatic Sorting for standard specialist roles
    if (lowEmail.includes('safety') || lowEmail.includes('compliance')) return 'safety-officer';
    if (lowEmail.includes('finance') || lowEmail.includes('audit') || lowEmail.includes('account')) return 'financial-analyst';
    
    // 3. Default Secure Entry Point
    return 'dispatcher'; 
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsEmailInUse(false);
    
    try {
      const roleId = determineRole(email, authKey);
      const roleConfig = ROLE_METADATA[roleId as keyof typeof ROLE_METADATA];

      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Step 2: Provision User Profile in Firestore
      setDocumentNonBlocking(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        roleId: roleId
      }, { merge: true });

      // Step 3: Provision Role Flag (This enables Security Rule access)
      setDocumentNonBlocking(doc(db, roleConfig.collection, user.uid), {
        id: user.uid,
        name: roleConfig.label,
        accessScope: `Verified ${roleConfig.label} access.`
      }, { merge: true });

      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setIsEmailInUse(true);
        setError('Email already exists. Please login.');
      } else {
        setError(err.message || 'Registration failed.');
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
        <span className="font-headline text-2xl font-bold text-primary tracking-tight uppercase">Fleet Flow</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="space-y-2 pb-8 pt-8 text-center border-b border-slate-50 bg-slate-50/30">
          <CardTitle className="text-2xl font-bold font-headline text-slate-900 uppercase tracking-tighter">Identity Setup</CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Automated workspace provisioning for logistics staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="mb-8 p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3 items-start">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              <strong>Fleet Manager</strong> access requires a System Authorization Key. Specialist roles are inferred from work email keywords. Defaults to <strong>Dispatcher</strong>.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-700">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="staff@fleetflow.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-primary" />
                <Label htmlFor="authKey" className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Admin Authorization Key</Label>
              </div>
              <Input 
                id="authKey" 
                placeholder="Enter key for Manager Access"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                className="h-12 rounded-xl bg-slate-900 text-white placeholder:text-slate-600 border-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
              />
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
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Verify & Initialize Dashboard"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-slate-50/50 p-6 space-y-4">
          <p className="text-sm text-slate-500 text-center font-medium">
            Already have an active session?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
