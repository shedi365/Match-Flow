import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Loader2, CheckCircle2, ShieldAlert, Upload, Trophy } from 'lucide-react';
import { startMatch, reportMatchResult, verifyMatchResult, uploadMatchEvidence, rivalMatchAction } from '../../api/tournaments';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

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
  reported_by_id: number | null;
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
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  
  const getFullUrl = (url: string | null | undefined) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isTied = scoreP1 !== '' && scoreP2 !== '' && Number(scoreP1) === Number(scoreP2);
  
  // Checks if current user is involved in this match
  const isPlayer1 = gamertag === match?.player1?.gamertag;
  const isPlayer2 = gamertag === match?.player2?.gamertag;
  const isParticipant = gamertag && match && (isPlayer1 || isPlayer2);
  
  const currentUserId = isPlayer1 ? match?.player1_id : (isPlayer2 ? match?.player2_id : null);
  const isRivalToValidate = currentUserId !== null && match?.reported_by_id !== null && currentUserId !== match?.reported_by_id;

  useEffect(() => {
    if (match && isOpen) {
      setScoreP1(match.score_p1 ?? '');
      setScoreP2(match.score_p2 ?? '');
      setPenaltiesP1(match.penalties_p1 ?? '');
      setPenaltiesP2(match.penalties_p2 ?? '');
      setEvidenceUrl('');
      setEvidenceFile(null);
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

  const handleRivalAction = async (action: 'ACCEPT' | 'REJECT') => {
    setIsLoading(true);
    try {
      await rivalMatchAction(match.id, action);
      toast.success(action === 'ACCEPT' ? "Resultado aceptado y finalizado" : "Disputa iniciada, un administrador revisará el caso");
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
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
      let uploadedUrl = evidenceUrl;
      if (evidenceFile) {
        const res = await uploadMatchEvidence(evidenceFile);
        uploadedUrl = res.evidence_url;
      }

      await reportMatchResult(match.id, {
        score_p1: Number(scoreP1),
        score_p2: Number(scoreP2),
        penalties_p1: isTied ? Number(penaltiesP1) : null,
        penalties_p2: isTied ? Number(penaltiesP2) : null,
        evidence_url: uploadedUrl || null
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
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-card">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Swords className="text-primary w-6 h-6" />
                  Ronda {match.round_number} - Partido {match.match_number}
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

              <div className="p-6 overflow-y-auto">
                {/* Visual VS Display */}
                    <div className="flex justify-between items-center mb-8 px-4">
                      <div className="text-center w-1/3">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                          <span className="font-bold text-xl text-blue-400">{match.player1?.gamertag?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                        <p className="font-bold text-foreground truncate">{match.player1?.gamertag || 'Por definir'}</p>
                      </div>
                      <div className="text-2xl font-black text-muted-foreground italic">VS</div>
                      <div className="text-center w-1/3">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                          <span className="font-bold text-xl text-red-400">{match.player2?.gamertag?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                        <p className="font-bold text-foreground truncate">{match.player2?.gamertag || 'Por definir'}</p>
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
                        <p className="text-muted-foreground mb-6">Este partido aún no ha comenzado.</p>
                        {(isAdmin || isParticipant) && match.player1 && match.player2 && (
                          <Button
                            onClick={handleStart}
                            disabled={isLoading}
                            className="w-full max-w-xs mx-auto py-6 text-lg font-bold rounded-xl shadow-[0_0_20px_var(--primary)/0.4]"
                          >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Swords className="w-5 h-5 mr-2" /> Iniciar Partido</>}
                          </Button>
                        )}
                      </div>
                    )}

                    {/* State: IN_PROGRESS, AWAITING_VALIDATION (Admin), or DISPUTE (Admin) */}
                    {((match.status === 'IN_PROGRESS' && isParticipant) || 
                      (match.status === 'AWAITING_VALIDATION' && isAdmin) ||
                      (match.status === 'IN_PROGRESS' && isAdmin) ||
                      (match.status === 'DISPUTE' && isAdmin)) && (
                      <form onSubmit={isAdmin ? handleVerify : handleReport} className="space-y-6">
                        <div className="bg-secondary/50 border border-border rounded-2xl p-6">
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-center mb-4">Goles</h3>
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
                              <Upload className="w-4 h-4" /> Subir Evidencia (Opcional)
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    setError("La imagen no debe superar los 5MB");
                                    setEvidenceFile(null);
                                    e.target.value = '';
                                  } else {
                                    setEvidenceFile(file);
                                    setError('');
                                  }
                                } else {
                                    setEvidenceFile(null);
                                }
                              }}
                              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 transition-all cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">Máximo 5MB. Formatos soportados: JPG, PNG, WEBP.</p>
                          </div>
                        )}

                        {(match.status === 'AWAITING_VALIDATION' || match.status === 'DISPUTE' || match.status === 'IN_PROGRESS') && isAdmin && (
                          <div className={`border rounded-xl p-4 text-sm ${match.status === 'DISPUTE' ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'}`}>
                            {match.status === 'DISPUTE' ? '⚠️ PARTIDO EN DISPUTA: Forzar la resolución del partido con este marcador.' : 'Como administrador, al guardar finalizarás el partido directamente con este marcador.'}
                            {(match.p1_evidence_url || match.p2_evidence_url) && (
                              <div className={`mt-2 pt-2 border-t ${match.status === 'DISPUTE' ? 'border-red-500/20' : 'border-blue-500/20'}`}>
                                <strong>Evidencias aportadas:</strong>
                                {match.p1_evidence_url && <a href={getFullUrl(match.p1_evidence_url)} target="_blank" rel="noreferrer" className="block text-blue-400 hover:underline">Prueba Jugador 1</a>}
                                {match.p2_evidence_url && <a href={getFullUrl(match.p2_evidence_url)} target="_blank" rel="noreferrer" className="block text-red-400 hover:underline">Prueba Jugador 2</a>}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-6 text-lg font-bold rounded-xl"
                          >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                              isAdmin ? <><CheckCircle2 className="w-5 h-5 mr-2" /> Verificar y Finalizar</> : <><Swords className="w-5 h-5 mr-2" /> Reportar Resultado</>
                            }
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* State: AWAITING_VALIDATION (Rival Action or Read Only) */}
                    {match.status === 'AWAITING_VALIDATION' && !isAdmin && (
                      <>
                        {isRivalToValidate ? (
                          <div className="text-center py-6 bg-secondary/50 rounded-2xl border border-border px-4">
                            <h3 className="text-xl font-bold text-foreground mb-2">Validar Resultado</h3>
                            <p className="text-muted-foreground mb-6">Tu rival ha reportado el siguiente marcador:</p>
                            
                            <div className="flex justify-center items-center gap-6 mb-6">
                              <span className="text-3xl font-black text-blue-400">{match.score_p1}</span>
                              <span className="text-xl text-gray-600">-</span>
                              <span className="text-3xl font-black text-red-400">{match.score_p2}</span>
                            </div>
                            {match.penalties_p1 !== null && (
                              <div className="mb-6">
                                <p className="text-sm text-gray-400 uppercase">Penaltis</p>
                                <span className="text-xl font-bold text-yellow-400">{match.penalties_p1} - {match.penalties_p2}</span>
                              </div>
                            )}

                            <div className="flex gap-4">
                              <Button
                                variant="default"
                                onClick={() => handleRivalAction('ACCEPT')}
                                disabled={isLoading}
                                className="flex-1 py-6 font-bold rounded-xl"
                              >
                                <CheckCircle2 className="w-5 h-5 mr-2" /> Aceptar
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleRivalAction('REJECT')}
                                disabled={isLoading}
                                className="flex-1 py-6 font-bold rounded-xl"
                              >
                                <X className="w-5 h-5 mr-2" /> Rechazar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-secondary/50 rounded-2xl border border-border">
                            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Esperando Validación</h3>
                            <p className="text-muted-foreground">El resultado ha sido reportado y está esperando validación del rival.</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* State: DISPUTE (Non-admin view) */}
                    {match.status === 'DISPUTE' && !isAdmin && (
                      <div className="text-center py-8 bg-destructive/10 rounded-2xl border border-destructive/20">
                        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">En Disputa</h3>
                        <p className="text-muted-foreground">El resultado fue rechazado. Un administrador revisará el caso para forzar el resultado.</p>
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
                                {match.p1_evidence_url && <a href={getFullUrl(match.p1_evidence_url)} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Prueba Jugador 1</a>}
                                {match.p2_evidence_url && <a href={getFullUrl(match.p2_evidence_url)} target="_blank" rel="noreferrer" className="text-red-400 hover:underline">Prueba Jugador 2</a>}
                                {match.evidence_url && <a href={getFullUrl(match.evidence_url)} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">Evidencia Extra</a>}
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
