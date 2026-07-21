const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const updateGamertag = async (newGamertag: string, token: string) => {
    const response = await fetch(`${API_URL}/users/me/gamertag`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_gamertag: newGamertag })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al cambiar nombre');
    }
    return response.json();
};

export const updatePassword = async (currentPassword: string, newPassword: string, token: string) => {
    const response = await fetch(`${API_URL}/users/me/password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al cambiar contraseña');
    }
    return response.json();
};
