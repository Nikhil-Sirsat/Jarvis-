import { useState, useContext } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Alert,
    Collapse,
    IconButton,
    CircularProgress,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext.jsx';
import logo from '../assets/jarvisLogo.png';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showCookieAlert, setShowCookieAlert] = useState(true);
    const [showPassword, setShowPassword] = useState(false);


    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => event.preventDefault();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        const trimmedEmail = formData.email.trim();
        const trimmedPassword = formData.password.trim();

        const success = await login(trimmedEmail, trimmedPassword);
        if (success) {
            navigate('/');
            setLoading(false);
        } else {
            setMessage('Invalid credentials');
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
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 400 }}>

                {/* logo */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <img src={logo} alt="Jarvis Logo" style={{ width: '100px', height: '100px' }} />
                </Box>

                <Collapse in={showCookieAlert}>
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                        action={
                            <IconButton
                                aria-label="close"
                                size="small"
                                onClick={() => setShowCookieAlert(false)}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                    >
                        <Typography fontWeight="bold">Enable Third-Party Cookies</Typography>
                        <Typography variant="body2">
                            To ensure a seamless login experience, please enable third-party cookies in your browser settings.
                            <br />
                            <strong>Chrome:</strong> Settings → Privacy & Security → Cookies and other site data.
                            <br />
                            <strong>Safari:</strong> Settings → Safari → Privacy & Security → Disable Prevent Cross-Site Tracking.
                        </Typography>
                    </Alert>
                </Collapse>

                <Card elevation={4} sx={{ backgroundColor: 'black' }}>
                    <CardHeader
                        title="Welcome back"
                        titleTypographyProps={{ align: 'center', variant: 'h4', color: '#0ca37f' }}
                    />
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                margin="normal"
                                required
                                sx={{ '& .MuiInputLabel-root': { color: '#0ca37f' } }}
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
                                    sx={{ color: '#fff' }}
                                />
                            </FormControl>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                sx={{ mt: 2, py: 1.2, backgroundColor: '#0ca37f', color: 'white', fontWeight: 'bold' }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                            </Button>
                        </Box>

                        <Typography variant="body2" align="center" sx={{ mt: 2, color: 'white' }}>
                            Don't have an account?{' '}
                            <Button
                                onClick={() => navigate('/Signup')}
                                variant="text"
                                sx={{ textTransform: 'none', fontWeight: 'bold', color: '#0ca37f' }}
                            >
                                Register
                            </Button>
                        </Typography>

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
};
