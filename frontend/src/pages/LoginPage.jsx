import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';
import { useLoginMutation, QUERY_KEYS } from '../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';
import { Lock, Mail, ChevronLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuthStore();
  const loginMutation = useLoginMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ username, password }, {
      onSuccess: (data) => {
        setUser(data.user, data.token);
        // invalidacja cache (TanStack Query): oznaczamy dane watchlisty tego usera jako "przestarzałe".
        // Dzięki temu, gdy użytkownik wejdzie na stronę ulubionych, aplikacja sama pobierze świeże dane z backendu.
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.watchlist(data.user?.id) });
        navigate('/');
      },
    });
  };

  const isLoading = loginMutation.isPending;
  const error = loginMutation.error?.message;

  return (
    <div className="container relative min-h-[calc(100vh-160px)] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <Button
        asChild
        className="absolute left-4 top-4 md:left-8 md:top-8 rounded-full bg-crypto-primary/10 border border-crypto-primary/30 text-crypto-primary hover:bg-crypto-primary/20 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-300 z-20 group h-auto py-2 px-4"
      >
        <Link to="/" className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Powrót
        </Link>
      </Button>

      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:w-[400px] relative z-10">
        <Card className="border-white/10 bg-crypto-card/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-crypto-primary to-crypto-purple opacity-50" />

          <CardHeader className="space-y-1 text-center pt-6 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Logowanie</CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Wprowadź swoje dane, aby przejść do panelu
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            {error && (
              <div className="p-2 text-[10px] font-medium bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="username" className="text-gray-300 ml-1 text-xs">Nazwa użytkownika</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    id="username"
                    placeholder="jan_kowalski"
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
                <Label htmlFor="password" className="text-gray-300 ml-1 text-xs">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
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
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Zaloguj się"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-6 pt-4 bg-transparent border-t-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-crypto-card-solid/80 backdrop-blur-sm px-3 text-gray-500 rounded-full border border-white/5">Nowy użytkownik?</span>
              </div>
            </div>
            <Button variant="outline" asChild className="w-full border-crypto-primary/20 bg-crypto-primary/5 hover:bg-crypto-primary/10 text-crypto-primary hover:text-crypto-primary h-11 transition-all duration-300">
              <Link to="/register">Stwórz nowe konto</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
