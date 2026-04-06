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

print("\nChecking components/show-sidebar.tsx...")
if not check_file("components/show-sidebar.tsx", [
    'aria-label="Send message"'
]):
    all_passed = False

print("\nChecking components/product-hotspot.tsx...")
if not check_file("components/product-hotspot.tsx", [
    'aria-label="Close product preview"',
    'aria-label={likedProducts.has(selectedProductData.id) ? "Unlike" : "Like"}'
]):
    all_passed = False

print("\nChecking components/live-shopping-video-conference.tsx...")
if not check_file("components/live-shopping-video-conference.tsx", [
    'aria-label={isCameraEnabled ? "Disable camera" : "Enable camera"}',
    'aria-label={isMicEnabled ? "Mute mic" : "Unmute mic"}'
]):
    all_passed = False

print("\nChecking components/host/product-management.tsx...")
if not check_file("components/host/product-management.tsx", [
    'aria-label="View stats"',
    'aria-label="Edit product"',
    'aria-label="Delete product"'
]):
    all_passed = False

print("\nChecking components/host/stream-control-panel.tsx...")
if not check_file("components/host/stream-control-panel.tsx", [
    'aria-label="Volume"',
    'aria-label="Share"'
]):
    all_passed = False

print("\nChecking components/live-qa.tsx...")
if not check_file("components/live-qa.tsx", [
    'aria-label="Submit question"'
]):
    all_passed = False

print("\nChecking components/show-product-carousel.tsx...")
if not check_file("components/show-product-carousel.tsx", [
    'aria-label="Scroll left"',
    'aria-label="Scroll right"'
]):
    all_passed = False

print("\nChecking components/livekit-broadcaster.tsx...")
if not check_file("components/livekit-broadcaster.tsx", [
    'aria-label={isMicEnabled ? "Mute mic" : "Unmute mic"}',
    'aria-label={isCameraEnabled ? "Disable camera" : "Enable camera"}'
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
