
import { useState } from 'react';

const SpeetchTest = () => {
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    let recognition;

    // Initialize SpeechRecognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            fetchBotResponse(text); // Send to backend
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    const startListening = () => {
        if (recognition) {
            recognition.start();
            setTranscript("Listening...");
        }
    };

    const speak = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    // const fetchBotResponse = async (userInput) => {
    //     try {
    //         // const res = await fetch('http://localhost:5000/api/jarvis', {
    //         //     method: 'POST',
    //         //     headers: { 'Content-Type': 'application/json' },
    //         //     body: JSON.stringify({ message: userInput }),
    //         // });
    //         // const data = await res.json();
    //         // setResponse(data.reply);
    //         // speak(data.reply);

    //         speak("This is a test response from JARVIS Lite.");
    //     } catch (err) {
    //         console.error(err);
    //         setResponse("Sorry, there was a problem.");
    //     }
    // };

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>🎙️ JARVIS Lite</h2>
            <button onClick={startListening}>Speak to JARVIS</button>
            <p><strong>You:</strong> {transcript}</p>
            {/* <p><strong>JARVIS:</strong> {response}</p> */}
        </div>
    );
};

export default SpeetchTest;
