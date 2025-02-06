"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { allPlugins } from "../../../data/plugins";
import { PluginModal } from "./components/PluginModal";
import { Plugin, GridItem } from "./utils/types";
import { useSearch } from "./context/SearchContext";

const RADIUS = 60;
const CENTER_ZOOM = 1.3;
const ZOOM_ZONE_SIZE = 500;

const SPACING = RADIUS * 0.7;
const HEX_RATIO = Math.sqrt(3) / 2;

const PASTEL_COLORS = ["#0A0A0A"];

const APPS = allPlugins;

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Plugin | null>(null);
  const { searchQuery } = useSearch();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const [mousePosition, setMousePosition] = useState({
    x: windowSize.width / 2,
    y: windowSize.height / 2,
  });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [frozenMousePosition, setFrozenMousePosition] = useState({
    x: windowSize.width / 2,
    y: windowSize.height / 2,
  });
  const [expandedActions, setExpandedActions] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    setIsClient(true);

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const generateHoneycombPositions = (
    totalItems: number,
    width: number,
    height: number,
  ) => {
    const positions = [];
    const hexWidth = SPACING * 2;
    const hexHeight = hexWidth * HEX_RATIO;
    const ringsNeeded = Math.ceil(Math.sqrt(totalItems / 3)) + 2;

    for (let q = -ringsNeeded; q <= ringsNeeded; q++) {
      for (let r = -ringsNeeded; r <= ringsNeeded; r++) {
        const x = hexWidth * (q + r / 2);
        const y = hexHeight * r;

        if (Math.abs(q) + Math.abs(r) + Math.abs(-q - r) <= 2 * ringsNeeded) {
          positions.push({
            x: width / 2 + x,
            y: height / 2 + y,
          });
        }
      }
    }
    return positions
      .sort((a, b) => {
        const distA = Math.sqrt(
          Math.pow(a.x - width / 2, 2) + Math.pow(a.y - height / 2, 2),
        );
        const distB = Math.sqrt(
          Math.pow(b.x - width / 2, 2) + Math.pow(b.y - height / 2, 2),
        );
        return distA - distB;
      })
      .slice(0, totalItems);
  };

  const circles = useMemo(() => {
    if (!isClient) return [];

    const grid: GridItem[] = [];
    const totalApps = APPS.length;
    const totalDecorativeCircles = 390;
    const totalItems = totalApps + totalDecorativeCircles;
    const positions = generateHoneycombPositions(
      totalItems,
      windowSize.width,
      windowSize.height,
    );
    APPS.forEach((app, index) => {
      grid.push({
        ...app,
        x: positions[index].x,
        y: positions[index].y,
      });
    });
    for (let i = totalApps; i < totalItems; i++) {
      const position = positions[i];
      grid.push({
        id: `decorative-${i}`,
        name: `App ${i}`,
        color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
        x: position.x,
        y: position.y,
      });
    }
    return grid;
  }, [isClient, windowSize]);

  const visibleCircles = useMemo(() => {
    if (!searchQuery) return circles;
    return circles.filter((circle) =>
      circle.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [circles, searchQuery]);

  const handleCirclePress = (circle: GridItem, event: React.MouseEvent) => {
    if ("actions" in circle) {
      setSelectedCircle(circle);
      setIsModalVisible(true);
      setFrozenMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const renderItem = (circle: GridItem) => {
    if (circle.image) {
      return (
        <div className="w-full h-full rounded-full">
          <Image
            src={circle.image}
            alt={circle.name}
            width={RADIUS}
            height={RADIUS}
            className="rounded-full"
          />
        </div>
      );
    }
    return (
      <div
        className="w-full h-full rounded-full"
        style={{ backgroundColor: circle.color }}
      />
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left - dragPosition.x;
      const relativeY = e.clientY - rect.top - dragPosition.y;
      setMousePosition({ x: relativeX, y: relativeY });
    },
    [dragPosition],
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      <div className="relative w-full h-full px-5">
        {/* Draggable Grid */}
        <motion.div
          drag
          dragConstraints={{
            left: -250,
            right: 250,
            top: -250,
            bottom: 250,
          }}
          style={{ x: dragPosition.x, y: dragPosition.y }}
          animate={{
            x: dragPosition.x,
            y: dragPosition.y,
          }}
          onDragStart={() => {
            setIsDragging(true);
            if (mousePosition) {
              setFrozenMousePosition(mousePosition);
            }
          }}
          onDragEnd={(event, info) => {
            setDragPosition((prev) => ({
              x: prev.x + info.offset.x,
              y: prev.y + info.offset.y,
            }));
            setIsDragging(false);
          }}
          className="absolute w-full h-full"
        >
          {visibleCircles.map((circle) => {
            const activePosition =
              isDragging || isModalVisible
                ? frozenMousePosition
                : mousePosition;
            const circleCenter = {
              x: circle.x + RADIUS / 2,
              y: circle.y + RADIUS / 2,
            };
            const distanceFromMouse = Math.sqrt(
              Math.pow(circleCenter.x - activePosition.x, 2) +
                Math.pow(circleCenter.y - activePosition.y, 2),
            );
            const scale =
              distanceFromMouse < ZOOM_ZONE_SIZE / 2
                ? 1 +
                  (CENTER_ZOOM - 1) *
                    Math.max(1 - distanceFromMouse / (ZOOM_ZONE_SIZE / 2))
                : 1;
            return (
              <motion.div
                key={circle.id}
                onClick={(e) => handleCirclePress(circle, e)}
                style={{
                  position: "absolute",
                  left: circle.x,
                  top: circle.y,
                  width: RADIUS,
                  height: RADIUS,
                  borderRadius: "50%",
                  overflow: "visible",
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                }}
                whileHover={{
                  transition: { duration: 0.2 },
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {renderItem(circle)}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Modal */}
        <PluginModal
          plugin={selectedCircle}
          isVisible={isModalVisible}
          expandedActions={expandedActions}
          onClose={() => {
            setIsModalVisible(false);
            setExpandedActions(new Set());
          }}
        />
      </div>
    </div>
  );
}
