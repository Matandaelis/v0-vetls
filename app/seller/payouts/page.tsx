import PayoutDashboard from "@/components/seller/payout-dashboard"

export default function SellerPayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>
      <PayoutDashboard />
    </div>
  )
}
