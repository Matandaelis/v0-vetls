with open('components/live-engagement-panel.tsx', 'r') as f:
    content = f.read()

if 'role="radiogroup"' in content:
    print("Has radiogroup")
else:
    print("No radiogroup")
