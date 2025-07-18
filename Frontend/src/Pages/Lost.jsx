import { Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function LostPage() {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/chat');
    };

    return (
        <Box
            sx={{
                height: '80vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                bgcolor: 'transparent',
                px: 2,
                color: 'white',
            }}
        >
            <ErrorOutlineIcon sx={{ fontSize: 80, color: '#0ca37f', mb: 2 }} />

            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>
                404 - Page Not Found
            </Typography>

            <Typography variant="body1" sx={{ color: '#aaa', mb: 4, maxWidth: 400 }}>
                Oops! The page you're looking for doesn't exist or has been moved.
            </Typography>

            <Button
                variant="contained"
                onClick={goHome}
                sx={{
                    px: 4,
                    py: 1.4,
                    fontSize: '1rem',
                    backgroundColor: '#0ca37f',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                        backgroundColor: '#089a72',
                    },
                }}
            >
                Go Back Home
            </Button>
        </Box>
    );
}
