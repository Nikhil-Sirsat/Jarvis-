import { useState, useEffect, useContext } from "react";
import axiosInstance from "../AxiosInstance";
import { useSnackbar } from "../Context/SnackBarContext";
import { ThemeContext } from "../Context/ThemeContext";

import {
    Box,
    Typography,
    Paper,
} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';



export default function Favourite() {
    const [favourites, setFavourites] = useState([]);
    const showSnackbar = useSnackbar();
    const [speakingMsgIndex, setSpeakingMsgIndex] = useState(null);
    const { mode } = useContext(ThemeContext);

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                // Fetch favourites from the backend
                const response = await axiosInstance.get('/api/favourite/get_Favourites');
                const data = response.data;
                setFavourites(data);
            } catch (error) {
                showSnackbar("Failed to fetch favourites : ", error.response.data.message);
            }
        };

        fetchFavourites();
    }, []);

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

    return (
        <div style={{ padding: '20px' }}>

            <Typography variant="h4" sx={{ mb: 3, color: mode == 'dark' ? 'white' : 'black' }}>
                Favourites
            </Typography>

            {favourites.map((fav, index) => (

                <Box
                    key={index}
                    display="flex"
                    justifyContent="flex-start"
                    mb={3}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            display: "inline-block",
                            maxWidth: '100%',
                            px: 2,
                            py: 1.5,
                            borderRadius: 7,
                            wordBreak: "break-word",
                            backgroundColor: mode == 'dark' ? 'black' : 'white',
                            boxShadow: 'none',
                            border: mode == 'dark' ? '1px solid #333' : '1px solid #ccc',
                        }}
                    >
                        <Typography sx={{
                            lineHeight: 1.7,
                            fontSize: '16px',
                            p: 1
                        }}>
                            <ReactMarkdown>
                                {fav.msgId.message}
                            </ReactMarkdown>
                        </Typography>


                        {/* response bottom ops */}
                        <>
                            <br />
                            {speakingMsgIndex === index ? (
                                <VolumeOffIcon onClick={stopAiVoiceRes} />
                            ) : (
                                <VolumeUpIcon onClick={() => aiVoiceRes(fav.msgId.message, index)} />
                            )}

                        </>

                    </Paper>
                </Box>
            ))}
        </div>
    )
}