import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Play, Loader2, Calendar } from 'lucide-react';
import { fetchTournamentParticipants } from '../../api/tournaments';

interface User {
  id: number;
  gamertag: string;
}

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

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  isAdmin: boolean;
  onEnroll: (id: number) => void;
  onUnenroll: (id: number) => void;
  onGenerate: (id: number) => void;
  onSelect: (id: number) => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  isAdmin,
  onEnroll,
  onUnenroll,
  onGenerate,
  onSelect
}) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tournament) {
      const loadParticipants = async () => {
        setLoading(true);
        try {
          const data = await fetchTournamentParticipants(tournament.id);
          setParticipants(data);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      loadParticipants();
    }
  }, [isOpen, tournament]);

  if (!tournament) return null;

  const isFull = tournament.enrolled_players_count >= tournament.max_players;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <Trophy className="text-purple-500 w-6 h-6" />
                  {tournament.name}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tournament.status === 'REGISTRATION' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {tournament.status === 'REGISTRATION' ? 'Fase de Inscripción' : 'En Progreso / Completado'}
                    </span>
                    <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" /> 
                      <span className={isFull ? 'text-red-400 font-bold' : ''}>
                        {tournament.enrolled_players_count} / {tournament.max_players} Jugadores
                      </span>
                    </span>
                    <span className="flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {new Date(tournament.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {tournament.description && (
                    <p className="text-gray-300 text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                      {tournament.description}
                    </p>
                  )}
                </div>

                <div className="mb-2 border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    Participantes Inscritos
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    </div>
                  ) : participants.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {participants.map((p) => (
                        <div key={p.id} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center text-sm font-medium text-gray-200">
                          {p.gamertag}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500 text-sm">
                      Aún no hay participantes inscritos en este torneo.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row gap-3">
                {tournament.status === 'REGISTRATION' && !tournament.is_enrolled && (
                  <button 
                    onClick={() => { onClose(); onEnroll(tournament.id); }}
                    disabled={isFull}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isFull 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {isFull ? 'Torneo Lleno' : 'Inscribirme'}
                  </button>
                )}

                {tournament.status === 'REGISTRATION' && tournament.is_enrolled && (
                  <button 
                    onClick={() => { onClose(); onUnenroll(tournament.id); }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30"
                  >
                    Abandonar Torneo
                  </button>
                )}
                
                {tournament.status === 'REGISTRATION' && isAdmin && (
                  <button 
                    onClick={() => { onClose(); onGenerate(tournament.id); }}
                    disabled={tournament.enrolled_players_count < 2}
                    className="flex-1 py-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4" /> Generar Llaves
                  </button>
                )}

                {(tournament.status !== 'REGISTRATION') && (
                  <button 
                    onClick={() => { onClose(); onSelect(tournament.id); }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-4 h-4" /> Ver Bracket
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
