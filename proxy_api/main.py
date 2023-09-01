from fastapi import FastAPI
from services import open_ai_proxy
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

class FHIRBundle(BaseModel):
    patient: dict
    entries: list
    category: str
    role: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])

@app.post("/openai")
def open_ai(patient_data: FHIRBundle):
    response = open_ai_proxy.query_open_ai(patient_data.patient, patient_data.entries, patient_data.category, patient_data.role)
    return {"response": response}
