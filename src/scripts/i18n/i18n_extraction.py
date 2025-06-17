import json
import requests
import time
from json.decoder import JSONDecodeError
import os
import concurrent.futures
import argparse
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Get Gemini API key from environment variable
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise RuntimeError('GEMINI_API_KEY environment variable not set')
GEMINI_API_URL = (
    f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key={GEMINI_API_KEY}'
)


# Strict prompt: only translation changes, return JSON as specified
def build_prompt(file_batch):
    file_sections = []
    for file_name, file_content in file_batch:
        file_sections.append(f"File: {file_name}\n{file_content}")
    files_str = '\n\n'.join(file_sections)
    return f"""
You are an expert Angular internationalization assistant.

Here are the contents of multiple Angular component, service, pipe, and directive files:
{files_str}

Your task is:

1. **Extract all user-facing strings** (HTML and TypeScript) from each file.  
   - Ignore comments, variable bindings, and non-user-visible text.
   - Do not extract strings from commented-out code, test files, or code blocks that are not executed.
   - Do not extract strings that are already translation keys (e.g., 'component.key' | transloco).

2. **Generate translation keys** in this JSON format:
   - For component files:
     {{
       <componentNameInCamelCaseWithoutComponentFeatureUiPrefix>: {{
         <meaningfulKeyName>: <stringValue>,
         <anotherMeaningfulKey>: <stringValue>
       }}
     }}
     (e.g., for 'sign-in.component.html', use 'signIn' as top-level key.)
   - For service files:  
     All service keys must be grouped under a single top-level key "services":
     {{
       "services": {{
         <serviceNameInCamelCaseWithoutServiceSuffix>: {{
           <meaningfulKeyName>: <stringValue>,
           ...
         }},
         <anotherServiceName>: {{ ... }}
       }}
     }}
   - For pipe files:  
     All pipe keys must be grouped under a single top-level key "pipes":
     {{
       "pipes": {{
         <pipeNameInCamelCaseWithoutPipeSuffix>: {{
           <meaningfulKeyName>: <stringValue>,
           ...
         }},
         <anotherPipeName>: {{ ... }}
       }}
     }}
   - For directive files:  
     All directive keys must be grouped under a single top-level key "directives":
     {{
       "directives": {{
         <directiveNameInCamelCaseWithoutDirectiveSuffix>: {{
           <meaningfulKeyName>: <stringValue>,
           ...
         }},
         <anotherDirectiveName>: {{ ... }}
       }}
     }}
   - **Do NOT create any nested objects or second-level keys except as described above. Every key must be a direct child of the component/service/pipe/directive key.**

   - **IMPORTANT:**  
     - In the JSON output, all double quotes inside HTML content must be escaped with a backslash (e.g., <div class=\"foo\"></div>), so that the HTML is always valid inside JSON strings.
     - If a user-facing string consists only of special characters (such as '-', ',', '.', etc.) and contains no alphanumeric characters, do NOT generate a translation key for it and do NOT include it in the JSON output.

3. **Translation key naming:**
   - Use meaningful, semantic, and context-aware key names that describe the purpose or usage of the string.
   - Prefer keys like 'signIn.title', 'error.accountDisabled', 'button.submit', etc., over generic names like 'label1', 'text1', etc.
   - The key should help a developer understand where and why the string is used, just by reading the key.

4. **Replace hardcoded user-facing strings with Transloco usage:**
   - **Angular Binding Rules:**
     - For attributes such as placeholder, title, alt, always use property binding:  
       [placeholder]="'componentName.keyName' | transloco"
     - For static text nodes or static attributes, use interpolation:  
       attr="{{ 'componentName.keyName' | transloco }}"
     - Do not change existing translation keys or pipes.
     - When in doubt, prefer property binding for user-facing attributes.
   - In TypeScript:  
     this.translocoService.translate('componentName.keyName')

5. **Update import statements** in each file to import Transloco packages if they are not already present.  
   - For example, in TypeScript files, add import {{ TranslocoService, TranslocoModule }} from '@jsverse/transloco'; if missing.

6. **Output formatting:**
   - In your response, for each file in the files array, the fileName field must contain the full file path (as provided above, e.g., 'src/app/auth/sign-in/sign-in.component.html').
   - The output must be a single, valid, and parseable JSON object.  
   - Do NOT include markdown code blocks, explanations, comments, or any extra text.
   - If no user-facing strings are found, return:  
     {{ "enJson": {{}}, "files": [] }}

7. **Special cases:**
   - Do not extract strings that are used for tracking or analytics (e.g., this.trackingService.trackEvent('User clicking on the button') or this.trackingService.eventTrack('User clicking on the button')).
   - Do NOT alter the code or formatting in any way except for the string replacement and necessary import updates. Do not optimize, reformat, or change indentation. Only perform the minimal necessary code change for i18n.

**IMPORTANT:**  
Your response MUST be ONLY valid, complete, and parseable JSON.  
If you cannot comply, return an error.

Return your response as a single JSON object with the following structure (and nothing else):
{{
  "enJson": {{ ... }},
  "files": [
    {{ "fileName": "<full file path>", "content": "..." }},
    ...
  ]
}}
"""

