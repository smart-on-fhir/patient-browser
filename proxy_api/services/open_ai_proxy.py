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


    #### THE FOLLOWING SHOW DIFFERENT OPTIONS TESTED ######

    '''
    Medication Side Effects

    Pros: Specific and concise
    Cons: Not overly general, focuses on medication

    '''

    response_side_effects = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'Provide me with alerts for this {category} based on the medications that I have taken given that {role_map[role]}. Only advise the key possible negative side effects of the medications and do not describe the medications.'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)


    '''
    Anomaly Prompt

    Pros: Most general
    Cons: Not very concise or relevant

    '''
    response_anomalies = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'What are major anomalies with the patient medical information in this {category} in comparison generally to other similar patients and explain the anomalies to me given that {role_map[role]}.'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)

    # print(response)

    '''
    Chain of thought

    Pros: CoT has been proven generally to improve performance and be more explainable: https://arxiv.org/pdf/2303.13375.pdf
    Cons: slightly more complicated, and it might miss information contained in the content in its entirety

    '''

    response_chain_of_thought = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'What are recent (last five years) the perscribed medications given to this patient for this {category}?'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)
    
    # Feeds in the response from the prior prompt into the new

    # https://platform.openai.com/docs/api-reference/chat/object

    my_openai_obj = list(response_chain_of_thought.choices)[0]
    CoT_response_text = my_openai_obj.to_dict()['message']['content']

    response_chain_of_thought_2 = openai.ChatCompletion.create(
        engine=openai_deployment_name,
        messages=[
            {"role": "system", "content": role_map[role]},
            {"role": "system", "content": json.dumps(patient)},
            {"role": "system", "content": "And these are their clinical measurements in FHIR format:"},
            {"role": "system", "content": json.dumps(entries)},
            {"role": "system", "content": f'For this {category}, the recent (in the last 5 years) medications taken by this patient are listed here: {CoT_response_text}. What are the major possible side effects from these medications?'}],
        temperature=0,
        max_tokens=800,
        top_p=0.95,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None)


    '''
    Return
    
    '''
    return response_chain_of_thought_2
