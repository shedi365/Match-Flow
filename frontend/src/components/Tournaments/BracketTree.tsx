import React, { useEffect, useState } from 'react';
import { fetchMatches } from '../../api/tournaments';
import { Loader2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { MatchResultModal } from '../Matches/MatchResultModal';
import { Podium } from './Podium';
import { BracketLines } from './BracketLines';
import { Xwrapper } from 'react-xarrows';
import { ScrollArea } from '../ui/scroll-area';

interface Match {
  id: number;
  tournament_id: number;
  round_number: number;
  match_number: number;
  player1: { gamertag: string } | null;
  player2: { gamertag: string } | null;
  winner: { gamertag: string } | null;
  winner_id: number | null;
  score_p1: number | null;
  score_p2: number | null;
  penalties_p1: number | null;
  penalties_p2: number | null;
  status: string;
  p1_has_reported: boolean;
  p2_has_reported: boolean;
  p1_evidence_url: string | null;
  p2_evidence_url: string | null;
}

export const BracketTree: React.FC<{ tournamentId: number, onBack: () => void }> = ({ tournamentId }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const loadMatches = async () => {
    try {
      const data = await fetchMatches(tournamentId);
      setMatches(data);
      if (selectedMatch) {
        const updated = data.find((m: Match) => m.id === selectedMatch.id);
        if (updated) setSelectedMatch(updated);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [tournamentId]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>;

  // Agrupar por ronda
  const rounds = matches.reduce((acc, match) => {
    if (!acc[match.round_number]) acc[match.round_number] = [];
    acc[match.round_number].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => b - a);
  const highestRound = roundNumbers.length > 0 ? roundNumbers[0] : null;
  const isTournamentCompleted = highestRound 
    ? rounds[highestRound].every(m => m.status === 'COMPLETED' && m.winner) 
    : false;
  const tournamentWinner = isTournamentCompleted ? rounds[highestRound!][0].winner?.gamertag : null;

  // Split into left, right, center
  const leftRounds: Record<number, Match[]> = {};
  const rightRounds: Record<number, Match[]> = {};
  let finalMatch: Match | null = null;

  Object.entries(rounds).forEach(([roundNumStr, roundMatches]) => {
    const roundNum = Number(roundNumStr);
    
    // Si es la ronda más alta y solo hay un partido, es la final (Centro)
    if (roundNum === highestRound && roundMatches.length === 1) {
      finalMatch = roundMatches[0];
      return;
    }

    const totalInRound = roundMatches.length;
    const midPoint = totalInRound / 2; 
    
    leftRounds[roundNum] = [];
    rightRounds[roundNum] = [];

    const sorted = [...roundMatches].sort((a, b) => a.match_number - b.match_number);
    
    sorted.forEach((match, idx) => {
      if (idx < midPoint) {
        leftRounds[roundNum].push(match);
      } else {
        rightRounds[roundNum].push(match);
      }
    });
  });

  const leftRoundNumbers = Object.keys(leftRounds).map(Number).sort((a, b) => a - b);
  const rightRoundNumbers = Object.keys(rightRounds).map(Number).sort((a, b) => a - b);

  const renderMatchCard = (match: Match) => (
    <motion.div 
      id={`match-${match.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      key={match.id} 
      onClick={() => {
        if (match.player2) {
          setSelectedMatch(match);
        }
      }}
      className={`w-64 bg-card border border-border rounded-xl overflow-hidden shadow-2xl relative z-10 ${match.player2 ? 'cursor-pointer hover:border-primary/50 hover:shadow-primary/20 transition-all' : ''}`}
    >
      {match.status === 'COMPLETED' && !match.player2 && (
        <div className="absolute top-0 right-0 bg-secondary text-foreground text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
          BYE
        </div>
      )}
      {match.status === 'IN_PROGRESS' && (
        <div className="absolute top-0 right-0 flex items-center gap-1 bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-bl-lg font-bold shadow-lg">
          <motion.div 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
          EN CURSO
        </div>
      )}
      
      <div className={`flex justify-between items-center p-3 border-b border-border ${match.winner?.gamertag === match.player1?.gamertag ? 'bg-primary/20' : ''}`}>
        <span className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <User className="w-4 h-4 text-muted-foreground" />
          {match.player1?.gamertag || <span className="text-muted-foreground italic">Por definir</span>}
        </span>
        <span className="font-mono font-bold text-foreground">{match.score_p1 ?? '-'}</span>
      </div>
      
      <div className={`flex justify-between items-center p-3 ${match.winner?.gamertag === match.player2?.gamertag ? 'bg-primary/20' : ''}`}>
        <span className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <User className="w-4 h-4 text-muted-foreground" />
          {match.player2?.gamertag || <span className="text-muted-foreground italic">Por definir</span>}
        </span>
        <span className="font-mono font-bold text-foreground">{match.score_p2 ?? '-'}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur-sm border border-border p-2 md:p-8 rounded-3xl relative">
        <h2 className="text-2xl font-black italic tracking-tight uppercase mb-8 text-center text-foreground drop-shadow-md">
          Bracket del <span className="text-primary">Torneo</span>
        </h2>
        
        {matches.length > 0 ? (
          <ScrollArea className="w-full rounded-md border border-border/50 bg-background/50">
            <Xwrapper>
              <div className="flex gap-20 min-w-max relative justify-center items-center py-12 px-12">
                <BracketLines matches={matches} />
                
                {/* Lado Izquierdo */}
                <div className="flex gap-16">
                  {leftRoundNumbers.map(roundNum => (
                    <div key={`left-${roundNum}`} className="flex flex-col justify-around gap-8">
                      {leftRounds[roundNum].map(match => renderMatchCard(match))}
                    </div>
                  ))}
                </div>

                {/* Centro (La Final) */}
                <div className="flex flex-col items-center justify-center gap-8 mx-8">
                  <h3 className="text-center font-black text-primary uppercase tracking-widest text-lg drop-shadow-md">
                    Gran Final
                  </h3>
                  {finalMatch && renderMatchCard(finalMatch)}
                  
                  {isTournamentCompleted && tournamentWinner && (
                    <Podium winnerGamertag={tournamentWinner} />
                  )}
                </div>

                {/* Lado Derecho */}
                <div className="flex gap-16">
                  {[...rightRoundNumbers].reverse().map(roundNum => (
                    <div key={`right-${roundNum}`} className="flex flex-col justify-around gap-8">
                      {rightRounds[roundNum].map(match => renderMatchCard(match))}
                    </div>
                  ))}
                </div>
              </div>
            </Xwrapper>
          </ScrollArea>
        ) : (
          <p className="text-muted-foreground text-center py-12">Aún no se han generado las llaves de este torneo.</p>
        )}
      </div>
      
      <MatchResultModal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onUpdated={loadMatches}
        match={selectedMatch as any}
      />
    </div>
  );
};
