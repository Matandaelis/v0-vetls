import os

def check_file(filepath, expected_strings):
    with open(filepath, 'r') as f:
        content = f.read()

    for string in expected_strings:
        if string not in content:
            print(f"FAILED: '{string}' not found in {filepath}")
            return False
    print(f"PASSED: All expected strings found in {filepath}")
    return True

all_passed = True

# Check products/[id]/page.tsx
all_passed &= check_file('app/products/[id]/page.tsx', [
    'aria-label="Decrease quantity"',
    'aria-label="Increase quantity"',
    'aria-label="Share product"',
    'aria-live="polite"'
])

# Check cart/page.tsx
all_passed &= check_file('app/cart/page.tsx', [
    'aria-label={`Remove ${item.product.name} from cart`}',
    'aria-label={`Decrease quantity of ${item.product.name}`}',
    'aria-label={`Increase quantity of ${item.product.name}`}',
    'aria-live="polite"'
])

if all_passed:
    print("ALL TESTS PASSED")
    exit(0)
else:
    print("SOME TESTS FAILED")
    exit(1)
