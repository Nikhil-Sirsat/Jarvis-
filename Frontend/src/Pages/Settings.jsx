import { useState, useContext } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from '../context/ThemeContext';

import ContrastIcon from '@mui/icons-material/Contrast';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

const drawerWidth = 240;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    height: '85vh',
    minWidth: '70vw',
    backgroundColor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
};

const listItemStyl = {
    borderRadius: "15px",
};

export default function Settings() {
    const [open, setOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { mode } = useContext(ThemeContext);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClose = () => {
        setOpen(false);
        const lastRoute = localStorage.getItem('lastRouteBeforeSettings');
        navigate(lastRoute || '/chat');
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{ mt: 7 }}>
            <List>
                <ListItem>
                    <ListItemButton component={NavLink} to="/chat/settings/theme" style={listItemStyl} sx={{ '&.active': { backgroundColor: mode === 'dark' ? '#2e2e2e' : '#e0e0e0' }, }}>
                        <ListItemIcon>
                            <ContrastIcon sx={{ color: '#0ca37f' }} />
                        </ListItemIcon>
                        <ListItemText primary="Theme" />
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton component={NavLink} to="/chat/settings/personalization" style={listItemStyl} sx={{ '&.active': { backgroundColor: mode === 'dark' ? '#2e2e2e' : '#e0e0e0' }, }}>
                        <ListItemIcon>
                            <EditNoteRoundedIcon sx={{ color: '#0ca37f' }} />
                        </ListItemIcon>
                        <ListItemText primary="Personalization" />
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton component={NavLink} to="/chat/settings/memory" style={listItemStyl} sx={{ '&.active': { backgroundColor: mode === 'dark' ? '#2e2e2e' : '#e0e0e0' }, }}>
                        <ListItemIcon>
                            <MemoryRoundedIcon sx={{ color: '#0ca37f' }} />
                        </ListItemIcon>
                        <ListItemText primary="Memory" />
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton component={NavLink} to="/chat/settings/account" style={listItemStyl} sx={{ '&.active': { backgroundColor: mode === 'dark' ? '#2e2e2e' : '#e0e0e0' }, }}>
                        <ListItemIcon>
                            <AccountCircleRoundedIcon sx={{ color: '#0ca37f' }} />
                        </ListItemIcon>
                        <ListItemText primary="Account" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="settings-modal"
        >
            <Box sx={modalStyle}>
                {/* App Bar with Toggle Button */}
                <AppBar
                    position="static"
                    color="default"
                    elevation={1}
                    sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
                >
                    <Toolbar>
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h6" noWrap component="div">
                            Settings
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box sx={{ display: 'flex', flex: 1, height: '100%' }}>
                    {/* Drawer Section */}
                    <Box
                        component="nav"
                        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                        aria-label="settings sections"
                    >
                        {/* Mobile temporary drawer */}
                        <Drawer
                            variant="temporary"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{
                                display: { xs: 'block', sm: 'none' },
                                zIndex: (theme) => theme.zIndex.modal + 1,
                                '& .MuiDrawer-paper': {
                                    width: drawerWidth,
                                    boxSizing: 'border-box',
                                },
                            }}
                        >
                            {drawerContent}
                        </Drawer>

                        {/* Permanent drawer for desktop */}
                        <Drawer
                            variant="permanent"
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                                '& .MuiDrawer-paper': {
                                    width: drawerWidth,
                                    boxSizing: 'border-box',
                                },
                            }}
                            open
                        >
                            {drawerContent}
                        </Drawer>
                    </Box>

                    {/* Main Content */}
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 3,
                            overflowY: 'auto',
                            width: { xs: '100vw', md: '70vw' },
                        }}
                    >
                        <Outlet />
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
