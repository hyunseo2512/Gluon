
import re

def check_balance(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove comments
    content = re.sub(r'{/\*.*?\*/}', '', content, flags=re.DOTALL)
    
    # Simple tag matching
    tags = []
    lines = content.split('\n')
    
    # Check only within App component roughly
    inside_app = False
    
    for i, line in enumerate(lines):
        if 'function App' in line:
            inside_app = True
        
        if not inside_app:
            continue
            
        # Find tags
        matches = re.finditer(r'</?([a-zA-Z0-9\.]+)[^>]*?/?>', line)
        for match in matches:
            tag_full = match.group(0)
            tag_name = match.group(1)
            
            # Self closing
            if tag_full.endswith('/>'):
                continue
            
            # Closing tag
            if tag_full.startswith('</'):
                if not tags or tags[-1][0] != tag_name:
                    print(f"Error at line {i+1}: Expected closing for {tags[-1][0] if tags else 'None'}, found </{tag_name}>")
                    return
                tags.pop()
            # Opening tag
            else:
                # void elements in HTML, but this is JSX. 
                # Assuming all non-void JSX elements must be closed or self-closed.
                # Common HTML void elements: img, input, br, hr
                if tag_name.lower() in ['img', 'input', 'br', 'hr']:
                    continue
                tags.append((tag_name, i+1))
                
    if tags:
        print(f"Unclosed tags remaining: {tags}")
    else:
        print("Tags balanced.")

check_balance('/home/zxcvne/ai-quark/Gluon/src/renderer/App.tsx')
