
import ai from '../config/ai.js';

// utils/generateTitle.js
export default async function generateTitle(message) {
    try {
        const prompt = `Generate only one short and relevant title for this conversation: "${message}"`;
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-lite",
            contents: prompt,
        });

        const title = response.text?.trim();

        // Check if we actually got a non-empty title
        if (!title || title.length === 0) {
            throw new Error('Empty title from Gemini');
        }

        return { title, status: true };
    } catch (err) {
        console.error('Title generation failed:', err.message || err);
        // Fallback title logic
        const fallback = message.split(' ').slice(0, 5).join(' ') + '...';
        return { title: fallback, status: false, err };
    }
}
