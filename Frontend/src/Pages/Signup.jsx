import { useState, useContext } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    CircularProgress,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext.jsx';
import axiosInstance from '../AxiosInstance.jsx';
import logo from '../assets/jarvisLogo.jpg';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useSnackbar } from '../Context/SnackBarContext';

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        age: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const showSnackbar = useSnackbar();

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => event.preventDefault();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axiosInstance.post('/api/user/SignUp', formData);
            const success = await login(formData.email, formData.password);
            if (success) {
                navigate('/');
            } else {
                showSnackbar("Error Logging in after registration");
            }
        } catch (error) {
            showSnackbar(`Error in Registration : ${error.status} : ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                backgroundColor: '#000000ff',
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 450 }}>

                {/* logo */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Avatar
                        src={logo}
                        alt="Jarvis Logo"
                        sx={{ width: 90, height: 90, mb: 2, backgroundColor: 'transparent' }}
                    />
                </Box>


                <Card elevation={4} sx={{ backgroundColor: 'black' }}>
                    <CardHeader
                        title="Create Account"
                        titleTypographyProps={{ align: 'center', variant: 'h4', color: '#0ca37f' }}
                    />
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                required
                                margin="normal"
                                sx={{
                                    '& .MuiInputLabel-root': { color: '#0ca37f' },
                                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#0ca37f' } },
                                    '& .MuiInputBase-input': { color: '#fff' }
                                }}
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
                                sx={{
                                    '& .MuiInputLabel-root': { color: '#0ca37f' },
                                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#0ca37f' } },
                                    '& .MuiInputBase-input': { color: '#fff' }
                                }}
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
                                sx={{
                                    '& .MuiInputLabel-root': { color: '#0ca37f' },
                                    '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#0ca37f' } },
                                    '& .MuiInputBase-input': { color: '#fff' }
                                }}
                            />

                            <FormControl fullWidth variant="outlined">
                                <InputLabel sx={{ color: '#0ca37f' }}>Password</InputLabel>
                                <OutlinedInput
                                    type={showPassword ? 'text' : 'password'}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                                                {showPassword ? <VisibilityOff sx={{ color: '#0ca37f' }} /> : <Visibility sx={{ color: '#0ca37f' }} />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    sx={{
                                        '& .MuiInputLabel-root': { color: '#0ca37f' },
                                        '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#0ca37f' } },
                                        '& .MuiInputBase-input': { color: '#fff' }
                                    }}
                                />
                            </FormControl>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2, py: 1.3, backgroundColor: '#0ca37f', color: 'white', fontWeight: 'bold' }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                            </Button>
                        </Box>

                        <Typography variant="body2" align="center" sx={{ mt: 2, color: 'white' }}>
                            Already have an account?{' '}
                            <Button
                                onClick={() => navigate('/Login')}
                                variant="text"
                                sx={{ textTransform: 'none', fontWeight: 'bold', color: '#0ca37f' }}
                            >
                                Login
                            </Button>
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
