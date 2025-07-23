import { IconButton } from "@mui/material";
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import { useState } from "react";
import { useSnackbar } from "../Context/SnackBarContext";
import axiosInstance from "../AxiosInstance";

export default function MarkFavBtn({ msgId, isFav }) {
    const [isFavourite, setIsFavourite] = useState(isFav);
    const showSnackbar = useSnackbar();

    const toggleFavourite = async () => {
        try {
            // console.log("is fav : ", isFavourite);
            if (isFavourite) {
                // Remove from favourites
                await axiosInstance.delete(`/api/favourite/${msgId}`);
                setIsFavourite(false);
                showSnackbar("Removed from favourites");
            } else {
                // Add to favourites
                // console.log("msgId: ", msgId);
                await axiosInstance.post(`/api/favourite/${msgId}`);
                setIsFavourite(true);
                // showSnackbar("Added to favourites");
            }
        } catch (error) {
            console.error("Error toggling favourite:", error);
            showSnackbar(`Error updating favourite status: ${error.status} : ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <IconButton onClick={toggleFavourite}>
            <StarOutlineOutlinedIcon sx={{ color: isFavourite ? "#0ca37f" : "#ccc" }} />
        </IconButton>
    );
}