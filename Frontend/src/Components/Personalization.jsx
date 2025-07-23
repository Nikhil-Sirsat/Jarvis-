
import { useState, useContext } from 'react';
import {
    Box,
    Button,
    CardContent,
    CardHeader,
    TextField,
    Chip,
    Stack,
    Divider,
} from '@mui/material';
import axiosInstance from '../AxiosInstance';
import { AuthContext } from '../Context/AuthContext.jsx';
import { useSnackbar } from "../Context/SnackBarContext";

export default function Personalization() {
    const { user } = useContext(AuthContext);

    const [form, setForm] = useState({
        nickname: user?.persona?.nickname || '',
        userRole: user?.persona?.userRole || '',
        traits: user?.persona?.traits?.join(', ') || '',
        extraNotes: user?.persona?.extraNotes || ''
    });

    const [loading, setLoading] = useState(false);
    const showSnackbar = useSnackbar();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const traitsArray = form.traits
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
        try {
            await axiosInstance.post('/api/user/setPersona', {
                ...form,
                traits: traitsArray
            });

            user.persona = {
                ...user.persona,
                ...form,
                traits: traitsArray
            };

            // showSnackbar('Persona updated successfully!', 'success');
        } catch (error) {
            showSnackbar(`Failed to update persona : ${error.status} : ${error.response?.data?.message || error.message}`);
        }
        setLoading(false);
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={2}
            pb={5}
            sx={{ width: { xs: '100%', md: '60%' } }}
        >
            <Box sx={{ width: '100%' }}>
                <CardHeader
                    title="Personalize JARVIS"
                    subheader="Let JARVIS know how to talk to you"
                    titleTypographyProps={{ fontWeight: 'bold', fontSize: 22 }}
                />
                <Divider />
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
                        <Stack spacing={3}>
                            <TextField
                                label="What should I call you?"
                                name="nickname"
                                value={form.nickname}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="What do you do?"
                                name="userRole"
                                value={form.userRole}
                                onChange={handleChange}
                                fullWidth
                            />
                            <TextField
                                label="Personal Traits (comma-separated)"
                                name="traits"
                                value={form.traits}
                                onChange={handleChange}
                                placeholder="e.g. professional, poetic, calm"
                                fullWidth
                            />
                            {form.traits && (
                                <Stack direction="row" flexWrap="wrap" gap={1}>
                                    {form.traits.split(',').map((trait, index) => (
                                        <Chip key={index} label={trait.trim()} variant="outlined" />
                                    ))}
                                </Stack>
                            )}
                            <TextField
                                label="Anything else JARVIS should know?"
                                name="extraNotes"
                                value={form.extraNotes}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                type="submit"
                                sx={{ mt: 2, mb: 2, borderRadius: 4, backgroundColor: '#0ca37f', color: '#fff' }}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Persona'}
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Box>
        </Box>
    );
};
