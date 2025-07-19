import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import {
    Box,
    Typography,
    Avatar,
} from '@mui/material';

const Account = () => {
    const { user } = useContext(AuthContext);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Box
                sx={{
                    p: 3,
                    borderRadius: 3,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                            {user.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6" component="div">
                            {user.name}
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Email:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    {user.email}
                </Typography>

                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Age:
                </Typography>
                <Typography variant="body2">{user.age} years</Typography>
            </Box>
        </Box>
    );
};

export default Account;
