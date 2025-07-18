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
} from "@mui/material";

import { useSnackbar } from '../Context/SnackBarContext';
import { ThemeContext } from "../Context/ThemeContext.jsx";

export default function Message({ msg, index }) {
    const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
    const showSnackbar = useSnackbar();
    const { mode } = useContext(ThemeContext);

    // handle ai voice response
    const aiVoiceRes = (message, index) => {
        if ('speechSynthesis' in window) {
            setSpeakingMsgIndex(index);
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);

            // stop any ongoing speech before starting a new one
            utterance.onend = () => {
                setSpeakingMsgIndex(null);
            };
        } else {
            console.error("Speech Synthesis not supported in this browser.");
            showSnackbar("Speetch Synthesis not supported in this browser");
            setSpeakingMsgIndex(null);
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
        console.log('msg : ', msg);
        navigator.clipboard.writeText(msg)
            .then(() => console.log("Copied!"))
            .catch(() => showSnackbar("Failed to copy"));
    };

    return (
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
                    px: 2.5,
                    py: 2.5,
                    borderRadius: 7,
                    wordBreak: "break-word",
                    backgroundColor: msg.sender === "user" ? 'none' : mode == 'dark' ? 'black' : 'white',
                    boxShadow: 'none',
                }}
            >
                <Typography sx={{
                    lineHeight: 1.7,
                    fontSize: '16px',
                    p: 1
                }}>

                    {/* memory Used */}
                    {msg.memoryUsed && msg.memoryUsed.length > 0 && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                            Memory Used:
                            <br />
                            {msg.memoryUsed.map(m => ` ${m}`).join('\n')}
                        </Typography>
                    )}

                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => (
                                <Typography variant="h4" sx={{ mt: 5, mb: 3, fontWeight: 700 }} {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <Typography variant="h5" sx={{ mt: 4, mb: 3, fontWeight: 700 }} {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <Typography variant="h6" sx={{ mt: 4, mb: 2.5, fontWeight: 600 }} {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <Typography sx={{ mb: 2.5, lineHeight: 1.8 }} {...props} />
                            ),
                            li: ({ node, ...props }) => (
                                <li style={{ marginBottom: 8 }}>
                                    <Typography component="span" sx={{ lineHeight: 2 }} {...props} />
                                </li>
                            ),
                        }}
                    >
                        {msg.message}
                    </ReactMarkdown>

                </Typography>

                {/* response bottom ops */}
                {msg.sender === "ai" ? (
                    <>
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

                    </>
                ) : null}

            </Paper>
        </Box>
    );
}