def call_gemini(prompt, batch=None, batch_num=None):
    body = {
        "contents": [{
            "role": "user",
            "parts": [{"text": prompt}]
        }]
    }
    last_exception = None
    for _ in range(3):  # Simple retry for transient failures
        try:
            response = requests.post(GEMINI_API_URL, json=body, timeout=1200)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print("Error calling Gemini API:", e)
            last_exception = e
            time.sleep(2)
    # Only write to failed_batches.jsonl if all retries failed
    if batch is not None and batch_num is not None:
        failed_batch = {
            'batch_num': batch_num,
            'files': {file_name: file_content for file_name, file_content in batch},
            'error': str(last_exception)
        }
        with open('src/scripts/failed_batches.jsonl', 'a', encoding='utf-8') as fail_f:
            fail_f.write(json.dumps(failed_batch, ensure_ascii=False) + '\n')
    raise RuntimeError("Failed to call Gemini API after retries")

def process_gemini_response(resp_content):
    cleaned = resp_content.strip()
    # Remove markdown code block markers (```json or ```)
    if cleaned.startswith('```json'):
        cleaned = cleaned[7:]
    if cleaned.startswith('```'):
        cleaned = cleaned[3:]
    if cleaned.endswith('```'):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip('` \n')
    return json.loads(cleaned)

def process_batch(batch, batch_num, type):
    prompt = build_prompt(batch)
    print(f"\n--- Prompt for batch {batch_num} ---\n{prompt}\n--- End Prompt ---\n")
    try:
        result = call_gemini(prompt, batch, batch_num)
    except RuntimeError as e:
        print(f"[ERROR] Gemini API call failed for batch {batch_num}: {e}")
        return None
    resp_content = result['candidates'][0]['content']['parts'][0]['text']
    print('--- RAW GEMINI RESPONSE ---')
    print(resp_content)
    print('--- END RAW GEMINI RESPONSE ---')
    try:
        data = process_gemini_response(resp_content)
    except JSONDecodeError as e:
        print(f"[ERROR] Failed to parse Gemini response for batch {batch_num}: {e}")
        print('--- CLEANED RESPONSE ---')
        cleaned = resp_content.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip('` \n')
        print(repr(cleaned))
        print('--- END CLEANED RESPONSE ---')
        print('Skipping this batch and continuing...', batch_num)

        # Write the failed batch to failed_files_output.js as an array of objects
        base_dir = f'src/scripts/i18n/{type}'
        failed_output_path = os.path.join(base_dir, 'failed_files_output.js')
        os.makedirs(base_dir, exist_ok=True)
        failed_output_obj = {
            'batch_num': batch_num,
            'cleaned': cleaned
        }
        # If the file exists, read and append; else, create new array
        if os.path.exists(failed_output_path):
            with open(failed_output_path, 'r+', encoding='utf-8') as f:
                content = f.read()
                # Remove export and trailing bracket to append
                if content.strip().startswith('export const result = ['):
                    content = content.strip()[len('export const result = ['):]
                    content = content.rstrip().rstrip('];').rstrip()
                    if content:
                        content = content.rstrip(',') + ',\n'
                    else:
                        content = ''
                else:
                    content = ''
                f.seek(0)
                f.write('export const result = [\n')
                f.write(content)
                f.write(json.dumps(failed_output_obj, ensure_ascii=False, indent=2))
                f.write('\n];\n')
                f.truncate()
        else:
            with open(failed_output_path, 'w', encoding='utf-8') as f:
                f.write('export const result = [\n')
                f.write(json.dumps(failed_output_obj, ensure_ascii=False, indent=2))
                f.write('\n];\n')
        return None
    return data

