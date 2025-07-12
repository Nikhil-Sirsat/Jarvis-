import { pipeline } from '@xenova/transformers';

let embedder = null;

export async function getEmbedding(text) {
    if (!embedder) {
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    const output = await embedder(text, {
        pooling: 'mean',
        normalize: true,
    });

    // console.log(output.data);
    return Array.from(output.data);

}
