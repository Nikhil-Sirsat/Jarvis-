import { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { Card, CardContent, Typography, List, Box, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from "../Context/SnackBarContext";

export default function Memory() {
    const [memory, setMemory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedText, setSelectedText] = useState("");
    const showSnackbar = useSnackbar();

    useEffect(() => {
        // Fetch memory data from the backend
        const fetchMemory = async () => {
            setLoading(true);
            const response = await axiosInstance.get('/api/user/memory');
            setMemory(response.data.memory);
            setLoading(false);
        };

        fetchMemory();
    }, []);

    const handleDeleteClick = (id, text) => {
        setSelectedId(id);
        setSelectedText(text);
        setOpenDialog(true);
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setSelectedId(null);
        setSelectedText("");
    };

    const handleDialogConfirm = async () => {
        if (!selectedId) return;
        try {
            await axiosInstance.delete(`/api/user/memory/${selectedId}`);
            setMemory(memory.filter(item => item.id !== selectedId));
        } catch (error) {
            console.error('Error deleting memory:', error);
            showSnackbar('Error deleting memory', error.response?.data?.message || '');
        } finally {
            setOpenDialog(false);
            setSelectedId(null);
            setSelectedText("");
        }
    };

    if (loading) return <div>Memory Loading...</div>;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Saved memories
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Jarvis tries to remember your recent chats, but it may forget things over time. saved memories are never forgotten.
            </Typography>

            <List sx={{ width: '100%', maxWidth: 600 }}>
                {memory.map((item, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2, borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="body1" color="text.primary">
                                {item.payload.text}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                Memory #{index + 1} - <DeleteIcon sx={{ height: '19px', width: '19px', ml: 1, color: '#c15757', cursor: 'pointer' }} onClick={() => handleDeleteClick(item.id, item.payload.text)} />
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </List>

            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{selectedText}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this memory? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}