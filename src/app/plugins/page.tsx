"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import { allPlugins } from "../../../data/plugins";
import { PluginModal } from "./components/PluginModal";
import type { Plugin, GridItem } from "./utils/types";
import { useSearch } from "./context/SearchContext";
import { generateHoneycombPositions } from "./utils/honeycomb";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Circle from "./components/Circle";
import { GRID_CONFIG } from "./constants/gridConfig";

// Types
interface Transform {
  scale: number;
  positionX: number;
  positionY: number;
}

interface MousePosition {
  x: number;
  y: number;
}

interface ThrottleEvent {
  clientX: number;
  clientY: number;
}

type ThrottledFunction<T = ThrottleEvent> = (arg: T) => void;

interface WindowSize {
  width: number;
  height: number;
}

interface ViewportBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface TransformState {
  state: {
    scale: number;
    positionX: number;
    positionY: number;
  };
}

// Configuration pour le zoom et l'affichage
const ZOOM_CONFIG = {
  MIN_SCALE: 0.15,
  MAX_SCALE: 1.3,
  ALL_PLUGINS_SCALE: 0.3,
  MOBILE_MIN_SCALE: 0.1,
  MOBILE_ALL_PLUGINS_SCALE: 0.2,
};

const APPS = allPlugins;
const VIEWPORT_MARGIN = 200;

