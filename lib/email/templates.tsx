export const emailTemplates = {
  orderConfirmation: (data: any) => ({
    subject: `Order Confirmation #${data.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. Your order has been placed successfully.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Total Amount:</strong> $${data.totalAmount}</p>
          <p><strong>Delivery Date:</strong> ${data.deliveryDate}</p>
        </div>
        <p>Track your order: <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${data.orderId}">View Order</a></p>
      </div>
    `,
  }),
  liveStreamNotification: (data: any) => ({
    subject: `${data.creatorName} is now live!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${data.creatorName} is now streaming!</h2>
        <p>Watch live and exclusive deals: <strong>${data.streamTitle}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/live/${data.showId}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Watch Now</a></p>
      </div>
    `,
  }),
  auctionOutbid: (data: any) => ({
    subject: `You've been outbid on ${data.productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been outbid!</h2>
        <p>Someone placed a higher bid on <strong>${data.productName}</strong></p>
        <p>Current highest bid: <strong>$${data.currentBid}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/shows/${data.showId}">Place a new bid</a></p>
      </div>
    `,
  }),
  auctionWon: (data: any) => ({
    subject: `Congratulations! You won the auction for ${data.productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You won the auction!</h2>
        <p>Congratulations! You've won the bid for <strong>${data.productName}</strong></p>
        <p>Winning bid: <strong>$${data.winningBid}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/checkout?auctionId=${data.auctionId}">Complete Purchase</a></p>
      </div>
    `,
  }),
  loyaltyRewardEarned: (data: any) => ({
    subject: `You earned ${data.points} loyalty points!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Loyalty Points Earned!</h2>
        <p>Great news! You earned <strong>${data.points} points</strong> from your recent purchase.</p>
        <p>Total points: <strong>${data.totalPoints}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/rewards">Redeem Rewards</a></p>
      </div>
    `,
  }),
}
