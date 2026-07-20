import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Play, Loader2, Calendar } from 'lucide-react';
import { fetchTournamentParticipants } from '../../api/tournaments';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Trophy className="text-primary w-6 h-6" />
                  {tournament.name}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground rounded-lg"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <Badge variant="outline" className={`font-semibold border-none ${tournament.status === 'REGISTRATION' ? 'bg-primary/20 text-primary' : 'bg-blue-500/20 text-blue-400'}`}>
                      {tournament.status === 'REGISTRATION' ? 'Fase de Inscripción' : 'En Progreso / Completado'}
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary text-foreground font-normal">
                      <Users className="w-3.5 h-3.5 mr-1" /> 
                      <span className={isFull ? 'text-destructive font-bold' : ''}>
                        {tournament.enrolled_players_count} / {tournament.max_players} Jugadores
                      </span>
                    </Badge>
                    <Badge variant="secondary" className="bg-secondary text-foreground font-normal">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(tournament.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  {tournament.description && (
                    <p className="text-foreground text-sm bg-secondary/50 p-4 rounded-lg border border-border">
                      {tournament.description}
                    </p>
                  )}
                </div>

                <div className="mb-2 border-t border-border pt-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    Participantes Inscritos
                  </h3>
                  
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : participants.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {participants.map((p) => (
                        <div key={p.id} className="bg-secondary/50 border border-border rounded-lg p-3 text-center text-sm font-medium text-foreground">
                          {p.gamertag}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-secondary/20 rounded-lg border border-dashed border-border text-muted-foreground text-sm">
                      Aún no hay participantes inscritos en este torneo.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-border bg-secondary/10 flex flex-col sm:flex-row gap-3">
                {tournament.status === 'REGISTRATION' && !tournament.is_enrolled && (
                  <Button 
                    onClick={() => { onClose(); onEnroll(tournament.id); }}
                    disabled={isFull}
                    variant={isFull ? "destructive" : "default"}
                    className="flex-1 py-6 rounded-lg text-sm font-bold transition-colors"
                  >
                    {isFull ? 'Torneo Lleno' : 'Inscribirme'}
                  </Button>
                )}

                {tournament.status === 'REGISTRATION' && tournament.is_enrolled && (
                  <Button 
                    variant="destructive"
                    onClick={() => { onClose(); onUnenroll(tournament.id); }}
                    className="flex-1 py-6 rounded-lg text-sm font-bold transition-colors"
                  >
                    Abandonar Torneo
                  </Button>
                )}
                
                {tournament.status === 'REGISTRATION' && isAdmin && (
                  <Button 
                    variant="outline"
                    onClick={() => { onClose(); onGenerate(tournament.id); }}
                    disabled={tournament.enrolled_players_count < 2}
                    className="flex-1 py-6 rounded-lg text-sm font-bold transition-colors border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <Play className="w-4 h-4 mr-2" /> Generar Llaves
                  </Button>
                )}

                {(tournament.status !== 'REGISTRATION') && (
                  <Button 
                    onClick={() => { onClose(); onSelect(tournament.id); }}
                    className="flex-1 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    <Trophy className="w-4 h-4 mr-2" /> Ver Bracket
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
