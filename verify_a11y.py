import os

files = [
    "components/live-show-player.tsx",
    "components/show-product-carousel.tsx",
    "components/livekit-player.tsx"
]

checks = {
    "components/live-show-player.tsx": [
        "focus-within:opacity-100",
        "aria-label={isLiked ? \"Unlike show\" : \"Like show\"}",
        "aria-pressed={isLiked}",
        "aria-label=\"Share show\"",
        "aria-label={isMuted ? \"Unmute stream\" : \"Mute stream\"}",
        "aria-pressed={isMuted}"
    ],
    "components/show-product-carousel.tsx": [
        "focus-visible:opacity-100",
        "aria-label=\"Scroll left\"",
        "aria-label=\"Scroll right\""
    ],
    "components/livekit-player.tsx": [
        "focus-within:opacity-100"
    ]
}

for file in files:
    with open(file, 'r') as f:
        content = f.read()
        print(f"Checking {file}...")
        for check in checks[file]:
            if check in content:
                print(f"  [OK] Found '{check}'")
            else:
                print(f"  [FAIL] Missing '{check}'")
                exit(1)

print("All checks passed.")
