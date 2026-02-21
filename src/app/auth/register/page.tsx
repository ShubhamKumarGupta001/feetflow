
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Truck, Loader2, ShieldCheck, AlertCircle, Info, Mail } from 'lucide-react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';

const ROLE_METADATA = {
  'fleet-manager': { collection: 'roles_fleetManagers', label: 'Fleet Manager' },
  'dispatcher': { collection: 'roles_dispatchers', label: 'Dispatcher' },
  'safety-officer': { collection: 'roles_safetyOfficers', label: 'Safety Officer' },
  'financial-analyst': { collection: 'roles_financialAnalysts', label: 'Financial Analyst' },
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailInUse, setIsEmailInUse] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  /**
   * Logic-Based Role Assignment (RBAC Engine)
   * The system automatically identifies the user's role based on their 
   * professional identity context (keywords in email).
   */
  const determineRoleFromEmail = (email: string) => {
    const lowEmail = email.toLowerCase();
    
    // Explicit Admin/Management keywords
    if (lowEmail.includes('admin') || lowEmail.includes('manager') || lowEmail.includes('owner')) {
      return 'fleet-manager';
    }
    
    // Specialist Logistics keywords
    if (lowEmail.includes('dispatch')) return 'dispatcher';
    if (lowEmail.includes('safety') || lowEmail.includes('compliance')) return 'safety-officer';
    if (lowEmail.includes('finance') || lowEmail.includes('audit') || lowEmail.includes('account')) return 'financial-analyst';
    
    // Default to the highest authority for general professional accounts
    return 'fleet-manager'; 
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsEmailInUse(false);
    
    try {
      // 1. Determine role before account creation using the identity engine
      const roleId = determineRoleFromEmail(email);
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
      // This creates the 'existence-based' flag that our Security Rules require.
      setDocumentNonBlocking(doc(db, roleConfig.collection, user.uid), {
        id: user.uid,
        name: roleConfig.label,
        accessScope: `System-generated administrative access for the ${roleConfig.label} role.`
      }, { merge: true });

      // 5. Redirect immediately to the centralized dashboard
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
          <CardTitle className="text-2xl font-bold font-headline">Identity Verification</CardTitle>
          <CardDescription className="text-slate-500">
            Automated workspace provisioning for logistics professionals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Professional Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@fleetflow.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
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
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
              />
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.15em] text-[10px]">
                <ShieldCheck className="w-4 h-4" />
                Automatic Role Detection
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Our AI-driven engine assigns access based on professional keywords. 
                Use <span className="text-slate-900 font-bold">admin</span>, <span className="text-slate-900 font-bold">dispatch</span>, 
                <span className="text-slate-900 font-bold">safety</span>, or <span className="text-slate-900 font-bold">finance</span> in your email. 
                Accounts default to <span className="text-slate-900 font-bold italic">Fleet Manager</span> administrative access.
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Authenticate & Open Workspace"}
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
