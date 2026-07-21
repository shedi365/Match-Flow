import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { User, Lock, Loader2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateGamertag, updatePassword } from '../../api/users';
import { toast } from 'sonner';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'security';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, defaultTab = 'profile' }) => {
  const { token, gamertag, loginUser } = useAuth();
  
  // Profile State
  const [newGamertag, setNewGamertag] = useState(gamertag || '');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingSecurity, setIsSubmittingSecurity] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGamertag.trim() || newGamertag === gamertag) return;
    
    setIsSubmittingProfile(true);
    try {
      if (!token) throw new Error('No token found');
      
      const response = await updateGamertag(newGamertag, token);
      
      // Update local storage and context with the new token
      if (response.access_token) {
        loginUser(response.access_token);
      }
      
      toast.success('Nombre de usuario actualizado con éxito.');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar perfil');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmittingSecurity(true);
    try {
      if (!token) throw new Error('No token found');
      
      await updatePassword(currentPassword, newPassword, token);
      
      toast.success('Contraseña actualizada con éxito.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose(); // Optional: close on success
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar contraseña');
    } finally {
      setIsSubmittingSecurity(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Ajustes de Cuenta
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modifica tu información pública o cambia tus opciones de seguridad.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-lg">
            <TabsTrigger value="profile" className="rounded-md data-[active]:bg-background data-[active]:text-primary data-[active]:shadow-sm">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md data-[active]:bg-background data-[active]:text-primary data-[active]:shadow-sm">
              <Lock className="w-4 h-4 mr-2" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Gamertag (Nombre de Usuario)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={newGamertag}
                    onChange={(e) => setNewGamertag(e.target.value)}
                    placeholder="Tu Gamertag"
                    className="pl-10 h-11 bg-secondary/30 border-border focus:border-primary/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Este es tu nombre público visible para los demás jugadores.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmittingProfile || newGamertag === gamertag || !newGamertag.trim()}
                  className="w-full sm:w-auto min-w-[120px] transition-all"
                >
                  {isSubmittingProfile ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Guardar Cambios</>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <form onSubmit={handleSecuritySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contraseña Actual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-secondary/30 border-border focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-foreground">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-secondary/30 border-border focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-secondary/30 border-border focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmittingSecurity || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full sm:w-auto min-w-[120px] transition-all"
                >
                  {isSubmittingSecurity ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Actualizando</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Actualizar Contraseña</>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
