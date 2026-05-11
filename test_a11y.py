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
    assert "htmlFor=\"review-title\"" in content, "Missing htmlFor on Title label"
    assert "id=\"review-title\"" in content, "Missing id on Title input"
    assert "htmlFor=\"review-comment\"" in content, "Missing htmlFor on Review label"
    assert "id=\"review-comment\"" in content, "Missing id on Review textarea"
    assert "fieldset" in content, "Missing fieldset for rating group"
    assert "legend" in content, "Missing legend for rating group"
    assert "role=\"radiogroup\"" in content, "Missing role=radiogroup"
    assert "role=\"radio\"" in content, "Missing role=radio on star buttons"
    assert "aria-checked={score === star}" in content, "Missing aria-checked on star buttons"
    assert "aria-busy={isSubmitting}" in content, "Missing aria-busy on submit button"
    print("PASSED: components/review-form.tsx")
