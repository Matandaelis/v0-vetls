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

print("\nChecking components/show-sidebar.tsx...")
if not check_file("components/show-sidebar.tsx", [
    'aria-label="Send message"'
]):
    all_passed = False

print("\nChecking components/product-hotspot.tsx...")
if not check_file("components/product-hotspot.tsx", [
    'aria-label={`View details for ${products.find((p) => p.id === hotspot.productId)?.name || "product"}`}',
    'aria-label="Close product preview"',
    'aria-label={likedProducts.has(selectedProductData.id) ? "Unlike product" : "Like product"}'
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
