import React, { useEffect, useState } from 'react';
import { fetchTournaments, enrollInTournament, unenrollFromTournament, generateBracket, deleteTournament } from '../../api/tournaments';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Plus, Users, Loader2, Calendar, Search, Trash2, Filter, MoreVertical, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateTournamentModal } from './CreateTournamentModal';
import { TournamentModal } from './TournamentModal';
import { EditTournamentModal } from './EditTournamentModal';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from '../ui/input';

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

export const TournamentList: React.FC<{ 
  activeTab: 'my_tournaments' | 'available' | 'history',
  onTabChange: (tab: 'my_tournaments' | 'available' | 'history') => void,
  onSelect: (id: number) => void 
}> = ({ activeTab, onTabChange, onSelect }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4">
        {isAdmin && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <Plus className="w-4 h-4" /> Nuevo Torneo
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-secondary/50 border-border"
            placeholder="Buscar torneo por nombre..."
          />
        </div>
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          <Select
            value={String(maxPlayersFilter)}
            onValueChange={(val) => setMaxPlayersFilter(val === 'all' ? 'all' : Number(val))}
          >
            <SelectTrigger className="w-full h-11 pl-9 bg-secondary/50 border-border text-foreground">
              <SelectValue placeholder="Tamaño: Todos" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Tamaño: Todos</SelectItem>
              <SelectItem value="4">4 Jugadores</SelectItem>
              <SelectItem value="8">8 Jugadores</SelectItem>
              <SelectItem value="16">16 Jugadores</SelectItem>
              <SelectItem value="32">32 Jugadores</SelectItem>
              <SelectItem value="64">64 Jugadores</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[60vh] w-full rounded-md pr-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4"
          >
            {displayedTournaments.map((t) => {
              const isFull = t.enrolled_players_count >= t.max_players;

              return (
                <motion.div 
                  key={t.id}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedTournament(t)}
                  className="cursor-pointer"
                >
                  <Card className={`relative overflow-hidden bg-card/50 backdrop-blur border-border hover:bg-secondary/40 transition-colors h-full flex flex-col`}>
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${
                      t.status === 'REGISTRATION' ? 'bg-primary' : 
                      t.status === 'COMPLETED' ? 'bg-purple-500' : 
                      'bg-blue-500'
                    }`} />
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold pr-8 flex items-start gap-2 text-foreground leading-tight">
                          <Trophy className="w-5 h-5 text-primary mt-0.5 shrink-0" /> {t.name}
                        </CardTitle>
                        
                        {isAdmin && (
                          <div className="absolute top-4 right-4 z-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger 
                                render={
                                  <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                }
                                onClick={(e: React.MouseEvent) => e.stopPropagation()} 
                              />
                              <DropdownMenuContent align="end" className="w-40 bg-card border-border">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingTournament(t); }}>
                                  <Edit2 className="w-4 h-4 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(t.id, t.name); }}
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1">
                      {t.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic opacity-50">Sin descripción</p>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-secondary/80 text-foreground font-normal">
                        <Users className="w-3.5 h-3.5 mr-1" /> 
                        <span className={isFull ? 'text-destructive font-bold' : ''}>
                          {t.enrolled_players_count} / {t.max_players}
                        </span>
                      </Badge>
                      <Badge variant="outline" className={`border-none font-semibold ${
                        t.status === 'REGISTRATION' ? 'bg-primary/20 text-primary' : 
                        t.status === 'COMPLETED' ? 'bg-purple-500/20 text-purple-400' : 
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {t.status === 'REGISTRATION' ? 'Abierto' : 
                         t.status === 'COMPLETED' ? 'Culminado' : 
                         'En Progreso'}
                      </Badge>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
            
            {displayedTournaments.length === 0 && (
              <div className="col-span-1 md:col-span-2 py-16 flex flex-col items-center justify-center text-muted-foreground bg-card/30 border border-border border-dashed rounded-xl">
                <Calendar className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-center max-w-sm">
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
      </ScrollArea>

      <CreateTournamentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={() => {
          loadTournaments();
          onTabChange('available');
        }} 
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
