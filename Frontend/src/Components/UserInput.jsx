import { useContext, useState, useRef } from "react";
import {
    Paper,
    IconButton,
    TextField,
} from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
import { ThemeContext } from "../Context/ThemeContext.jsx";
import { useSnackbar } from '../Context/SnackBarContext';
import ThreeDotLoading from "./ThreeDotLoading.jsx";
import PulseDotAnim from "./pulseDotAnim.jsx";

export default function UserInput({ handleSend, input, setInput, msgLoading }) {
    const { mode } = useContext(ThemeContext);
    const [mikeActive, setMikeActive] = useState(false);
    const recognitionRef = useRef(null);
    const showSnackbar = useSnackbar();
    let recognition = null;

    // Listen & Initialized speech recognition 
    const startListening = () => {
        if (!SpeechRecognition) {
            console.log("Speech Recognition API not supported in this browser.");
            return;
        }

        if (mikeActive && recognitionRef.current) {
            // console.log("Stopping previous recognition...");
            recognitionRef.current.stop();
            return;
        }

        // console.log("Initializing speech recognition...");

        recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognitionRef.current = recognition;
        setMikeActive(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            // console.log("Transcript:", transcript);
            setInput(transcript);
            setMikeActive(false);
        };

        recognition.onerror = (event) => {
            console.log("Speech recognition error:", event.error);
            showSnackbar(`Speech recognition error : ${event.error}`);
            recognitionRef.current = null;
            setMikeActive(false);
        };

        recognition.onend = () => {
            // console.log("Speech recognition ended.");
            recognitionRef.current = null;
            setMikeActive(false);
        };

        recognition.start();
    };

    return (
        <Paper
            sx={{
                p: 2.5,
                display: "flex",
                alignItems: "center",
                borderRadius: 5,
                width: '100%',
                boxShadow: 'none',
                backgroundColor: mode === 'dark' ? '#272727ff' : '#d6d6d6ff'
            }}
        >

            {/* Show loading animation for listening */}
            {mikeActive && <PulseDotAnim mode={mode} />}


            <TextField
                fullWidth
                variant="outlined"
                placeholder={recognition || mikeActive ? "Listening..." : "Ask anything"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                multiline
                minRows={1}
                maxRows={4}
                sx={{
                    '& .MuiInputBase-input': {
                        color: recognition || mikeActive ? '#0ca37f' : mode === 'light' ? '#000000' : '#ffffff',
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            border: 'none',
                        },
                        '&:hover fieldset': {
                            border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                            border: 'none',
                        },
                    },
                }}
            />

            {msgLoading ? (
                <ThreeDotLoading />
            ) : (
                input ? (
                    <IconButton onClick={handleSend} sx={{ ml: 1, backgroundColor: mode === 'dark' ? '#ffffffff' : '#000000ff', color: mode === 'dark' ? 'black' : 'white' }}>
                        <ArrowUpwardIcon />
                    </IconButton>
                ) : (
                    <IconButton sx={{ ml: 1, color: recognition || mikeActive ? "#0ca37f" : mode === 'light' ? '#000000' : '#ffffff', backgroundColor: mode === 'dark' ? '#292929ff' : '#918f8fff' }} onClick={startListening}>
                        <GraphicEqRoundedIcon />
                    </IconButton>
                )
            )}
        </Paper>
    )
}