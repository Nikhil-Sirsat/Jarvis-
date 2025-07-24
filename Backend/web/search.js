import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const SERPAPI_KEY = process.env.SERPAPI_KEY;

export const searchSerpAPI = async (query) => {
    try {
        const response = await axios.get('https://serpapi.com/search.json', {
            params: {
                q: query,
                engine: 'google',
                api_key: SERPAPI_KEY
            }
        });

        const results = response.data.organic_results?.slice(0, 5) || [];

        // console.log('SEARCH : ', results);

        return results;
    } catch (error) {
        console.error("SerpAPI Error:", error.message);
        return [];
    }
};
