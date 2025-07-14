import { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";
import { Card, CardContent, Typography, List, ListItem, Box, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Memory() {
    const [memory, setMemory] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const handleDeleteMemory = async (id) => {
        console.log('delete');
    }

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
                                Memory #{index + 1} - <DeleteIcon sx={{ height: '19px', width: '19px', ml: 1, color: '#c15757' }} onClick={() => handleDeleteMemory(item.id)} />
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </List>
        </Box>
    )
}