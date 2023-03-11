import json
import os

for file in os.listdir('.'):
    if file.endswith('.html'):
        os.remove(file)
        print(f'Removed {file}!')

try:
    with open('index.html', 'w+') as index_file:
        with open('data/data.json', 'r') as data_file:
            index_file.write(data_file.read())
except Exception as e:
    print(f'An error occurred: {e}')
