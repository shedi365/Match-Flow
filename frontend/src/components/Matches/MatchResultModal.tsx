import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Loader2, CheckCircle2, ShieldAlert, Upload, Trophy } from 'lucide-react';
import { startMatch, reportMatchResult, verifyMatchResult } from '../../api/tournaments';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface Match {
  id: number;
  tournament_id: number;
  round_number: number;
  match_number: number;
  player1_id: number;
  player2_id: number;
  player1: { id: number, gamertag: string } | null;
  player2: { id: number, gamertag: string } | null;
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
  evidence_url?: string | null;
}

interface MatchResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  match: Match | null;
}

export const MatchResultModal: React.FC<MatchResultModalProps> = ({ isOpen, onClose, onUpdated, match }) => {
  const { gamertag, isAdmin } = useAuth();
  
  const [scoreP1, setScoreP1] = useState<number | ''>('');
  const [scoreP2, setScoreP2] = useState<number | ''>('');
  const [penaltiesP1, setPenaltiesP1] = useState<number | ''>('');
  const [penaltiesP2, setPenaltiesP2] = useState<number | ''>('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isTied = scoreP1 !== '' && scoreP2 !== '' && Number(scoreP1) === Number(scoreP2);
  
  // Checks if current user is involved in this match
  const isParticipant = gamertag && match && (gamertag === match.player1?.gamertag || gamertag === match.player2?.gamertag);

  useEffect(() => {
    if (match && isOpen) {
      setScoreP1(match.score_p1 ?? '');
      setScoreP2(match.score_p2 ?? '');
      setPenaltiesP1(match.penalties_p1 ?? '');
      setPenaltiesP2(match.penalties_p2 ?? '');
      setEvidenceUrl('');
      setError('');
    }
  }, [match, isOpen]);

  if (!match) return null;

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await startMatch(match.id);
      toast.success("¡Partido iniciado!");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreP1 === '' || scoreP2 === '') {
      setError("Debes ingresar los goles de ambos jugadores");
      return;
    }
    if (isTied && (penaltiesP1 === '' || penaltiesP2 === '')) {
      setError("Debes ingresar el resultado de los penaltis para desempatar");
      return;
    }
    if (isTied && Number(penaltiesP1) === Number(penaltiesP2)) {
      setError("Los penaltis no pueden terminar en empate");
      return;
    }

    setIsLoading(true);
    try {
      await reportMatchResult(match.id, {
        score_p1: Number(scoreP1),
        score_p2: Number(scoreP2),
        penalties_p1: isTied ? Number(penaltiesP1) : null,
        penalties_p2: isTied ? Number(penaltiesP2) : null,
        evidence_url: evidenceUrl || null
      });
      toast.success("Resultado reportado. Esperando validación del administrador.");
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreP1 === '' || scoreP2 === '') {
      setError("Faltan goles");
      return;
    }
    
    const p1Score = Number(scoreP1);
    const p2Score = Number(scoreP2);
    let p1Pen = isTied ? Number(penaltiesP1) : null;
    let p2Pen = isTied ? Number(penaltiesP2) : null;
    
    if (isTied && (p1Pen === null || p2Pen === null)) {
      setError("Faltan penaltis");
      return;
    }
    
    let winnerId: number;
    if (p1Score > p2Score) winnerId = match.player1_id;
    else if (p2Score > p1Score) winnerId = match.player2_id;
    else if (p1Pen! > p2Pen!) winnerId = match.player1_id;
    else if (p2Pen! > p1Pen!) winnerId = match.player2_id;
    else {
      setError("Empate total no permitido");
      return;
    }

    setIsLoading(true);
    try {
      await verifyMatchResult(match.id, {
        score_p1: p1Score,
        score_p2: p2Score,
        penalties_p1: p1Pen,
        penalties_p2: p2Pen,
        winner_id: winnerId
      });
      toast.success("Resultado verificado y finalizado");
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
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <Swords className="text-purple-400 w-6 h-6" />
                  Ronda {match.round_number} - Partido {match.match_number}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {/* Visual VS Display */}
                <div className="flex justify-between items-center mb-8 px-4">
                  <div className="text-center w-1/3">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <span className="font-bold text-xl text-blue-400">{match.player1?.gamertag?.charAt(0).toUpperCase() || '?'}</span>
                    </div>
                    <p className="font-bold text-white truncate">{match.player1?.gamertag || 'Por definir'}</p>
                  </div>
                  <div className="text-2xl font-black text-gray-500 italic">VS</div>
                  <div className="text-center w-1/3">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                      <span className="font-bold text-xl text-red-400">{match.player2?.gamertag?.charAt(0).toUpperCase() || '?'}</span>
                    </div>
                    <p className="font-bold text-white truncate">{match.player2?.gamertag || 'Por definir'}</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> {error}
                  </div>
                )}

                {/* State: PENDING */}
                {match.status === 'PENDING' && (
                  <div className="text-center py-6">
                    <p className="text-gray-400 mb-6">Este partido aún no ha comenzado.</p>
                    {(isAdmin || isParticipant) && match.player1 && match.player2 && (
                      <button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="w-full max-w-xs mx-auto flex justify-center items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] font-bold text-lg disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Swords className="w-5 h-5" /> Iniciar Partido</>}
                      </button>
                    )}
                  </div>
                )}

                {/* State: IN_PROGRESS or AWAITING_VALIDATION (Editing Form) */}
                {((match.status === 'IN_PROGRESS' && isParticipant) || 
                  (match.status === 'AWAITING_VALIDATION' && isAdmin) ||
                  (match.status === 'IN_PROGRESS' && isAdmin)) && (
                  <form onSubmit={isAdmin ? handleVerify : handleReport} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest text-center mb-4">Goles</h3>
                      <div className="flex justify-center items-center gap-6">
                        <input
                          type="number"
                          min="0"
                          value={scoreP1}
                          onChange={(e) => setScoreP1(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-20 text-center text-3xl font-black px-2 py-3 bg-black/40 border border-blue-500/30 rounded-xl text-blue-400 focus:outline-none focus:border-blue-500 transition-colors"
                          placeholder="0"
                        />
                        <span className="text-xl text-gray-600">-</span>
                        <input
                          type="number"
                          min="0"
                          value={scoreP2}
                          onChange={(e) => setScoreP2(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-20 text-center text-3xl font-black px-2 py-3 bg-black/40 border border-red-500/30 rounded-xl text-red-400 focus:outline-none focus:border-red-500 transition-colors"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isTied && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-yellow-500/80 uppercase tracking-widest text-center mb-4">Tanda de Penaltis</h3>
                            <div className="flex justify-center items-center gap-6">
                              <input
                                type="number"
                                min="0"
                                value={penaltiesP1}
                                onChange={(e) => setPenaltiesP1(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-16 text-center text-xl font-bold px-2 py-2 bg-black/40 border border-yellow-500/30 rounded-xl text-yellow-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                placeholder="0"
                              />
                              <span className="text-sm text-yellow-600/50">VS</span>
                              <input
                                type="number"
                                min="0"
                                value={penaltiesP2}
                                onChange={(e) => setPenaltiesP2(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-16 text-center text-xl font-bold px-2 py-2 bg-black/40 border border-yellow-500/30 rounded-xl text-yellow-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {match.status === 'IN_PROGRESS' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Enlace de Evidencia (Opcional)
                        </label>
                        <input
                          type="url"
                          value={evidenceUrl}
                          onChange={(e) => setEvidenceUrl(e.target.value)}
                          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                          placeholder="https://imgur.com/... o clip de Twitch"
                        />
                      </div>
                    )}

                    {(match.status === 'AWAITING_VALIDATION' || match.status === 'IN_PROGRESS') && isAdmin && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                        Como administrador, al guardar finalizarás el partido directamente con este marcador.
                        {(match.p1_evidence_url || match.p2_evidence_url) && (
                          <div className="mt-2 pt-2 border-t border-blue-500/20">
                            <strong>Evidencias:</strong>
                            {match.p1_evidence_url && <a href={match.p1_evidence_url} target="_blank" rel="noreferrer" className="block text-blue-400 hover:underline">Prueba Jugador 1</a>}
                            {match.p2_evidence_url && <a href={match.p2_evidence_url} target="_blank" rel="noreferrer" className="block text-red-400 hover:underline">Prueba Jugador 2</a>}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all font-bold text-lg disabled:opacity-50 shadow-lg shadow-purple-500/25"
                      >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                          isAdmin ? <><CheckCircle2 className="w-5 h-5" /> Verificar y Finalizar</> : <><Swords className="w-5 h-5" /> Reportar Resultado</>
                        }
                      </button>
                    </div>
                  </form>
                )}

                {/* State: AWAITING_VALIDATION (Read Only for non-admin) */}
                {match.status === 'AWAITING_VALIDATION' && !isAdmin && (
                  <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/10">
                    <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Esperando Validación</h3>
                    <p className="text-gray-400">El resultado ha sido reportado y está siendo revisado por un administrador.</p>
                  </div>
                )}

                {/* State: COMPLETED */}
                {match.status === 'COMPLETED' && (
                  <div className="text-center space-y-6">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-24 h-24 text-green-500" />
                      </div>
                      <h3 className="text-sm font-bold text-green-500 uppercase tracking-widest mb-4">Resultado Final</h3>
                      <div className="flex justify-center items-center gap-6 relative z-10">
                        <span className={`text-4xl font-black ${match.winner_id === match.player1_id ? 'text-green-400' : 'text-gray-500'}`}>{match.score_p1}</span>
                        <span className="text-xl text-gray-600">-</span>
                        <span className={`text-4xl font-black ${match.winner_id === match.player2_id ? 'text-green-400' : 'text-gray-500'}`}>{match.score_p2}</span>
                      </div>
                      
                      {match.penalties_p1 !== null && (
                        <div className="mt-4 pt-4 border-t border-green-500/20 relative z-10">
                          <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Penaltis</p>
                          <div className="flex justify-center items-center gap-4">
                            <span className={`text-xl font-bold ${match.winner_id === match.player1_id ? 'text-yellow-400' : 'text-gray-500'}`}>{match.penalties_p1}</span>
                            <span className="text-gray-600">-</span>
                            <span className={`text-xl font-bold ${match.winner_id === match.player2_id ? 'text-yellow-400' : 'text-gray-500'}`}>{match.penalties_p2}</span>
                          </div>
                        </div>
                      )}

                      {(match.p1_evidence_url || match.p2_evidence_url || match.evidence_url) && (
                        <div className="mt-4 pt-4 border-t border-green-500/20 relative z-10 text-sm">
                          <p className="text-gray-400 uppercase tracking-widest mb-2 text-center text-xs">Evidencias Adjuntas</p>
                          <div className="flex justify-center gap-4">
                            {match.p1_evidence_url && <a href={match.p1_evidence_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Prueba Jugador 1</a>}
                            {match.p2_evidence_url && <a href={match.p2_evidence_url} target="_blank" rel="noreferrer" className="text-red-400 hover:underline">Prueba Jugador 2</a>}
                            {match.evidence_url && <a href={match.evidence_url} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Evidencia Extra</a>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
