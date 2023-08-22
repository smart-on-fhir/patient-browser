from fastapi import FastAPI
from services import open_api_proxy
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

class FHIRBundle(BaseModel):
    patient: dict
    entries: list
    category: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])

@app.post("/openapi")
def open_api(patient_data: FHIRBundle):
    response = open_api_proxy.query_open_api(patient_data.patient, patient_data.entries, patient_data.category)
    return {"response": response}
