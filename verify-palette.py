
import re

def check_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    errors = []

    if filename == 'components/product-hotspot.tsx':
        if not re.search(r'aria-label=["\']Close product details["\']', content):
            errors.append('Missing aria-label on close button in product-hotspot.tsx')
        if not re.search(r'aria-label=\{[^\}]+\}', content):
            errors.append('Missing aria-label on heart button in product-hotspot.tsx')

    if filename == 'components/show-sidebar.tsx':
        if not re.search(r'aria-label=["\']Send message["\']', content):
            errors.append('Missing aria-label on send button in show-sidebar.tsx')
        if not re.search(r'aria-label=["\']Message text["\']', content):
            errors.append('Missing aria-label on message input in show-sidebar.tsx')
        if not re.search(r'aria-label=["\']Like comment["\']', content):
            errors.append('Missing aria-label on like comment button in show-sidebar.tsx')

    return errors

all_errors = []
all_errors.extend(check_file('components/product-hotspot.tsx'))
all_errors.extend(check_file('components/show-sidebar.tsx'))

if all_errors:
    print('Errors found:')
    for err in all_errors:
        print(f' - {err}')
    exit(1)
else:
    print('All checks passed!')
