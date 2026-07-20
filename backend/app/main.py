from fastapi import FastAPI

app = FastAPI(
    title="MatchFlow API",
    description="API para el sistema de torneos MatchFlow",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a MatchFlow API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
