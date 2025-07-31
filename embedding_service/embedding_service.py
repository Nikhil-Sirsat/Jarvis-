from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

# Load model once at startup
model = SentenceTransformer("intfloat/e5-small-v2")  # Fast & high-quality

app = FastAPI()

class EmbedRequest(BaseModel):
    text: str

@app.post("/embed")
def embed_text(req: EmbedRequest):
    vector = model.encode(req.text).tolist()
    return {"embedding": vector}