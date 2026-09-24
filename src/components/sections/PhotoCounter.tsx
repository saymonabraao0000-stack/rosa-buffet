"use client";

import { useEffect, useState } from "react";

interface PhotoCounterProps {
  initialCount: number;
}

export default function PhotoCounter({ initialCount }: PhotoCounterProps) {
  const [total, setTotal] = useState(initialCount);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch("/api/fotos");
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.fotos)) {
          setTotal(initialCount + data.fotos.length);
        }
      } catch (error) {
        // API falhar, mantém o número estático
        console.error("Failed to fetch photos:", error);
      }
    };

    fetchPhotos();
  }, [initialCount]);

  return <>{total}</>;
}
