import ai from '../config/gemini.js';
import ExpressError from './ExpressError.js';

export const aiResponse = async (user, relevantMemories, historyMessages, message, webContext) => {

    const { nickname, userRole, traits, extraNotes } = user || {};

    try {
        // personality prefix
        const personaPrefix = `
    You are speaking to ${nickname || user.name}.
    They are: ${userRole || 'a valued user'}.
    Be ${traits?.join(', ') || 'friendly'}.
    Notes: ${extraNotes || 'No extra instructions.'}
    `;

        // Build Prompt
        const promptParts = [
            {
                text: `
    You are Jarvis, an intelligent, evolving AI created by Nikhil Sirsat.
    Your role is to assist ${nickname || user.name} with clarity, depth, and accuracy.

    Instructions:

    1. Analyze the user query and the underlying intent using user memories and past conversations.

    2. Internally classify the query as:
       - SIMPLE → direct/factual, short response.
       - COMPLEX → requires reasoning, analysis, or multi-step explanation.

    3. For COMPLEX queries:
       - Use internal chain-of-thought: analyze intent → break down → reason → conclude.
       - Combine multiple knowledge sources: user memories, general knowledge, and web search.
       - Treat web search results as supporting context, if given, not the only source.
       - Expand on the topic to provide a rich, in-depth, and comprehensive answer.
       - DO NOT show the classification or thought process in the final output.

    4. When responding:
       - Start by acknowledging or appreciating the query.
       - **Answer**: For SIMPLE → be clear and direct. For COMPLEX → provide a thorough, well-reasoned explanation with details, insights, and examples when possible.
       - **Conclusion**: Briefly recap the main points.
       - Ask a follow-up question like:
         - "Would you like me to go deeper into any part?"
         - "Should I provide examples or comparisons?"
         - "Do you want me to break this into actionable steps?"

    5. Always use a clear, friendly, and professional tone like a helpful expert advisor.

    6. Validate logic before answering. Always aim to provide full, detailed information in the final answer, even if the web search context is minimal.

    7. When using web search:
       - Treat it as **additional reference material**.
       - Fill in missing gaps using reasoning and general knowledge.
       - If web content is short, **expand** it into a complete, informative answer.

    Respond only with the final answer following the above structure.
    `
            },

            { text: personaPrefix },

            ...(relevantMemories.length > 0
                ? [{ text: `Some important memories about ${nickname || user.name}: \n${relevantMemories.map(m => `- ${m}`).join('\n')}` }]
                : []),

            ...historyMessages.map((msg) => ({
                text: `${msg.sender === "user" ? "user" : "ai"}: ${msg.message}`,
            })),

            { text: `New query: ${nickname || user.name}: ${message}` },

            ...(webContext
                ? [{
                    text: `Here are web search results for additional reference. Use them as context, but combine with reasoning and general knowledge to give a complete and detailed answer: ${webContext}`
                }]
                : [])
        ];


        // console.log('prompt : ', promptParts);

        // Gemini Call
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: promptParts,
            generationConfig: {
                temperature: 0.4,
            },
        });

        const aiReply = response.text?.trim();
        if (!aiReply) { throw new ExpressError(500, 'LLM did not return a valid response'); }

        return aiReply;
    } catch (error) {
        console.log('error in generating ai response');
        throw new ExpressError(error.code, error.message);
    }
};

export const ProactiveSuggestion = async (memoryTexts) => {
    const prompt = `
    You are an intelligent AI assistant. Based on the user's recent messages:
    
    ${memoryTexts}
    
    Suggest 3 smart, context-aware follow-up questions that user would like to ask AI. Return the output as a JSON array of questions. like: 
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

        if (!suggestions) { return null };

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
    // console.log('is memory valid LLM called');
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

        return JSON.parse(data);
    } catch (error) {
        console.error("Error calling LLM for reflection:", error);
        throw new ExpressError("Error calling LLM for reflection");
    }

};

export async function classifyMessageForMemoryAndSearch(userMessage, lastLLMresponse) {
    try {
        const prompt = `
You are a smart AI system that decides if a user message requires access to past memory or a real-time web search.

Your default behavior should assume that:
- isMemoryRequired = true
- isWebSearchRequired = true

However, override this default and return both flags as false **only** when:
- The user's message is clearly casual, polite, or complimentary (e.g., "thanks", "okay", "got it", "you're helpful", "good bot", "I understand", "you are smart", etc.)
- The message contains no actual question or instruction, and is not a continuation or agreement to a previous suggestion

Also, be smart enough to detect when short or vague messages like "yes", "okay", or "sure" are in response to a follow-up question from the last AI response like : (e.g. "Would you like me to explain more?"), In those cases, keep the default (both flags true).
then:
    - Generate a more explicit, properly formatted user query that represents the user’s intent based on both messages.
    - Return this in the "clarifiedFollowupQuery" field.
4. If the user's message is not a vague follow-up but a clear, new, independent question, then "clarifiedFollowupQuery" should be null.

Your job is to analyze:
- LLM's last response: ${lastLLMresponse}
- User's latest message: ${userMessage}

Return ONLY a JSON object in this format (without any explanation):
{
    "isMemoryRequired": true / false,
    "isWebSearchRequired": true / false,
    "clarifiedFollowupQuery": _formatted user query / null
}
`.trim();

        const res = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
            generationConfig: { temperature: 0.3 },
        });

        let permissions = res.text?.trim();

        // Remove Markdown code block if present
        if (permissions.startsWith("```")) {
            permissions = permissions.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
        }

        console.log("PERMISSIONS : ", permissions);

        permissions = JSON.parse(permissions);

        return permissions;

    } catch (error) {
        console.log("Error in 'classifyMessageForMemoryAndSearch' : ", error.response?.data?.message || error.message);
        // default when LLM fails
        return {
            "isMemoryRequired": true,
            "isWebSearchRequired": true,
            "clarifiedFollowupQuery": null
        };
    }
};