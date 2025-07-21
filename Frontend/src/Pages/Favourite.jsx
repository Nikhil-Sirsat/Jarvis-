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
                // Fetch favourites from the backend
                const response = await axiosInstance.get('/api/favourite/get_Favourites');

                const isfavRes = await Promise.all(
                    response.data.map(async (msg) => {
                        let msgId = msg.msgId._id;
                        const favRes = await axiosInstance.get(`/api/favourite/isFavourite/${msgId}`);
                        return favRes.data.isFavourite;
                    })
                );

                console.log(response.data);

                setFavourites(
                    response.data.map((msg, index) => ({
                        ...msg,
                        msgId: {
                            ...msg.msgId,
                            isFavourite: isfavRes[index],
                        },
                    }))
                );

            } catch (error) {
                showSnackbar(`Failed to fetch favourites : ${error.status} : ${error.response?.data?.message || error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, []);

    // If loading, show a loading message
    if (loading) return <ThreeDotLoading />;

    return (

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
                    <Message msg={fav.msgId} index={index} key={index} />
                ))}
            </Box>
        </Box>

    )
}