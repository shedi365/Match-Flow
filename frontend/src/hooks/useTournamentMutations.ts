import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTournament, updateTournament, deleteTournament } from '../api/tournaments';
import { toast } from 'sonner';

export const useCreateTournamentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description: string; maxPlayers: number }) =>
      createTournament(data.name, data.description, data.maxPlayers),
    onSuccess: () => {
      toast.success('Torneo creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear torneo');
    },
  });
};

export const useUpdateTournamentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: number; name: string; description: string; maxPlayers: number }) =>
      updateTournament(data.id, data.name, data.description, data.maxPlayers),
    onSuccess: () => {
      toast.success('Torneo actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar torneo');
    },
  });
};

export const useDeleteTournamentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTournament(id),
    onSuccess: () => {
      toast.success('Torneo eliminado');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar torneo');
    },
  });
};
