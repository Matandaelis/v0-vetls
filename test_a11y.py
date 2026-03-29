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

print("\nChecking app/products/[id]/page.tsx...")
if not check_file("app/products/[id]/page.tsx", [
    'aria-label="Decrease quantity"',
    'aria-label="Increase quantity"'
]):
    all_passed = False

print("\nChecking app/products/page.tsx...")
if not check_file("app/products/page.tsx", [
    'aria-label="Back to home"'
]):
    all_passed = False

print("\nChecking app/search/page.tsx...")
if not check_file("app/search/page.tsx", [
    'aria-label="Back to home"'
]):
    all_passed = False

print("\nChecking components/host/product-management.tsx...")
if not check_file("components/host/product-management.tsx", [
    'aria-label="View statistics"',
    'aria-label="Edit product"',
    'aria-label="Delete product"'
]):
    all_passed = False

print("\nChecking components/host/stream-control-panel.tsx...")
if not check_file("components/host/stream-control-panel.tsx", [
    'aria-label="Volume settings"',
    'aria-label="Share stream"'
]):
    all_passed = False

print("\nChecking components/show-sidebar.tsx...")
if not check_file("components/show-sidebar.tsx", [
    'aria-label="Send message"'
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
