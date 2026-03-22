import os
import sys

def verify_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    expected_strings = [
        'aria-label={`Remove ${item.product.name} from cart`}',
        'aria-label={`Decrease quantity of ${item.product.name}`}',
        'aria-live="polite"',
        'aria-atomic="true"',
        'aria-label={`Increase quantity of ${item.product.name}`}',
        '<Trash2 className="w-4 h-4" aria-hidden="true" />',
        '<Minus className="w-3 h-3" aria-hidden="true" />',
        '<Plus className="w-3 h-3" aria-hidden="true" />'
    ]

    missing = []
    for s in expected_strings:
        if s not in content:
            missing.append(s)

    if missing:
        print("Verification failed. Missing strings:")
        for m in missing:
            print(f"  - {m}")
        sys.exit(1)
    else:
        print("All accessibility strings verified successfully in " + filepath)
        sys.exit(0)

if __name__ == '__main__':
    verify_file('app/cart/page.tsx')
