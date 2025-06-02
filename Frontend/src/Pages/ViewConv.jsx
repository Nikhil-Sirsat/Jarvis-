import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    TextField,
} from "@mui/material";
import axiosInstance from "../AxiosInstance.jsx";
import CircularProgress from '@mui/material/CircularProgress';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PendingIcon from '@mui/icons-material/Pending';
import ReactMarkdown from 'react-markdown';
import { ThemeContext } from "../Context/ThemeContext.jsx";
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import ReplyLoad from "../Components/ReplyLoad.jsx";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { speek, stopSpeaking } from "../aiVoice.js";

export default function ViewConv() {
    const [input, setInput] = useState("");
    const { convId } = useParams();
    const [messages, setMessages] = useState([]);
    const [convLoad, setConvLoad] = useState(false);
    const [msgLoading, setMsgLoading] = useState(false);
    const { mode } = useContext(ThemeContext)
    const [aiSpeaking, setAiSpeaking] = useState(false);

    // Ref for auto-scrolling
    const messagesEndRef = useRef(null);

    // Function to scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // fetch old conversation 
    useEffect(() => {
        console.log('fetch conv messages called');
        const fetchMessages = async () => {

            if (!convId) return;

            setConvLoad(true);
            try {
                const res = await axiosInstance.get(`/api/Chat/${convId}/messages`);
                setMessages(res.data);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.log("Error fetching messages:", err);
            } finally {
                setConvLoad(false);
            }
        };

        fetchMessages();
    }, [convId]);

    // send message and receive ai reply
    const handleSend = async () => {
        console.log('send message called');
        if (!input.trim()) return;

        setMsgLoading(true);

        setInput(""); // Clear input field

        const userMessage = {
            sender: "user",
            message: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setTimeout(scrollToBottom, 100);

        try {
            const res = await axiosInstance.post(
                "/api/chat",
                {
                    message: input,
                    conversationId: convId,
                },
            );

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    message: res.data.reply,
                },
            ]);
            setTimeout(scrollToBottom, 100);

        } catch (err) {
            console.log("Message send error:", err);
        } finally {
            setMsgLoading(false);
        }
    };

    // speek the AI response
    const handleSpeak = (message) => {
        setAiSpeaking(true);
        speek(message);
    }

    const handleStopSpeaking = () => {
        stopSpeaking();
        setAiSpeaking(false);
    }

    if (convLoad) {
        return (
            <CircularProgress />
        )
    }

    return (
        <Box
            sx={{
                width: { xs: '87vw', md: '60vw' },
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    padding: 2,
                }}
            >
                {messages.map((msg, index) => (

                    <Box
                        key={index}
                        display="flex"
                        justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
                        mb={3}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                display: "inline-block",
                                maxWidth: msg.sender === "user" ? '70%' : '100%',
                                px: 2,
                                py: 1.5,
                                borderRadius: 7,
                                wordBreak: "break-word",
                                backgroundColor: msg.sender === "user" ? 'none' : mode == 'dark' ? 'black' : 'white',
                                boxShadow: 'none'
                            }}
                        >
                            <Typography sx={{
                                lineHeight: 1.7,
                                fontSize: '16px',
                                p: 1
                            }}>
                                <ReactMarkdown>
                                    {msg.message}
                                </ReactMarkdown>
                            </Typography>


                            {/* response bottom ops */}
                            {msg.sender === "ai" ? (
                                <>
                                    <br />
                                    {aiSpeaking ? (
                                        <VolumeOffIcon onClick={handleStopSpeaking} />
                                    ) : (
                                        <VolumeUpIcon onClick={() => handleSpeak(msg.message)} />
                                    )}

                                </>
                            ) :
                                null}

                        </Paper>
                    </Box>
                ))}

                {msgLoading ? (<ReplyLoad />) : null}

                <div ref={messagesEndRef} /> {/* Auto-scroll target */}

            </Box>

            {/* bottom  */}
            <Box sx={{
                pt: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                position: 'sticky',
                bottom: -1,
                backgroundColor: mode == 'light' ? 'white' : '#121212',
            }}>

                <Paper
                    sx={{
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 11,
                        width: '100%',
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Ask anything"
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
                <Typography sx={{ p: 0.5, fontSize: { xs: 11, md: 14 }, color: 'grey' }}>
                    <i>Jarvis can make mistakes. Check important info.</i>
                </Typography>

            </Box>
        </Box >
    )
}