import { useMutation } from '@tanstack/react-query';
import { login, register } from '../api/auth';
import { toast } from 'sonner';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (data: Parameters<typeof login>) => login(data[0], data[1]),
    onError: (error: any) => {
      toast.error(error.message || 'Error al iniciar sesión');
    }
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: Parameters<typeof register>) => register(data[0], data[1], data[2]),
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar usuario');
    }
  });
};
