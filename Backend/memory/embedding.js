import { pipeline } from '@xenova/transformers';

let embedderPromise = null;

export async function getEmbedding(text) {
    // console.time('getEmbedding');

    if (!embedderPromise) {
        // Memoize promise to avoid re-instantiating pipeline multiple times
        embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const embedder = await embedderPromise;

    const output = await embedder(text, {
        pooling: 'mean',
        normalize: true,
    });

    // console.timeEnd('getEmbedding');
    return Array.from(output.data);
};
