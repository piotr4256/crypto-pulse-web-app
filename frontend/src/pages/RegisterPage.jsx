import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { useRegisterMutation } from '../hooks/queries';
import { Lock, Mail, UserPlus, ChevronLeft, Loader2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuthStore();
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate({ username, email, password }, {
      onSuccess: (data) => {
        setUser(data.user, data.token);
        navigate('/');
      },
    });
  };

  const isLoading = registerMutation.isPending;
  const error = registerMutation.error?.message;

  return (
    <div className="container relative min-h-[calc(100vh-160px)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Link
        to="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors z-20"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Powrót do logowania
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[400px] relative z-10 pt-4">
        <Card className="border-white/10 bg-crypto-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-crypto-purple to-crypto-primary opacity-50" />

          <CardHeader className="space-y-1 text-center pt-6 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <UserPlus className="h-5 w-5 text-crypto-primary" /> Dołącz do nas
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Stwórz darmowe konto i zacznij śledzić rynek
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            {error && (
              <div className="p-3 text-xs font-medium bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="reg-username" className="text-gray-300 ml-1 text-xs">Nazwa użytkownika</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    id="reg-username"
                    placeholder="Twoja unikalna nazwa"
                    type="text"
                    disabled={isLoading}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 h-9 bg-black/40 border-white/10 focus-visible:ring-crypto-primary/50 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="reg-email" className="text-gray-300 ml-1 text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    id="reg-email"
                    placeholder="email@przyklad.pl"
                    type="email"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 bg-black/40 border-white/10 focus-visible:ring-crypto-primary/50 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="reg-password" className="text-gray-300 ml-1 text-xs">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Minimum 8 znaków"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 bg-black/40 border-white/10 focus-visible:ring-crypto-primary/50 text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-crypto-primary text-black hover:bg-crypto-primary/80 font-bold transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)] mt-1 text-sm"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Załóż konto"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-6 pt-4 text-center bg-transparent border-t-0">
            <div className="w-full border-t border-white/10 mb-2" />
            <p className="text-sm text-gray-500">
              Masz już konto?{" "}
              <Link to="/login" className="text-crypto-primary hover:text-crypto-primary/80 hover:underline font-bold transition-colors">
                Zaloguj się
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
