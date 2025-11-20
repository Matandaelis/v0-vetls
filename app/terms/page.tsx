import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>Please read these Terms of Service carefully before using the JB Live Shopping platform.</p>
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of
            the terms, then you may not access the service.
          </p>
          <h3>2. User Accounts</h3>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current
            at all times. Failure to do so constitutes a breach of the Terms.
          </p>
          <h3>3. Content</h3>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text,
            graphics, videos, or other material. You are responsible for the content that you post to the Service.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
