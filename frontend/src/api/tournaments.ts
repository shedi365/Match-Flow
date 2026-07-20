const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('matchflow_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const getUploadHeaders = () => {
  const token = localStorage.getItem('matchflow_token');
  return {
    'Authorization': `Bearer ${token}`
  };
};

export async function fetchTournaments() {
  const response = await fetch(`${API_URL}/tournaments/`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Error al cargar torneos');
  return response.json();
}

export async function createTournament(name: string, description: string, maxPlayers: number) {
  const response = await fetch(`${API_URL}/tournaments/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description, max_players: maxPlayers })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Error al crear torneo');
  }
  return response.json();
}

export async function updateTournament(tournamentId: number, name: string, description: string, maxPlayers: number) {
  const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description, max_players: maxPlayers })
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Error al actualizar torneo');
  }
  return response.json();
}

export async function enrollInTournament(tournamentId: number) {
  const response = await fetch(`${API_URL}/tournaments/${tournamentId}/enroll`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Error al inscribirse');
  }
  return response.json();
}

export async function unenrollFromTournament(tournamentId: number) {
  const response = await fetch(`${API_URL}/tournaments/${tournamentId}/enroll`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Error al abandonar el torneo');
  }
}

export async function fetchTournamentParticipants(tournamentId: number) {
  const response = await fetch(`${API_URL}/tournaments/${tournamentId}/participants`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Error al cargar participantes');
  return response.json();
}

export async function generateBracket(tournamentId: number) {
  const response = await fetch(`${API_URL}/tournaments/${tournamentId}/generate-bracket`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Error al generar bracket');
  }
  return response.json();
}

export async function fetchMatches(tournamentId: number) {
  const response = await fetch(`${API_URL}/tournaments/${tournamentId}/matches`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Error al cargar partidos');
  return response.json();
}

export async function deleteTournament(tournamentId: number) {
  const response = await fetch(`${API_URL}/tournaments/${tournamentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Error al eliminar el torneo');
  }
}

export async function startMatch(matchId: number) {
  const response = await fetch(`${API_URL}/matches/${matchId}/start`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Error al iniciar el partido');
  }
  return response.json();
}

export async function reportMatchResult(matchId: number, data: any) {
  const response = await fetch(`${API_URL}/matches/${matchId}/report`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Error al reportar resultado');
  }
  return response.json();
}

export async function verifyMatchResult(matchId: number, data: any) {
  const response = await fetch(`${API_URL}/matches/${matchId}/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Error al verificar resultado');
  }
  return response.json();
}

export async function uploadMatchEvidence(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/matches/upload-evidence`, {
    method: 'POST',
    headers: getUploadHeaders(),
    body: formData
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Error al subir la imagen');
  }
  return response.json();
}

export async function rivalMatchAction(matchId: number, action: 'ACCEPT' | 'REJECT') {
  const response = await fetch(`${API_URL}/matches/${matchId}/rival-action`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Error al enviar respuesta del rival');
  }
  return response.json();
}
