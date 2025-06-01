import React, { useState } from "react";
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

export default function NewChat() {
    const [input, setInput] = useState("");
    const [msgLoading, setMsgLoading] = useState(false);
    const navigate = useNavigate();

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
        } finally {
            setMsgLoading(false);
        }
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
                    placeholder="Ask something to JARVIS..."
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
                        <IconButton color="white" sx={{ ml: 1, border: '3px solid rgb(255, 255, 255)', ":hover": { cursor: 'default' } }}>
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
