import {ThemeContext} from "../Context/ThemeContext.jsx";
import { useContext } from 'react';
import { Box, keyframes } from '@mui/system';

const pulse = keyframes`
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.4);
    opacity: 1;
  }
`;

export default function ReplyLoad() {
    const { mode } = useContext(ThemeContext);

    return (
        <Box
            sx={{
                width: 15,
                height: 15,
                borderRadius: '50%',
                backgroundColor: mode === 'light' ? '#000000ff' : '#ffffffff',
                mt: 15,
                mb: 10,
                animation: `${pulse} 1.2s ease-in-out infinite`,
            }}
        />
    );
};

