import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Breadcrumb } from "@/components/Breadcrumb";
import bgImage from "@/assets/bg-1.png";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service – CreativeUtil</title>
        <meta name="description" content="Read CreativeUtil's Terms of Service to understand the rules and guidelines for using our web development and design tools. Learn about user responsibilities, intellectual property, and service limitations." />
        <meta name="keywords" content="terms of service, user agreement, CreativeUtil terms, service terms, legal agreement" />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/terms" />
        <meta property="og:title" content="Terms of Service – CreativeUtil" />
        <meta property="og:description" content="Read CreativeUtil's Terms of Service to understand the rules and guidelines for using our services." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/terms" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Service – CreativeUtil" />
        <meta name="twitter:description" content="Read CreativeUtil's Terms of Service to understand the rules and guidelines for using our services." />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div
          className="fixed inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

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
                  Terms of Service
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-muted-foreground mb-6">
                    <strong>Last updated:</strong> January 1, 2025
                  </p>

                  <p className="mb-6">
                    Welcome to CreativeUtil. These Terms of Service ("Terms") govern your access to and use of CreativeUtil's website and services ("Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please do not use our Services.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
                  <p className="mb-6">
                    By using CreativeUtil, you confirm that you are at least 13 years old and agree to these Terms, our Privacy Policy, and any additional terms and conditions that may apply to specific features of the Services. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Services</h2>
                  <p className="mb-6">
                    CreativeUtil provides a collection of web development and design tools, including but not limited to CSS generators, Markdown previewers, QR code generators, and other utilities. The Services are provided "as is" and "as available" without warranties of any kind.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
                  <p className="mb-4">To access certain features, you may need to create an account:</p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>You must provide accurate information and keep your account credentials secure.</li>
                    <li>You are responsible for all activities conducted through your account.</li>
                    <li>We reserve the right to suspend or terminate accounts for violations of these Terms.</li>
                  </ul>

                  <h2 className="text-2xl font-bold mt-8 mb-4">4. User Responsibilities</h2>
                  <p className="mb-4">You agree not to:</p>
                  <ul className="list-disc pl-6 mb-6">
                    <li>Use the Services for illegal purposes or in violation of any applicable laws.</li>
                    <li>Upload or transmit harmful code, viruses, or malware.</li>
                    <li>Interfere with the Services or other users' access.</li>
                    <li>Attempt to gain unauthorized access to our systems.</li>
                    <li>Copy, modify, or distribute the Services without permission.</li>
                    <li>Use automated systems to access the Services without authorization.</li>
                  </ul>

                  <h2 className="text-2xl font-bold mt-8 mb-4">5. Intellectual Property</h2>
                  <p className="mb-6">
                    CreativeUtil and its licensors own all rights, title, and interest in the Services, including all intellectual property rights. You are granted a limited, non-exclusive, non-transferable license to use the Services for your personal or internal business purposes. You may not remove or alter any proprietary notices.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">6. User Content</h2>
                  <p className="mb-4">
                    You retain ownership of any content you submit to the Services ("User Content"). By submitting User Content, you grant CreativeUtil a worldwide, royalty-free, perpetual license to use, modify, and distribute it as necessary to provide the Services.
                  </p>
                  <p className="mb-6">
                    You are responsible for ensuring that your User Content does not infringe third-party rights and complies with these Terms.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">7. Third-Party Services</h2>
                  <p className="mb-6">
                    The Services may integrate with or link to third-party websites or services. We are not responsible for the content, privacy practices, or availability of these third-party services. Your use of third-party services is at your own risk and subject to their terms.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">8. Fees and Payment</h2>
                  <p className="mb-6">
                    Currently, CreativeUtil Services are provided free of charge. We reserve the right to introduce paid features or subscriptions in the future, subject to additional terms.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">9. Disclaimers and Limitation of Liability</h2>
                  <p className="mb-4">
                    The Services are provided "as is" without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                  </p>
                  <p className="mb-6">
                    To the fullest extent permitted by law, CreativeUtil shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services, even if advised of the possibility of such damages.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">10. Indemnification</h2>
                  <p className="mb-6">
                    You agree to indemnify and hold CreativeUtil harmless from any claims, losses, liabilities, and expenses (including attorneys' fees) arising from your violation of these Terms, your use of the Services, or your User Content.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">11. Termination</h2>
                  <p className="mb-6">
                    We may terminate or suspend your access to the Services at any time, with or without notice, for any reason, including violation of these Terms. Upon termination, your right to use the Services will cease immediately.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">12. Governing Law</h2>
                  <p className="mb-6">
                    These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Any disputes shall be resolved exclusively in the state or federal courts located in San Francisco County, California.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">13. Changes to Terms</h2>
                  <p className="mb-6">
                    We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Services after changes constitutes acceptance of the revised Terms.
                  </p>

                  <h2 className="text-2xl font-bold mt-8 mb-4">14. Contact Us</h2>
                  <p className="mb-4">
                    If you have any questions about these Terms, please contact us:
                  </p>
                  <ul className="list-none mb-6">
                    <li><strong>Email:</strong> legal@creativeutil.com</li>
                    <li><strong>Address:</strong> CreativeUtil, Legal Team</li>
                  </ul>

                  <p className="text-sm text-muted-foreground mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    This Terms of Service is effective as of January 1, 2025. By using CreativeUtil, you agree to be bound by these terms.
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

export default Terms;
