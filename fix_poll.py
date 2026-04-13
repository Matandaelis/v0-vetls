with open('components/live-engagement-panel.tsx', 'r') as f:
    content = f.read()

print("Initial checks:")
print(f"Has <div className=\"space-y-2\">: {'<div className=\"space-y-2\">' in content}")
print(f"Has <button: {'<button' in content}")
