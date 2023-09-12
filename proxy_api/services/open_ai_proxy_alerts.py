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

    setup_prompt = """You play the role of a medical doctor. 
    Read data about the following patient and respond to their questions. 
    Provide references for any clinical advice from well trusted authorities. 
    Explain your answers using simple and concise language."""

    '''
    Chain of thought

    Pros: CoT has been proven generally to improve performance and be more explainable: https://arxiv.org/pdf/2303.13375.pdf
    Cons: slightly more complicated, and it might miss information contained in the content in its entirety

    '''

    response_medications = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": setup_prompt},
            {"role": "user", "content": f'this is my patient data: {json.dumps(clean_patient(patient))}'},
            {"role": "user", "content": f'this is my clinical data: {json.dumps(clean_entries(entries))}'},
            {"role": "system", "content": f'What are recent (last five years) the perscribed medications given to this patient for this {category}? Please only state the list of the medications and do not include any preambles, disclaimers, notes about the information source, or other superfluous information. Format your response as HTML body.'}],
        temperature=0,
        max_tokens=400,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)
    
    my_openai_obj = list(response_medications.choices)[0]
    response_text_medications = my_openai_obj.to_dict()['message']['content']
    
    response_health_concerns = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": setup_prompt},
            {"role": "user", "content": f'this is my patient data: {json.dumps(clean_patient(patient))}'},
            {"role": "user", "content": f'this is my clinical data: {json.dumps(clean_entries(entries))}'},
            {"role": "system", "content": f'What are significantly different, odd or anomalous health conditions of this patient for this {category}? Please only state the list of the anomalous health conditions and do not include any preambles, disclaimers, notes about the information source, or other superfluous information. Format your response as HTML body.'}],
        temperature=0,
        max_tokens=400,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)
    
    my_openai_obj = list(response_health_concerns.choices)[0]
    response_text_health_concerns = my_openai_obj.to_dict()['message']['content']
    
    # Feeds in the response from the prior prompt into the new

    # https://platform.openai.com/docs/api-reference/chat/object

    response_chain_of_thought_alerts = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": setup_prompt},
            {"role": "user", "content": f'this is my patient data: {json.dumps(clean_patient(patient))}'},
            {"role": "user", "content": f'this is my clinical data: {json.dumps(clean_entries(entries))}'},
            {"role": "system", "content": f'For this {category}, the recent (in the last 5 years) medications taken by this patient are listed here: {response_text_medications}. The anomalous health conditions of the patient are listed here: {response_text_health_concerns}. State the top 3 possible health risks or side effects, provided in a bulletted list, from these medications considering the health conditions of the patient? Only include the text listing of the possible risks, without superfluous text, notes, information about sources or disclaimers. Format your response as HTML body.'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)
    
    my_openai_obj = list(response_chain_of_thought_alerts.choices)[0]
    response_text_alerts = my_openai_obj.to_dict()['message']['content']

    # Checks if an alert was generated or not
    response_chain_of_thought_alerts_check = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": setup_prompt},
            {"role": "user", "content": f'this is my patient data: {json.dumps(clean_patient(patient))}'},
            {"role": "user", "content": f'this is my clinical data: {json.dumps(clean_entries(entries))}'},
            {"role": "system", "content": f'A review of possible health risks and side effects for this patient is included here: {response_text_alerts}. If health risks or side effects were not able to be determined, or if none were listed, then respond "No", otherwise respond "Yes". Please only say "Yes" or "No".'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None) 

    print(response_chain_of_thought_alerts_check)
    '''
    Return
    
    '''
    return response_chain_of_thought_alerts, response_medications, response_health_concerns, response_chain_of_thought_alerts_check


'''
Cleaning functions
'''

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