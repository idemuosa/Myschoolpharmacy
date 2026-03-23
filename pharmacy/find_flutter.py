import os

def find_flutter(search_path):
    for root, dirs, files in os.walk(search_path):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        if 'flutter.bat' in files:
            return os.path.join(root, 'flutter.bat')
    return None

paths = [r"C:\Users\sagacious wizzy", r"C:\src", r"C:\flutter", r"C:\Program Files"]
for p in paths:
    try:
        if os.path.exists(p):
            result = find_flutter(p)
            if result:
                print(f"FOUND: {result}")
                break
    except Exception as e:
        pass
