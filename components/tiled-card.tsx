"use client";
import type { SpringOptions } from "motion/react";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface TiltedCardProps {
  imageSrc: React.ComponentProps<"img">["src"];
  altText?: string;
  height?: React.CSSProperties["height"];
  width?: React.CSSProperties["width"];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  overlayContent?: React.ReactNode;
  dead?: boolean;
}

const springValues: SpringOptions = {
  damping: 10,
  stiffness: 100,
  mass: 1,
};

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  width = 240,
  height = 360,
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  overlayContent = null,
  dead = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1,
  });

  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  return (
    <figure
      ref={ref}
      className="relative w-full h-full perspective-midrange flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        height: height,
        width: width,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative transform-3d"
        style={{
          width: width,
          height: height,
          rotateX,
          rotateY,
          scale,
        }}
      >
        <motion.img
          src={imageSrc}
          draggable={false}
          alt={altText}
          className="absolute sepia top-0 left-0 object-cover rounded-[15px] will-change-transform transform-[translateZ(0)]"
          style={{
            width: width,
            height: height,
          }}
        />

        {dead && (
          <motion.div className="absolute z-100 left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 font-bold text-xl text-danger rotate-[-15deg]">
            Погиб
          </motion.div>
        )}
        {overlayContent && (
          <motion.div className="absolute z-100 left-1/2 bottom-2 -translate-x-1/2 font-medium text-lg">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>
    </figure>
  );
}
