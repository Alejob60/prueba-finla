import { useState, useEffect, useCallback } from 'react';
import { getFullState, subscribeToFund, unsubscribeFromFund, AppState, Fund } from './services/api';
import './App.css';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
};

function App() {
    const [state, setState] = useState<AppState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const loadState = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await getFullState();
            setState(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadState();
    }, [loadState]);

    const handleSubscribe = async (fund: Fund) => {
        const amountStr = prompt(`Monto mínimo: ${formatCurrency(fund.minAmount)}\n\nIngrese el monto a suscribir para el fondo ${fund.name}:`);
        if (!amountStr || isNaN(Number(amountStr))) {
            alert('Monto inválido.');
            return;
        }
        const amount = Number(amountStr);
        try {
            setError(null);
            const newState = await subscribeToFund(fund.id, amount);
            setState(newState);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleUnsubscribe = async (fundId: string) => {
        if (!confirm('¿Está seguro de que desea cancelar esta suscripción?')) return;
        try {
            setError(null);
            const newState = await unsubscribeFromFund(fundId);
            setState(newState);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error && !state) return <div>Error al cargar: {error}</div>;
    if (!state) return <div>No se pudieron cargar los datos.</div>;

    const { user, funds, subscriptions, transactions } = state;
    
    const getFundById = (fundId: string) => funds.find(f => f.id === fundId);

    const activeSubscriptions = subscriptions.map(sub => {
        const fund = getFundById(sub.fundId);
        return {
            ...sub,
            fundName: fund?.name || 'Desconocido',
            category: fund?.category || ''
        };
    });

    return (
        <div className="container">
            <h1>Gestor de Fondos de Inversión</h1>
            <div className="card">
                <h2>Hola, {user.name}</h2>
                <p style={{fontSize: '1.5rem'}}>Saldo Disponible: <strong>{formatCurrency(user.balance)}</strong></p>
            </div>

            {error && <div className="error" onClick={() => setError(null)} title="Cerrar">{error}</div>}

            <div className="main-layout">
                <div className="card">
                    <h2>Catálogo de Fondos</h2>
                    <ul>
                        {funds.map((fund) => (
                            <li key={fund.id}>
                                <div>
                                    <strong>{fund.name}</strong> ({fund.category})<br />
                                    <small>Mínimo: {formatCurrency(fund.minAmount)}</small>
                                </div>
                                <button className="subscribe-btn" onClick={() => handleSubscribe(fund)}>Suscribir</button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card">
                    <h2>Mis Suscripciones</h2>
                    {activeSubscriptions.length > 0 ? (
                        <ul>
                            {activeSubscriptions.map((sub) => (
                                <li key={sub.fundId}>
                                    <div>
                                        <strong>{sub.fundName}</strong><br />
                                        <small>Monto: {formatCurrency(sub.amount)}</small>
                                    </div>
                                    <button className="unsubscribe-btn" onClick={() => handleUnsubscribe(sub.fundId)}>Cancelar</button>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No tienes suscripciones activas.</p>}
                </div>
            </div>
            <div className="card full-width">
                <h2>Historial de Transacciones</h2>
                {transactions.length > 0 ? (
                    <ul>
                        {transactions.map((tx) => (
                            <li key={tx.id}>
                                <div>
                                    <strong>{tx.type === 'subscription' ? 'Suscripción' : 'Cancelación'} - {getFundById(tx.fundId)?.name}</strong><br />
                                    <small>ID: {tx.id} | Monto: {formatCurrency(tx.amount)} | Fecha: {new Date(tx.timestamp).toLocaleString()}</small>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p>No hay transacciones en tu historial.</p>}
            </div>
        </div>
    );
}

export default App;