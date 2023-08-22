# Patient Co-Pilot Hack

This repo contains:
- A devcontainer for node + python
- A React app (the Patient Browser), which displays sample FHIR data
- A Python FastAPI proxy, which accepts a payload from the app and constructs a prompt for OpenAI

It will also contain data science experimentation work.

## Getting Started
To get going and run the project:
- Ensure you have Docker + VS Code installed
- An Azure OpenAI deployment you can access, with a URL + API Key.
  - Create an Azure OpenAI resource (you may need to fill in a form to request one)
  - Deployments -> Create new deployment -> Choose your model (I have been using the GPT 3.5 turbo 16k to test with so far)
  - Open in Chat Playground -> View Code -> Get your `OPENAI_API_BASE` and `OPENAI_API_KEY` values from the sample code there.

Then...
- Clone this repo
- Open in VS Code, and when prompted, reopen in the Container. This will build the dev container and reopen VS Code 'inside' it. It will also install all the npm dependencies for the frontend app, and all the python dependencies for the API.
- Create a copy of `.env.sample` => `.env`, and fill in the `OPENAI_API_BASE` and `OPENAI_API_KEY` values.
- Run the frontend app: `make run-app`
- Run the proxy api: `make run-api`

You should be able to open your browser to http://localhost:9001 and see a list of Patients. Clicking on one will open the patient detail screen and you'll see an `Open AI` widget which is displaying the results of the proxy api call.

## API Payload
This can be modified, but currently as the user clicks around the Patient Browser, the front end will `POST` a payload to the proxy api in the structure:

```json
{
    "patient": {...demographic details of the patient},
    "entries": [...list of clinical measurements]
    "category": type of measurement, such as 'Condition', 'Medication', or 'all'
}
```

A full sample payload for a patient condition screen is in in the `proxy_api` directory here.

The proxy API currently just forwards the details on to OpenAI and asks for a simple summary. This is where the bulk of the hack focus will be, in improving / asking more specific questions here.

## Co-working
Let's all try to work inside this repo, using feature branches. Even experimentation work should live here, so we all have one simple way to share stuff. If you need extra tools / dependencies, make sure to add them to the dev container / requirements.txt so others can 'just run it'.

If anything is useful in any way - even if not functional - PR it so we keep hold of it.

...that's it! See a problem? PR a fix :)
