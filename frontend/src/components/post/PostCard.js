import React from "react";
import Card from "../Card";

export default function PostCard({ post, onLike, onViewProfile }) {
    if (!post) return null;
    return (
        <Card
            imageUrl={post.imageUrl}
            title={post.title}
            description={post.description}
            rating={post.rating}
            liked={post.liked}
            onLike={onLike}
            onViewProfile={onViewProfile}
        />
    );
}
