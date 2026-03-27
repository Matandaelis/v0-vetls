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

if all_passed:
    print("\nAll accessibility checks passed!")
else:
    print("\nSome accessibility checks failed.")
    exit(1)

print("\nChecking components/review-form.tsx...")
if not check_file("components/review-form.tsx", [
    'aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}'
]):
    all_passed = False

print("\nChecking components/show-sidebar.tsx...")
if not check_file("components/show-sidebar.tsx", [
    'aria-label="Like comment"',
    'aria-label="Chat message"',
    'aria-label="Send message"'
]):
    all_passed = False

print("\nChecking components/live-engagement-panel.tsx...")
if not check_file("components/live-engagement-panel.tsx", [
    'aria-label={`React with ${emoji}`}'
]):
    all_passed = False

print("\nChecking components/product-hotspot.tsx...")
if not check_file("components/product-hotspot.tsx", [
    'aria-label={`View product details for hotspot`}',
    'aria-label="Close product preview"',
    'aria-label={likedProducts.has(selectedProductData.id) ? `Remove ${selectedProductData.name} from likes` : `Add ${selectedProductData.name} to likes`}'
]):
    all_passed = False

print("\nChecking components/live-auction-enhanced.tsx...")
if not check_file("components/live-auction-enhanced.tsx", [
    'aria-label={showBidHistory ? "Hide Bid History" : "Show Bid History"}',
    'aria-expanded={showBidHistory}',
    'aria-controls="bid-history-panel"',
    'id="bid-history-panel"'
]):
    all_passed = False

if all_passed:
    print("\nAll accessibility checks passed!")
else:
    print("\nSome accessibility checks failed.")
    exit(1)
