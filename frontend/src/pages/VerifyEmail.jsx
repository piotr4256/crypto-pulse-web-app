import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
// Bezpośredni axios (bez apiService) — użytkownik nie jest jeszcze zalogowany,
// więc nie ma tokenu JWT do dodania w nagłówkach zapytania
import axios from 'axios';

const VerifyEmail = () => {
    // Odczytanie tokenu weryfikacyjnego z parametrów URL (np. /verify-email?token=abc123...)
    // Token jest generowany przez backend Django i wysyłany użytkownikowi mailem
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // Stan procesu weryfikacji: 'loading' | 'success' | 'error'
    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('Trwa weryfikacja konta...');

    // useEffect uruchamia się automatycznie po załadowaniu strony — bez kliknięcia przez użytkownika
    useEffect(() => {
        // Zabezpieczenie: jeśli link nie zawiera tokenu, natychmiast pokaż błąd
        if (!token) {
            setStatus('error');
            setMessage('Brak tokenu weryfikacyjnego w linku.');
            return;
        }

        // Asynchroniczna funkcja wysyłająca token do backendu w celu aktywacji konta
        const verifyAccount = async () => {
            try {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                // HTTP POST do Django — backend sprawdza token w bazie danych i aktywuje konto
                const response = await axios.post(`${backendUrl}/api/verify-email/`, {
                    token: token 
                });
                // Sukces: konto zostało aktywowane
                setStatus('success');
                setMessage(response.data.message || response.data.success || 'Konto pomyślnie aktywowane');
            } catch (error) {
                // Błąd: token wygasł, użyty ponownie lub nieprawidłowy
                setStatus('error');
                setMessage(error.response?.data?.error || 'Wystąpił błąd podczas weryfikacji.');
            }
        };

        verifyAccount();
    }, [token]); // Efekt uruchamia się ponownie tylko jeśli token w URL się zmieni

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="bg-[#111] border border-gray-800 p-8 rounded-xl max-w-md w-full text-center shadow-lg text-white">
                <h2 className="text-2xl font-bold mb-6">Aktywacja konta</h2>
                
                {/* Renderowanie warunkowe na podstawie stanu status */}
                {status === 'loading' && <div className="text-blue-400 animate-pulse">{message}</div>}
                {status === 'success' && <div className="text-green-400 mb-6">{message}</div>}
                {status === 'error' && <div className="text-red-400 mb-6">{message}</div>}

                {/* Przycisk pojawia się dopiero po zakończeniu weryfikacji (sukces lub błąd) */}
                {status !== 'loading' && (
                    <Link to="/login" className="inline-block mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 px-4 rounded transition-colors duration-300">
                        Przejdź do logowania
                    </Link>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
