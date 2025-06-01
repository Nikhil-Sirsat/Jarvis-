import React, { useContext, useState } from 'react';
import { AuthContext } from '../Context/AuthContext.jsx';
import { Typography } from '@mui/material';

export default function LogoutButton() {
    const { logout } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
    };

    return (
        <Typography variant='body2' onClick={handleLogout}>
            {loading ? "loading ... " : 'Logout'}
        </Typography>
    );
};
