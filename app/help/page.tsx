import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for help..." className="pl-10" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I start selling?</AccordionTrigger>
                <AccordionContent>
                  To start selling, register for an account and select "Seller" as your role. Once approved, you can
                  access the Host Dashboard to create shows and products.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is shipping included?</AccordionTrigger>
                <AccordionContent>
                  Shipping policies are set by individual sellers. Check the product details page for specific shipping
                  information.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I return an item?</AccordionTrigger>
                <AccordionContent>
                  You can initiate a return from your Order History page. Returns are subject to the seller's return
                  policy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Contact Support</h2>
            <div className="bg-secondary/20 p-6 rounded-xl">
              <p className="mb-4">Can't find what you're looking for? Our support team is here to help.</p>
              <Button className="w-full mb-3">Chat with Support</Button>
              <Button variant="outline" className="w-full bg-transparent">
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
