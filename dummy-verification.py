import re

with open('components/review-form.tsx', 'r') as f:
    content = f.read()

assert 'aria-busy={isSubmitting}' in content
assert 'role="radiogroup"' in content
assert 'role="radio"' in content
assert '<fieldset' in content
assert 'htmlFor="review-title"' in content
print("All verifications passed!")
