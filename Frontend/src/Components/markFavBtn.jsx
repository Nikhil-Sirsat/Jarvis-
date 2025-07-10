import { IconButton } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import { useState } from "react";
import { useSnackbar } from "../Context/SnackBarContext";
import axiosInstance from "../AxiosInstance";

export default function MarkFavBtn({ msgId, isFav }) {
    const [isFavourite, setIsFavourite] = useState(isFav);
    const showSnackbar = useSnackbar();

    const toggleFavourite = async () => {
        try {
            console.log("is fav : ", isFavourite);
            if (isFavourite) {
                // Remove from favourites
                await axiosInstance.delete(`/api/favourite/${msgId}`);
                setIsFavourite(false);
                showSnackbar("Removed from favourites");
            } else {
                // Add to favourites
                console.log("msgId: ", msgId);
                await axiosInstance.post(`/api/favourite/${msgId}`);
                setIsFavourite(true);
                // showSnackbar("Added to favourites");
            }
            // onToggle(); // Call the parent callback to update the state
        } catch (error) {
            showSnackbar("Error updating favourite status: ", error);
        }
    };

    return (
        <IconButton onClick={toggleFavourite}>
            <StarIcon sx={{ color: isFavourite ? "#0ca37f" : "#ccc" }} />
        </IconButton>
    );
}