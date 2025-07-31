import { keyframes } from '@mui/system';
import { Box } from '@mui/material';

const pulse = keyframes`
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
`;

export default function PulseDotAnim({ mode }) {

    return (
        <Box
            sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: `linear-gradient(135deg, #0ca37f, ${mode === 'light' ? '#000' : '#fff'})`,
                mt: 5,
                mb: 5,
                ml: 1,
                animation: `${pulse} 1.4s ease-in-out infinite`,
            }}
        />
    )
}