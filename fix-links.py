import os
import re

def fix_links(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()

                # Find <Link><Button></Button></Link> patterns and fix them
                # This simple regex might not catch everything but it's a start
                new_content = re.sub(r'<Link([^>]*)>\s*<Button([^>]*)>(.*?)</Button>\s*</Link>', r'<Button\2 asChild>\n  <Link\1>\n    \3\n  </Link>\n</Button>', content, flags=re.DOTALL)

                if new_content != content:
                    print(f"Fixing links in {filepath}")
                    with open(filepath, 'w') as f:
                        f.write(new_content)

if __name__ == '__main__':
    fix_links('.')
