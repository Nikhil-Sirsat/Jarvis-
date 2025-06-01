import { Box, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Intro() {
    const navigate = useNavigate();

    const start = () => {
        navigate('/new-chat');
    }

    return (
        <Box
            sx={{
                height: '75vh',
                width: '70vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // background: 'linear-gradient(135deg, #1a1a1a, #0f2027)',
                color: 'white',
                textAlign: 'center',
                px: 2,
            }}
        >
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    fontSize: '4rem',
                    background: 'linear-gradient(90deg, #00dbde, #fc00ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                    margin: 0,
                }}
            >
                JARVIS
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
            >
                <Typography variant="h6" sx={{ mt: 2, color: '#ccc' }}>
                    Your personal AI assistant, redefined.
                </Typography>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
            >
                <Stack spacing={1} sx={{ mt: 4, color: '#ccc' }}>
                    <Typography variant="body1">💬 Answer questions instantly</Typography>
                    <Typography variant="body1">🧠 Remember your conversations</Typography>
                    <Typography variant="body1">🚀 Write code, fix bugs, explain logic</Typography>
                    <Typography variant="body1">📚 Help with writing, research & more</Typography>
                </Stack>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
            >
                <Button
                    variant="contained"
                    onClick={start}
                    sx={{
                        mt: 5,
                        mb: 2,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        background: 'linear-gradient(90deg, #00dbde, #fc00ff)',
                        borderRadius: '30px',
                        boxShadow: '0px 0px 10px rgba(0,0,0,0.4)',
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    Get Started
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1, delay: 1.5 }}
            >
                <Typography variant="caption" sx={{ mt: 4, fontStyle: 'italic', color: '#aaa' }}>
                    "Empowering you with the future of AI – one conversation at a time."
                </Typography>
            </motion.div>
        </Box>
    );
}
