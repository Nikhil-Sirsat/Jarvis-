import { Box, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Intro() {
    const navigate = useNavigate();

    const start = () => {
        navigate('/chat/new-chat');
    };

    return (
        <Box
            sx={{
                height: '80vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                textAlign: 'center',
                px: 2,
            }}
        >
            {/* JARVIS Title */}
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        fontWeight: 700,
                        letterSpacing: '2px',
                        color: '#0ca37f',
                    }}
                >
                    JARVIS
                </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
            >
                <Typography variant="subtitle1" sx={{ mt: 1, color: '#ccc' }}>
                    Intelligent. Contextual. Always improving.
                </Typography>
            </motion.div>

            {/* Features */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
            >
                <Stack spacing={1.2} sx={{ mt: 4, color: '#bbb' }}>
                    <Typography variant="body1">Understands your intent deeply</Typography>
                    <Typography variant="body1">Remembers & evolves with you</Typography>
                    <Typography variant="body1">Solves, explains & creates</Typography>
                    <Typography variant="body1">Built to integrate into your workflow</Typography>
                </Stack>
            </motion.div>

            {/* CTA Button */}
            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 1 }}
            >
                <Button
                    variant="contained"
                    onClick={start}
                    sx={{
                        mt: 5,
                        mb: 5,
                        px: 5,
                        py: 1.6,
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
                    Launch Jarvis
                </Button>
            </motion.div>

            {/* Footer Quote */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.7, x: 0 }}
                transition={{ duration: 1, delay: 1.5 }}
            >
                <Typography
                    variant="caption"
                    sx={{ mt: 4, fontStyle: 'italic', color: '#888' }}
                >
                    "Your AI, evolved — always ready to assist."
                </Typography>
            </motion.div>
        </Box>
    );
}
