import { useState, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import MarkFavBtn from './markFavBtn.jsx';

import {
    Box,
    Typography,
    Paper,
    IconButton,
    Stack,
} from "@mui/material";

import { useSnackbar } from '../Context/SnackBarContext';
import { ThemeContext } from "../Context/ThemeContext.jsx";

export default function Message({ msg, index }) {
    const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
    const showSnackbar = useSnackbar();
    const { mode } = useContext(ThemeContext);

    // handle ai voice response
    const aiVoiceRes = (message, index) => {
        if (!('speechSynthesis' in window)) {
            console.error("Speech Synthesis not supported in this browser.");
            showSnackbar("Speech Synthesis not supported in this browser");
            setSpeakingMsgIndex(null);
            return;
        }

        const speak = () => {
            const voices = window.speechSynthesis.getVoices();
            if (!voices.length) {
                console.warn("Voices not loaded yet.");
                return;
            }

            setSpeakingMsgIndex(index);
            const cleaned = cleanText(message);
            const utterance = new SpeechSynthesisUtterance(cleaned);
            utterance.lang = 'en-US';

            // Set preferred voice
            const preferredVoice = voices.find(
                (voice) => voice.name.includes("Google") && voice.lang === "en-US"
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);

            utterance.onend = () => {
                setSpeakingMsgIndex(null);
            };
        };

        // Wait for voices
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = speak;
        } else {
            speak();
        }
    };

    // handle and stop ai voice response
    const stopAiVoiceRes = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setSpeakingMsgIndex(null);
        } else {
            console.error("Speech Synthesis not supported in this browser.");
            setSpeakingMsgIndex(null);
        }
    };

    // copy response
    const handleCopy = (msg) => {
        // console.log('msg : ', msg);
        navigator.clipboard.writeText(msg)
            .then(() => console.log("Copied!"))
            .catch(() => showSnackbar("Failed to copy"));
    };

    // clean text 
    const cleanText = (text) => {
        // Keep only letters, numbers, and spaces
        return text.replace(/[^a-zA-Z0-9\s.,]/g, '');
    }

    return (
        <Box
            key={index}
            display="flex"
            justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
            mb={3}
            width="100%"
        >
            <Box
                elevation={3}
                sx={{
                    display: "inline-block",
                    maxWidth: msg.sender === "user" ? { xs: '90%', md: '70%' } : '100%',
                    px: msg.sender === "user" ? { xs: 1, md: 2 } : { xs: 0, md: 2 },
                    py: 2,
                    borderRadius: 7,
                    wordBreak: "break-word",
                    backgroundColor: msg.sender === "user" ? mode == 'dark' ? '#1a1a1aff' : '#ecececff' : 'transparent',
                    boxShadow: 'none',
                }}
            >
                <Box sx={{
                    lineHeight: 1.7,
                    fontSize: '16px',
                    p: 1
                }}>

                    {/* Sources Section */}
                    {msg.sender === "ai" && msg.sources && msg.sources.length > 0 && (
                        <Box sx={{ px: 2, pt: 1 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}
                            >
                                Sources <b>:</b>
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                                sx={{
                                    mt: 1,
                                    mb: 2,
                                }}
                            >
                                {msg.sources.map((source, idx) => (
                                    <Box
                                        key={idx}
                                        component="a"
                                        href={source.redirect_link}
                                        target="_blank"
                                        // rel="noopener noreferrer"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1e1e1e' : '#f0f0f0',
                                            borderRadius: "8px",
                                            px: 1.5,
                                            py: 0.8,
                                            textDecoration: "none",
                                            color: "inherit",
                                            maxWidth: '100%',
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#333' : '#e2e2e2',
                                            },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={source.favicon}
                                            alt={source.source}
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                mr: 1,
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                maxWidth: { xs: '130px', sm: '180px' },
                                            }}
                                        >
                                            {source.source}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {/* memory Used */}
                    {msg.memoryUsed && msg.memoryUsed.length > 0 && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 5, ml: 2, mt: 3 }}>
                            memory used <b>:</b>
                            <br />
                            {msg.memoryUsed.map(m => ` ${m}`).join('\n')}
                        </Typography>
                    )}

                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => (
                                <Typography
                                    variant="h4"
                                    sx={{
                                        mt: 6,
                                        mb: 3,
                                        fontWeight: 700,
                                        pl: 1.5,
                                        borderLeft: '4px solid #1976d2',
                                        backgroundColor: '#f5f7fa',
                                        padding: '12px',
                                        borderRadius: '6px',
                                    }}
                                    {...props}
                                />
                            ),
                            h2: ({ node, ...props }) => (
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mt: 5,
                                        mb: 3,
                                        fontWeight: 700,
                                        pl: 1.2,
                                        borderLeft: '4px solid #42a5f5',
                                        backgroundColor: '#f8f9fb',
                                        padding: '10px',
                                        borderRadius: '6px',
                                    }}
                                    {...props}
                                />
                            ),
                            h3: ({ node, ...props }) => (
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mt: 4,
                                        mb: 2,
                                        fontWeight: 600,
                                        pl: 1,
                                        borderLeft: '3px solid #90caf9',
                                        backgroundColor: '#fafbfc',
                                        padding: '8px',
                                        borderRadius: '4px',
                                    }}
                                    {...props}
                                />
                            ),
                            p: ({ node, ...props }) => (
                                <Typography
                                    sx={{
                                        mb: msg.sender === 'user' ? 0 : 2,
                                        pl: msg.sender === 'user' ? 0 : 2,
                                        lineHeight: 1.8,
                                    }}
                                    {...props}
                                />
                            ),
                            li: ({ node, ...props }) => (
                                <li
                                    style={{
                                        marginBottom: '12px',
                                        paddingLeft: '0.5rem', // 1 rem is ideal of large screen
                                        marginLeft: '1.5rem',
                                    }}
                                >
                                    <Typography
                                        component="span"
                                        sx={{
                                            lineHeight: 2,
                                        }}
                                        {...props}
                                    />
                                </li>
                            ),
                            ul: ({ node, ...props }) => (
                                <ul
                                    style={{
                                        paddingLeft: '2rem',
                                        marginBottom: '1.5rem',
                                    }}
                                    {...props}
                                />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol
                                    style={{
                                        paddingLeft: '2rem',
                                        marginBottom: '1.5rem',
                                    }}
                                    {...props}
                                />
                            ),


                        }}
                    >
                        {msg.message}
                    </ReactMarkdown>

                </Box>

                {/* response bottom ops */}
                {msg.sender === "ai" ? (
                    <Box sx={{ pl: 2 }}>
                        <br />
                        {speakingMsgIndex === index ? (
                            <IconButton onClick={stopAiVoiceRes}>
                                <VolumeOffOutlinedIcon sx={{ color: "#0ca37f" }} />
                            </IconButton>

                        ) : (
                            <IconButton onClick={() => aiVoiceRes(msg.message, index)}>
                                <VolumeUpOutlinedIcon />
                            </IconButton>
                        )}

                        <MarkFavBtn
                            msgId={msg._id}
                            isFav={msg.isFavourite}
                        />

                        <IconButton sx={{ ml: 1 }} onClick={() => handleCopy(msg.message)}>
                            <ContentCopyOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconButton>

                    </Box>
                ) : null}

            </Box>
        </Box>
    );
}