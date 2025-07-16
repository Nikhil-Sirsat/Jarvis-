
import { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarIcon from '@mui/icons-material/Star';
import MuiAppBar from '@mui/material/AppBar';
import axiosInstance from '../AxiosInstance.jsx';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { ThemeContext } from "../context/ThemeContext";
import LogoutButton from '../Components/Logout.jsx';
import { useSnackbar } from '../Context/SnackBarContext.jsx';
import logo from '../assets/jarvisLogo.png';

import {
    Box,
    CssBaseline,
    Typography,
    IconButton,
    Drawer,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: `-${drawerWidth}px`,
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    transition: theme.transitions.create('margin', {
                        easing: theme.transitions.easing.easeOut,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    marginLeft: 0,
                },
            },
        ],
    }),
);

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }) => open,
            style: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: `${drawerWidth}px`,
                transition: theme.transitions.create(['margin', 'width'], {
                    easing: theme.transitions.easing.easeOut,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function Chat() {
    const theme = useTheme();
    const [open, setOpen] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [conversationLoading, setConversationLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorE2, setAnchorE2] = useState(null);
    const [idToDel, setIdToDel] = useState(null);
    const { mode } = useContext(ThemeContext);
    const [fetchConv, setFetchConv] = useState(false);
    const navigate = useNavigate();

    const showSnackbar = useSnackbar();

    const acOpen = Boolean(anchorE2);
    const isOpen = Boolean(anchorEl);

    // conv del menu sys
    const handleClick = (e, convId) => {
        setAnchorEl(e.currentTarget);
        setIdToDel(convId);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setIdToDel(null);
    };

    // Account menu sys
    const handleAcClick = (e) => {
        setAnchorE2(e.currentTarget);
    };
    const handleAcClose = () => {
        setAnchorE2(null);
    };

    const deleteConv = async () => {
        if (!idToDel) return;
        try {
            const response = await axiosInstance.delete(`/api/chat/${idToDel}`);
            const data = await response.data;
            console.log(data);
            setConversations(conversations.filter((conv) => conv._id !== idToDel));
            handleClose();
        } catch (error) {
            console.log('Error deleting conversation:', error);
            showSnackbar("Error deleting conversation", error.message);
        }
    }

    const handleSettingClick = () => {
        handleAcClose();
        localStorage.setItem('lastRouteBeforeSettings', window.location.pathname);
        navigate('/chat/settings/theme');
    }

    // fetch conversation history
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await axiosInstance.get(`/api/chat/conversations`);
                const data = await response.data;
                setConversations(data);
            } catch (error) {
                console.log('Error fetching conversations:', error);
                showSnackbar("Error fetching conversations", error.message);
            } finally {
                setConversationLoading(false);
            }
        };
        fetchConversations();
    }, [fetchConv]);

    // refetch the conversation after new created
    const reFreshFetchConvHist = () => {
        setFetchConv(!fetchConv);
    }

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open} sx={{ backgroundColor: mode == 'dark' ? 'black' : 'white', boxShadow: 'none' }}>
                <Toolbar>
                    <IconButton
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={[
                            {
                                mr: 2,
                            },
                            open && { display: 'none' },
                        ]}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton onClick={handleAcClick}>
                        <AccountCircleRoundedIcon />
                    </IconButton>

                    <IconButton component={Link} to={'/chat/Favourites'}>
                        <StarIcon />
                    </IconButton>

                    <IconButton sx={{ right: 20, position: 'absolute' }}>
                        <Avatar
                            src={logo}
                            alt="Jarvis Logo"
                            sx={{ width: 35, height: 35, p: 0.5, backgroundColor: 'black' }}
                        />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader sx={{ display: 'flex', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 9, borderBottom: '1px solid grey', backgroundColor: mode == 'light' ? '#f5f5f5' : '#1e1e1e' }}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                    <IconButton component={Link} to={'/chat/new-chat'}>
                        <EditDocumentIcon />
                    </IconButton>
                </DrawerHeader>

                {conversationLoading ? (<p>loading... </p>) : (
                    conversations.length === 0 ? (
                        <Typography variant='body2' sx={{ m: 'auto' }}>
                            <i>no conversation yet</i>
                        </Typography>
                    ) : (
                        <List sx={{p: 1}}>
                            {conversations.map((conv, index) => (

                                <ListItem key={index} disablePadding>
                                    <ListItemButton sx={{borderRadius: 3}} >
                                        <ListItemIcon
                                            aria-label="more"
                                            aria-controls={isOpen ? 'long-menu' : undefined}
                                            aria-expanded={isOpen ? 'true' : undefined}
                                            aria-haspopup="true"
                                            onClick={(e) => { handleClick(e, conv._id) }}
                                        >
                                            <MoreHorizIcon />
                                        </ListItemIcon>
                                        <Typography type='body2' component={Link} to={`/chat/${conv._id}`} sx={{ textDecoration: 'none', color: mode === 'dark' ? 'white' : 'black', fontSize: '0.875rem' }}>
                                            {conv.title}
                                        </Typography>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )
                )}
            </Drawer>
            {/* conv menu */}
            <Menu
                id="long-menu"
                anchorEl={anchorEl}
                open={isOpen}
                onClose={handleClose}
            >
                <MenuItem onClick={deleteConv}>
                    delete
                </MenuItem>
            </Menu>

            {/* account menu */}
            <Menu
                id="long-menu"
                anchorEl={anchorE2}
                open={acOpen}
                onClose={handleAcClose}
            >
                <MenuItem component={Link} to={'/About'}>
                    About
                </MenuItem>
                <MenuItem>
                    <LogoutButton />
                </MenuItem>
                <MenuItem onClick={handleSettingClick}>
                    Settings
                </MenuItem>
            </Menu>
            <Main open={open} sx={{ height: '85vh', width: 'auto' }}>
                <Outlet context={{ reFreshFetchConvHist }} />
            </Main>
        </Box>
    );
}