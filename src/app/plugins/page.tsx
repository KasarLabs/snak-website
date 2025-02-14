"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { allPlugins } from "../../../data/plugins";
import { PluginModal } from "./components/PluginModal";
import { Plugin, GridItem } from "./utils/types";
import { useSearch } from "./context/SearchContext";
import { generateHoneycombPositions } from "./utils/honeycomb";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Circle from "./components/Circle";

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
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenMousePosition, setFrozenMousePosition] = useState({
    x: windowSize.width / 2,
    y: windowSize.height / 2,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      setIsFrozen(true);
      setFrozenMousePosition(mousePosition);
    }
    setHasPanned(false);
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
            <motion.div className="absolute w-full h-full">
              {visibleCircles.map((circle) => (
                <Circle
                  key={circle.id}
                  circle={circle}
                  mousePosition={isFrozen ? frozenMousePosition : mousePosition}
                  onPress={handleCirclePress}
                />
              ))}
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
          setIsFrozen(false);
        }}
      />
    </div>
  );
}
