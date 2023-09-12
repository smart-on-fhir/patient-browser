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

    '''
    Chain of thought

    Pros: CoT has been proven generally to improve performance and be more explainable: https://arxiv.org/pdf/2303.13375.pdf
    Cons: slightly more complicated, and it might miss information contained in the content in its entirety

    '''

    response_medications = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'What are recent (last five years) the perscribed medications given to this patient for this {category}? Please only state the list of the medications and do not include any preambles, disclaimers, notes about the information source, or other superfluous information.'}],
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
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'What are significantly different, odd or anomalous health conditions of this patient for this {category}? Please only state the list of the anomalous health conditions and do not include any preambles, disclaimers, notes about the information source, or other superfluous information.'}],
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
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'For this {category}, the recent (in the last 5 years) medications taken by this patient are listed here: {response_text_medications}. The anomalous health conditions of the patient are listed here: {response_text_health_concerns}. State the top 3 possible side effects, provided in a bulletted list and without additional text or disclaimers, from these medications considering the health conditions of the patient?'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)


    '''
    Return
    
    '''
    return response_chain_of_thought_alerts, response_medications, response_health_concerns
