import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface BlogPost {
  slug: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  headerImage: string;
  featured: boolean;
  tags: string[];
}

const postsDirectory = path.join(process.cwd(), 'content/blog');

function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'));
}

function getPostBySlugFromFile(slug: string): BlogPost | undefined {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
      return undefined;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Convert Markdown to HTML
    const htmlContent = marked(content);

    return {
      slug,
      title: data.title || '',
      summary: data.summary || '',
      content: htmlContent as string,
      author: data.author || '',
      date: data.date || '',
      headerImage: data.headerImage || '',
      featured: data.featured || false,
      tags: data.tags || [],
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return undefined;
  }
}

export function getFeaturedPosts(): BlogPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map(filename => {
      const slug = filename.replace(/\.mdx$/, '');
      return getPostBySlugFromFile(slug);
    })
    .filter((post): post is BlogPost => post !== undefined)
    .filter(post => post.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return posts;
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map(filename => {
      const slug = filename.replace(/\.mdx$/, '');
      return getPostBySlugFromFile(slug);
    })
    .filter((post): post is BlogPost => post !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getPostBySlugFromFile(slug);
}
