import os
import base64
import requests

# Get authentication token from environment variable
token = os.environ['shock_token']

# Set repository and file path
owner = 'ShockPlease'
repo = 'ShockPlease.github.io'
path = 'index.html'

# Retrieve current contents of file
headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3.raw'
}
response = requests.get(f'https://api.github.com/repos/{owner}/{repo}/contents/{path}', headers=headers)
response.raise_for_status()
content = response.content

# Update file contents
new_content = content.decode().replace('oldtext', 'newtext').encode()

# Encode updated file contents as base64
new_content_b64 = base64.b64encode(new_content).decode()

# Create new commit with updated file contents
message = 'Update myfile.txt'
url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
payload = {
    'message': message,
    'content': new_content_b64,
    'sha': response.json()['sha']
}
response = requests.put(url, headers=headers, json=payload
