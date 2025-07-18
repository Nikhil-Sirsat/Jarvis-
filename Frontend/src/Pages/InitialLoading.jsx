import JarvisLogo from '../assets/jarvisLogo.png';
import { Box, Typography, Avatar, Paper } from '@mui/material';

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
                <Box sx={{ mt: 4 }}>
                    <div className="dot-loader">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </Box>
            </Paper>

            {/* Custom loader CSS */}
            <style>
                {`
                .dot-loader {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 10px;
                }

                .dot-loader span {
                    width: 12px;
                    height: 12px;
                    background-color: #00e676;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }

                .dot-loader span:nth-child(1) {
                    animation-delay: -0.32s;
                }

                .dot-loader span:nth-child(2) {
                    animation-delay: -0.16s;
                }

                .dot-loader span:nth-child(3) {
                    animation-delay: 0s;
                }

                @keyframes bounce {
                    0%, 80%, 100% {
                        transform: scale(0);
                    } 
                    40% {
                        transform: scale(1);
                    }
                }
                `}
            </style>
        </Box>
    );
}