function throttle(func: ThrottledFunction, limit = 16): ThrottledFunction {
  let inThrottle = false;
  let lastFunc: ThrottledFunction | null = null;

  return function (this: unknown, arg: ThrottleEvent) {
    if (!inThrottle) {
      func.apply(this, [arg]);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastFunc) {
          lastFunc.apply(this, [arg]);
          lastFunc = null;
        }
      }, limit);
    } else {
      lastFunc = () => func.apply(this, [arg]);
    }
  };
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Plugin | null>(null);
  const { searchQuery } = useSearch();
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: windowSize.width / 2,
    y: windowSize.height / 2,
  });

  const [expandedActions, setExpandedActions] = useState<Set<number>>(
    new Set(),
  );
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });
  const [hasPanned, setHasPanned] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [frozenMousePosition, setFrozenMousePosition] = useState<MousePosition>(
    {
      x: windowSize.width / 2,
      y: windowSize.height / 2,
    },
  );
  const [viewport, setViewport] = useState<ViewportBounds>({
    left: 0,
    top: 0,
    right: windowSize.width,
    bottom: windowSize.height,
  });

  // Utilisation de useRef pour éviter les re-rendus
  const visibleCirclesRef = useRef<GridItem[]>([]);
  const zoomTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseMoveThrottleRef = useRef<ThrottledFunction | undefined>(undefined);
  const prevZoomScaleRef = useRef(1);
  const [isMobile, setIsMobile] = useState(false);
  const distanceMapRef = useRef(new Map<string, number>());

  // Optimisation: utiliser useRef pour les états qui ne doivent pas déclencher de re-rendu
  const transformRef = useRef(transform);
  const viewportRef = useRef(viewport);

  // Mettre à jour les refs quand les états changent
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  // Initialiser le throttle une seule fois avec RAF
  useEffect(() => {
    mouseMoveThrottleRef.current = throttle((e: ThrottleEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX =
        (e.clientX - rect.left + transformRef.current.positionX) /
        transformRef.current.scale;
      const relativeY =
        (e.clientY - rect.top + transformRef.current.positionY) /
        transformRef.current.scale;
      setMousePosition({ x: relativeX, y: relativeY });
    }, 16); // 60fps
  }, []);

  // Fonction d'update de viewport extraite pour être réutilisable
  const updateViewport = useCallback(
    (currentTransform: Transform, size: WindowSize) => {
      const isMobileView = window.innerWidth <= 768;
      const margin =
        currentTransform.scale <=
        (isMobileView
          ? ZOOM_CONFIG.MOBILE_ALL_PLUGINS_SCALE
          : ZOOM_CONFIG.ALL_PLUGINS_SCALE)
          ? VIEWPORT_MARGIN * (isMobileView ? 2 : 4)
          : currentTransform.scale <= 0.5
            ? VIEWPORT_MARGIN * (isMobileView ? 1.5 : 2)
            : VIEWPORT_MARGIN;

      const visibleWidth = size.width / currentTransform.scale;
      const visibleHeight = size.height / currentTransform.scale;

      setViewport({
        left: currentTransform.positionX / currentTransform.scale - margin,
        top: currentTransform.positionY / currentTransform.scale - margin,
        right:
          currentTransform.positionX / currentTransform.scale +
          visibleWidth +
          margin,
        bottom:
          currentTransform.positionY / currentTransform.scale +
          visibleHeight +
          margin,
      });
    },
    [],
  );

  // Gestion du resize et détection mobile
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

      updateViewport(transformRef.current, {
        width: newWidth,
        height: newHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateViewport]);

  // Mise à jour de la viewport lors des changements de transformation
  useEffect(() => {
    updateViewport(transform, windowSize);

    if (transform.scale !== prevZoomScaleRef.current) {
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }

      zoomTimerRef.current = setTimeout(() => {
        zoomTimerRef.current = null;
      }, 300);
    }

    prevZoomScaleRef.current = transform.scale;
  }, [transform, windowSize, updateViewport]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) {
        clearTimeout(zoomTimerRef.current);
      }
    };
  }, []);

  // Génération des positions en nid d'abeille
  const allCircles = useMemo(() => {
    if (!isClient) return [];

    const config = {
      spacing: 45,
      hexRatio: 0.866,
    };

    // Optimisation: utiliser une méthode plus efficace pour générer les positions
    const positions = generateHoneycombPositions(
      2000,
      windowSize.width,
      windowSize.height,
      config,
    );

    // Créer un tableau de la taille exacte nécessaire pour éviter les redimensionnements
    const resultGrid = new Array(Math.max(APPS.length, positions.length));

    APPS.forEach((app, index) => {
      if (index < positions.length) {
        resultGrid[index] = {
          ...app,
          x: positions[index].x,
          y: positions[index].y,
        };
      }
    });

    // Remplir les positions restantes avec des placeholders
    for (let i = APPS.length; i < positions.length; i++) {
      resultGrid[i] = {
        id: `placeholder-${i}`,
        name: `Placeholder ${i}`,
        x: positions[i].x,
        y: positions[i].y,
        color: "#0A0A0A",
      };
    }

    return resultGrid.filter(Boolean);
  }, [isClient, windowSize]);

  // Filtrage par recherche
  const filteredCircles = useMemo(() => {
    if (!searchQuery) return allCircles;
    const query = searchQuery.toLowerCase();
    return allCircles.filter((circle) =>
      circle.name.toLowerCase().includes(query),
    );
  }, [allCircles, searchQuery]);

  // Calcul de la limite d'éléments visibles
  const dynamicVisibleLimit = useMemo(() => {
    if (transform.scale <= ZOOM_CONFIG.ALL_PLUGINS_SCALE) {
      return isMobile ? 150 : 300; // Limiter même à faible zoom pour les performances
    } else if (transform.scale <= 0.5) {
      return isMobile ? 75 : 150;
    } else {
      return isMobile ? 50 : GRID_CONFIG.MAX_VISIBLE_ITEMS;
    }
  }, [transform.scale, isMobile]);

  // Optimisation du calcul des cercles visibles avec une version plus performante
  const calculateVisibleCircles = useCallback(() => {
    if (!isClient) return [];

    const currentViewport = viewportRef.current;
    const currentTransform = transformRef.current;
    const distanceMap = distanceMapRef.current;

    // Vider la map de distance pour éviter des fuites de mémoire
    distanceMap.clear();

    // À faible zoom, optimiser pour le dézoom
    if (
      currentTransform.scale <=
      (isMobile
        ? ZOOM_CONFIG.MOBILE_ALL_PLUGINS_SCALE
        : ZOOM_CONFIG.ALL_PLUGINS_SCALE)
    ) {
      const viewportCenterX =
        (currentViewport.left + currentViewport.right) / 2;
      const viewportCenterY =
        (currentViewport.top + currentViewport.bottom) / 2;

      // Limiter le nombre de plugins lorsqu'on dézoome complètement
      const limitedCircles = filteredCircles.slice(0, isMobile ? 150 : 300);

      limitedCircles.forEach((circle) => {
        distanceMap.set(
          circle.id,
          Math.sqrt(
            Math.pow(circle.x - viewportCenterX, 2) +
              Math.pow(circle.y - viewportCenterY, 2),
          ),
        );
      });

      limitedCircles.sort(
        (a, b) => (distanceMap.get(a.id) || 0) - (distanceMap.get(b.id) || 0),
      );

      return limitedCircles;
    }

    // Optimisation pour Firefox/Mobile: réduire le nombre d'opérations
    const viewportCenterX = (currentViewport.left + currentViewport.right) / 2;
    const viewportCenterY = (currentViewport.top + currentViewport.bottom) / 2;

    // Utiliser une marge adaptée
    const margin = currentTransform.scale <= 0.5 ? 200 : 100;

    // Pré-allouer un tableau pour stocker les cercles dans la viewport
    const inViewportCircles = [];
    const maxCircles = Math.min(filteredCircles.length, dynamicVisibleLimit);

    // Utiliser for au lieu de filter/map pour de meilleures performances
    for (let i = 0; i < filteredCircles.length; i++) {
      const circle = filteredCircles[i];

      // Vérifier si dans la viewport
      if (
        circle.x >= currentViewport.left - margin &&
        circle.x <= currentViewport.right + margin &&
        circle.y >= currentViewport.top - margin &&
        circle.y <= currentViewport.bottom + margin
      ) {
        // Calculer la distance au centre
        const distanceToCenter = Math.sqrt(
          Math.pow(circle.x - viewportCenterX, 2) +
            Math.pow(circle.y - viewportCenterY, 2),
        );

        distanceMap.set(circle.id, distanceToCenter);
        inViewportCircles.push(circle);

        // Arrêter après avoir trouvé suffisamment de cercles
        if (inViewportCircles.length >= maxCircles) break;
      }
    }

    // Trier par distance (seulement si nécessaire)
    if (inViewportCircles.length > 1) {
      inViewportCircles.sort(
        (a, b) => (distanceMap.get(a.id) || 0) - (distanceMap.get(b.id) || 0),
      );
    }

    return inViewportCircles;
  }, [filteredCircles, dynamicVisibleLimit, isMobile, isClient]);

  // Mise à jour des cercles visibles avec une RAF pour optimiser les performances
  useEffect(() => {
    if (!isClient) return;

    // Utiliser requestAnimationFrame pour synchroniser avec le rendu du navigateur
    const updateVisibleCircles = () => {
      const newVisibleCircles = calculateVisibleCircles();
      visibleCirclesRef.current = newVisibleCircles;
      setVisibleCircles(newVisibleCircles);
    };

    // Déclencher une mise à jour immédiate
    updateVisibleCircles();
  }, [calculateVisibleCircles, viewport, transform, isClient]);

  // État visible pour le rendu
  const [visibleCircles, setVisibleCircles] = useState<GridItem[]>([]);

  // Handlers d'interaction
  const handleCirclePress = useCallback(
    (circle: GridItem) => {
      if (!hasPanned && "actions" in circle && "description" in circle) {
        setSelectedCircle(circle as Plugin);
        setIsModalVisible(true);
        setIsFrozen(true);
        setFrozenMousePosition(mousePosition);
      }
      setHasPanned(false);
    },
    [hasPanned, mousePosition],
  );

  const handleMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (mouseMoveThrottleRef.current) {
      mouseMoveThrottleRef.current({
        clientX: e.clientX,
        clientY: e.clientY,
      });
    }
  }, []);

  const handleTransformChange = useCallback((newTransform: TransformState) => {
    setTransform({
      scale: newTransform.state.scale,
      positionX: -newTransform.state.positionX,
      positionY: -newTransform.state.positionY,
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setExpandedActions(new Set());
    setIsFrozen(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoomTimerRef.current) {
      clearTimeout(zoomTimerRef.current);
    }

    zoomTimerRef.current = setTimeout(() => {
      zoomTimerRef.current = null;
    }, 500);
  }, []);

  // Mémoisation du gestionnaire d'événements tactiles
  const handleTouchMove = useCallback((e: ReactTouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (touch && mouseMoveThrottleRef.current) {
      mouseMoveThrottleRef.current({
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      <TransformWrapper
        initialScale={1}
        minScale={
          isMobile ? ZOOM_CONFIG.MOBILE_MIN_SCALE : ZOOM_CONFIG.MIN_SCALE
        }
        maxScale={ZOOM_CONFIG.MAX_SCALE}
        centerOnInit={true}
        doubleClick={{
          disabled: isMobile,
          step: 0.7,
          mode: "zoomIn",
          animationTime: 200, // Plus court pour Firefox/Mobile
        }}
        pinch={{
          disabled: false,
          step: 1, // Réduit pour plus de fluidité
        }}
        limitToBounds={false}
        onTransformed={(e) => {
          requestAnimationFrame(() => {
            handleTransformChange(e);
            if (e.state.scale !== prevZoomScaleRef.current) {
              handleDoubleClick();
            }
          });
        }}
        onPanningStart={() => {
          setHasPanned(false);
        }}
        onPanning={() => {
          setHasPanned(true);
        }}
        // Meilleure gestion de la mémoire et des événements
        alignmentAnimation={{ disabled: true }}
        velocityAnimation={{ disabled: true }}
        wheel={{
          step: 0.05, // Pas de zoom plus petit pour plus de fluidité
          smoothStep: 0.02,
        }}
      >
        <TransformComponent
          wrapperClass="!w-full !h-full"
          contentClass="!w-full !h-full"
        >
          <div className="relative w-full h-full">
            <div className="absolute w-full h-full">
              {visibleCircles.map((circle) => {
                const uniqueKey = circle.id || `circle-${circle.x}-${circle.y}`;
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
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>

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
