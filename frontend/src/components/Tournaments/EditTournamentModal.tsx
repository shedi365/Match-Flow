import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, X, Loader2 } from 'lucide-react';
import { updateTournament } from '../../api/tournaments';
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

interface EditTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  tournament: Tournament | null;
}

export const EditTournamentModal: React.FC<EditTournamentModalProps> = ({ isOpen, onClose, onUpdated, tournament }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tournament && isOpen) {
      setName(tournament.name);
      setDescription(tournament.description || '');
      setMaxPlayers(tournament.max_players);
      setError('');
    }
  }, [tournament, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;
    
    setError('');
    setIsLoading(true);

    try {
      await updateTournament(tournament.id, name, description, maxPlayers);
      toast.success("Torneo actualizado exitosamente");
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && tournament && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <Edit2 className="text-blue-500 w-6 h-6" />
                  Editar Torneo
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Torneo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      placeholder="Ej: Copa de Verano 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Descripción (Opcional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors h-24 resize-none"
                      placeholder="Reglas, premios, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Límite de Jugadores 
                      <span className="text-xs text-gray-500 ml-2">(Mínimo: {tournament.enrolled_players_count})</span>
                    </label>
                    <select
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(Number(e.target.value))}
                      className="w-full px-4 py-2 bg-[#2a2a2a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    >
                      <option value={4}>4 Jugadores</option>
                      <option value={8}>8 Jugadores</option>
                      <option value={16}>16 Jugadores</option>
                      <option value={32}>32 Jugadores</option>
                      <option value={64}>64 Jugadores</option>
                    </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex justify-center items-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
