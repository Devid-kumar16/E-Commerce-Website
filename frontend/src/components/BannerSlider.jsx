import React, { useState, useEffect } from "react";
import "../styles/BannerSlider.css";

export default function BannerSlider({ images = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!images.length) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [images]);

  if (!images.length) return null;

  return (
    <div className="banner-wrapper">
      <img src={images[index]} alt="banner" className="banner-img" />
    </div>
  );
}
