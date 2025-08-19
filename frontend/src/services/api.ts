// La API de FastAPI corre en el puerto 8000 por defecto con uvicorn
const API_URL = 'http://localhost:8000/api';
const USER_ID = 'user-1'; // Usuario único según los requisitos

// Interfaces que coinciden con los modelos Pydantic de FastAPI
export interface User {
  id: string;
  name: string;
  balance: number;
}

export interface Fund {
  id: string;
  name: string;
  minAmount: number;
  category: string;
}

export interface Subscription {
  fundId: string;
  amount: number;
}

export interface Transaction {
  id: string;
  type: 'subscription' | 'cancellation';
  fundId: string;
  amount: number;
  timestamp: string; // ISO format string
}

export interface AppState {
    user: User;
    funds: Fund[];
    subscriptions: Subscription[];
    transactions: Transaction[];
}

export const getFullState = async (): Promise<AppState> => {
    const response = await fetch(`${API_URL}/state/${USER_ID}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cargar los datos del servidor.');
    }
    return response.json();
};

export const subscribeToFund = async (fundId: string, amount: number): Promise<AppState> => {
    const response = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, fundId, amount }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail);
    return data;
};

export const unsubscribeFromFund = async (fundId: string): Promise<AppState> => {
    const response = await fetch(`${API_URL}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID, fundId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail);
    return data;
};