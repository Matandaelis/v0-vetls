/**
 * Integration test utilities for critical user flows
 * Tests end-to-end functionality including live streaming, payments, and orders
 */

import { createClient } from '@/lib/supabase/client'

export interface TestResult {
  passed: boolean
  message: string
  duration: number
  details?: any
}

export class IntegrationTestRunner {
  private results: Map<string, TestResult> = new Map()

  /**
   * Test user authentication flow
   */
  async testAuthFlow(email: string, password: string): Promise<TestResult> {
    const start = Date.now()
    const supabase = createClient()

    try {
      // Test sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) throw signUpError

      // Test sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Test sign out
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      const duration = Date.now() - start

      return {
        passed: true,
        message: 'Authentication flow completed successfully',
        duration,
        details: {
          userId: signUpData.user?.id,
        },
      }
    } catch (error) {
      return {
        passed: false,
        message: `Authentication flow failed: ${error}`,
        duration: Date.now() - start,
      }
    }
  }

  /**
   * Test product creation and listing
   */
  async testProductFlow(userId: string): Promise<TestResult> {
    const start = Date.now()
    const supabase = createClient()

    try {
      // Create test product
      const testProduct = {
        seller_id: userId,
        name: 'Test Product',
        description: 'Integration test product',
        price: 99.99,
        stock: 10,
        category_id: 'test-category',
        status: 'active',
      }

      const { data: product, error: createError } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single()

      if (createError) throw createError

      // List products
      const { data: products, error: listError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId)

      if (listError) throw listError

      // Update product
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: 79.99 })
        .eq('id', product.id)

      if (updateError) throw updateError

      // Clean up
      await supabase.from('products').delete().eq('id', product.id)

      const duration = Date.now() - start

