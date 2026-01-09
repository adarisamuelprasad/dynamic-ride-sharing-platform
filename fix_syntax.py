import os
import re

# Directory containing your React files
project_root = r"C:\Users\samue\One Drive official\OneDrive\Desktop\Development-of-a-Dynamic-Ride-Sharing-and-Carpooling-Platform_Nov_Batch-6_2025\triply-frontend\src"

def fix_file_syntax(filepath):
    """Fix common syntax errors in a JavaScript/JSX file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix 1: Import statements missing 'as'
        content = re.sub(r'import \* from "react"', 'import * as React from "react"', content)
        content = re.sub(r'import \* from "@radix-ui', 'import * as RadixUI from "@radix-ui', content)
        
        # Fix 2: Broken object literals in useState - missing colons
        # Pattern: { key, value ) or { key, value}
        content = re.sub(r'\{ (\w+), (\w+), (\w+)\)', r'{ \1: "", \2: "", \3: "" }', content)
        content = re.sub(r'\{ (\w+), (\w+)\)', r'{ \1: "", \2: "" }', content)
        
        # Fix 3: Unterminated strings in console.error
        content = re.sub(r'console\.error\([\'"]([^\'",]+), (\w+)\)', r'console.error("\1", \2)', content)
        
        # Fix 4: Broken setForm/setState patterns
        content = re.sub(r'setForm\(\(prev\) => \(\{ \.\.\.prev, \[key\]\)\)', 'setForm((prev) => ({ ...prev, [key]: value }))', content)
        content = re.sub(r'setPassData\(\{ \.\.\.passData, \[e\.target\.name\]\)', 'setPassData({ ...passData, [e.target.name]: e.target.value })', content)
        
        # Fix 5: Missing closing braces in object literals
        content = re.sub(r'state, (\w+), (\w+)\)', r'state: { \1, \2 }', content)
        
        # Fix 6: Broken JSX ternary operators - ) : (  should be ) : (
        content = re.sub(r'\) : \($', ') : (', content, flags=re.MULTILINE)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ Fixed: {filepath}")
            return True
        else:
            print(f"  No changes: {filepath}")
            return False
            
    except Exception as e:
        print(f"✗ Error processing {filepath}: {e}")
        return False

def process_directory(directory):
    """Process all .jsx and .js files in the directory"""
    fixed_count = 0
    total_count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js'  )):
                filepath = os.path.join(root, file)
                total_count += 1
                if fix_file_syntax(filepath):
                    fixed_count += 1
    
    print(f"\n{'='*60}")
    print(f"Processed {total_count} files, fixed {fixed_count} files")
    print(f"{'='*60}")

if __name__ == "__main__":
    print("Starting syntax fix script...")
    print(f"Target directory: {project_root}\n")
    process_directory(project_root)
    print("\nDone! Please review changes and test your application.")
