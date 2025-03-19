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
import { Placeholder, Position } from "./utils/types";
import { GRID_CONFIG } from "./constants/gridConfig";

// Configuration pour le zoom minimal et l'affichage de tous les plugins
const ZOOM_CONFIG = {
  MIN_SCALE: 0.1, // Niveau de zoom minimal configurable
  ALL_PLUGINS_SCALE: 0.3, // Seuil de zoom pour afficher tous les plugins
  MOBILE_MIN_SCALE: 0.05, // Niveau de zoom minimal pour mobile
  MOBILE_ALL_PLUGINS_SCALE: 0.15, // Seuil de zoom pour mobile
};

const APPS = allPlugins;
const VIEWPORT_MARGIN = 300; // Marge supplémentaire en pixels autour de la viewport

// Fonction utilitaire pour limiter la fréquence d'exécution d'une fonction
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

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
  const [viewport, setViewport] = useState({
    left: 0,
    top: 0,
    right: windowSize.width,
    bottom: windowSize.height,
  });
  // État pour stocker les cercles visibles précédents lors des transitions de zoom
  const [previousVisibleCircles, setPreviousVisibleCircles] = useState<
    GridItem[]
  >([]);
  // État pour suivre si on est en train de faire une transition
  const [isZooming, setIsZooming] = useState(false);
  // Timer pour la transition de zoom
  const zoomTimerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseMoveThrottleRef = useRef<
    ((e: React.MouseEvent) => void) | undefined
  >(undefined);
  const prevZoomScaleRef = useRef<number>(1);

  const [isMobile, setIsMobile] = useState(false);

  // Initialiser le throttle une seule fois
  useEffect(() => {
    mouseMoveThrottleRef.current = throttle((e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX =
        (e.clientX - rect.left + transform.positionX) / transform.scale;
      const relativeY =
        (e.clientY - rect.top + transform.positionY) / transform.scale;
      setMousePosition({ x: relativeX, y: relativeY });
    }, GRID_CONFIG.MOUSE_MOVE_THROTTLE);
  }, [transform]);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setWindowSize({ width: newWidth, height: newHeight });
      checkMobile();

      const margin =
        transform.scale <=
        (isMobile
          ? ZOOM_CONFIG.MOBILE_ALL_PLUGINS_SCALE
          : ZOOM_CONFIG.ALL_PLUGINS_SCALE)
          ? VIEWPORT_MARGIN * (isMobile ? 4 : 8)
          : transform.scale <= 0.5
            ? VIEWPORT_MARGIN * (isMobile ? 2 : 4)
            : VIEWPORT_MARGIN;

      const visibleWidth = newWidth / transform.scale;
      const visibleHeight = newHeight / transform.scale;

      setViewport({
        left: transform.positionX / transform.scale - margin,
        top: transform.positionY / transform.scale - margin,
        right: transform.positionX / transform.scale + visibleWidth + margin,
        bottom: transform.positionY / transform.scale + visibleHeight + margin,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [transform.positionX, transform.positionY, transform.scale, isMobile]);

  // Mettre à jour la viewport lorsque la transformation change
  useEffect(() => {
    const margin =
      transform.scale <=
      (isMobile
        ? ZOOM_CONFIG.MOBILE_ALL_PLUGINS_SCALE
        : ZOOM_CONFIG.ALL_PLUGINS_SCALE)
        ? VIEWPORT_MARGIN * (isMobile ? 4 : 8)
        : transform.scale <= 0.5
          ? VIEWPORT_MARGIN * (isMobile ? 2 : 4)
          : VIEWPORT_MARGIN;

    const visibleWidth = windowSize.width / transform.scale;
    const visibleHeight = windowSize.height / transform.scale;

    setViewport({
      left: transform.positionX / transform.scale - margin,
      top: transform.positionY / transform.scale - margin,
      right: transform.positionX / transform.scale + visibleWidth + margin,
      bottom: transform.positionY / transform.scale + visibleHeight + margin,
    });

    if (transform.scale !== prevZoomScaleRef.current) {
      setIsZooming(true);

      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }

      zoomTimerRef.current = setTimeout(() => {
        setIsZooming(false);
        zoomTimerRef.current = null;
      }, 500);
    }

    prevZoomScaleRef.current = transform.scale;
  }, [transform, windowSize, isMobile]);

  // Nettoyer le timer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }
    };
  }, []);

  const allCircles = useMemo(() => {
    if (!isClient) return [];

    const config = {
      spacing: 45, // Adjust based on your needs
      hexRatio: 0.866, // Math.sqrt(3)/2 for regular hexagons
    };

    const grid: GridItem[] = [];
    // Augmenter le rayon pour créer plus de positions pour tous les plugins
    const positions = generateHoneycombPositions(
      3500, // Augmenté de 2500 à 3500 pour avoir plus de positions
      windowSize.width,
      windowSize.height,
      config,
    );
    APPS.forEach((app, index) => {
      if (index < positions.length) {
        grid.push({
          ...app,
          x: positions[index].x,
          y: positions[index].y,
        });
      }
    });
    for (let i = APPS.length; i < positions.length; i++) {
      const placeholder: Placeholder & Position = {
        id: `placeholder-${i}`,
        name: `Placeholder ${i}`,
        x: positions[i].x,
        y: positions[i].y,
        color: "#0A0A0A", // You can adjust this default color
      };
      grid.push(placeholder);
    }
    return grid;
  }, [isClient, windowSize]);

  const filteredCircles = useMemo(() => {
    if (!searchQuery) return allCircles;
    return allCircles.filter((circle) =>
      circle.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allCircles, searchQuery]);

  // Calculer la limite dynamique d'éléments visibles en fonction du niveau de zoom
  const dynamicVisibleLimit = useMemo(() => {
    // Plus le zoom est faible (scale petit), plus on affiche d'éléments
    if (transform.scale <= ZOOM_CONFIG.ALL_PLUGINS_SCALE) {
      // À faible zoom, montrer tous les éléments
      return Infinity;
    } else if (transform.scale <= 0.5) {
      // Zoom intermédiaire, augmenter progressivement la limite
      return GRID_CONFIG.MAX_VISIBLE_ITEMS * 3;
    } else {
      // Zoom normal, utiliser la limite standard
      return GRID_CONFIG.MAX_VISIBLE_ITEMS;
    }
  }, [transform.scale]);

  // Calculer les cercles actuellement visibles dans la viewport
  const currentVisibleCircles = useMemo(() => {
    if (!isClient) return [];

    // Si on est en dessous du seuil de zoom, afficher tous les cercles sans filtrage par viewport
    if (transform.scale <= ZOOM_CONFIG.ALL_PLUGINS_SCALE) {
      // En dézoom important, on affiche tous les plugins, mais on les trie par distance
      // au centre de l'écran pour un meilleur rendu
      const viewportCenterX = (viewport.left + viewport.right) / 2;
      const viewportCenterY = (viewport.top + viewport.bottom) / 2;

      // Copier les cercles pour ne pas modifier l'original
      const allCirclesCopy = [...filteredCircles];

      // Ajouter la distance au centre pour chaque cercle
      allCirclesCopy.forEach((circle) => {
        const distanceToCenter = Math.sqrt(
          Math.pow(circle.x - viewportCenterX, 2) +
            Math.pow(circle.y - viewportCenterY, 2),
        );
        (circle as any).distanceToCenter = distanceToCenter;
      });

      // Trier par distance au centre
      allCirclesCopy.sort(
        (a, b) => (a as any).distanceToCenter - (b as any).distanceToCenter,
      );

      return allCirclesCopy;
    }

    // Sinon, filtrer les cercles dans la viewport comme avant
    const inViewportCircles = filteredCircles.filter((circle) => {
      // Calcul de distance au centre de la viewport pour un affichage plus naturel
      const viewportCenterX = (viewport.left + viewport.right) / 2;
      const viewportCenterY = (viewport.top + viewport.bottom) / 2;

      // Utiliser une marge de tolérance adaptée au niveau de zoom
      const margin = transform.scale <= 0.5 ? 300 : 100;

      // Vérifier si le cercle est dans la viewport avec marge
      const isInViewport =
        circle.x >= viewport.left - margin &&
        circle.x <= viewport.right + margin &&
        circle.y >= viewport.top - margin &&
        circle.y <= viewport.bottom + margin;

      // Si pas dans la viewport, ne pas afficher
      if (!isInViewport) return false;

      // Calculer la distance au centre
      const distanceToCenter = Math.sqrt(
        Math.pow(circle.x - viewportCenterX, 2) +
          Math.pow(circle.y - viewportCenterY, 2),
      );

      // Ajouter la distance pour trier plus tard
      (circle as any).distanceToCenter = distanceToCenter;

      return true;
    });

    // Trier par distance au centre pour un affichage plus naturel
    inViewportCircles.sort(
      (a, b) => (a as any).distanceToCenter - (b as any).distanceToCenter,
    );

    // Limiter le nombre de cercles affichés pour des performances optimales
    // Utiliser la limite dynamique basée sur le niveau de zoom
    return inViewportCircles.slice(0, dynamicVisibleLimit);
  }, [
    filteredCircles,
    viewport,
    isClient,
    dynamicVisibleLimit,
    transform.scale,
  ]);

  // Mettre à jour les cercles précédents quand les cercles actuels changent
  // mais seulement quand on n'est pas en train de zoomer
  useEffect(() => {
    if (!isZooming) {
      setPreviousVisibleCircles(currentVisibleCircles);
    }
  }, [currentVisibleCircles, isZooming]);

  // Cercles à afficher: utiliser les précédents lors du zoom pour une transition plus douce
  const visibleCircles = useMemo(() => {
    // Si on est en train de zoomer ou dézoomer, conserver les cercles précédents
    // pour éviter le recadrage soudain
    if (isZooming) {
      // Combiner et dédupliquer les cercles actuels et précédents
      const allCircleIds = new Set<string>();
      const combinedCircles: GridItem[] = [];

      // Ajouter d'abord les cercles actuels
      for (const circle of currentVisibleCircles) {
        if (!allCircleIds.has(circle.id)) {
          allCircleIds.add(circle.id);
          combinedCircles.push(circle);
        }
      }

      // Si on zoome (scale augmente), privilégier les cercles actuels
      // Si on dézoome (scale diminue), inclure aussi les cercles précédents
      if (transform.scale < prevZoomScaleRef.current) {
        // On est en train de dézoomer, inclure également les précédents
        for (const circle of previousVisibleCircles) {
          if (!allCircleIds.has(circle.id)) {
            allCircleIds.add(circle.id);
            combinedCircles.push(circle);
          }
        }
      }

      return combinedCircles;
    }

    // Sinon, retourner les cercles actuellement visibles
    return currentVisibleCircles;
  }, [
    currentVisibleCircles,
    previousVisibleCircles,
    isZooming,
    transform.scale,
  ]);

  const handleCirclePress = useCallback(
    (circle: GridItem) => {
      if (!hasPanned && "actions" in circle) {
        setSelectedCircle(circle);
        setIsModalVisible(true);
        setIsFrozen(true);
        setFrozenMousePosition(mousePosition);
      }
      setHasPanned(false);
    },
    [hasPanned, mousePosition],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (mouseMoveThrottleRef.current) {
      mouseMoveThrottleRef.current(e);
    }
  }, []);

  const handleTransformChange = useCallback(
    (newTransform: {
      state: { scale: number; positionX: number; positionY: number };
    }) => {
      setTransform({
        scale: newTransform.state.scale,
        positionX: -newTransform.state.positionX,
        positionY: -newTransform.state.positionY,
      });
    },
    [],
  );

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setExpandedActions(new Set());
    setIsFrozen(false);
  }, []);

  // Calcul du message d'info sur les plugins
  const pluginInfo = useMemo(() => {
    const isShowingAll =
      transform.scale <= ZOOM_CONFIG.ALL_PLUGINS_SCALE ||
      visibleCircles.length === APPS.length;

    return {
      visible: visibleCircles.length,
      total: APPS.length,
      isShowingAll,
      isZooming,
      isZoomingIn: transform.scale > prevZoomScaleRef.current,
      isZoomingOut: transform.scale < prevZoomScaleRef.current,
    };
  }, [visibleCircles.length, APPS.length, transform.scale, isZooming]);

  // Gérer les transitions de double-clic pour le zoom
  const handleDoubleClick = useCallback(() => {
    // Sauvegarde temporaire des cercles visibles actuels pour la transition
    setPreviousVisibleCircles(currentVisibleCircles);
    setIsZooming(true);

    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
    }

    zoomTimerRef.current = setTimeout(() => {
      setIsZooming(false);
      zoomTimerRef.current = null;
    }, 700); // Temps plus long pour le double-clic car l'animation est plus longue
  }, [currentVisibleCircles]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        if (touch && mouseMoveThrottleRef.current) {
          mouseMoveThrottleRef.current({
            clientX: touch.clientX,
            clientY: touch.clientY,
          } as React.MouseEvent);
        }
      }}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      <TransformWrapper
        initialScale={1}
        minScale={
          isMobile ? ZOOM_CONFIG.MOBILE_MIN_SCALE : ZOOM_CONFIG.MIN_SCALE
        }
        maxScale={1}
        centerOnInit={true}
        doubleClick={{
          disabled: isMobile, // Désactiver le double-clic sur mobile
          step: 0.7,
          mode: "zoomIn",
          animationTime: 300,
        }}
        pinch={{
          // Activer le pinch-to-zoom sur mobile
          disabled: false,
          step: 5,
        }}
        limitToBounds={false}
        onTransformed={(e) => {
          handleTransformChange(e);
          if (e.state.scale !== prevZoomScaleRef.current) {
            handleDoubleClick();
          }
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
            <motion.div
              className="absolute w-full h-full"
              initial={false}
              layout={false}
            >
              {visibleCircles.map((circle, index) => {
                // Assurer que chaque cercle a un ID unique pour React
                const uniqueKey = `${circle.id}-${index}`;
                return (
                  <Circle
                    key={uniqueKey}
                    circle={circle}
                    mousePosition={
                      isFrozen ? frozenMousePosition : mousePosition
                    }
                    onPress={handleCirclePress}
                  />
                );
              })}
            </motion.div>
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Modal avec ajustements pour mobile */}
      <PluginModal
        plugin={selectedCircle}
        isVisible={isModalVisible}
        expandedActions={expandedActions}
        onClose={handleModalClose}
        isMobile={isMobile}
      />
    </div>
  );
}
