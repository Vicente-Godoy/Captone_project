import PostCard from "./PostCard";

export default function PostList({
    posts = [],
    onLike,
    onViewProfile,
    expandedId,
    onToggle,
}) {
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
            expanded={expandedId === p.id}
            onToggle={() => onToggle?.(p)}
            onLike={(nextLiked) => onLike?.(p, nextLiked)}
            onViewProfile={() => onViewProfile?.(p)}
        />
    ));
}
