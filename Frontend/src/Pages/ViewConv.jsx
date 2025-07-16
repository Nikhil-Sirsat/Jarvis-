import { useState, useEffect, useRef, useContext } from "react";
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
import { useSnackbar } from '../Context/SnackBarContext';
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
import MarkFavBtn from "../Components/markFavBtn.jsx";

export default function ViewConv() {
    const [input, setInput] = useState("");
    const { convId } = useParams();
    const [messages, setMessages] = useState([]);
    const [convLoad, setConvLoad] = useState(false);
    const [msgLoading, setMsgLoading] = useState(false);
    const { mode } = useContext(ThemeContext)
    const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
    const [mikeActive, setMikeActive] = useState(false);
    const recognitionRef = useRef(null);
    let recognition = null;
    const showSnackbar = useSnackbar();

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

                const isfavRes = await Promise.all(
                    res.data.map(async (msg) => {
                        let msgId = msg._id;
                        const favRes = await axiosInstance.get(`/api/favourite/isFavourite/${msgId}`);
                        return favRes.data.isFavourite;
                    })
                );

                setMessages(
                    res.data.map((msg, index) => ({
                        ...msg,
                        isFavourite: isfavRes[index],
                    }))
                );
                console.log(res.data);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.log("Error fetching messages:", err);
                showSnackbar("Error fetching messages : ", err);
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
                    memoryUsed: res.data.memoryUsed,

                },
            ]);
            setTimeout(scrollToBottom, 100);

        } catch (err) {
            console.log("Message send error:", err);
            showSnackbar(err.response.data.message);
        } finally {
            setMsgLoading(false);
        }
    };

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
    }

    // handle and stop ai voice response
    const stopAiVoiceRes = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setSpeakingMsgIndex(null);
        } else {
            console.error("Speech Synthesis not supported in this browser.");
            setSpeakingMsgIndex(null);
        }
    }

    // Listen & Initialized speech recognition 
    const startListening = () => {
        if (!SpeechRecognition) {
            console.log("Speech Recognition API not supported in this browser.");
            showSnackbar("Speech Recognition API not supported in this browser.");
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
            showSnackbar("Speech recognition error : ", event.error);
            setMikeActive(false);
        };

        recognition.onend = () => {
            console.log("Speech recognition ended.");
            setMikeActive(false);
        };

        recognition.start();
    };

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
                                            <VolumeOffIcon sx={{ color: "#0ca37f" }} />
                                        </IconButton>

                                    ) : (
                                        <IconButton onClick={() => aiVoiceRes(msg.message, index)}>
                                            <VolumeUpIcon />
                                        </IconButton>
                                    )}

                                    <MarkFavBtn
                                        msgId={msg._id}
                                        isFav={msg.isFavourite}
                                    />

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
                <Typography sx={{ p: 0.5, fontSize: { xs: 11, md: 14 }, color: 'grey' }}>
                    <i>Jarvis can make mistakes. Check important info.</i>
                </Typography>

            </Box>
        </Box >
    )
}