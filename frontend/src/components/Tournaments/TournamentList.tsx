import React, { useEffect, useState } from 'react';
import { fetchTournaments, enrollInTournament, unenrollFromTournament, generateBracket, deleteTournament } from '../../api/tournaments';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Plus, Users, Loader2, Calendar, Search, Trash2, Filter, MoreVertical, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateTournamentModal } from './CreateTournamentModal';
import { TournamentModal } from './TournamentModal';
import { EditTournamentModal } from './EditTournamentModal';
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'my_tournaments' | 'available' | 'history'>('my_tournaments');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPlayersFilter, setMaxPlayersFilter] = useState<number | 'all'>('all');
  const { isAdmin } = useAuth();

  const loadTournaments = async () => {
    try {
      const data = await fetchTournaments();
      setTournaments(data);
      if (selectedTournament) {
        const updated = data.find((t: Tournament) => t.id === selectedTournament.id);
        if (updated) setSelectedTournament(updated);
      }
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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

  const handleUnenroll = async (id: number) => {
    try {
      await unenrollFromTournament(id);
      toast.success("Has abandonado el torneo");
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
  const myTournaments = tournaments.filter(t => t.is_enrolled && t.status !== 'COMPLETED');
  const availableTournaments = tournaments.filter(t => !t.is_enrolled && t.status === 'REGISTRATION');
  const historyTournaments = tournaments.filter(t => t.status === 'COMPLETED');

  const displayedTournaments = (
    activeTab === 'my_tournaments' ? myTournaments : 
    activeTab === 'available' ? availableTournaments : 
    historyTournaments
  )
    .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(t => maxPlayersFilter === 'all' || t.max_players === maxPlayersFilter);

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
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'history' 
                ? 'bg-purple-600 shadow-lg text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Historial
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-purple-500/20 font-semibold text-sm"
          >
            <Plus className="w-5 h-5" /> Nuevo Torneo
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <select
            value={maxPlayersFilter}
            onChange={(e) => setMaxPlayersFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="block w-full pl-9 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-[#1a1a1a] text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors sm:text-sm appearance-none"
          >
            <option value="all">Tamaño: Todos</option>
            <option value={4}>4 Jugadores</option>
            <option value={8}>8 Jugadores</option>
            <option value={16}>16 Jugadores</option>
            <option value={32}>32 Jugadores</option>
            <option value={64}>64 Jugadores</option>
          </select>
        </div>
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
                onClick={() => setSelectedTournament(t)}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-lg relative group flex flex-col cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className={`absolute top-0 right-0 w-2 h-full rounded-r-2xl ${
                  t.status === 'REGISTRATION' ? 'bg-green-500' : 
                  t.status === 'COMPLETED' ? 'bg-purple-500' : 
                  'bg-blue-500'
                }`} />
                
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === t.id ? null : t.id);
                      }}
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all border border-white/10"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {openDropdownId === t.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-40 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTournament(t);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors text-left"
                          >
                            <Edit2 className="w-4 h-4" /> Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(t.id, t.name);
                              setOpenDropdownId(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                          >
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1 pr-10 flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-purple-400" /> {t.name}
                  </h3>
                  {t.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{t.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-4">
                    <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" /> 
                      <span className={isFull ? 'text-red-400 font-bold' : ''}>
                        {t.enrolled_players_count} / {t.max_players}
                      </span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      t.status === 'REGISTRATION' ? 'bg-green-500/20 text-green-400' : 
                      t.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-400' : 
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {t.status === 'REGISTRATION' ? 'Abierto' : 
                       t.status === 'COMPLETED' ? 'Culminado' : 
                       'En Progreso'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {displayedTournaments.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-12 text-center text-gray-500 bg-white/5 border border-white/5 rounded-2xl border-dashed">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchQuery || maxPlayersFilter !== 'all'
                  ? `No se encontraron torneos que coincidan con los filtros.`
                  : activeTab === 'my_tournaments' 
                    ? "No estás inscrito en ningún torneo activo actualmente." 
                    : activeTab === 'history'
                      ? "Aún no hay torneos culminados."
                      : "No hay torneos disponibles para inscripción en este momento."}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <CreateTournamentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={loadTournaments} 
      />

      <EditTournamentModal 
        isOpen={!!editingTournament}
        onClose={() => setEditingTournament(null)}
        onUpdated={loadTournaments}
        tournament={editingTournament}
      />

      <TournamentModal
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        tournament={selectedTournament}
        isAdmin={isAdmin}
        onEnroll={handleEnroll}
        onUnenroll={handleUnenroll}
        onGenerate={handleGenerate}
        onSelect={onSelect}
      />
    </div>
  );
};
