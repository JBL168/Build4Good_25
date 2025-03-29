import os
import time
import csv
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv



def get_assistant_output(file_path):
    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        prompt = reader[0]

    """
    Function to get the output from the assistant based on user input.
    This function creates a thread and retrieves the response from the assistant.
    """
    if not load_dotenv(dotenv_path='llm-parsing\keys.env'):
        raise EnvironmentError('Could not load .env file')

    api_key=os.getenv('OPENAI_API_KEY')
    ASSISTANT_ID=os.getenv('ASSISTANT_ID')

    # print(f"API Key loaded: {'Yes' if api_key else 'No'}")
    # print(f"Assistant ID loaded: {'Yes' if ASSISTANT_ID else 'No'}")

    client = OpenAI(
    api_key=api_key
    )

    thread = client.beta.threads.create(
        messages=[
            {
                'role': 'user',
                'content': f'{prompt}'
            }
        ]
    )

    run = client.beta.threads.runs.create(thread_id=thread.id, assistant_id=ASSISTANT_ID)
    print(f"Thread ID: {run.id}")

    while run.status != 'completed':
        run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
        print(f"Run Status: {run.status}")
        time.sleep(1)
        if run.status == 'failed':
            print("Run failed:", run.error)
            break
    else:
        print("Run completed successfully.")

    message_response = client.beta.threads.messages.list(thread_id=thread.id)
    messages = message_response.data

    latest_message = messages[0] if messages else None

    print(f'Response: \n{latest_message.content[0].text.value}')

    return latest_message.content[0].text.value

def parse_assistant_output(output):
    """
    Function to parse the assistant output and return a dictionary of values.
    This function takes the output from the assistant and parses it into a dictionary.
    """
    with open(r'llm-parsing\textinput.csv') as file:
        reader = csv.reader(file, delimiter=';')
        data = []
        headers=['start_date', 'end_date', 'title', 'description']
        for row in reader:
            data.append(row)
        df = pd.DataFrame(data, columns=headers)

    print(df.head())
    df.to_csv(r'llm-parsing\output.csv', index=False)

def main():
    user_input = ...
    output = get_assistant_output(user_input)
    parse_assistant_output(output)
