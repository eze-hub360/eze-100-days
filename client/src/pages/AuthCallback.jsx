import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { googleLogin } = useAuthStore();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userParam = params.get('user');

        console.log('Auth callback - Token exists:', !!token);
        console.log('Auth callback - User exists:', !!userParam);

        if (token && userParam) {
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                const success = googleLogin(user, token);
                if (success) {
                    navigate('/dashboard');
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                toast.error('Login failed. Please try again.');
                navigate('/login');
            }
        } else {
            toast.error('Authentication failed');
            navigate('/login');
        }
    }, [location, navigate, googleLogin]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Completing login...</p>
            </div>
        </div>
    );
};

export default AuthCallback;