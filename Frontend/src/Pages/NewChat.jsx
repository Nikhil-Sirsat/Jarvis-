import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Typography,
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import axiosInstance from '../AxiosInstance.jsx';
import PendingIcon from '@mui/icons-material/Pending';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
import { useSnackbar } from '../Context/SnackBarContext';

export default function NewChat() {
    const [input, setInput] = useState("");
    const [msgLoading, setMsgLoading] = useState(false);
    const [mikeActive, setMikeActive] = useState(false);
    const recognitionRef = useRef(null);
    const navigate = useNavigate();
    let recognition = null;
    const showSnackbar = useSnackbar();

    const handleSend = async () => {
        console.log('send message called');
        if (!input.trim()) return;

        setMsgLoading(true);

        try {
            const res = await axiosInstance.post(
                "/api/chat",
                {
                    message: input,
                },
            );

            navigate(`/${res.data.conversationId}`);
            setInput("");
        } catch (err) {
            console.log("Message send error:", err);
            showSnackbar(err.response.data.message);
        } finally {
            setMsgLoading(false);
        }
    };

    // Listen & Initialized speech recognition 
    const startListening = () => {
        if (!SpeechRecognition) {
            console.log("Speech Recognition API not supported in this browser.");
            return;
        }

        if (mikeActive && recognitionRef.current) {
            console.log("Stopping previous recognition...");
            recognitionRef.current.stop();
            return; // Wait for `onend` to restart
        }

        console.log("Initializing speech recognition...");

        recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;
        setMikeActive(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcript:", transcript);
            setInput(transcript);
            setMikeActive(false);
        };

        recognition.onerror = (event) => {
            console.log("Speech recognition error:", event.error);
            setMikeActive(false);
        };

        recognition.onend = () => {
            console.log("Speech recognition ended.");
            setMikeActive(false);
        };

        recognition.start();
    };

    return (
        <Box
            sx={{
                height: "70vh",
                width: { xs: '87vw', md: '60vw' },
                display: "flex",
                flexDirection: 'column',
            }}
        >
            <Typography variant="h4" sx={{ m: 'auto' }}>
                Welcome Boss what can I help with?
            </Typography>
            <Paper
                sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 11,
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={recognition || mikeActive ? "Listening..." : "Ask something to JARVIS..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                border: 'none',
                            },
                            '&:hover fieldset': {
                                border: 'none',
                            },
                            '&.Mui-focused fieldset': {
                                border: 'none',
                            },
                        },
                    }}
                />

                {msgLoading ? (
                    <PendingIcon sx={{ fontSize: 40 }} />
                ) : (
                    input ? (
                        <IconButton color="white" onClick={handleSend} sx={{ ml: 1, border: '3px solid rgb(255, 255, 255)' }}>
                            <ArrowUpwardIcon />
                        </IconButton>
                    ) : (
                        <IconButton color="white" sx={{ ml: 1, border: '3px solid rgb(255, 255, 255)' }} onClick={startListening}>
                            <GraphicEqRoundedIcon />
                        </IconButton>
                    )
                )}
            </Paper>
            {/* warning */}
            <Typography sx={{ p: 0.5, fontSize: { xs: 11, md: 14 }, m: 'auto', color: "grey" }}>
                <i>Jarvis can make mistakes. Check important info.</i>
            </Typography>
        </Box>
    );
};
