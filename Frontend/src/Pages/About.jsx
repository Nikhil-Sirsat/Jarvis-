import {
    Box,
    Typography,
    Container,
    Divider,
    Stack,
    Avatar,
    Grid,
    IconButton,
} from '@mui/material';
import logo from '../assets/jarvisLogo.png';
import { useNavigate } from 'react-router-dom';
import { LinkedIn, GitHub, X, AcUnit, Code, Person, KeyboardBackspace } from "@mui/icons-material";

const Section = ({ title, icon, children }) => (
    <Box mb={6}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            {icon}
            <Typography variant="h5" fontWeight={600}>
                {title}
            </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
            {children}
        </Typography>
    </Box>
);

const About = () => {

    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1);
    }


    return (
        <Container maxWidth="md" sx={{ py: 8 }}>

            <IconButton onClick={handleBack} sx={{ position: 'absolute', top: 16, left: 16 }}>
                <KeyboardBackspace
                    sx={{ color: '#0ca37f' }}
                />
            </IconButton>

            <Box textAlign="center" mb={6}>
                <Avatar
                    src={logo}
                    alt="Jarvis AI Logo"
                    sx={{ width: 100, height: 100, mb: 2, mx: 'auto' }}
                />
                <Typography variant="h3" fontWeight="700" gutterBottom>
                    Jarvis AI
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Your intelligent, voice-powered assistant for a smarter life.
                </Typography>
            </Box>

            <Divider sx={{ mb: 6 }} />

            <Section title="What is Jarvis?" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                Jarvis is a next-gen AI assistant designed to interact through voice and natural language.
                Built with powerful NLP, machine learning, and real-time automation tools, Jarvis is more than a chatbot —
                it's your daily digital co-pilot.
            </Section>

            <Section title="Key Features" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                <ul style={{ paddingLeft: 20, marginTop: 0 }}>
                    <li>Conversational AI with real-time language understanding</li>
                    <li>Voice control for hands-free interaction</li>
                    <li>Schedule & reminder management</li>
                    <li>Local system command execution</li>
                    <li>Privacy-first architecture with encrypted/local data</li>
                </ul>
            </Section>

            <Section title="Technology Stack" icon={<Code sx={{ color: '#0ca37f' }} />}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>Core Stack:</strong> MERN (MongoDB, Express.js, React, Node.js)
                        </Typography>
                        <Typography variant="body2">
                            <strong>Frontend:</strong> React with Material UI for clean, responsive UI
                        </Typography>
                        <Typography variant="body2">
                            <strong>Voice:</strong> Speech-to-Text (STT) using Web Speech API / Google STT
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>AI Engine:</strong> Gemini API for NLP and conversational intelligence
                        </Typography>
                        <Typography variant="body2">
                            <strong>Audio Output:</strong> Text-to-Speech (TTS) via Web Speech API / Google TTS
                        </Typography>
                        <Typography variant="body2">
                            <strong>Architecture:</strong> Modular, API-driven, privacy-aware
                        </Typography>
                    </Grid>
                </Grid>
            </Section>



            <Section title="Use Cases" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                - Personal task automation<br />
                - Study assistant / AI companion<br />
                - Command execution & system shortcuts
            </Section>

            <Section title="Vision" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                Jarvis was built to bridge the gap between intuitive human thought and machine logic.
                It's not just software – it’s the start of a more seamless digital future.
            </Section>

            <Section title="What’s Next" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                <ul style={{ paddingLeft: 20, marginTop: 0 }}>
                    <li>Emotion-aware response generation</li>
                    <li>Mobile app + cross-device sync</li>
                    <li>Multi-language support</li>
                    <li>Visual dashboard for monitoring & control</li>
                </ul>
            </Section>

            <Divider sx={{ my: 6 }} />

            <Section title="Nikhil Sirsat Production" icon={<Person sx={{ color: '#0ca37f' }} />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box>
                        {/* <Typography variant="body1"><strong>Name:</strong> Nikhil Sirsat </Typography> */}
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <IconButton component="a" href="https://www.linkedin.com/in/nikhil-sirsat-b49bb128a/" target="_blank" sx={{ color: '#0073e6' }}>
                                <LinkedIn fontSize="large" />
                            </IconButton>
                            <IconButton component="a" href="https://github.com/Nikhil-Sirsat" target="_blank">
                                <GitHub fontSize="large" />
                            </IconButton>
                            <IconButton component="a" href="https://x.com/NikhilS27949297" target="_blank">
                                <X fontSize="large" />
                            </IconButton>
                        </Stack>
                    </Box>
                </Stack>
            </Section>

            <Typography
                variant="subtitle2"
                color="text.secondary"
                textAlign="center"
                mt={8}
                fontStyle="italic"
            >
                “The best way to predict the future is to create it.” – Alan Kay
            </Typography>
        </Container>
    );
};

export default About;
