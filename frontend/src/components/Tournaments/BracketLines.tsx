import React from 'react';
import Xarrow from 'react-xarrows';

interface Match {
  id: number;
  tournament_id: number;
  round_number: number;
  match_number: number;
  status: string;
  winner_id: number | null;
}

interface BracketLinesProps {
  matches: Match[];
}

export const BracketLines: React.FC<BracketLinesProps> = ({ matches }) => {
  const arrows = [];
  const Arrow = (Xarrow as any).default || Xarrow;

  for (const match of matches) {
    const nextRound = match.round_number + 1;
    const nextMatchNum = Math.floor((match.match_number + 1) / 2);
    
    const nextMatch = matches.find(m => m.round_number === nextRound && m.match_number === nextMatchNum);
    if (!nextMatch) continue;

    const hasWinnerAdvanced = match.status === 'COMPLETED' && match.winner_id !== null;

    arrows.push(
      <Arrow
        key={`${match.id}-${nextMatch.id}`}
        start={`match-${match.id}`}
        end={`match-${nextMatch.id}`}
        color={hasWinnerAdvanced ? "#a855f7" : "rgba(255,255,255,0.15)"}
        strokeWidth={hasWinnerAdvanced ? 4 : 2}
        path="smooth"
        showHead={false}
        dashness={hasWinnerAdvanced ? { strokeLen: 10, nonStrokeLen: 10, animation: -1 } : false}
        zIndex={0}
        startAnchor={["right", "left"]}
        endAnchor={["left", "right"]}
      />
    );
  }

  return <>{arrows}</>;
};
