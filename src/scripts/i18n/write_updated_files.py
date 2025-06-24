import json
import os
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Write updated files for a given type.")
    parser.add_argument('--type', type=str, default='components', choices=['components', 'services', 'pipes', 'directives'], help='Type of files (components, services, pipes, directives)')
    args = parser.parse_args()

    file_type = args.type
    OUTPUT_JSON_PATH = f'src/scripts/i18n/{file_type}/output.json'

    with open(OUTPUT_JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    files = data.get('files', [])
    for file_obj in files:
        file_path = file_obj['fileName']
        content = file_obj['content']
        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as out_f:
            out_f.write(content)
        print(f"Wrote updated content to {file_path}")