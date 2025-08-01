import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export const searchSerpAPI = async (query) => {

    console.time('web search');
    try {
        const response = await axios.get('https://serpapi.com/search.json', {
            params: {
                q: query,
                engine: 'google',
                api_key: SERPAPI_KEY
            }
        });

        const results = response.data.organic_results?.slice(0, 5) || [];

        // web searches to feed to LLM
        let webContext = results.map(
            (r, i) => `${i + 1}. ${r.title}:\n${r.snippet}`
        ).join('\n\n');

        // sources for UI
        let sourcesForUI = results.map(result => ({
            title: result.title,
            source: result.source || new URL(result.link).hostname.replace("www.", ""),
            redirect_link: result.redirect_link,
            favicon: result.favicon
        }));

        const data = { webContext, sourcesForUI };

        console.timeEnd('web search');

        return data;
    } catch (error) {
        console.error("SerpAPI Error:", error.message);
        return {};
    }
};
