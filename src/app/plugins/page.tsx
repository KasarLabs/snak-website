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
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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

  const [expandedActions, setExpandedActions] = useState<Set<number>>(
    new Set(),
  );
  const [transform, setTransform] = useState({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });
  const [hasPanned, setHasPanned] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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
    const totalDecorativeCircles = 400;
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

  const handleCirclePress = (circle: GridItem) => {
    if (!hasPanned && "actions" in circle) {
      setSelectedCircle(circle);
      setIsModalVisible(true);
    }
    setHasPanned(false);
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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX =
        (e.clientX - rect.left + transform.positionX) / transform.scale;
      const relativeY =
        (e.clientY - rect.top + transform.positionY) / transform.scale;
      setMousePosition({ x: relativeX, y: relativeY });
    },
    [transform],
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.1}
        maxScale={1}
        centerOnInit={true}
        doubleClick={{ disabled: false, step: 0.7 }}
        limitToBounds={false}
        onTransformed={(e) => {
          setTransform({
            scale: e.state.scale,
            positionX: -e.state.positionX,
            positionY: -e.state.positionY,
          });
        }}
        onPanningStart={() => {
          setHasPanned(false);
        }}
        onPanning={() => {
          setHasPanned(true);
        }}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full"
        >
          <div className="relative w-full h-full">
            {/* Draggable Grid */}
            <motion.div className="absolute w-full h-full">
              {visibleCircles.map((circle) => {
                const circleCenter = {
                  x: circle.x + RADIUS / 2,
                  y: circle.y + RADIUS / 2,
                };
                const distanceFromMouse = Math.sqrt(
                  Math.pow(circleCenter.x - mousePosition.x, 2) +
                    Math.pow(circleCenter.y - mousePosition.y, 2),
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
                    onClick={() => handleCirclePress(circle)}
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
                      willChange: "transform",
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
          </div>
        </TransformComponent>
      </TransformWrapper>

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
  );
}
