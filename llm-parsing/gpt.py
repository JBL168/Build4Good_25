import os
import time
import csv
import pandas as pd
from openai import OpenAI
from dotenv import load_dotenv

def get_assistant_output(prompt):
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
            raise RuntimeError(f"Run failed: {run.error}")

    message_response = client.beta.threads.messages.list(thread_id=thread.id)
    messages = message_response.data

    latest_message = messages[0] if messages else None

    print(f'Response: \n{latest_message.content[0].text.value}')

    if latest_message:
        response_text = latest_message.content[0].text.value
        print(f'Response: \n{response_text}')
        
        # Convert response to CSV
        lines = response_text.strip().split('\n')
        data = []
        for line in lines:
            values = [val.strip() for val in line.split(';')]
            if len(values) == 4:
                data.append(values)
        
        # Create and save DataFrame
        headers = ['start_date', 'end_date', 'title', 'description']
        df = pd.DataFrame(data, columns=headers)
        output_path = os.path.join(os.getcwd(), 'data.csv')
        df.to_csv(output_path, index=False)
        print(f"Created CSV with {len(data)} rows")
        
        return df
    
    return None

# def parse_assistant_output():
#     """
#     Function to parse the assistant output and return a dictionary of values.
#     This function takes the output from the assistant and parses it into a dictionary.
#     """
#     with open(r'llm-parsing\textinput.csv') as file:
#         reader = csv.reader(file, delimiter=';')
#         data = []
#         headers=['start_date', 'end_date', 'title', 'description']
#         for row in reader:
#             data.append(row)
#         df = pd.DataFrame(data, columns=headers)

#     print(df.head())
#     df.to_csv(r'data.csv', index=False)

def main():
    with open('output.csv', 'r') as file:
        reader = csv.reader(file)
        header = next(reader)
        prompt = next(reader)

        
    result_df = get_assistant_output(prompt)
    result_df.to_csv('data.csv', index=False)

main()