import { GRID_CONFIG } from "../constants/gridConfig";
import { GridItem } from "../utils/types";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

interface CircleProps {
  circle: GridItem;
  mousePosition: { x: number; y: number };
  onPress: (circle: GridItem) => void;
}

const Circle = React.memo(({ circle, mousePosition, onPress }: CircleProps) => {
  const circleCenter = {
    x: circle.x + GRID_CONFIG.RADIUS / 2,
    y: circle.y + GRID_CONFIG.RADIUS / 2,
  };

  const distanceFromMouse = Math.sqrt(
    Math.pow(circleCenter.x - mousePosition.x, 2) +
      Math.pow(circleCenter.y - mousePosition.y, 2),
  );

  const scale =
    distanceFromMouse < GRID_CONFIG.ZOOM_ZONE_SIZE / 2
      ? 1 +
        (GRID_CONFIG.CENTER_ZOOM - 1) *
          Math.max(1 - distanceFromMouse / (GRID_CONFIG.ZOOM_ZONE_SIZE / 2))
      : 1;

  return (
    <motion.div
      onClick={() => onPress(circle)}
      style={{
        position: "absolute",
        left: circle.x,
        top: circle.y,
        width: GRID_CONFIG.RADIUS,
        height: GRID_CONFIG.RADIUS,
        borderRadius: "50%",
        overflow: "visible",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        willChange: "transform",
      }}
      whileHover={{
        transition: { duration: 0.2 },
      }}
    >
      <div className="w-full h-full cursor-pointer relative">
        {circle.image ? (
          <div className="w-full h-full rounded-full">
            <Image
              src={circle.image}
              alt={circle.name}
              width={GRID_CONFIG.RADIUS}
              height={GRID_CONFIG.RADIUS}
              className="rounded-full"
            />
          </div>
        ) : (
          <div
            className="w-full h-full rounded-full"
            style={{ backgroundColor: circle.color }}
          />
        )}
      </div>
    </motion.div>
  );
});

Circle.displayName = "Circle";
export default Circle;
