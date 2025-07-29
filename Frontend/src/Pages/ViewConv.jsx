import { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import {
    Box,
    Typography,
} from "@mui/material";
import axiosInstance from "../AxiosInstance.jsx";
import { ThemeContext } from "../Context/ThemeContext.jsx";
import ReplyLoad from "../Components/ReplyLoad.jsx";
import { useSnackbar } from '../Context/SnackBarContext';
import Message from '../Components/Message.jsx';
import UserInput from "../Components/UserInput.jsx";
import ThreeDotLoading from "../Components/ThreeDotLoading.jsx";
import AutorenewTwoToneIcon from '@mui/icons-material/AutorenewTwoTone';
import { keyframes } from '@mui/system';
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
    withCredentials: true,
});

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); } /* negative = right-to-left */
`;

export default function ViewConv() {
    const [input, setInput] = useState("");
    const { convId } = useParams();
    const [messages, setMessages] = useState([]);
    const [convLoad, setConvLoad] = useState(false);
    const [msgLoading, setMsgLoading] = useState(false);
    const { mode } = useContext(ThemeContext);
    const showSnackbar = useSnackbar();
    const [isWebSearch, setIsWebSearch] = useState(false);
    const [isMemorySearch, setIsMemorySearch] = useState(false);

    // Ref for auto-scrolling
    const messagesEndRef = useRef(null);

    // Function to scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // socket connections
    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to socket : ", socket.id);
        });

        // web search indicator
        socket.on("web-search", (data) => {
            console.log("Web Search Status:", data.status);
            setIsWebSearch(data.status);
        });

        // memory search indicator
        socket.on("memory-search", (data) => {
            console.log("Memeory Search Status:", data.status);
            setIsMemorySearch(data.status);
        });

        return () => {
            socket.off("connect", () => {
                console.log('socket disconnected');
            });
        };

    }, []);

    // fetch old conversation 
    useEffect(() => {
        // console.log('fetch conv messages called');
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
                // console.log(res.data);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.log("Error fetching messages:", error);
                showSnackbar(`Error fetching messages : ${error.status} : ${error.response?.data?.message || error.message}`);
            } finally {
                setConvLoad(false);
            }
        };

        fetchMessages();
    }, [convId]);

    // send message and receive ai reply
    const handleSend = async () => {
        if (socket.id) {
            if (!input.trim()) return;

            setMsgLoading(true);

            setInput("");

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
                        socketId: socket.id,
                    },
                );

                // console.log("SOURCES : ", res.data.sources);

                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "ai",
                        message: res.data.reply,
                        memoryUsed: res.data.memoryUsed,
                        _id: res.data.aiMsgId,
                        sources: res.data.sources,

                    },
                ]);
                setTimeout(scrollToBottom, 100);

            } catch (error) {
                console.log("Message send error:", error);

                //remove new message if error occurs
                setMessages((prev) => prev.filter((msg) => msg.sender !== "user" || msg.message !== input));

                showSnackbar(`Error sending message: ${error.status} : ${error.response?.data?.message || error.message}`);
            } finally {
                setMsgLoading(false);
                setIsMemorySearch(false);
                setIsWebSearch(false);
            }
        }
    };

    if (convLoad) return <ThreeDotLoading />;

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

                {msgLoading ? (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <ReplyLoad />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>Thinking...</Typography>
                        </Box>

                        {isWebSearch ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: -2, mb: 1.5 }}>
                                <AutorenewTwoToneIcon
                                    sx={{
                                        animation: `${rotate} 0.5s linear infinite`, // 1.5s per rotation
                                        fontSize: 22, // optional, adjust size
                                        ml: 0.7
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>searching web...</Typography>
                            </Box>
                        ) : null}

                        {isMemorySearch ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <AutorenewTwoToneIcon
                                    sx={{
                                        animation: `${rotate} 0.5s linear infinite`, // 1.5s per rotation
                                        fontSize: 22, // optional, adjust size
                                        ml: 0.7
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>Looking at memories...</Typography>
                            </Box>
                        ) : null}

                    </Box>
                ) : null}

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
                backgroundColor: mode == 'light' ? 'white' : '#212121',
            }}>

                {/* user input */}
                <UserInput
                    handleSend={handleSend}
                    input={input}
                    setInput={setInput}
                    msgLoading={msgLoading}
                />

                {/* warning */}
                <Typography sx={{ p: 0.5, fontSize: { xs: 11, md: 14 }, color: 'grey' }}>
                    <i>Jarvis can make mistakes. Check important info.</i>
                </Typography>

            </Box>
        </Box >
    )
}