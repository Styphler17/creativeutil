import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageLoader } from '@/components/PageLoader';
import { tools } from '@/config/tools';
import { toolComponents } from '@/config/tools';

const ToolPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const tool = tools.find(t => t.id === id);
    if (tool) {
      document.title = `${tool.title} - CreativeUtil`;
    }
  }, [id]);

  const tool = tools.find(t => t.id === id);
  if (!tool) {
    navigate('/tools');
    return null;
  }

  const ToolComponent = toolComponents[id as keyof typeof toolComponents];

  return (
    <>
      <Helmet>
        <title>{tool.title} - CreativeUtil</title>
        <meta name="description" content={`${tool.description} - Free online tool at CreativeUtil. Professional web development and design utilities.`} />
        <meta name="keywords" content={`${tool.title}, ${tool.description}, web development tool, design tool, CreativeUtil, free online tool`} />
        <meta name="author" content="CreativeUtil" />
        <link rel="canonical" href={`https://creativeutil.com/tools/${tool.id}`} />
        <meta property="og:title" content={`${tool.title} - CreativeUtil`} />
        <meta property="og:description" content={`${tool.description} - Free online tool at CreativeUtil.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://creativeutil.com/tools/${tool.id}`} />
        <meta property="og:image" content={`https://creativeutil.com/assets/tools/${tool.id}-og-image.webp`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@CreativeUtil" />
        <meta name="twitter:title" content={`${tool.title} - CreativeUtil`} />
        <meta name="twitter:description" content={`${tool.description} - Free online tool at CreativeUtil.`} />
        <meta name="twitter:image" content={`https://creativeutil.com/assets/tools/${tool.id}-og-image.webp`} />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": tool.title,
            "description": tool.description,
            "url": `https://creativeutil.com/tools/${tool.id}`,
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "provider": {
              "@type": "Organization",
              "name": "CreativeUtil",
              "url": "https://creativeutil.com/"
            }
          })}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 opacity-40 pattern-bg" />

      {/* Gradient Overlays */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

      {/* Branded Accent Shapes */}
      <div className="fixed top-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full opacity-20 blur-lg -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-tl from-accent to-primary rounded-full opacity-20 blur-xl -z-10" />

      <Header />

      <main className="flex-1 pt-32 pb-16 px-4 md:px-6">
        <section className="max-w-7xl mx-auto">
          <Breadcrumb />
          <Suspense fallback={<PageLoader message="Loading CreativeUtil tool..." />}>
            <ToolComponent />
          </Suspense>
        </section>
      </main>

      <Footer />

      <BackToTop />
      </div>
    </>
  );
};

export default ToolPage;
