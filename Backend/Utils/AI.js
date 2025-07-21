import ai from '../config/ai.js';
import ExpressError from './ExpressError.js';

export const aiResponse = async (user, relevantMemories, historyMessages, message) => {

    const { nickname, userRole, traits, extraNotes } = user || {};

    try {
        // personality prefix
        const personaPrefix = `
    You are speaking to ${nickname || 'the user'}.
    They are: ${userRole || 'a valued user'}.
    Be ${traits?.join(', ') || 'friendly'}.
    Notes: ${extraNotes || 'No extra instructions.'}
    `;

        // Build Prompt
        const promptParts = [
            {
                text: `
                You are Jarvis, an intelligent, evolving AI created by Nikhil Sirsat.
    Your goal is to assist ${nickname || 'user'} with clarity, speed, and accuracy.
    
    Before answering:
    
    Classify query as SIMPLE (direct/factual) or COMPLEX (requires reasoning).
    
    SIMPLE → reply in 1–5 lines, no extra reasoning.
    
    COMPLEX → use chain-of-thought: analyze intent → break down → reason → conclude accurately.
    
    Always validate logic before final answer.
    
    Respond with a clear, professional, and helpful tone.
    `,
            },

            {
                text: personaPrefix,
            },

            ...(relevantMemories.length > 0
                ? [{ text: `some important memories about ${nickname || 'user'}: \n${relevantMemories.map(m => `- ${m}`).join('\n')}` }]
                : []),
            ...historyMessages.map((msg) => ({
                text: `${msg.sender === "user" ? "user" : "ai"}: ${msg.message}`,
            })),
            {
                text: `next question : ${nickname || 'User'}: ${message}`,
            },
        ];

        // Gemini Call
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: promptParts,
            generationConfig: {
                temperature: 0.4,
            },
        });

        const aiReply = response.text?.trim();
        if (!aiReply) { throw new ExpressError(500, 'AI did not return a valid response'); }

        return aiReply;
    } catch (error) {
        console.log('error in generating ai response');
        throw new ExpressError(500, "Error in Generating AI response");
    }
};

export const ProactiveSuggestion = async (memoryTexts) => {
    const prompt = `
    You are an intelligent AI assistant. Based on the user's recent messages:
    
    ${memoryTexts}
    
    Suggest 3 smart, context-aware follow-up questions I can proactively ask the user. Return the output as a JSON array of questions. like: 
    {
    ["question1", "question2", "question3"]
    } 
    Keep it short and relevant.
        `.trim();

    try {

        // Gemini Call
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
            generationConfig: {
                temperature: 0.4,
            },
        });

        let suggestions = response.text?.trim();

        if (!suggestions) { return res.status(500).json({ message: "Gemini failed to generate proactivly suggested questions" }) };

        // Remove Markdown code block if present
        if (suggestions.startsWith("```")) {
            suggestions = suggestions.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
        }

        suggestions = JSON.parse(suggestions);

        return suggestions;
    } catch (error) {
        console.log("Error in Generating Proactive Suggestions : ", error.response?.data?.message || error.message);
        return null;
    }
};

export const generateTitle = async (message) => {
    try {
        const prompt = `Generate only one short and relevant title for this conversation: "${message}"`;
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        const title = response.text?.trim();

        // Check if we actually got a non-empty title
        if (!title || title.length === 0) {
            throw new ExpressError(500, 'Title generation returned an empty response');
        }

        return { title, status: true };
    } catch (err) {
        console.error('Title generation failed:', err.message || err);
        // Fallback title logic
        const fallback = message.split(' ').slice(0, 5).join(' ') + '...';
        return { title: fallback, status: false, err };
    }
};

export const validateMemoryLLM = async (text) => {
    console.log('is memory valid LLM called');
    const prompt = `
    You are Jarvis, a highly intelligent assistant managing long-term memory.

The user just said: 
"${text}"

Your task is to decide if this message contains **useful long-term memory information** that will help you personalize future conversations with the user.

 You should store the message ONLY IF it contains:
- personal facts (e.g., "my name is...", "I live in...", "I want to...")
- preferences (e.g., "I like...", "I enjoy...", "I prefer...")
- goals or plans (e.g., "I want to become a...", "I plan to...")
- opinions (e.g., "I believe that...", "I hate...")
- past actions or achievements (e.g., "I built...", "I studied...")

 Do NOT store if the message is:
- a general question or help request (e.g., "what should I build next?", "suggest me a project")
- vague or speculative (e.g., "maybe I should learn React")
- small talk (e.g., "how are you?")
- commands or task requests (e.g., "tell me a joke", "summarize this")

Be strict. Do not guess.

If YES:
→ Convert it into a third-person factual format like:
  - "User has a goal to become a software engineer."
  - "User prefers working at night."
  - "User has already built an app called LinkSpace."
  and return exactly only the converted message and no extra text.

If NO:
→ Reply exactly with "NO".`;

    const res = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: prompt,
        generationConfig: { temperature: 0.2 },
    });

    const data = res.text?.trim();

    if (!data || data.toUpperCase() === "NO") return null;

    return data;
};

export async function callLLMForReflection(memoryTexts) {

    try {

        // console.log("Calling LLM for reflection with memories:", memoryTexts);

        const prompt = `
You are JARVIS, an intelligent assistant.
The user has shared the following thoughts/memories over the past week:

${memoryTexts.map((text, i) => `${i + 1}. "${text}"`).join('\n')}

Based on this:
1. Give a short 4-5 sentence summary of what the user has been focused on.
2. Identify 2-3 key themes from their thoughts.
3. Suggest 3-4 helpful AI-generated suggestions to help them next week.
Output in JSON format like:
{
  "summary": "...",
  "themes": ["Theme1", "Theme2"],
  "suggestions": ["Suggestion1", "Suggestion2"]
}
`;

        const res = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
            generationConfig: { temperature: 0.3 },
        });

        let data = res.text?.trim();

        // Remove Markdown code block if present
        if (data.startsWith("```")) {
            data = data.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
        }

        // console.log("Reflection LLM response:", data);

        return JSON.parse(data); // Gemini returns raw JSON text
    } catch (error) {
        console.error("Error calling LLM for reflection:", error);
        throw new ExpressError("Error calling LLM for reflection");
    }

};