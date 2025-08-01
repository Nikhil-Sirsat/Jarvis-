from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from contextlib import asynccontextmanager

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

class EmbedRequest(BaseModel):
    text: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    model.encode("warmup", normalize_embeddings=True)
    print("Quantized model warmed up!")
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/embed")
def embed_text(req: EmbedRequest):
    vector = model.encode(req.text, normalize_embeddings=True, convert_to_numpy=False).tolist()
    return {"embedding": vector}
