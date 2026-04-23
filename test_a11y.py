import os

def check_file(filepath, expected_strings):
    with open(filepath, 'r') as f:
        content = f.read()

    missing = []
    for string in expected_strings:
        if string not in content:
            missing.append(string)

    if missing:
        print(f"FAILED: {filepath}")
        for string in missing:
            print(f"  Missing: {string}")
        return False
    else:
        print(f"PASSED: {filepath}")
        return True

all_passed = True

print("Checking components/product-filters.tsx...")
if not check_file("components/product-filters.tsx", [
    "<fieldset>",
    "<legend className=",
    'aria-label="Sort by"',
    'role="group"',
    'aria-label="Category filters"',
    'aria-pressed={!selectedCategory}',
    'aria-pressed={selectedCategory === category}',
    'aria-label="Minimum price"',
    'aria-label="Maximum price"'
]):
    all_passed = False

print("\nChecking components/header.tsx...")
if not check_file("components/header.tsx", [
    'aria-hidden="true"',
    'aria-label="Search products or shows"',
    'aria-label="Search"'
]):
    all_passed = False

print("\nChecking components/show-chat.tsx...")
if not check_file("components/show-chat.tsx", [
    'aria-label="Chat message"'
]):
    all_passed = False

print("\nChecking components/live-show-player.tsx...")
if not check_file("components/live-show-player.tsx", [
    'aria-label={isLiked ? "Unlike show" : "Like show"}',
    'aria-label="Share show"',
    'aria-label={isMuted ? "Unmute" : "Mute"}',
    'aria-hidden="true"'
]):
    all_passed = False

if all_passed:
    print("\nAll accessibility checks passed!")
else:
    print("\nSome accessibility checks failed.")
    exit(1)

print("\nChecking components/clip-card.tsx...")
if not check_file("components/clip-card.tsx", [
    'aria-label="Like"',
    'aria-label="Chat"',
    'aria-label="Share"'
]):
    all_passed = False

if all_passed:
    print("\nAll accessibility checks passed!")
else:
    print("\nSome accessibility checks failed.")
    exit(1)

print("\nChecking components/review-form.tsx...")
with open("components/review-form.tsx", "r") as f:
    content = f.read()
    if 'role="radiogroup"' not in content:
        print("FAILED: components/review-form.tsx - Missing role=\"radiogroup\"")
        exit(1)
    if 'role="radio"' not in content:
        print("FAILED: components/review-form.tsx - Missing role=\"radio\"")
        exit(1)
    if 'aria-checked={score === star}' not in content:
        print("FAILED: components/review-form.tsx - Missing aria-checked={score === star}")
        exit(1)
    if '<fieldset' not in content:
        print("FAILED: components/review-form.tsx - Missing <fieldset>")
        exit(1)
    if '<legend' not in content:
        print("FAILED: components/review-form.tsx - Missing <legend>")
        exit(1)
    print("PASSED: components/review-form.tsx")

print("\nAll accessibility checks passed!")
