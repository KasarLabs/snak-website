"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  Touch,
} from "react";
import Image from "next/image";
import { motion, useTransform, useSpring, useMotionValue, motionValue } from "framer-motion";
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
  const [dragPosition, setDragPosition] = useState({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [frozenMousePosition, setFrozenMousePosition] = useState({
    x: windowSize.width / 2,
    y: windowSize.height / 2,
  });
  const [expandedActions, setExpandedActions] = useState<Set<number>>(
    new Set(),
  );
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const lastTouch = useRef<Touch | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const motionX = useMotionValue(0);
	const motionY = useMotionValue(0);

  useEffect(() => {
    setIsClient(true);
    setDragPosition({
      x: -window.innerWidth * 0.025,
      y: 0,
    });
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
    if (!hasDragged) {
      if ("actions" in circle) {
        setSelectedCircle(circle);
        setIsModalVisible(true);
        setFrozenMousePosition({ x: event.clientX, y: event.clientY });
      }
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

  const applyConstraints = useCallback(
    (newX: number, newY: number) => {
      const minX = -windowSize.width * 0.4;
      const maxX = windowSize.width * 0.4;
      const minY = -windowSize.height * 0.4;
      const maxY = windowSize.height * 0.4;

      return {
        x: Math.min(Math.max(newX, minX), maxX),
        y: Math.min(Math.max(newY, minY), maxY),
      };
    },
    [windowSize],
  );

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      setHasDragged(false); // Reset drag flag on new interaction
      setDragStart({
        x: clientX - dragPosition.x,
        y: clientY - dragPosition.y,
      });
      setFrozenMousePosition(mousePosition);
    },
    [dragPosition, mousePosition],
  );

  const handleDrag = useCallback((clientX: number, clientY: number) => {
	if (!isDragging) return;

	setHasDragged(true);

	const newX = clientX - dragStart.x;
	const newY = clientY - dragStart.y;

	// Apply constraints
	const minX = -windowSize.width * 0.4;
	const maxX = windowSize.width * 0.4;
	const minY = -windowSize.height * 0.4;
	const maxY = windowSize.height * 0.4;

	motionX.set(Math.min(Math.max(newX, minX), maxX));
	motionY.set(Math.min(Math.max(newY, minY), maxY));

	// Update dragPosition less frequently
	requestAnimationFrame(() => {
	  setDragPosition({
		x: motionX.get(),
		y: motionY.get()
	  });
	});
  }, [isDragging, dragStart, windowSize]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden"
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        overscrollBehavior: "none",
      }}
    >
      <div className="relative w-full h-full">
        {/* Draggable Grid */}
        <motion.div
          drag={false} // Ensure Framer's drag is disabled
          style={{
            x: motionX,
            y: motionY,
            cursor: isDragging ? "grabbing" : "grab",
            willChange: "transform",
            touchAction: "none",
            WebkitOverflowScrolling: "touch", // Add smooth scrolling on iOS
            transform: 'translate3d(0,0,0)', // Force GPU acceleration
          }}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            document.body.style.cursor = "grabbing";
            startDrag(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (e.buttons === 1) {
              // Check if primary button is held down
              handleDrag(e.clientX, e.clientY);
            } else if (isDragging) {
              // If button was released outside the window
              document.body.style.cursor = "grab";
              endDrag();
            }
          }}
          onMouseUp={() => {
            document.body.style.cursor = "grab";
            endDrag();
          }}
          onMouseLeave={() => {
            if (isDragging) {
              document.body.style.cursor = "grab";
              endDrag();
            }
          }}
          onTouchStart={(e) => {
            e.preventDefault(); // Prevent default touch behaviors
            const touch = e.touches[0];
            lastTouch.current = touch;
            startDrag(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e) => {
            e.preventDefault(); // Prevent default touch behaviors
            const touch = e.touches[0];
            lastTouch.current = touch;
            handleDrag(touch.clientX, touch.clientY);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            lastTouch.current = null;
            endDrag();
          }}
          onContextMenu={(e) => {
            e.preventDefault(); // Empêche le menu contextuel d'apparaître
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
