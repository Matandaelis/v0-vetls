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

def check_review_form():
    import os
    file_path = 'components/review-form.tsx'
    if not os.path.exists(file_path):
        print(f"Skipping {file_path} - not found.")
        return

    print(f"\nChecking {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []

    # Check for semantic fieldset
    if '<fieldset' not in content or '<legend' not in content:
        errors.append("ERROR: Form is missing semantic <fieldset> and <legend> tags for grouped inputs (rating).")

    # Check for radiogroup roles
    if 'role="radiogroup"' not in content:
        errors.append("ERROR: Rating container is missing role=\"radiogroup\".")

    # Check for individual radio role
    if 'role="radio"' not in content:
        errors.append("ERROR: Rating stars are missing role=\"radio\".")

    # Check for aria-checked
    if 'aria-checked' not in content:
        errors.append("ERROR: Rating stars are missing aria-checked attribute.")

    # Check for htmlFor and id binding
    if 'htmlFor="review-title"' not in content or 'id="review-title"' not in content:
        errors.append("ERROR: Title label and input are not semantically bound with htmlFor/id.")

    if 'htmlFor="review-comment"' not in content or 'id="review-comment"' not in content:
        errors.append("ERROR: Comment label and textarea are not semantically bound with htmlFor/id.")

    # Check for aria-busy on submit
    if 'aria-busy' not in content:
        errors.append("ERROR: Submit button is missing aria-busy attribute.")

    if errors:
        for error in errors:
            print(error)
        print(f"FAILED: {file_path}")
        exit(1)
    else:
        print(f"PASSED: {file_path}")

check_review_form()
