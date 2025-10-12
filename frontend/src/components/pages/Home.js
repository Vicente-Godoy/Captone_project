import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import PostList from "../post/PostList";
import { POSTS_MOCK } from "../../fixtures/PostsMocks";



export default function Home() {
  const navigate = useNavigate();
  const posts = POSTS_MOCK; // hoy MOCK; mañana Firebase

  return (
    <div className="home">
      <h2 className="home__title">Home</h2>
      <PostList
        posts={posts}
        onLike={(p) => console.log("like?", p.id)}
        onViewProfile={(p) => navigate(`/profile/${p.ownerUid ?? p.id}`)}
      />
    </div>
  );
}
