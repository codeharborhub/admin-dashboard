import React from "react";
import BlogPosts from "../pages/BlogPosts";

const BlogPost = ({ title, content, image, author, date }) => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500">
          By <span className="font-medium">{author}</span> on{" "}
          {new Date(date).toLocaleDateString()}
        </p>
      </div>

      {image && (
        <div className="mb-6">
          <img
            src={image}
            alt={title}
            className="w-full h-auto rounded-lg shadow"
          />
        </div>
      )}

      <div
        className="prose prose-lg max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="mt-10 bg-gray-100 p-4 rounded-lg">
        <BlogPosts />
      </div>
    </div>
  );
};

export default BlogPost;
