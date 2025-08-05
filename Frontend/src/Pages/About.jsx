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
import logo from '../assets/jarvisLogo.jpg';
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
        {/* Check if children is a string, if so wrap in Typography */}
        {typeof children === 'string' ? (
            <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                {children}
            </Typography>
        ) : (
            // If children is JSX like <ul> or <Grid>, render directly
            children
        )}
    </Box>
);

const About = () => {

    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1);
    }


    return (
        <Container maxWidth="md">

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
                    <li>Conversational AI with real-time natural language understanding</li>
                    <li>Voice Input and Output</li>
                    <li>Memory-aware conversations with contextual history</li>
                    <li>Custom user persona management for more personalization</li>
                    <li>Interactive Reflection page for weekly insights and feedback</li>
                    <li>Memory store to view and manage memory</li>
                    <li>Smart proactive follow-up question suggestion based on your past conversations</li>
                    <li>Real time web search for more accurate and latest information</li>
                </ul>
            </Section>

            <Section title="Tools & Technology Stack" icon={<Code sx={{ color: '#0ca37f' }} />}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>Core Stack:</strong> MERN (MongoDB, Express.js, React, Node.js)
                        </Typography>
                        <Typography variant="body2">
                            <strong>Frontend:</strong> React with Material UI for clean, responsive UI
                        </Typography>
                        <Typography variant="body2">
                            <strong>Voice:</strong> Web Speech API for STT and TTS
                        </Typography>
                        <Typography variant="body2">
                            <strong>Vector DB:</strong> Qdrant for semantic memory and document retrieval
                        </Typography>
                        <Typography variant="body2">
                            <strong>Serp API:</strong> Serp API for real time web search
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                            <strong>AI Engine:</strong> Gemini API for NLP and conversational logic
                        </Typography>
                        <Typography variant="body2">
                            <strong>Memory:</strong> Redis with Upstash for short-term and session memory
                        </Typography>
                        <Typography variant="body2">
                            <strong>Architecture:</strong> Modular, API-driven, scalable and privacy-aware
                        </Typography>
                        <Typography variant="body2">
                            <strong>BullMQ:</strong> background job scheduling and queue management (deployed on Railway)
                        </Typography>
                        <Typography variant="body2">
                            <strong>Socket.io:</strong> Socket.io for displaying real time req processing on frontend
                        </Typography>
                    </Grid>
                </Grid>
            </Section>


            <Section title="Use Cases" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                - Personal or Professional tasks and daily planning<br />
                - Study and research assistant with persistent memory<br />
                - Code generation, execution, and debugging assistant<br />
                - Self-reflection and analytics via Reflection interface
            </Section>


            <Section title="Vision" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                Jarvis was built to bridge the gap between intuitive human thought and machine logic.
                It's not just software – it’s the start of a more seamless digital future.
            </Section>

            <Section title="What’s Next" icon={<AcUnit sx={{ color: '#0ca37f' }} />}>
                <ul style={{ paddingLeft: 20, marginTop: 0 }}>
                    <li>File and document analysis (PDFs, CSVs, JSON)</li>
                    <li>Emotion-aware response generation</li>
                    <li>Mobile app + cross-device sync</li>
                    <li>Custom plugin builder and third-party integrations</li>
                    <li>Fine-grained control over memory and tool permissions</li>
                </ul>
            </Section>

            <Divider sx={{ my: 6 }} />

            <Section title="Nikhil Sirsat Production" icon={<Person sx={{ color: '#0ca37f' }} />}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box>
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
