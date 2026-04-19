import os
import glob
import re

directories = ['data/processed/markdown/interview', 'data/processed/markdown/translation']
for d in directories:
    for filepath in glob.glob(os.path.join(d, '*.md')):
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
            lines = content.split('\n')
            
            anomalies = []
            
            # Check for replacement character
            if '\ufffd' in content:
                anomalies.append(f"Contains replacement character \\ufffd ({content.count('\ufffd')} times)")
            
            # Check for common error messages from converters
            if re.search(r'(?i)error|failed to parse|exception', content):
                anomalies.append("Contains error/failed keywords")
                
            # Check for excessive consecutive empty lines (e.g. >5)
            if re.search(r'\n\n\n\n\n\n', content):
                anomalies.append("Contains 5+ consecutive empty lines")
                
            # Check for unparsed XML/HTML that might indicate bad conversion
            # Just count basic tags
            html_tags = len(re.findall(r'</?(div|span|p|br|table|tr|td)[^>]*>', content, re.I))
            if html_tags > 10:
                anomalies.append(f"Contains {html_tags} raw HTML tags")
                
            # Check for missing headings
            headings = len(re.findall(r'^#+ ', content, re.M))
            if headings == 0:
                anomalies.append("No markdown headings found")
                
            # Check for unusually long lines (e.g. > 1000 chars)
            long_lines = sum(1 for line in lines if len(line) > 1000)
            if long_lines > 5:
                anomalies.append(f"Contains {long_lines} lines longer than 1000 characters (could be lack of line breaks)")
                
            # Check for lots of weird spaces or tabs
            if '\t\t\t' in content:
                anomalies.append("Contains excessive consecutive tabs")
                
            print(f"File: {os.path.basename(filepath)}")
            print(f"  Size: {len(content)} chars, Lines: {len(lines)}")
            if anomalies:
                for a in anomalies:
                    print(f"  [!] {a}")
            else:
                print("  [OK] No obvious anomalies detected.")
            print()
