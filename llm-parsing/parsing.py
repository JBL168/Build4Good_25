import pandas as pd
import csv

with open(r'llm-parsing\textinput.csv') as file:
    reader = csv.reader(file, delimiter=';')
    data = []
    headers=['start_date', 'end_date', 'title', 'description']
    for row in reader:
        data.append(row)
    df = pd.DataFrame(data, columns=headers)

print(df.head())
df.to_csv(r'llm-parsing\output.csv', index=False)