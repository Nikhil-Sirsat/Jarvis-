
import ai from '../config/ai.js';

export default async function createContext(prevContext, userMsg, aiReply) {
    try {
        const prompt = `You are an AI assistant responsible for maintaining a smart and efficient memory of an ongoing conversation. 
Your job is to update the previous context by incorporating the latest user message and your own latest reply, and generate a new summarized context that captures the most important details so far.
Be concise, avoid repetition, and retain only meaningful, relevant information that would help the assistant understand the ongoing conversation without needing the full history.

Previous Context:
${prevContext}

Latest User Message:
${userMsg}

Your Latest Reply:
${aiReply}

Now, update the context to reflect the current state of the conversation. Ensure the new context is:
- Concise (max 100 words)
- Clear and logically structured
- Focused on important facts, goals, or preferences
- Persistent (include key info that shouldn't be forgotten)
- Self-contained (makes sense without full chat history)
`;
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        const newContext = response.text?.trim();

        // Check if we actually got a non-empty title
        if (!newContext || newContext.length === 0) {
            throw new Error('Empty context from Gemini');
        }

        console.log('context : ', newContext);

        return { newContext, status: true };
    } catch (err) {
        console.error('Context generation failed:', err.message || err);
        return { status: false, err };
    }
}