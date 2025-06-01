import { Button, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

export default function LostPage() {
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/');
    }

    return (
        <div style={{
            height: '70vh',
            width: '100vw',
            display: "flex",
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <h1>404 Page Not Found</h1>
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>this page does not exist</Typography>
            <Button variant="contained" onClick={goHome}>Take me Home</Button>
        </div>
    )
}