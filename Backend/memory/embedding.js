import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL;

export async function getEmbedding(text) {

    console.time('getEmbedding');

    if (!text || typeof text !== "string") {
        console.error("Invalid text provided for embedding");
        return null;
    }

    try {
        const response = await axios.post(EMBEDDING_API_URL, { text }, {
            timeout: 5000, // 5s timeout
        });

        if (response.data?.embedding && Array.isArray(response.data.embedding)) {
            console.log('OUTPUT : ', response.data.embedding);
            console.timeEnd('getEmbedding');
            return response.data.embedding;
        } else {
            console.error("Invalid response from embedding service:", response.data);
            return null;
        }

    } catch (err) {
        console.error("Embedding service error:", err.message);
        return null;
    }
};

