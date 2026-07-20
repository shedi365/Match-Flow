import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, X, Loader2 } from 'lucide-react';
import { useUpdateTournamentMutation } from '../../hooks/useTournamentMutations';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

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

const getEditSchema = (minPlayers: number) => z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  maxPlayers: z.preprocess(
    (val) => Number(val), 
    z.number().min(minPlayers, `El torneo ya tiene ${minPlayers} jugadores`).max(64, 'Máximo 64 jugadores')
  ),
});

type EditTournamentFormValues = z.infer<ReturnType<typeof getEditSchema>>;

export const EditTournamentModal: React.FC<EditTournamentModalProps> = ({ isOpen, onClose, onUpdated, tournament }) => {
  const mutation = useUpdateTournamentMutation();
  
  const minPlayers = tournament?.enrolled_players_count || 4;
  const schema = getEditSchema(minPlayers);

  const form = useForm<EditTournamentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      maxPlayers: 16,
    },
  });

  useEffect(() => {
    if (tournament && isOpen) {
      form.reset({
        name: tournament.name,
        description: tournament.description || '',
        maxPlayers: tournament.max_players,
      });
    }
  }, [tournament, isOpen, form]);

  const onSubmit = (data: EditTournamentFormValues) => {
    if (!tournament) return;
    
    mutation.mutate(
      { id: tournament.id, name: data.name, description: data.description || '', maxPlayers: data.maxPlayers },
      {
        onSuccess: () => {
          onUpdated();
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && tournament && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-border">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Edit2 className="text-primary w-6 h-6" />
                  Editar Torneo
                </h2>
                <button
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Nombre del Torneo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Copa de Verano 2026" 
                              className="bg-secondary/50 border-white/10 focus-visible:ring-primary h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Descripción (Opcional)</FormLabel>
                          <FormControl>
                            <textarea
                              className="w-full px-4 py-2 bg-secondary/50 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors h-24 resize-none"
                              placeholder="Reglas, premios, etc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxPlayers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">
                            Límite de Jugadores <span className="text-xs text-muted-foreground ml-2">(Mínimo: {minPlayers})</span>
                          </FormLabel>
                          <FormControl>
                            <select
                              className="w-full px-4 h-11 bg-secondary/50 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors appearance-none"
                              {...field}
                            >
                              {[4, 8, 16, 32, 64].map((num) => (
                                <option key={num} value={num} disabled={num < minPlayers}>
                                  {num} Jugadores
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4 flex gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        className="flex-1 h-12 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                      >
                        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
