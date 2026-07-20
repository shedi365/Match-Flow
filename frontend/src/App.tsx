import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { TournamentList } from './components/Tournaments/TournamentList';
import { BracketTree } from './components/Tournaments/BracketTree';
import { Toaster } from 'sonner';
import { LogOut, ArrowLeft } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, logoutUser, gamertag, isAdmin } = useAuth();
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'my_tournaments' | 'available' | 'history'>('my_tournaments');

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <header className="sticky top-0 z-50 flex justify-between items-center bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-white/10 px-8 py-4">
          {/* Logo (Izquierda) */}
          <div className="w-1/3">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              MatchFlow
            </h1>
          </div>

          {/* Centro: Pestañas o Botón Volver */}
          <div className="w-1/3 flex justify-center">
            {selectedTournamentId ? (
              <button
                onClick={() => setSelectedTournamentId(null)}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" /> Volver a Torneos
              </button>
            ) : (
              <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setActiveTab('my_tournaments')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'my_tournaments' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Mis Torneos
                </button>
                <button
                  onClick={() => setActiveTab('available')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'available' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Disponibles
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Historial
                </button>
              </div>
            )}
          </div>

          {/* Derecha: Perfil y Logout */}
          <div className="w-1/3 flex justify-end items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-200 font-bold">{gamertag}</p>
              {isAdmin && (
                <span className="inline-block mt-0.5 bg-purple-500/20 text-purple-300 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-500/30">
                  Admin
                </span>
              )}
            </div>
            <div className="w-px h-8 bg-white/10 mx-1"></div>
            <button 
              onClick={logoutUser}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster theme="dark" position="bottom-right" richColors />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
