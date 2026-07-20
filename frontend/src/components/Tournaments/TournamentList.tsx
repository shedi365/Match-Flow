import React, { useEffect, useState } from 'react';
import { fetchTournaments, enrollInTournament, generateBracket, deleteTournament } from '../../api/tournaments';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Plus, Users, Play, Loader2, Calendar, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateTournamentModal } from './CreateTournamentModal';
import { toast } from 'sonner';

interface Tournament {
  id: number;
  name: string;
  description: string | null;
  max_players: number;
  status: string;
  enrolled_players_count: number;
  is_enrolled: boolean;
  created_at: string;
}

export const TournamentList: React.FC<{ onSelect: (id: number) => void }> = ({ onSelect }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_tournaments' | 'available'>('my_tournaments');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAdmin } = useAuth();

  const loadTournaments = async () => {
    try {
      const data = await fetchTournaments();
      setTournaments(data);
    } catch (e) {
      console.error(e);
      toast.error("No se pudieron cargar los torneos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleEnroll = async (id: number) => {
    try {
      await enrollInTournament(id);
      toast.success("Te has inscrito al torneo exitosamente");
      loadTournaments();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleGenerate = (id: number) => {
    toast('¿Generar el bracket ahora?', {
      description: 'Esto cerrará las inscripciones de forma permanente.',
      action: {
        label: 'Generar',
        onClick: async () => {
          try {
            await generateBracket(id);
            toast.success("Bracket generado exitosamente");
            loadTournaments();
            onSelect(id);
          } catch (e: any) {
            toast.error(e.message);
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleDelete = (id: number, name: string) => {
    toast.error(`¿Eliminar el torneo "${name}"?`, {
      description: 'Esta acción es irreversible y eliminará todos los partidos e inscripciones asociadas.',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            await deleteTournament(id);
            toast.success(`Torneo "${name}" eliminado`);
            loadTournaments();
          } catch (e: any) {
            toast.error(e.message);
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  // Filtrar torneos
  const myTournaments = tournaments.filter(t => t.is_enrolled);
  const availableTournaments = tournaments.filter(t => !t.is_enrolled && t.status === 'REGISTRATION');

  const displayedTournaments = (activeTab === 'my_tournaments' ? myTournaments : availableTournaments)
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('my_tournaments')}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'my_tournaments' 
                ? 'bg-purple-600 shadow-lg text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Mis Torneos
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'available' 
                ? 'bg-purple-600 shadow-lg text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Disponibles
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-purple-500/20 font-semibold text-sm"
          >
            <Plus className="w-5 h-5" /> Nuevo Torneo
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors sm:text-sm"
          placeholder="Buscar torneo por nombre..."
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {displayedTournaments.map((t) => {
            const isFull = t.enrolled_players_count >= t.max_players;

            return (
              <motion.div 
                key={t.id}
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-lg relative overflow-hidden group flex flex-col"
              >
                <div className={`absolute top-0 right-0 w-2 h-full ${t.status === 'REGISTRATION' ? 'bg-green-500' : 'bg-blue-500'}`} />
                
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="absolute top-4 right-4 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-red-500/20"
                    title="Eliminar Torneo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 pr-10">{t.name}</h3>
                  {t.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{t.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
                    <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" /> 
                      <span className={isFull ? 'text-red-400 font-bold' : ''}>
                        {t.enrolled_players_count} / {t.max_players}
                      </span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === 'REGISTRATION' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {t.status === 'REGISTRATION' ? 'Abierto' : 'En Progreso'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto">
                  {t.status === 'REGISTRATION' && activeTab === 'available' && !t.is_enrolled && (
                    <button 
                      onClick={() => handleEnroll(t.id)}
                      disabled={isFull}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isFull 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed' 
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      {isFull ? 'Torneo Lleno' : 'Inscribirme'}
                    </button>
                  )}
                  
                  {t.status === 'REGISTRATION' && isAdmin && (
                    <button 
                      onClick={() => handleGenerate(t.id)}
                      className="flex-1 py-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Generar Llaves
                    </button>
                  )}

                  {(t.status !== 'REGISTRATION' || activeTab === 'my_tournaments') && (
                    <button 
                      onClick={() => onSelect(t.id)}
                      className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-4 h-4" /> Ver Bracket
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {displayedTournaments.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-12 text-center text-gray-500 bg-white/5 border border-white/5 rounded-2xl border-dashed">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchQuery
                  ? `No se encontraron torneos con el nombre "${searchQuery}".`
                  : activeTab === 'my_tournaments' 
                    ? "No estás inscrito en ningún torneo actualmente." 
                    : "No hay torneos disponibles para inscripción en este momento."}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <CreateTournamentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={loadTournaments} 
      />
    </div>
  );
};
