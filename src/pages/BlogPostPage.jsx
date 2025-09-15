import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import BlogPost from '../components/BlogPost';
import { toast } from 'react-hot-toast';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setPost(data || null);
    } catch (error) {
      console.error('Error fetching blog post:', error.message);
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  if (loading) return <div className="text-center py-10">Loading post...</div>;
  if (!post) return <div className="text-center text-red-500">Post not found</div>;

  return (
    <BlogPost
      title={post.title}
      content={post.content}
      image={post.featured_image}
      author={post.author || 'Ajay Dhangar'}
      date={post.published_at}
    />
  );
};

export default BlogPostPage;
