import { useState, useEffect, useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Box,
    Typography,
    Skeleton,
    Stack,
} from "@mui/material";
import axiosInstance from '../AxiosInstance.jsx';
import { useSnackbar } from '../Context/SnackBarContext';
import UserInput from "../Components/UserInput.jsx";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { ThemeContext } from "../Context/ThemeContext.jsx";

export default function NewChat() {
    const [input, setInput] = useState("");
    const [msgLoading, setMsgLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);
    const { reFreshFetchConvHist } = useOutletContext(); // Get the function to refresh conversation history
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();
    const { mode } = useContext(ThemeContext);

    // fetch proactive suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await axiosInstance.get("/api/user/getProactiveSuggestions");
                setSuggestions(res.data.suggestions || []);
            } catch (error) {
                showSnackbar(`Failed to load suggestions : ${error.status} : ${error.response?.data?.message || error.message}`);
            } finally {
                setSuggestionsLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

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

            reFreshFetchConvHist(); // Refresh conversation history
            navigate(`/chat/${res.data.conversationId}`);
            setInput("");
        } catch (error) {
            console.log(`Message send error:`);
            showSnackbar(`Message send error : ${error.status} : ${error.response?.data?.message || error.message}`);
        } finally {
            setMsgLoading(false);
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
                alignItems: 'center',
                justifyContent: 'space-evenly'
            }}
        >
            <Typography variant="h4">
                Welcome Boss what can I help with?
            </Typography>

            {/* Suggestions Section */}
            {suggestions && suggestionsLoading ? (
                <Box sx={{ mt: 3, mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        you might wanna ask.....
                    </Typography>

                    {suggestionsLoading ? (
                        <Stack direction="column" spacing={1} flexWrap="wrap">
                            {[...Array(3)].map((_, idx) => (
                                <Skeleton
                                    key={idx}
                                    variant="rectangular"
                                    width={220}
                                    height={40}
                                    sx={{ borderRadius: 2, mb: 1 }}
                                />
                            ))}
                        </Stack>
                    ) : (
                        <Stack direction="column" spacing={2} sx={{ mt: 4, mb: 4 }}>
                            {suggestions.map((text, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleSuggestionClick(text)}
                                    sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', backgroundColor: 'transparent', ':hover': { cursor: 'pointer' } }}
                                >
                                    <HelpOutlineRoundedIcon sx={{ flexShrink: 0, color: '#606060' }} />
                                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                                        {text}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>
            ) : null}

            {/* user input */}
            <UserInput
                handleSend={handleSend}
                input={input}
                setInput={setInput}
                msgLoading={msgLoading}
            />

            {/* warning */}
            <Typography sx={{ p: 0.5, fontSize: { xs: 11, md: 14 }, color: "grey" }}>
                <i>Jarvis can make mistakes. Check important info.</i>
            </Typography>
        </Box>
    );
};
