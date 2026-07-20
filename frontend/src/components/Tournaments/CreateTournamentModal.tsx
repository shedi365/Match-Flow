import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Loader2 } from 'lucide-react';
import { useCreateTournamentMutation } from '../../hooks/useTournamentMutations';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const createTournamentSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  maxPlayers: z.preprocess((val) => Number(val), z.number().min(4).max(64)),
});

type CreateTournamentFormValues = z.infer<typeof createTournamentSchema>;

export const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ isOpen, onClose, onCreated }) => {
  const mutation = useCreateTournamentMutation();

  const form = useForm<CreateTournamentFormValues>({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: {
      name: '',
      description: '',
      maxPlayers: 16,
    },
  });

  const onSubmit = (data: CreateTournamentFormValues) => {
    mutation.mutate(
      { name: data.name, description: data.description || '', maxPlayers: data.maxPlayers },
      {
        onSuccess: () => {
          form.reset();
          onCreated();
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
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
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
                  <Trophy className="text-primary w-6 h-6" />
                  Nuevo Torneo
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
                          <FormLabel className="text-muted-foreground">Límite de Jugadores</FormLabel>
                          <FormControl>
                            <select
                              className="w-full px-4 h-11 bg-secondary/50 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors appearance-none"
                              {...field}
                            >
                              <option value={4}>4 Jugadores</option>
                              <option value={8}>8 Jugadores</option>
                              <option value={16}>16 Jugadores</option>
                              <option value={32}>32 Jugadores</option>
                              <option value={64}>64 Jugadores</option>
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
                        {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Torneo'}
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
