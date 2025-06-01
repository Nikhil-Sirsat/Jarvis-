import React, { useState, useContext } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext.jsx';
import axiosInstance from '../axiosInstance.jsx';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        password: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await axiosInstance.post('/api/user/SignUp', formData);
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/');
            } else {
                setMessage('Error logging in after registration');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed';
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 450 }}>
                <Card elevation={4}>
                    <CardHeader
                        title="Create Your JARVIS Account"
                        titleTypographyProps={{ align: 'center', variant: 'h5' }}
                        sx={{ backgroundColor: '#1976d2', color: 'white' }}
                    />
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <TextField
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <TextField
                                label="Age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                color="primary"
                                sx={{ mt: 2, py: 1.3 }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                            </Button>
                        </Box>

                        {message && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {message}
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
