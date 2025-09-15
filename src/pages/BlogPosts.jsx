import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, published_at, featured_image")
        .order("published_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error.message);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <div className="text-center py-10">Loading posts...</div>;
  if (posts.length === 0)
    return <div className="text-center text-gray-600">No posts available</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Blog Posts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4">
            <div className="mb-2 flex justify-center">
              {post.featured_image && (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded mb-2"
                />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              <Link
                to={`/admin/blog/${post.slug}`}
                className="text-blue-600 hover:underline hover:text-blue-800"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(post.published_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPosts;