      return {
        passed: true,
        message: 'Product flow completed successfully',
        duration,
        details: {
          productId: product.id,
          productsFound: products?.length,
        },
      }
    } catch (error) {
      return {
        passed: false,
        message: `Product flow failed: ${error}`,
        duration: Date.now() - start,
      }
    }
  }

  /**
   * Test order creation and payment
   */
  async testOrderFlow(userId: string, productId: string): Promise<TestResult> {
    const start = Date.now()
    const supabase = createClient()

    try {
      // Create order
      const testOrder = {
        buyer_id: userId,
        seller_id: userId,
        total_amount: 99.99,
        status: 'pending',
        payment_status: 'pending',
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single()

      if (orderError) throw orderError

      // Add order items
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: productId,
          quantity: 1,
          price: 99.99,
        })

      if (itemError) throw itemError

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed', payment_status: 'paid' })
        .eq('id', order.id)

      if (updateError) throw updateError

      // Verify order
      const { data: verifiedOrder, error: verifyError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', order.id)
        .single()

      if (verifyError) throw verifyError

      const duration = Date.now() - start

      return {
        passed: true,
        message: 'Order flow completed successfully',
        duration,
        details: {
          orderId: order.id,
          totalAmount: verifiedOrder.total_amount,
          itemCount: verifiedOrder.order_items?.length,
        },
      }
    } catch (error) {
      return {
        passed: false,
        message: `Order flow failed: ${error}`,
        duration: Date.now() - start,
      }
    }
  }

  /**
   * Test show creation and live streaming setup
   */
  async testShowFlow(userId: string): Promise<TestResult> {
    const start = Date.now()
    const supabase = createClient()

    try {
      // Create show
      const testShow = {
        host_id: userId,
        title: 'Test Live Show',
        description: 'Integration test show',
        status: 'scheduled',
        start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        room_name: `test-room-${Date.now()}`,
      }

      const { data: show, error: showError } = await supabase
        .from('shows')
        .insert(testShow)
        .select()
        .single()

      if (showError) throw showError

      // Get LiveKit token
      const tokenResponse = await fetch(
        `/api/livekit/token?room=${show.room_name}&username=test-user&admin=true`
      )

      if (!tokenResponse.ok) {
        throw new Error('Failed to get LiveKit token')
      }

      const { token } = await tokenResponse.json()

      // Update show status
      const { error: updateError } = await supabase
        .from('shows')
        .update({ status: 'live' })
        .eq('id', show.id)

      if (updateError) throw updateError

      // Clean up
      await supabase.from('shows').delete().eq('id', show.id)

      const duration = Date.now() - start

      return {
        passed: true,
        message: 'Show flow completed successfully',
        duration,
        details: {
          showId: show.id,
          roomName: show.room_name,
          tokenReceived: !!token,
        },
      }
    } catch (error) {
      return {
        passed: false,
        message: `Show flow failed: ${error}`,
        duration: Date.now() - start,
      }
    }
  }

  /**
   * Test auction bidding flow
   */
  async testAuctionFlow(userId: string, productId: string): Promise<TestResult> {
    const start = Date.now()
    const supabase = createClient()

    try {
      // Create show
      const { data: show } = await supabase
        .from('shows')
        .insert({
          host_id: userId,
          title: 'Test Auction Show',
          status: 'live',
          start_time: new Date().toISOString(),
        })
        .select()
        .single()

      if (!show) throw new Error('Failed to create show')

      // Create auction
      const { data: auction, error: auctionError } = await supabase
        .from('auctions')
        .insert({
          show_id: show.id,
          product_id: productId,
          starting_bid: 50.00,
          auction_start: new Date().toISOString(),
          auction_end: new Date(Date.now() + 3600000).toISOString(),
          status: 'active',
        })
        .select()
        .single()

      if (auctionError) throw auctionError

      // Place bid using RPC function
      const { error: bidError } = await supabase.rpc('place_auction_bid', {
        auction_uuid: auction.id,
        bidder_uuid: userId,
        bid_amount: 75.00,
      })

      if (bidError) throw bidError

      // Verify auction updated
      const { data: updatedAuction, error: verifyError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auction.id)
        .single()

      if (verifyError) throw verifyError

      // Clean up
      await supabase.from('auctions').delete().eq('id', auction.id)
      await supabase.from('shows').delete().eq('id', show.id)

      const duration = Date.now() - start

      return {
        passed: true,
        message: 'Auction flow completed successfully',
        duration,
        details: {
          auctionId: auction.id,
          currentBid: updatedAuction.current_bid,
          highestBidder: updatedAuction.highest_bidder_id,
        },
      }
    } catch (error) {
      return {
        passed: false,
        message: `Auction flow failed: ${error}`,
        duration: Date.now() - start,
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(userId: string, productId?: string): Promise<Map<string, TestResult>> {
    console.log('Starting integration tests...')

    // Create test product if not provided
    let testProductId = productId
    if (!testProductId) {
      const productResult = await this.testProductFlow(userId)
      this.results.set('product_flow', productResult)
      if (productResult.passed && productResult.details?.productId) {
        testProductId = productResult.details.productId
      }
    }

    // Run all tests
    const tests = [
      { name: 'order_flow', test: () => this.testOrderFlow(userId, testProductId!) },
      { name: 'show_flow', test: () => this.testShowFlow(userId) },
      { name: 'auction_flow', test: () => this.testAuctionFlow(userId, testProductId!) },
    ]

    for (const { name, test } of tests) {
      try {
        const result = await test()
        this.results.set(name, result)
        console.log(`✓ ${name}: ${result.message} (${result.duration}ms)`)
      } catch (error) {
        console.error(`✗ ${name}: ${error}`)
        this.results.set(name, {
          passed: false,
          message: `Test execution failed: ${error}`,
          duration: 0,
        })
      }
    }

    return this.results
  }

  /**
   * Get test summary
   */
  getSummary(): {
    total: number
    passed: number
    failed: number
    duration: number
  } {
    const total = this.results.size
    let passed = 0
    let failed = 0
    let duration = 0

    for (const result of this.results.values()) {
      if (result.passed) {
        passed++
      } else {
        failed++
      }
      duration += result.duration
    }

    return { total, passed, failed, duration }
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const summary = this.getSummary()
    let report = '=== Integration Test Report ===\n\n'
    
    report += `Total Tests: ${summary.total}\n`
    report += `Passed: ${summary.passed}\n`
    report += `Failed: ${summary.failed}\n`
    report += `Total Duration: ${summary.duration}ms\n\n`

    report += '=== Test Details ===\n\n'

    for (const [name, result] of this.results) {
      report += `${name}:\n`
      report += `  Status: ${result.passed ? 'PASSED' : 'FAILED'}\n`
      report += `  Message: ${result.message}\n`
      report += `  Duration: ${result.duration}ms\n`
      if (result.details) {
        report += `  Details: ${JSON.stringify(result.details, null, 2)}\n`
      }
      report += '\n'
    }

    return report
  }
}

/**
 * Load testing utilities
 */
export class LoadTester {
  private concurrentUsers = 10
  private duration = 60000 // 1 minute
  private results: any[] = []

  /**
   * Simulate concurrent users viewing a show
   */
  async testConcurrentViewers(showId: string, userCount: number = 100): Promise<void> {
    console.log(`Starting load test with ${userCount} concurrent viewers...`)

    const promises = []
    for (let i = 0; i < userCount; i++) {
      promises.push(this.simulateViewer(showId, `test-user-${i}`))
    }

    const results = await Promise.allSettled(promises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`Load test complete: ${successful} successful, ${failed} failed`)
  }

  private async simulateViewer(showId: string, username: string): Promise<void> {
    try {
      // Get token
      const response = await fetch(
        `/api/livekit/token?room=${showId}&username=${username}&admin=false`
      )
      
      if (!response.ok) {
        throw new Error('Failed to get token')
      }

      // Simulate viewing duration
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30000))
    } catch (error) {
      throw error
    }
  }

  /**
   * Test API endpoint performance under load
   */
  async testApiLoad(endpoint: string, requestsPerSecond: number, duration: number): Promise<void> {
    console.log(`Starting API load test: ${requestsPerSecond} req/s for ${duration}ms`)

    const interval = 1000 / requestsPerSecond
    const startTime = Date.now()
    const results: number[] = []

    while (Date.now() - startTime < duration) {
      const requestStart = Date.now()
      
      try {
        const response = await fetch(endpoint)
        const requestDuration = Date.now() - requestStart
        results.push(requestDuration)
      } catch (error) {
        results.push(-1)
      }

      const elapsed = Date.now() - requestStart
      if (elapsed < interval) {
        await new Promise(resolve => setTimeout(resolve, interval - elapsed))
      }
    }

    const successful = results.filter(r => r > 0)
    const avgLatency = successful.reduce((a, b) => a + b, 0) / successful.length
    const maxLatency = Math.max(...successful)
    const minLatency = Math.min(...successful)

    console.log('API Load Test Results:')
    console.log(`  Total Requests: ${results.length}`)
    console.log(`  Successful: ${successful.length}`)
    console.log(`  Failed: ${results.length - successful.length}`)
    console.log(`  Avg Latency: ${avgLatency.toFixed(2)}ms`)
    console.log(`  Min Latency: ${minLatency}ms`)
    console.log(`  Max Latency: ${maxLatency}ms`)
  }
}
