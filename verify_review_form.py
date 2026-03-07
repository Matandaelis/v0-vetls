import sys

with open("components/review-form.tsx", "r") as f:
    content = f.read()

assert 'role="radiogroup"' in content
assert 'role="radio"' in content
assert 'aria-checked' in content
assert 'aria-label' in content
assert 'focus-visible:ring-2' in content
assert 'Star' in content
assert 'RatingDisplay' not in content

print("All accessibility attributes and focus styles found!")
