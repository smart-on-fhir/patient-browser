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

    # Commenting out role_map for now as we focus on patient experience only
    #role_map = { 
    #    'nurse': "I am a nurse treating this patient:", 
    #    'patient': "I am this patient:" }
    #if role not in role_map.keys():
    #    role = 'patient'

   # print(entries)

    setup_prompt = """You play the role of a medical doctor. 
        Read data about the following patient and respond to their questions. 
        Provide references for any clinical advice from well trusted authorities. 
        Explain your answers using simple and concise language."""


    #### THE FOLLOWING SHOW DIFFERENT OPTIONS TESTED ######

    '''
    Medication Side Effects

    Pros: Specific and concise
    Cons: Not overly general, focuses on medication

    '''

    response_side_effects = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": setup_prompt},
            {"role": "user", "content": f'this is my patient data: {json.dumps(clean_patient(patient))}'},
            {"role": "user", "content": f'this is my clinical data: {json.dumps(clean_entries(entries))}'},
            {"role": "user", "content": f'write me a short summary of this {category} highlighting any areas that need my attention. Format your response as HTML body.'}
        ],
        temperature=0,
        max_tokens=1200,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)

    return response


def try_get_val(input: dict, key: str) -> str:
    try:
        return input[key]
    except:
        return ""


def clean_patient(input: dict) -> dict:
    clean_patient = {
        "name": f"{try_get_val(input['name'][0], 'given')[0]} {try_get_val(input['name'][0], 'family')}",
        "gender": try_get_val(input, 'gender'),
        "birthDate": try_get_val(input,'birthDate'),
        "address": f"{try_get_val(input['address'][0], 'line')[0]}, {try_get_val(input['address'][0], 'city')}, {try_get_val(input['address'][0], 'state')}, {try_get_val(input['address'][0], 'postalCode')}, {try_get_val(input['address'][0], 'country')}",
        "maritalStatus": try_get_val(try_get_val(input, 'maritalStatus'), 'text')
    }
    return clean_patient


def clean_entries(entries: list):
    for entry in entries:
        entry.pop('fullUrl', None)
        entry.pop('search', None)
        entry['resource'].pop('meta', None)
        entry['resource'].pop('subject', None)
        entry['resource'].pop('id', None)
        entry['resource'].pop('context', None)
        entry['resource'].pop('reasonReference', None)
        entry['resource'].pop('medicationReference', None)
        if entry['resource']['resourceType'] == 'CommunicationRequest' or \
            entry['resource']['resourceType'] == 'Encounter' or \
            entry['resource']['resourceType'] == 'Questionnaire' or \
            entry['resource']['resourceType'] == 'QuestionnaireResponse':
            entry = {}
    
    return entries
