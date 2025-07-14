import { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ContrastIcon from '@mui/icons-material/Contrast';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    height: '85vh',
    width: '60vw',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto', // Enable vertical scrolling
};

const listItemStyl = {
    backgroundColor: "black",
    borderRadius: "15px",
}

const drawerWidth = 240;

export default function Settings() {
    const [open, setOpen] = useState(true);
    // const handleOpen = () => setOpen(true);
    const navigate = useNavigate();
    const handleClose = () => {
        setOpen(false);
        const lastRoute = localStorage.getItem('lastRouteBeforeSettings');
        if (lastRoute) {
            navigate(lastRoute);
        } else {
            navigate('/chat');
        }
    }

    return (
        <div >
            {/* <Button onClick={handleOpen}>Open modal</Button> */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Box sx={{ display: 'flex' }}>
                        {/* <CssBaseline /> */}
                        <Drawer
                            sx={{
                                width: drawerWidth,
                                flexShrink: 0,
                                position: 'sticky',
                                '& .MuiDrawer-paper': {
                                    width: drawerWidth,
                                    boxSizing: 'border-box',
                                },
                            }}
                            variant="permanent"
                            anchor="left"
                        >
                            <Toolbar />
                            <List sx={{ color: "white" }}>
                                <ListItem>
                                    <ListItemButton sx={listItemStyl} component={Link} to="/chat/settings/theme">
                                        <ListItemIcon>
                                            <ContrastIcon sx={{ color: "white" }} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Theme"} />
                                    </ListItemButton>
                                </ListItem>

                                <ListItem>
                                    <ListItemButton sx={listItemStyl} component={Link} to="/chat/settings/personalization">
                                        <ListItemIcon>
                                            <EditNoteRoundedIcon sx={{ color: "white" }} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Personalization"} />
                                    </ListItemButton>
                                </ListItem>

                                <ListItem>
                                    <ListItemButton sx={listItemStyl} component={Link} to="/chat/settings/memory">
                                        <ListItemIcon>
                                            <MemoryRoundedIcon sx={{ color: "white" }} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Memory"} />
                                    </ListItemButton>
                                </ListItem>

                                <ListItem>
                                    <ListItemButton sx={listItemStyl} component={Link} to="/chat/settings/data-control">
                                        <ListItemIcon>
                                            <DocumentScannerRoundedIcon sx={{ color: "white" }} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Data Control"} />
                                    </ListItemButton>
                                </ListItem>

                                <ListItem>
                                    <ListItemButton sx={listItemStyl} component={Link} to="/chat/settings/account">
                                        <ListItemIcon>
                                            <AccountCircleRoundedIcon sx={{ color: "white" }} />
                                        </ListItemIcon>
                                        <ListItemText primary={"Account"} />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </Drawer>
                        <Box
                            component="main"
                            sx={{ p: 3 }}
                        >
                            <Outlet />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </div >
    );
}

