import { useState, useEffect, useContext } from "react";
import axiosInstance from "../AxiosInstance";
import { useSnackbar } from "../Context/SnackBarContext";
import { ThemeContext } from "../Context/ThemeContext";
import ThreeDotLoading from "../Components/ThreeDotLoading.jsx";

import {
    Box,
    Typography,
} from "@mui/material";
import Message from '../Components/Message.jsx';

export default function Favourite() {
    const [favourites, setFavourites] = useState([]);
    const [loading, setLoading] = useState(false);
    const showSnackbar = useSnackbar();
    const { mode } = useContext(ThemeContext);

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                setLoading(true);
                // Fetch favourites
                const response = await axiosInstance.get('/api/favourite/get_Favourites');

                if (response.data.length > 0) {
                    const isfavRes = await Promise.all(
                        response.data.map(async (msg) => {
                            if (msg.msgId && msg.msgId._id) {
                                const favRes = await axiosInstance.get(`/api/favourite/isFavourite/${msg.msgId._id}`);
                                return favRes.data.isFavourite;
                            }
                            return false; // Not favourite if message is missing
                        })
                    );

                    setFavourites(
                        response.data.map((msg, index) => ({
                            ...msg,
                            msgId: msg.msgId
                                ? { ...msg.msgId, isFavourite: isfavRes[index] }
                                : null, // Keep null if message is deleted
                        }))
                    );
                }

            } catch (error) {
                showSnackbar(`Failed to fetch favourites : ${error.status} : ${error.response?.data?.message || error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, []);

    if (loading) return <ThreeDotLoading />;

    return (

        favourites.length > 0 ?
            (
                <Box
                    sx={{
                        width: { xs: '87vw', md: '60vw' },
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "100vh",
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            padding: 2,
                        }}
                    >
                        <Typography variant="h4" sx={{ mb: 3, color: mode == 'dark' ? 'white' : 'black' }}>
                            Favourites responses
                        </Typography>
                        {favourites.map((fav, index) => (
                            fav.msgId
                                ? <Message msg={fav.msgId} index={index} key={index} />
                                : <Typography variant="body2" color="text.secondary">message is deleted</Typography>
                        ))}
                    </Box>
                </Box>
            ) : (
                <Typography> no Archived messages </Typography>
            )
    )
};