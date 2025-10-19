import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send } from "lucide-react";
import bgImage from "@/assets/bg-1.png";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you as soon as possible.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Contact CreativeUtil – Get in Touch with Our Team</title>
        <meta name="description" content="Have questions about CreativeUtil? Contact our team for support, feedback, or partnership inquiries. We're here to help with your web development and design needs." />
        <meta name="keywords" content="contact CreativeUtil, support, feedback, partnership, web development help, design tools support" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/contact" />
        <meta property="og:title" content="Contact CreativeUtil – Get in Touch with Our Team" />
        <meta property="og:description" content="Have questions about CreativeUtil? Contact our team for support, feedback, or partnership inquiries." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/contact" />
        <meta property="og:image" content="https://creativeutil.com/assets/creativeutil-contact-og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CreativeUtil" />
        <meta name="twitter:title" content="Contact CreativeUtil – Get in Touch with Our Team" />
        <meta name="twitter:description" content="Have questions about CreativeUtil? Contact our team for support, feedback, or partnership inquiries." />
        <meta name="twitter:image" content="https://creativeutil.com/assets/creativeutil-contact-og-image.png" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact CreativeUtil",
            "url": "https://creativeutil.com/contact",
            "description": "Get in touch with the CreativeUtil team for support and inquiries.",
            "mainEntity": {
              "@type": "Organization",
              "name": "CreativeUtil",
              "email": "brastyphler17@gmail.com",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "brastyphler17@gmail.com",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="fixed top-1/3 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10" />

      {/* Branded Accent Shapes */}
      <div className="fixed top-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full opacity-20 blur-lg -z-10" />
      <div className="fixed bottom-1/3 right-1/4 w-32 h-32 bg-gradient-to-tl from-accent to-primary rounded-full opacity-20 blur-xl -z-10" />

      <Header />

      <main className="flex-1 pt-32 pb-16 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            {/* Gradient Background Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-3xl" />

            <div className="text-center mb-12 relative z-10">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Get in Touch
              </h1>
              <p className="text-xl text-foreground dark:text-gray-100 font-semibold">
                Have questions? We'd love to hear from you. Send us a message and
                we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-primary">Email Us</h3>
                    <p className="text-foreground dark:text-gray-300 font-medium">
                      brastyphler17@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-secondary">Live Chat</h3>
                    <p className="text-foreground dark:text-gray-300 font-medium">
                      Available Monday-Friday, 9am-5pm EST
                    </p>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6 space-y-2 relative overflow-hidden">
                  {/* Card Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl" />

                  <h4 className="font-semibold relative z-10 text-accent">Quick Response</h4>
                  <p className="text-sm text-foreground dark:text-gray-300 font-medium relative z-10">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input 
                    id="name"
                    placeholder="Your name" 
                    required 
                    className="glass"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                    className="glass"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea 
                    id="message"
                    placeholder="Tell us what you're thinking about..." 
                    rows={5}
                    required 
                    className="glass resize-none"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 rounded-xl text-lg"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      </div>
    </>
  );
};

export default Contact;
