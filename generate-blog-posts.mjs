import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDir = path.join(process.cwd(), 'src', 'blog');

const files = fs.readdirSync(blogDir);

const blogPosts = files.map(filename => {
  const filePath = path.join(blogDir, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  // Generate title from filename if not provided
  const title = data.title || filename.replace(/\.mdx?$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Generate excerpt from content if not provided
  const excerpt = data.excerpt || content.split('\n').find(line => line.trim() && !line.startsWith('#'))?.substring(0, 150) + '...' || 'Learn more about this tool...';

  // Estimate read time (roughly 200 words per minute)
  const wordCount = content.split(/\s+/).length;
  const readTime = `${Math.ceil(wordCount / 200)} min read`;

  // Generate tags from filename if not provided
  const tags = data.tags || [filename.split('-')[0].toUpperCase()];

  return {
    id: filename.replace(/\.mdx?$/, ''),
    title,
    excerpt,
    author: data.author || 'CreativeUtil Team',
    date: data.date || '2024-01-01',
    readTime,
    tags,
    image: `/assets/blog/${filename.replace(/\.mdx?$/, '.jpg')}`,
    content,
  };
});

const output = `export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  image: string;
  content: string;
}

export const blogPosts: BlogPost[] = ${JSON.stringify(blogPosts, null, 2)};`;

const outputPath = path.join(process.cwd(), 'src', 'config', 'blog.ts');
fs.writeFileSync(outputPath, output);

console.log('Successfully created src/config/blog.ts with', blogPosts.length, 'blog posts');
