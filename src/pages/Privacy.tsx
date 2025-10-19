import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Breadcrumb } from "@/components/Breadcrumb";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy – CreativeUtil</title>
        <meta name="description" content="Learn about how CreativeUtil collects, uses, and protects your personal information. Our privacy policy explains our commitment to data protection and user privacy." />
        <meta name="keywords" content="privacy policy, data protection, user privacy, CreativeUtil privacy, personal information" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/privacy" />
        <meta property="og:title" content="Privacy Policy – CreativeUtil" />
        <meta property="og:description" content="Learn about how CreativeUtil collects, uses, and protects your personal information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/privacy" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Privacy Policy – CreativeUtil" />
        <meta name="twitter:description" content="Learn about how CreativeUtil collects, uses, and protects your personal information." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 opacity-40 pattern-bg" />

        {/* Gradient Overlays */}
        <div className="fixed top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

        <Header />

        <main className="flex-1 pt-32 pb-16 px-4 md:px-6">
          <section className="max-w-4xl mx-auto relative">
            {/* Branded Accent Shapes */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-bl from-primary to-secondary rounded-full opacity-20 blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-secondary to-accent rounded-full opacity-20 blur-xl" />

            <Breadcrumb />
            <div className="glass rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden">
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-3xl" />

              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Privacy Policy
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-muted-foreground mb-6">
                    <strong>Last updated:</strong> January 1, 2025
                  </p>

                  <p className="mb-6">
                    At CreativeUtil, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>

                  <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
                  <p className="mb-4">
                    We may collect personal information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>Name and contact information (email address)</li>
                    <li>Account information when you create an account</li>
                    <li>Communication preferences</li>
                    <li>Feedback and support requests</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-6 mb-3">Usage Information</h3>
                  <p className="mb-4">
                    We automatically collect certain information about your use of our services:
                  </p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>IP address and location information</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Referral sources</li>
                  </ul>

                  <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
                  <p className="mb-4">We use the information we collect to:</p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>Provide and maintain our services</li>
                    <li>Process your requests and transactions</li>
                    <li>Send you technical notices and support messages</li>
                    <li>Communicate with you about products, services, and promotions</li>
                    <li>Improve our website and services</li>
                    <li>Monitor and analyze usage patterns</li>
                    <li>Detect, prevent, and address technical issues</li>
                  </ul>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Information Sharing and Disclosure</h2>
                  <p className="mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy:
                  </p>
                  <ul className="list-disc pl-6 mb-6">
                    <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website and conducting our business.</li>
                    <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to legal process.</li>
                    <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred.</li>
                    <li><strong>Protection of Rights:</strong> We may disclose information to protect our rights, property, or safety, or that of our users.</li>
                  </ul>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
                  <p className="mb-6">
                    We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Cookies and Tracking Technologies</h2>
                  <p className="mb-4">
                    We use cookies and similar technologies to enhance your experience on our website:
                  </p>
                  <ul className="list-disc pl-6 mb-6">
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                  <p className="mb-6">
                    You can control cookie settings through your browser preferences.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>
                  <p className="mb-6">
                    Our website may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party services you use.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Children's Privacy</h2>
                  <p className="mb-6">
                    Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
                  <p className="mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>Access to your personal information</li>
                    <li>Correction of inaccurate information</li>
                    <li>Deletion of your personal information</li>
                    <li>Restriction or objection to processing</li>
                    <li>Data portability</li>
                  </ul>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
                  <p className="mb-6">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
                  <p className="mb-4">
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                  </p>
                  <ul className="list-none mb-6">
                    <li><strong>Email:</strong> brastyphler17@gmail.com</li>
                    <li><strong>Address:</strong> CreativeUtil, Privacy Team</li>
                  </ul>

                  <p className="text-sm text-muted-foreground mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    This privacy policy is effective as of January 1, 2025. By using CreativeUtil, you agree to the collection and use of information in accordance with this policy.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Privacy;
