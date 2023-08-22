import os
import openai
import json
from dotenv import load_dotenv
load_dotenv(f'{os.path.dirname(__file__)}/../../.env')

openai.api_type = "azure"
openai.api_version = "2023-03-15-preview"
openai.api_base = os.getenv("OPENAI_API_BASE")
openai.api_key = os.getenv("OPENAI_API_KEY")

def query_open_api(patient: dict, entries: list, category: str):

    # TODO - actual prompt work here...

    response = openai.ChatCompletion.create(
        engine="damoo",
        messages=[
            {"role": "system", "content": "I am this patient:"},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are my clinical measurements:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": "write me a short summary of my clinical measurements that a child would understand, highlighting any areas that need attention"}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)

    return response
