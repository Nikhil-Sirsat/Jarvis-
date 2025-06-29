import { createContext, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MuiAlert from '@mui/material/Alert';

// Create a context
const SnackbarContext = createContext();

// Custom hook to use the SnackbarContext
export const useSnackbar = () => {
    return useContext(SnackbarContext);
};

// Provider component
export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
    });

    const showSnackbar = (message) => {
        setSnackbar({
            open: true,
            message,
        });
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <SnackbarContext.Provider value={showSnackbar}>
            {children}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    severity="error"
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={handleClose}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};
