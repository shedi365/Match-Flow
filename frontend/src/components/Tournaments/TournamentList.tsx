import React, { useEffect, useState } from 'react';
import { fetchTournaments, createTournament, enrollInTournament, generateBracket } from '../../api/tournaments';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Plus, Users, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tournament {
  id: number;
  name: string;
  status: string;
  enrolled_players_count: number;
}

export const TournamentList: React.FC<{ onSelect: (id: number) => void }> = ({ onSelect }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState('');
  const { isAdmin } = useAuth();

  const loadTournaments = async () => {
    try {
      const data = await fetchTournaments();
      setTournaments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournamentName.trim()) return;
    try {
      await createTournament(newTournamentName);
      setNewTournamentName('');
      setIsCreating(false);
      loadTournaments();
    } catch (e) {
      alert("Error al crear torneo");
    }
  };

  const handleEnroll = async (id: number) => {
    try {
      await enrollInTournament(id);
      loadTournaments();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleGenerate = async (id: number) => {
    if (!confirm("¿Seguro que quieres cerrar inscripciones y generar el bracket?")) return;
    try {
      await generateBracket(id);
      loadTournaments();
      onSelect(id);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-yellow-500" />
          Torneos Activos
        </h2>
        {isAdmin && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" /> Nuevo Torneo
          </button>
        )}
      </div>

      {isCreating && isAdmin && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreate} 
          className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 backdrop-blur-md"
        >
          <input
            type="text"
            value={newTournamentName}
            onChange={(e) => setNewTournamentName(e.target.value)}
            placeholder="Nombre del torneo (ej. Copa FIFA 2026)"
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
            required
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors">
            Crear
          </button>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments.map((t) => (
          <motion.div 
            key={t.id}
            whileHover={{ y: -5 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-xl shadow-lg relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-2 h-full ${t.status === 'OPEN' ? 'bg-green-500' : 'bg-blue-500'}`} />
            
            <h3 className="text-xl font-bold mb-1">{t.name}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {t.enrolled_players_count} inscritos
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {t.status === 'OPEN' ? 'Inscripciones Abiertas' : 'En Progreso'}
              </span>
            </div>

            <div className="flex gap-2">
              {t.status === 'OPEN' && (
                <button 
                  onClick={() => handleEnroll(t.id)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors"
                >
                  Inscribirme
                </button>
              )}
              
              {t.status === 'OPEN' && isAdmin && (
                <button 
                  onClick={() => handleGenerate(t.id)}
                  className="flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Generar Llaves
                </button>
              )}

              {t.status !== 'OPEN' && (
                <button 
                  onClick={() => onSelect(t.id)}
                  className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-semibold transition-colors"
                >
                  Ver Bracket
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {tournaments.length === 0 && !loading && (
          <p className="text-gray-500 col-span-2 text-center py-8">No hay torneos disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
};
