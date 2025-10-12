import React from "react";
import Card from "../Card";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // 👈 nuevo import

const MOCK = [
  {
    id: 1,
    title: "PROGRAMACIÓN PYTHON",
    description:
      "ENSEÑO PROGRAMACIÓN EN PYTHON BÁSICO, ES UNO DE LOS IDIOMAS DE PROGRAMACIÓN CON MÁS CAMPO Y MÁS ÚTILES",
    rating: 4.8,
    imageUrl: "https://via.placeholder.com/96?text=Py",
    liked: false,
  },
  {
    id: 2,
    title: "CLASES DE MÚSICA",
    description:
      "DOMINO DIFERENTES TIPOS DE INSTRUMENTOS DE CUERDA Y DE AIRE",
    rating: 4.2,
    imageUrl: "https://via.placeholder.com/96?text=Mu",
    liked: false,
  },
  {
    id: 3,
    title: "CLASES DE MÚSICA",
    description:
      "DOMINO DIFERENTES TIPOS DE INSTRUMENTOS DE CUERDA Y DE AIRE",
    rating: 4.2,
    imageUrl: "https://via.placeholder.com/96?text=Mu",
    liked: false,
  },
  {
    id: 4,
    title: "CLASES DE MÚSICA",
    description:
      "DOMINO DIFERENTES TIPOS DE INSTRUMENTOS DE CUERDA Y DE AIRE",
    rating: 4.2,
    imageUrl: "https://via.placeholder.com/96?text=Mu",
    liked: false,
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h2 className="home__title">Home</h2>

      {MOCK.map((item) => (
        <Card
          key={item.id}
          imageUrl={item.imageUrl}
          title={item.title}
          description={item.description}
          rating={item.rating}
          liked={item.liked}
          onLike={(nuevo) => console.log("like?", item.id, nuevo)}
          onViewProfile={() => navigate(`/profile/${item.id}`)}
        />
      ))}
    </div>
  );
}
