
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Truck, Loader2, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';
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
   * 1. Check for the hardcoded System Admin Key first.
   * 2. If no key, look for specialist keywords.
   * 3. Default everyone else to 'dispatcher'.
   */
  const determineRole = (email: string, key: string) => {
    const lowEmail = email.toLowerCase();
    
    // Administrative Access is ONLY granted via the secret System Key
    if (key.trim() === ADMIN_SECRET_KEY) {
      return 'fleet-manager';
    }
    
    // Specialist Logistics keywords for standard roles
    if (lowEmail.includes('safety') || lowEmail.includes('compliance')) return 'safety-officer';
    if (lowEmail.includes('finance') || lowEmail.includes('audit') || lowEmail.includes('account')) return 'financial-analyst';
    if (lowEmail.includes('dispatch')) return 'dispatcher';
    
    // Strict Default: All other users are Dispatchers (Limited Access)
    return 'dispatcher'; 
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsEmailInUse(false);
    
    try {
      // 1. Determine role using the secure identity engine
      const roleId = determineRole(email, authKey);
      const roleConfig = ROLE_METADATA[roleId as keyof typeof ROLE_METADATA];

      // 2. Authenticate with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 3. Initialize User Profile (Non-blocking)
      setDocumentNonBlocking(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        roleId: roleId
      }, { merge: true });

      // 4. Provision Specific Role Collection (Non-blocking)
      setDocumentNonBlocking(doc(db, roleConfig.collection, user.uid), {
        id: user.uid,
        name: roleConfig.label,
        accessScope: `System-generated access for the ${roleConfig.label} role.`
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
          <CardTitle className="text-2xl font-bold font-headline text-slate-900">Secure Provisioning</CardTitle>
          <CardDescription className="text-slate-500">
            Automated workspace setup for verified logistics personnel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Professional Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="staff@fleetflow.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
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
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-primary" />
                <Label htmlFor="authKey" className="font-bold text-slate-700">System Authorization Key</Label>
              </div>
              <Input 
                id="authKey" 
                placeholder="Required for Administrative Access"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                className="h-12 rounded-xl bg-slate-900 text-white placeholder:text-slate-500 border-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
              />
              <p className="mt-2 text-[10px] text-slate-400 font-medium">
                Admin role is locked. Leave blank to register as a <span className="text-slate-600 font-bold">Dispatcher</span>.
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
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Verify & Initialize Dashboard"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-slate-50/50 p-6 space-y-4">
          <p className="text-sm text-slate-500 text-center">
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
