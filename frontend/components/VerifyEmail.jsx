import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying your email...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (!token) {
            setError('Verification token is missing.');
            setMessage(null);
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`/users/verify-email?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message || 'Email verified successfully.');
                    setError(null);
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setError(data.error || 'Failed to verify email.');
                    setMessage(null);
                }
            } catch (err) {
                setError('An error occurred while verifying your email.');
                setMessage(null);
            }
        };

        verifyEmail();
    }, [location.search, navigate]);

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default VerifyEmail;
