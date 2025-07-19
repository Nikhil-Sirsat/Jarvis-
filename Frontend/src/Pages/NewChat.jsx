import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
    Box,
    Typography,
} from "@mui/material";
import axiosInstance from '../AxiosInstance.jsx';
import { useSnackbar } from '../Context/SnackBarContext';
import UserInput from "../Components/UserInput.jsx";

export default function NewChat() {
    const [input, setInput] = useState("");
    const [msgLoading, setMsgLoading] = useState(false);
    const { reFreshFetchConvHist } = useOutletContext(); // Get the function to refresh conversation history
    const navigate = useNavigate();
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