def process_input_json(en_json, output_files, input_json_path, type):
    with open(input_json_path, 'r') as f:
        files = list(json.load(f).items())

    batch_size = 4
    batches = [
        files[i:i + batch_size]
        for i in range(0, len(files), batch_size)
    ]

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_batch = {
            executor.submit(process_batch, batch, idx + 1, type): (batch, idx)
            for idx, batch in enumerate(batches)
        }
        for future in concurrent.futures.as_completed(future_to_batch):
            batch, idx = future_to_batch[future]
            data = future.result()
            if not data:
                continue
            if 'enJson' in data:
                for k, v in data['enJson'].items():
                    if k in en_json:
                        en_json[k].update(v)
                    else:
                        en_json[k] = v
            if 'files' in data:
                for file_obj in data['files']:
                    content = file_obj['content']
                    content = content.replace('<START_OF_FILE>', '').replace('<END_OF_FILE>', '')
                    if not any(f['fileName'] == file_obj['fileName'] for f in output_files):
                        output_files.append({
                            'fileName': file_obj['fileName'],
                            'content': content
                        })

def process_failed_batches(en_json, output_files, failed_batches_path, type):
    if not os.path.exists(failed_batches_path):
        print(f"No {failed_batches_path} found, skipping failed batch reprocessing.")
        return
    batches = []
    with open(failed_batches_path, 'r', encoding='utf-8') as f:
        for line in f:
            if not line.strip():
                continue
            batch = json.loads(line)
            batch_num = batch['batch_num']
            files_dict = batch['files']
            file_batch = list(files_dict.items())
            batches.append((file_batch, batch_num))

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_batch = {
            executor.submit(process_batch, file_batch, batch_num, type): (file_batch, batch_num)
            for file_batch, batch_num in batches
        }
        for future in concurrent.futures.as_completed(future_to_batch):
            data = future.result()
            if not data:
                continue
            if 'enJson' in data:
                for k, v in data['enJson'].items():
                    if k in en_json:
                        en_json[k].update(v)
                    else:
                        en_json[k] = v
            if 'files' in data:
                for file_obj in data['files']:
                    content = file_obj['content']
                    content = content.replace('<START_OF_FILE>', '').replace('<END_OF_FILE>', '')
                    if not any(f['fileName'] == file_obj['fileName'] for f in output_files):
                        output_files.append({
                            'fileName': file_obj['fileName'],
                            'content': content
                        })
    print("Processed all failed batches.")

def main():
    parser = argparse.ArgumentParser(description="i18n Extraction Script")
    parser.add_argument('--failed', action='store_true', help='Process only failed batches')
    parser.add_argument('--type', type=str, default='components', choices=['components', 'services', 'pipes', 'directives'], help='Type of files to process (components, services, pipes, directives)')
    args = parser.parse_args()

    base_dir = f'src/scripts/i18n/{args.type}'
    en_json_path = 'src/assets/i18n/en.json'

    input_json_path = f'{base_dir}/input.json'
    output_json_path = f'{base_dir}/output.json'
    failed_batches_path = f'{base_dir}/failed_batches.jsonl'
    print(f"Processing {args.type} files in {base_dir}")
    en_json = {}
    output_files = []

    # Ensure the directory for en_json_path exists
    en_json_dir = os.path.dirname(en_json_path)
    if not os.path.exists(en_json_dir):
        os.makedirs(en_json_dir, exist_ok=True)
    if os.path.exists(en_json_path):
        with open(en_json_path, 'r', encoding='utf-8') as f:
            en_json = json.load(f)
    if os.path.exists(output_json_path):
        with open(output_json_path, 'r', encoding='utf-8') as f:
            output_data = json.load(f)
            output_files = output_data.get('files', [])

    if args.failed:
        process_failed_batches(en_json, output_files, failed_batches_path, args.type)
    else:
        process_input_json(en_json, output_files, input_json_path, args.type)

    with open(en_json_path, 'w', encoding='utf-8') as f:
        json.dump(en_json, f, indent=2, ensure_ascii=False)
    print(f"Written translation keys to {en_json_path}")

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump({'files': output_files}, f, indent=2, ensure_ascii=False)
    print(f"Written all updated files to {output_json_path}")

    print("All done.")

if __name__ == "__main__":
    main()