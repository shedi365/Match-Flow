import React, { useEffect, useState } from 'react';
import { fetchMatches } from '../../api/tournaments';
import { Loader2, ArrowLeft, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Match {
  id: number;
  tournament_id: number;
  round_number: number;
  match_number: number;
  player1: { gamertag: string } | null;
  player2: { gamertag: string } | null;
  winner: { gamertag: string } | null;
  score_p1: number;
  score_p2: number;
  status: string;
}

export const BracketTree: React.FC<{ tournamentId: number, onBack: () => void }> = ({ tournamentId, onBack }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const data = await fetchMatches(tournamentId);
        setMatches(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, [tournamentId]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>;

  // Agrupar por ronda
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) acc[match.round_number] = [];
    acc[match.round_number].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Torneos
      </button>
      
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl overflow-x-auto">
        <h2 className="text-2xl font-bold mb-8">Bracket del Torneo</h2>
        
        <div className="flex gap-16 min-w-max">
          {Object.entries(rounds).map(([roundNum, roundMatches]) => (
            <div key={roundNum} className="flex flex-col justify-around gap-8">
              <h3 className="text-center font-bold text-gray-500 uppercase tracking-widest text-sm mb-4">
                Ronda {roundNum}
              </h3>
              
              {roundMatches.map((match) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={match.id} 
                  className="w-64 bg-black/40 border border-white/10 rounded-xl overflow-hidden shadow-2xl relative"
                >
                  {/* Etiqueta de Bye o Estado */}
                  {match.status === 'COMPLETED' && !match.player2 && (
                    <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                      BYE
                    </div>
                  )}
                  
                  {/* Jugador 1 */}
                  <div className={`flex justify-between items-center p-3 border-b border-white/5 ${match.winner?.gamertag === match.player1?.gamertag ? 'bg-green-500/10' : ''}`}>
                    <span className="flex items-center gap-2 font-semibold">
                      <User className="w-4 h-4 text-gray-400" />
                      {match.player1?.gamertag || <span className="text-gray-500 italic">Por definir</span>}
                    </span>
                    <span className="font-mono font-bold">{match.score_p1 ?? '-'}</span>
                  </div>
                  
                  {/* Jugador 2 */}
                  <div className={`flex justify-between items-center p-3 ${match.winner?.gamertag === match.player2?.gamertag ? 'bg-green-500/10' : ''}`}>
                    <span className="flex items-center gap-2 font-semibold">
                      <User className="w-4 h-4 text-gray-400" />
                      {match.player2?.gamertag || <span className="text-gray-500 italic">Por definir</span>}
                    </span>
                    <span className="font-mono font-bold">{match.score_p2 ?? '-'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
          
          {matches.length === 0 && (
            <p className="text-gray-500">Aún no se han generado las llaves de este torneo.</p>
          )}
        </div>
      </div>
    </div>
  );
};
