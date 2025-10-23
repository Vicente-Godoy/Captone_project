// src/components/post/PostList.js
import React from "react";
import PostCard from "./PostCard";

export default function PostList({ posts = [], onLike, onViewProfile }) {
    if (!posts.length) {
        return (
            <div style={{ textAlign: "center", color: "#666" }}>
                Aún no hay publicaciones.
            </div>
        );
    }
    return posts.map((p) => (
        <PostCard
            key={p.id}
            post={p}
            onLike={() => onLike?.(p)}
            onViewProfile={() => onViewProfile?.(p)}
        />
    ));
}
