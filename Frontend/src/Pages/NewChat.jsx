import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Box,
    Typography,
    Skeleton,
    Chip,
    Stack,
} from "@mui/material";
import axiosInstance from '../AxiosInstance.jsx';
import { useSnackbar } from '../Context/SnackBarContext';
import UserInput from "../Components/UserInput.jsx";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

export default function NewChat() {
    const [input, setInput] = useState("");
    const [msgLoading, setMsgLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(true);
    const { reFreshFetchConvHist } = useOutletContext(); // Get the function to refresh conversation history
    const navigate = useNavigate();
    const showSnackbar = useSnackbar();

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
            }}
        >
            <Typography variant="h4" sx={{ m: 'auto' }}>
                Welcome Boss what can I help with?
            </Typography>

            {/* Suggestions Section */}
            <Box sx={{ mt: 3, mb: 3 }}>
                <Typography variant="subtitle1" mb={1}>
                    Suggested Questions
                </Typography>

                {suggestionsLoading ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {[...Array(3)].map((_, idx) => (
                            <Skeleton
                                key={idx}
                                variant="rectangular"
                                width={220}
                                height={40}
                                sx={{ borderRadius: 2 }}
                            />
                        ))}
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {suggestions.map((text, index) => (
                            <Chip
                                key={index}
                                icon={<QuestionAnswerIcon />}
                                label={text}
                                onClick={() => handleSuggestionClick(text)}
                                sx={{
                                    mb: 5,
                                    fontSize: 14,
                                    backgroundColor: "#000000ff",
                                    "&:hover": {
                                        backgroundColor: "#2e2e2eff"
                                    }
                                }}
                            />
                        ))}
                    </Stack>
                )}
            </Box>

            {/* user input */}
            <UserInput
                handleSend={handleSend}
                input={input}
                setInput={setInput}
                msgLoading={msgLoading}
            />

            {/* warning */}
            <Typography sx={{ p: 0.5, fontSize: { xs: 11, md: 14 }, m: 'auto', color: "grey" }}>
                <i>Jarvis can make mistakes. Check important info.</i>
            </Typography>
        </Box>
    );
};
