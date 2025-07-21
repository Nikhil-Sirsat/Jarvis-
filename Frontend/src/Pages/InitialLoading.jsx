import JarvisLogo from '../assets/jarvisLogo.png';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import ThreeDotLoading from '../Components/ThreeDotLoading';

export default function InitialLoading() {
    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#000000ff',
                color: '#ffffff',
                padding: 2,
            }}
        >
            <Paper
                elevation={5}
                sx={{
                    padding: 4,
                    borderRadius: 3,
                    textAlign: 'center',
                    backgroundColor: '#000000ff',
                    color: '#fff',
                }}
            >
                <Avatar
                    alt="Jarvis Logo"
                    src={JarvisLogo}
                    sx={{ width: 80, height: 80, margin: '0 auto', mb: 2 }}
                />
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to Jarvis
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Your intelligent personal AI assistant is getting ready...
                </Typography>

                {/* Unique Loading Indicator */}
                <ThreeDotLoading />
            </Paper>
        </Box>
    );
}

