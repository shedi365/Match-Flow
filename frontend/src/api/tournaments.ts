const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('matchflow_token');
  return {
    'Content-Type': 'application/json',
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
