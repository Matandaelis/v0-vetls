import os
import sys

def verify_file(filepath):
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        sys.exit(1)

    with open(filepath, 'r') as f:
        content = f.read()

    checks = [
        "focus-within:opacity-100",
        'aria-label={isLiked ? "Unlike show" : "Like show"}',
        'aria-pressed={isLiked}',
        'title={isLiked ? "Unlike show" : "Like show"}',
        'aria-label="Share show"',
        'title="Share show"',
        'aria-label={isMuted ? "Unmute" : "Mute"}',
        'title={isMuted ? "Unmute" : "Mute"}',
        'aria-expanded={showProductOverlay}',
        'aria-controls="product-overlay"',
        'id="product-overlay"',
        'aria-hidden="true"'
    ]

    missing = []
    for check in checks:
        if check not in content:
            missing.append(check)

    if missing:
        print("Verification failed! Missing strings:")
        for m in missing:
            print(f"  - {m}")
        sys.exit(1)

    print("Verification passed! All accessibility attributes found.")

if __name__ == "__main__":
    verify_file("components/live-show-player.tsx")
