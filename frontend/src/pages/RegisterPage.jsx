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
  const [isRegistered, setIsRegistered] = useState(false);
  const { setUser } = useAuthStore();
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate({ username, email, password }, {
      onSuccess: () => {
        setIsRegistered(true);
      },
    });
  };

  const isLoading = registerMutation.isPending;
  const error = registerMutation.error?.message;

  return (
    <div className="container relative min-h-[calc(100vh-160px)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      {!isRegistered && (
        <Button
          asChild
          className="absolute left-4 top-4 md:left-8 md:top-8 rounded-full bg-crypto-primary/10 border border-crypto-primary/30 text-crypto-primary hover:bg-crypto-primary/20 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-300 z-20 group h-auto py-2 px-4"
        >
          <Link to="/login" className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Powrót do logowania
          </Link>
        </Button>
      )}

      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[400px] relative z-10 pt-4">
        {isRegistered ? (
          <Card className="border-white/10 bg-crypto-card/40 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-500 to-crypto-primary opacity-50" />

            <CardHeader className="space-y-2 text-center pt-8 pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 text-green-400 mb-2 animate-bounce">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                Sprawdź skrzynkę!
              </CardTitle>
              <CardDescription className="text-gray-400 text-xs">
                Konto zostało utworzone pomyślnie.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4 px-6 pb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                Wysłaliśmy link aktywacyjny na adres:
                <strong className="block text-crypto-primary mt-1 text-base">{email}</strong>
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Kliknij w otrzymany link w ciągu 24 godzin, aby aktywować swoje konto i móc się zalogować.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8 pt-4 bg-transparent border-t border-white/5">
              <Button asChild className="w-full h-11 bg-crypto-primary text-black hover:bg-crypto-primary/80 font-bold transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  Przejdź do logowania
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
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

            <CardFooter className="flex flex-col gap-4 pb-6 pt-4 bg-transparent border-t-0">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-crypto-card-solid/80 backdrop-blur-sm px-3 text-gray-500 rounded-full border border-white/5">Masz już konto?</span>
                </div>
              </div>
              <Button variant="outline" asChild className="w-full border-crypto-primary/20 bg-crypto-primary/5 hover:bg-crypto-primary/10 text-crypto-primary hover:text-crypto-primary h-11 transition-all duration-300">
                <Link to="/login">Zaloguj się</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
