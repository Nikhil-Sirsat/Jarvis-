export function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB) {
        throw new Error('cosineSimilarity: one or both vectors are undefined/null');
    }
    if (vecA.length !== vecB.length) {
        throw new Error('cosineSimilarity: vector lengths differ');
    }

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        const a = Number(vecA[i]) || 0;
        const b = Number(vecB[i]) || 0;
        dot += a * b;
        normA += a * a;
        normB += b * b;
    }

    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}