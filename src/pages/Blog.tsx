import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Twitter, Facebook, Linkedin } from "lucide-react";
import bgImage from "@/assets/bg-1.png";
import { blogPosts, BlogPost } from "@/config/blog";

const Blog = () => {
  const shareUrl = window.location.href;
  const shareTitle = "CreativeUtil Blog - Web Development & Design Insights";

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Blog - CreativeUtil | Web Development & Design Insights</title>
        <meta name="description" content="Read our latest blog posts on web development, design tips, and tool tutorials. Learn CSS animations, responsive design, and more with CreativeUtil." />
        <meta name="keywords" content="blog, web development, design, CSS, responsive design, color theory, CreativeUtil" />
        <link rel="canonical" href="https://creativeutil.com/blog" />
        <meta property="og:title" content="Blog - CreativeUtil" />
        <meta property="og:description" content="Web development and design insights from CreativeUtil." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://creativeutil.com/blog" />
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
        <div className="fixed top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10" />

        <Header />

        <main className="flex-1 pt-32 pb-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                CreativeUtil Blog
              </h1>
              <p className="text-xl text-foreground max-w-3xl mx-auto font-semibold">
                Insights, tutorials, and tips for web development and design. Learn from our tools and community.
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <Button variant="outline" onClick={shareOnTwitter} className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Share on Twitter
                </Button>
                <Button variant="outline" onClick={shareOnFacebook} className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Share on Facebook
                </Button>
                <Button variant="outline" onClick={shareOnLinkedIn} className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  Share on LinkedIn
                </Button>
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {blogPosts.map((post: BlogPost) => (
                <Card key={post.id} className="glass hover:scale-105 transition-transform duration-300 border-2 hover:border-primary/50 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-6xl opacity-50">📝</div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString()}
                      <User className="h-4 w-4 ml-2" />
                      {post.author}
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      <Link to={`/blog/${post.id}`}>{post.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-4">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{post.readTime}</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/blog/${post.id}`} className="flex items-center gap-1">
                          Read More <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center glass rounded-3xl p-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
              <p className="text-lg text-foreground mb-8">
                Explore our tools and start building amazing web experiences.
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                <Link to="/tools">Explore Tools</Link>
              </Button>
            </div>
          </div>
        </main>

        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default Blog;