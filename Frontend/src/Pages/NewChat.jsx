import { useState, useEffect, useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Box,
    Typography,
    Stack,
    useMediaQuery, useTheme
} from "@mui/material";
import axiosInstance from '../AxiosInstance.jsx';
import { useSnackbar } from '../Context/SnackBarContext';
import UserInput from "../Components/UserInput.jsx";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { AuthContext } from '../Context/AuthContext.jsx';
import { useSocket } from "../Context/SocketContext.jsx";
import ReplyLoad from "../Components/ReplyLoad.jsx";

export default function NewChat() {
    const [input, setInput] = useState("");
    const [msgLoading, setMsgLoading] = useState(false);
    const [isWebSearch, setIsWebSearch] = useState(false);
    const [isMemorySearch, setIsMemorySearch] = useState(false);
    const [isConvInit, setIsConvInit] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const { reFreshFetchConvHist } = useOutletContext();
    const { user } = useContext(AuthContext);

    const navigate = useNavigate();
    const showSnackbar = useSnackbar();
    const socket = useSocket();

    // fetch proactive suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await axiosInstance.get("/api/user/getProactiveSuggestions");
                setSuggestions(res.data.suggestions || []);
            } catch (error) {
                // showSnackbar(`Failed to load suggestions : ${error.status} : ${error.response?.data?.message || error.message}`);
                console.log(`Failed to load proactive suggestions suggestions : ${error.status} : ${error.response?.data?.message || error.message}`);
            } finally {
                setSuggestionsLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    // socket events
    useEffect(() => {
        if (!socket) return;

        // new conv init indicator
        socket.on("new-conv-init", (data) => {
            setIsConvInit(data.status);
        });

        // web search indicator
        socket.on("web-search", (data) => {
            setIsWebSearch(data.status);
        });

        // memory search indicator
        socket.on("memory-search", (data) => {
            setIsMemorySearch(data.status);
        });

        return () => {
            socket.off("new-conv-init");
            socket.off("web-search");
            socket.off("memory-search");
        };
    }, [socket]);

    const handleSend = async () => {
        if (!socket || !socket.id) {
            return;
        }

        if (!input.trim()) return;

        setMsgLoading(true);

        try {
            const res = await axiosInstance.post(
                "/api/chat",
                {
                    message: input,
                    socketId: socket.id,
                },
            );

            reFreshFetchConvHist(); // Refresh conversation history
            navigate(`/chat/${res.data.conversationId}`);
            setInput("");
        } catch (error) {
            console.log(`Message send error:`);
            showSnackbar(`Message send error : ${error.status} : ${error.response?.data?.message || error.message}`);
        } finally {
            setMsgLoading(false);
            setIsWebSearch(false);
            setIsMemorySearch(false);
            setIsConvInit(false);
        }
    };

    const handleSuggestionClick = (text) => {
        setInput(text);
    }

    return (
        <Box
            sx={{
                height: "70vh",
                width: { xs: '87vw', md: '60vw' },
                display: "flex",
                flexDirection: 'column',
                // alignItems: 'center',
                justifyContent: 'space-evenly'
            }}
        >
            <Typography variant="h3" sx={{ m: 'auto', mb: 0 }}>
                Hey {user.persona.nickname || user.name}!
            </Typography>
            <Typography variant={isSmallScreen ? 'h5' : 'h4'} sx={{ m: 'auto', mb: 3, mt: 2 }}>
                what can I help with?
            </Typography>

            {msgLoading ? (<ReplyLoad isConvInit={isConvInit} isWebSearch={isWebSearch} isMemorySearch={isMemorySearch} />) : null}

            {/* user input */}
            <UserInput
                handleSend={handleSend}
                input={input}
                setInput={setInput}
                msgLoading={msgLoading}
            />

            {/* warning */}
            <Typography sx={{ p: 0.5, fontSize: { xs: 11, md: 14 }, color: "grey", m: 'auto' }}>
                <i>Jarvis can make mistakes. Check important info.</i>
            </Typography>

            {/* Suggestions Section */}
            {suggestions ? (
                <Box sx={{ mt: 3, mb: 3 }}>
                    {suggestions.length > 0 ? (<Typography variant="body2" color="text.secondary" mb={1}>
                        you might wanna ask.....
                    </Typography>) : null
                    }

                    {suggestionsLoading ? (
                        null
                    ) : (
                        <Stack direction="column" spacing={2} sx={{ mt: 4, mb: 4 }}>
                            {suggestions.map((text, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleSuggestionClick(text)}
                                    sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', backgroundColor: 'transparent', ':hover': { cursor: 'pointer' } }}
                                >
                                    <HelpOutlineRoundedIcon sx={{ flexShrink: 0, color: '#606060', fontSize: '15px', mt: '3.5px' }} />
                                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                        {text}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            ) : null}
        </Box>
    );
};
