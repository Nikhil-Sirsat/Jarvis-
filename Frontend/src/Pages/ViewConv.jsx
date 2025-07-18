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
import { ThemeContext } from "../Context/ThemeContext.jsx";
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import ReplyLoad from "../Components/ReplyLoad.jsx";
import { useSnackbar } from '../Context/SnackBarContext';
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
import Message from '../Components/Message.jsx';

export default function ViewConv() {
    const [input, setInput] = useState("");
    const { convId } = useParams();
    const [messages, setMessages] = useState([]);
    const [convLoad, setConvLoad] = useState(false);
    const [msgLoading, setMsgLoading] = useState(false);
    const { mode } = useContext(ThemeContext);
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
                    _id: res.data.aiMsgId,

                },
            ]);
            setTimeout(scrollToBottom, 100);

        } catch (err) {
            console.log("Message send error:", err);

            //remove new message if error occurs
            setMessages((prev) => prev.filter((msg) => msg.sender !== "user" || msg.message !== input));

            showSnackbar(err.response.data.message);
        } finally {
            setMsgLoading(false);
        }
    };

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

                    <Message msg={msg} index={index} key={index} />
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