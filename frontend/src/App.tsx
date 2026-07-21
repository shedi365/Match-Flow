import { useState, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { TournamentList } from "./components/Tournaments/TournamentList";
import { BracketTree } from "./components/Tournaments/BracketTree";
import { SettingsModal } from "./components/Profile/SettingsModal";
import { Toaster } from 'sonner';
import { LogOut, ArrowLeft, Trophy, Settings, User, HelpCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { Button } from "./components/ui/button";

function AppContent() {
  const { isAuthenticated, logoutUser, gamertag, isAdmin } = useAuth();
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'my_tournaments' | 'available' | 'history'>('my_tournaments');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security'>('profile');

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      popoverClass: 'matchflow-theme',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Listo',
      steps: [
        { element: '#tabs-navigation', popover: { title: 'Navegación', description: 'Usa estas pestañas para ver tus torneos, explorar otros nuevos o ver el historial.', side: "bottom", align: 'start' } },
        { element: '#tournaments-list', popover: { title: 'Torneos', description: 'Aquí verás la lista de torneos. Selecciona uno para ver sus detalles o unirte.', side: "top", align: 'start' } },
        { element: '#profile-menu', popover: { title: 'Perfil y Configuración', description: 'Accede a tu perfil, cambia tu configuración de seguridad o cierra sesión.', side: "left", align: 'start' } },
      ]
    });
    driverObj.drive();
  };

  useEffect(() => {
    if (isAuthenticated) {
      const tourCompleted = localStorage.getItem('tourCompleted');
      if (!tourCompleted) {
        setTimeout(() => {
          startTour();
          localStorage.setItem('tourCompleted', 'true');
        }, 500);
      }
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 flex justify-between items-center bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4">
        {/* Logo (Izquierda) */}
        <div 
          className="w-1/3 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setSelectedTournamentId(null);
            setActiveTab('my_tournaments');
          }}
        >
          <Trophy className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">
            Match<span className="text-primary">Flow</span>
          </h1>
        </div>

        {/* Centro: Pestañas o Botón Volver */}
        <div className="w-1/3 flex justify-center">
          {selectedTournamentId ? (
            <Button
              variant="outline"
              onClick={() => setSelectedTournamentId(null)}
              className="gap-2 bg-secondary/50 hover:bg-secondary border-border"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Torneos
            </Button>
          ) : (
            <Tabs 
              id="tabs-navigation"
              value={activeTab} 
              onValueChange={(val) => setActiveTab(val as any)}
              className="w-full max-w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50 border border-border h-11">
                <TabsTrigger value="my_tournaments" className="data-[active]:bg-primary data-[active]:text-primary-foreground font-bold rounded-md transition-all">Mis Torneos</TabsTrigger>
                <TabsTrigger value="available" className="data-[active]:bg-primary data-[active]:text-primary-foreground font-bold rounded-md transition-all">Disponibles</TabsTrigger>
                <TabsTrigger value="history" className="data-[active]:bg-primary data-[active]:text-primary-foreground font-bold rounded-md transition-all">Historial</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* Derecha: Perfil y Logout */}
        <div className="w-1/3 flex justify-end items-center gap-4">
          <Button variant="ghost" size="icon" onClick={startTour} className="rounded-full hover:bg-secondary/50 border border-transparent">
            <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
          <div id="profile-menu">
            <DropdownMenu>
              <DropdownMenuTrigger 
              render={
                <Button variant="ghost" className="relative h-12 w-12 rounded-full focus-visible:ring-primary hover:bg-secondary/50 p-0 border border-border">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold">
                      {getInitials(gamertag)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              }
            />
            <DropdownMenuContent className="w-56 bg-card border-border" align="end">
              <div className="px-2 py-1.5 text-sm font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="font-bold text-foreground leading-none">{gamertag}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {isAdmin ? 'Administrador' : 'Jugador'}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-secondary/50"
                onClick={() => { setSettingsTab('profile'); setIsSettingsOpen(true); }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer focus:bg-secondary/50"
                onClick={() => { setSettingsTab('security'); setIsSettingsOpen(true); }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                onClick={logoutUser}
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <main>
            {selectedTournamentId ? (
              <BracketTree 
                tournamentId={selectedTournamentId} 
                onBack={() => setSelectedTournamentId(null)} 
              />
            ) : (
              <TournamentList 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                onSelect={(id) => setSelectedTournamentId(id)} 
              />
            )}
          </main>
        </div>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        defaultTab={settingsTab} 
      />
    </div>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster theme="dark" position="top-center" richColors />
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
