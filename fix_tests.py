with open('test_a11y.py', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.strip() == 'if all_passed:':
        # Don't add it yet
        skip = True
        pass

    if skip:
        if line.strip() == 'exit(1)':
            skip = False
        continue

    if line.strip() == 'print("\\nChecking components/host/product-management.tsx...")':
        # Skip the end part
        break

    new_lines.append(line)

new_lines.append("""
print("\\nChecking components/host/product-management.tsx...")
if not check_file("components/host/product-management.tsx", [
    "aria-label={`View stats for ${product.name}`}",
    "aria-label={`Edit ${product.name}`}",
    "aria-label={`Delete ${product.name}`}"
]):
    all_passed = False

if all_passed:
    print("\\nAll accessibility checks passed!")
else:
    print("\\nSome accessibility checks failed.")
    exit(1)
""")

with open('test_a11y.py', 'w') as f:
    f.writelines(new_lines)
