import { ThemeContext } from "../Context/ThemeContext.jsx";
import { useContext } from 'react';
import { keyframes } from '@mui/system';
import {
  Box,
  Typography,
} from "@mui/material";
import AutorenewTwoToneIcon from '@mui/icons-material/AutorenewTwoTone';
import PulseDotAnim from "./pulseDotAnim.jsx";

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const floatDots = keyframes`
  0% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-4px); opacity: 1; }
  100% { transform: translateY(0); opacity: 0.3; }
`;

export default function ReplyLoad({ isConvInit, isWebSearch, isMemorySearch, isReflectionGen }) {
  const { mode } = useContext(ThemeContext);

  return (
    <Box sx={{ mb: 14, mt: 2 }}>

      {/* Thinking... */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }}>
        <PulseDotAnim mode={mode} />
        <Typography
          variant="body2"
          sx={{
            ml: 1,
            color: mode === 'light' ? '#333' : '#c7c7c7ff',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          Thinking
          <Box component="span" sx={{ animation: `${floatDots} 1s infinite`, ml: 0.3 }}>.</Box>
          <Box component="span" sx={{ animation: `${floatDots} 1s infinite 0.2s`, ml: 0.3 }}>.</Box>
          <Box component="span" sx={{ animation: `${floatDots} 1s infinite 0.4s`, ml: 0.3 }}>.</Box>
        </Typography>
      </Box>

      {/* new conv init*/}
      {isConvInit && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: -2, mb: 1.5, gap: 2 }}>
          <AutorenewTwoToneIcon
            sx={{
              animation: `${rotate} 0.7s linear infinite`,
              fontSize: 24,
              ml: 0.7,
              color: '#0ca37f',
            }}
          />
          <Typography variant="body2" sx={{ ml: 1, color: mode === 'light' ? '#444' : '#9c9c9cff' }}>
            Initializing new converstion...
          </Typography>
        </Box>
      )}

      {/* Web Searches... */}
      {isWebSearch && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', mt: isConvInit ? 0 : -2, mb: 1.5, gap: 2 }}>
          <AutorenewTwoToneIcon
            sx={{
              animation: `${rotate} 0.7s linear infinite`,
              fontSize: 24,
              ml: 0.7,
              color: '#0ca37f',
            }}
          />
          <Typography variant="body2" sx={{ ml: 1, color: mode === 'light' ? '#444' : '#9c9c9cff' }}>
            Searching web...
          </Typography>
        </Box>
      )}

      {/* Looking at Memories... */}
      {isMemorySearch && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }}>
          <AutorenewTwoToneIcon
            sx={{
              animation: `${rotate} 1s linear infinite`,
              fontSize: 24,
              ml: 0.7,
              color: '#0ca37f',
            }}
          />
          <Typography variant="body2" sx={{ ml: 1, color: mode === 'light' ? '#444' : '#9c9c9cff' }}>
            Looking at memories...
          </Typography>
        </Box>
      )}

      {/* Generating Reflection... */}
      {isReflectionGen && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, mt: 2 }}>
          <AutorenewTwoToneIcon
            sx={{
              animation: `${rotate} 1s linear infinite`,
              fontSize: 24,
              ml: 0.7,
              color: '#0ca37f',
            }}
          />
          <Typography variant="body2" sx={{ ml: 1, color: mode === 'light' ? '#444' : '#9c9c9cff' }}>
            Generating Reflection...
          </Typography>
        </Box>
      )}
    </Box>
  );
};
