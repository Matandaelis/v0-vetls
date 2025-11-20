import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About JB Live Shopping</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>
            Welcome to JB Live Shopping, the premier destination for interactive live video shopping. We connect
            creators, brands, and shoppers in real-time, creating an immersive shopping experience like no other.
          </p>
          <p>
            Our platform empowers sellers to showcase their products through live broadcasts, allowing viewers to ask
            questions, see products in action, and purchase instantly without leaving the stream.
          </p>
          <h3>Our Mission</h3>
          <p>
            To revolutionize e-commerce by bringing the human connection back to online shopping. We believe that
            shopping should be social, entertaining, and transparent.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
