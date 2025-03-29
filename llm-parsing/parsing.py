import pandas as pd
import csv

import pandas as pd
import csv



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