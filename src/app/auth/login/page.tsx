
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Truck, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const auth = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform text-white shadow-lg shadow-primary/20">
          <Truck className="w-6 h-6" />
        </div>
        <span className="font-headline text-2xl font-bold text-primary tracking-tight">Fleet Flow</span>
      </Link>

      <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 pb-8 pt-8">
          <CardTitle className="text-2xl font-bold font-headline text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter your credentials to access your fleet dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <input 
                id="email" 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-12 w-full rounded-xl bg-slate-50/50 border-slate-200 px-3 py-2 text-sm focus:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm text-primary font-medium hover:underline">Forgot?</Link>
              </div>
              <input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-12 w-full rounded-xl bg-slate-50/50 border-slate-200 px-3 py-2 text-sm focus:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Sign In"}
              {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t bg-slate-50/50 p-6 space-y-4">
          <p className="text-sm text-slate-500 text-center">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
