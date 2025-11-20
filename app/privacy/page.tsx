import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p>
            JB Live Shopping ("us", "we", or "our") operates the JB Live Shopping website. This page informs you of our
            policies regarding the collection, use, and disclosure of personal data when you use our Service.
          </p>
          <h3>Information Collection</h3>
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to
            you, including:
          </p>
          <ul>
            <li>Personal Data (Email, Name, Address)</li>
            <li>Usage Data</li>
            <li>Cookies and Tracking Data</li>
          </ul>
          <h3>Use of Data</h3>
          <p>We use the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer care and support</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  )
}
