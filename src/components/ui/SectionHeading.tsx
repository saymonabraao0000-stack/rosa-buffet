"use client";

import { motion } from "framer-motion";

type SectionHeadingProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
};

export default function SectionHeading({
  title,
  description,
  align = "center",
  light = false,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`reveal flex flex-col gap-4 ${isCenter ? "items-center text-center" : "items-start text-left"}`}
    >
      <h2
        className={`font-display text-3xl leading-tight sm:text-4xl md:text-5xl ${
          light ? "text-cream" : "text-ink"
        } ${isCenter ? "max-w-2xl" : "max-w-xl"}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`max-w-2xl text-base leading-relaxed sm:text-lg ${
            light ? "text-cream/75" : "text-gray-dark"
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
