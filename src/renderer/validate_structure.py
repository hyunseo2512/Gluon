
import re

def validate_structure(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    stack = []
    
    inside_main_return = False
    
    # Void elements
    void_elements = set(['img', 'input', 'br', 'hr', 'area', 'base', 'col', 'embed', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

    print("--- Structure Validation Start (Targeting App Component) ---")
    
    main_return_start_line = -1
    
    # Find the 'return (' that belongs to App component.
    # Heuristic: the last 'return (' before 'export default App' or end of file
    # Or scan specifically for 'function App' and find its return
    
    app_start_line = -1
    for i, line in enumerate(lines):
        if 'function App' in line:
            app_start_line = i
            break
            
    if app_start_line == -1:
        print("Could not find function App")
        return

    # Find the return ( inside App
    for i in range(app_start_line, len(lines)):
        line = lines[i]
        # We look for the top-level return of the component.
        # This is tricky with hooks having returns.
        # But usually the main JSX return is at the end.
        if 'return (' in line:
             main_return_start_line = i
             # Keep updating, assume the last one is the main one? 
             # No, hooks are at top. The main return is usually the last one.
             # Let's try to find the last 'return (' in the function block.
    
    # Actually, simpler: search backwards from 'export default App'
    for i in range(len(lines)-1, -1, -1):
        if 'export default App' in lines[i]:
             # Search backwards for return (
             for j in range(i, -1, -1):
                 if 'return (' in lines[j]:
                      main_return_start_line = j
                      inside_main_return = True
                      break
             break
             
    if main_return_start_line == -1:
         print("Could not find main return statement")
         return
         
    print(f"Main return starts at line {main_return_start_line + 1}")
    
    for i in range(main_return_start_line, len(lines)):
        line_num = i + 1
        line = lines[i]
        
        # Stop check
        if line.strip() == ');' and len(stack) == 0:
             print(f"Line {line_num}: Found main return end")
             break

        tag_pattern = re.compile(r'(</?)([a-zA-Z0-9\.]+)([^>]*?)(/?>)')
        
        pos = 0
        while pos < len(line):
            match = tag_pattern.search(line, pos)
            if not match:
                break
            
            full_match = match.group(0)
            prefix = match.group(1) # < or </
            name = match.group(2)
            attrs = match.group(3)
            suffix = match.group(4) # > or />
            
            start_pos = match.start()
            pos = match.end()
            
            # Skip comments
            if '{/*' in line[:start_pos] and '*/}' in line[pos:]:
                 continue

            if prefix == '</':
                if not stack:
                    print(f"ERROR Line {line_num}: Unexpected closing tag </{name}>. Stack is empty.")
                elif stack[-1] != name:
                    print(f"ERROR Line {line_num}: Mismatched closing tag </{name}>. Expected </{stack[-1]}>.")
                    # Recover logic
                    if len(stack) > 1 and stack[-2] == name:
                         print(f"  -> Assuming missing closing for {stack[-1]}")
                         stack.pop()
                         stack.pop()
                    else:
                         print(f"  -> Ignoring </{name}>")
                else:
                    stack.pop()
                    # print(f"Line {line_num}: {'  ' * len(stack)}</{name}>")
            
            elif suffix == '/>':
                pass
                # print(f"Line {line_num}: {'  ' * len(stack)}<{name} />")
            
            else:
                if name.lower() not in void_elements:
                    stack.append(name)
                    # print(f"Line {line_num}: {'  ' * (len(stack)-1)}<{name}>")

    if stack:
        print(f"ERROR: Unclosed tags at end: {stack}")
    else:
        print("Structure seems balanced.")

validate_structure('/home/zxcvne/ai-quark/Gluon/src/renderer/App.tsx')
