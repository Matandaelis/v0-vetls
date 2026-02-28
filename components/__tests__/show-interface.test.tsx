import { render, screen } from '@testing-library/react'
import { ShowInterface } from '@/components/show-interface'
import { describe, it, expect, vi } from 'vitest'

// Mock dependencies
vi.mock('@/components/livekit-player', () => ({
  LiveKitPlayer: () => <div data-testid="livekit-player" />
}))
vi.mock('@/components/show-chat', () => ({
  ShowChat: () => <div data-testid="show-chat" />
}))
vi.mock('@/contexts/cart-context', () => ({
  useCart: () => ({ addItem: vi.fn() })
}))

// Mock data
const mockShow = {
  id: '1',
  title: 'Test Show',
  hostName: 'Test Host',
  hostAvatar: '/avatar.jpg',
  roomName: 'room-1',
  startTime: '2023-01-01T00:00:00Z',
  status: 'live' as const
}

const mockProducts = [
  { id: 'p1', name: 'Product 1', price: 10, image: '/p1.jpg', description: 'desc', sellerId: 's1' }
]

describe('ShowInterface Accessibility', () => {
  it('renders tabs with correct ARIA roles and attributes', () => {
    render(<ShowInterface show={mockShow} featuredProducts={mockProducts} isLive={true} />)

    // Check tablist
    const tablist = screen.getByRole('tablist', { name: /show content sections/i })
    expect(tablist).toBeInTheDocument()

    // Check tabs
    const shopTab = screen.getByRole('tab', { name: /shop/i })
    const chatTab = screen.getByRole('tab', { name: /chat/i })

    expect(shopTab).toHaveAttribute('aria-selected', 'true') // Shop is default active
    expect(chatTab).toHaveAttribute('aria-selected', 'false')
    expect(shopTab).toHaveAttribute('aria-controls', 'panel-shop')
    expect(chatTab).toHaveAttribute('aria-controls', 'panel-chat')
  })

  it('renders tab panels with correct ARIA roles and attributes', () => {
    render(<ShowInterface show={mockShow} featuredProducts={mockProducts} isLive={true} />)

    // Check active panel (Shop)
    const shopPanel = screen.getByRole('tabpanel')
    expect(shopPanel).toHaveAttribute('id', 'panel-shop')
    expect(shopPanel).toHaveAttribute('aria-labelledby', 'tab-shop')
    expect(shopPanel).toHaveAttribute('tabIndex', '0')
  })
})
