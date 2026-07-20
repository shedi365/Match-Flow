import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { TournamentList } from './components/Tournaments/TournamentList';
import { BracketTree } from './components/Tournaments/BracketTree';
import { Toaster } from 'sonner';

function AppContent() {
  const { isAuthenticated, logoutUser, gamertag, isAdmin } = useAuth();
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              MatchFlow
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-300">Hola, <strong>{gamertag}</strong></span>
              {isAdmin && (
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
                  Admin
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={logoutUser}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
          >
            Cerrar Sesión
          </button>
        </header>
        <main>
          {selectedTournamentId ? (
            <BracketTree 
              tournamentId={selectedTournamentId} 
              onBack={() => setSelectedTournamentId(null)} 
            />
          ) : (
            <TournamentList onSelect={(id) => setSelectedTournamentId(id)} />
          )}
        </main>
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
