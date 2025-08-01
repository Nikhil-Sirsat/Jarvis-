
import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../AxiosInstance.jsx';
import InitialLoading from '../Pages/InitialLoading.jsx';

const AuthContext = createContext();

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const response = await axiosInstance.get('/api/user/protected');
                setUser(response.data.user);
                // console.log("User set in useEffect:", response.data.user.username);
            } catch (err) {
                setUser(null);
                console.log("Error in useEffect:", err.response ? err.response.data : err.message);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);
    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('/api/user/Login', { email, password });
            setUser(response.data.user);
            // console.log("User set in login : ", response.data.user);
            return true;
        } catch (err) {
            console.log("Error in login:", err);
            return false;
        }
    };
    const logout = async () => {
        try {
            await axiosInstance.get('/api/user/Logout');
            setUser(null);
            // console.log("User logged out");
        } catch (err) {
            console.log("Error in logout:", err.response ? err.response.data : err.message);
        }
    };

    if (loading) return <InitialLoading />

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export { AuthProvider, AuthContext };

