with open('components/live-auction-enhanced.tsx', 'r') as f:
    content = f.read()

if 'aria-expanded={showBidHistory}' in content and 'htmlFor="proxy-bid-amount"' in content:
    print("Static checks passed.")
else:
    print("Static checks failed.")
