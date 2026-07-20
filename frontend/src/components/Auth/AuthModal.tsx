import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLoginMutation, useRegisterMutation } from '../../hooks/useAuthMutations';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const loginSchema = z.object({
  gamertag: z.string().min(1, 'El gamertag es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const registerSchema = z.object({
  gamertag: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export const AuthModal: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { loginUser } = useAuth();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { gamertag: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { gamertag: '', email: '', password: '', confirmPassword: '' },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate([data.gamertag, data.password], {
      onSuccess: (res) => {
        loginUser(res.access_token);
        toast.success(`¡Bienvenido de nuevo, ${data.gamertag}!`);
      }
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate([data.gamertag, data.email, data.password], {
      onSuccess: () => {
        // Auto-login after register
        loginMutation.mutate([data.gamertag, data.password], {
          onSuccess: (res) => {
            loginUser(res.access_token);
            toast.success(`Cuenta creada exitosamente. ¡Bienvenido, ${data.gamertag}!`);
          }
        });
      }
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden text-foreground">
      {/* Background decoration elements (FC24 style Volt Green & Dark Blue) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-16 h-16 mx-auto bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20"
          >
            <Gamepad2 className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">
            Match<span className="text-primary">Flow</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {isLogin ? 'Inicia sesión para jugar' : 'Crea tu cuenta para competir'}
          </p>
        </div>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="gamertag"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input placeholder="Gamertag" className="pl-10 h-12 rounded-xl bg-secondary/50 border-white/10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña" 
                                className="pl-10 pr-12 h-12 rounded-xl bg-secondary/50 border-white/10" 
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-white transition-colors focus:outline-none"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl text-primary-foreground font-bold text-base mt-6 bg-primary hover:bg-primary/90 transition-all"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          INGRESAR
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input placeholder="Correo electrónico" className="pl-10 h-12 rounded-xl bg-secondary/50 border-white/10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="gamertag"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input placeholder="Gamertag" className="pl-10 h-12 rounded-xl bg-secondary/50 border-white/10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Contraseña" 
                                className="pl-10 pr-12 h-12 rounded-xl bg-secondary/50 border-white/10" 
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-white transition-colors focus:outline-none"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirmar contraseña" 
                                className="pl-10 pr-12 h-12 rounded-xl bg-secondary/50 border-white/10" 
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-white transition-colors focus:outline-none"
                              >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-12 rounded-xl text-primary-foreground font-bold text-base mt-6 bg-primary hover:bg-primary/90 transition-all"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          REGISTRARSE
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            type="button"
            className="text-sm text-muted-foreground hover:text-white transition-colors"
          >
            {isLogin 
              ? "¿No tienes una cuenta? Regístrate aquí" 
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
