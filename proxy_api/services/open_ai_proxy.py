import os
import openai
import json
from dotenv import load_dotenv
load_dotenv(f'{os.path.dirname(__file__)}/../../.env')

openai.api_type = "azure"
openai.api_version = "2023-03-15-preview"
openai.api_base = os.getenv("OPENAI_API_BASE")
openai.api_key = os.getenv("OPENAI_API_KEY")
openai_deployment_name = os.getenv("OPENAI_DEPLOYMENT_NAME")

def query_open_ai(patient: dict, entries: list, category: str, role: str):

    if category == 'all':
        category = 'clinical measurements'

    # TODO - actual data restructuring / prompt work here...

    role_map = { 
        'nurse': "I am a nurse treating this patient:", 
        'patient': "I am this patient:" }
    if role not in role_map.keys():
        role = 'patient'

    response = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'write me a short summary of this {category} highlighting any areas that need my attention given that {role_map[role]}.'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)

    return response
