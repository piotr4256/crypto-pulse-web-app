import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading'); 
    const [message, setMessage] = useState('Trwa weryfikacja konta...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Brak tokenu weryfikacyjnego w linku.');
            return;
        }

        const verifyAccount = async () => {
            try {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const response = await axios.post(`${backendUrl}/api/verify-email/`, { 
                    token: token 
                });
                setStatus('success');
                setMessage(response.data.message || response.data.success || 'Konto pomyślnie aktywowane');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Wystąpił błąd podczas weryfikacji.');
            }
        };

        verifyAccount();
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="bg-[#111] border border-gray-800 p-8 rounded-xl max-w-md w-full text-center shadow-lg text-white">
                <h2 className="text-2xl font-bold mb-6">Aktywacja konta</h2>
                
                {status === 'loading' && <div className="text-blue-400 animate-pulse">{message}</div>}
                {status === 'success' && <div className="text-green-400 mb-6">{message}</div>}
                {status === 'error' && <div className="text-red-400 mb-6">{message}</div>}

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