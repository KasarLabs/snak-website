import { GRID_CONFIG } from "../constants/gridConfig";

export const generateHoneycombPositions = (
  totalItems: number,
  width: number,
  height: number,
) => {
  const positions = [];
  const hexWidth = GRID_CONFIG.SPACING * 2;
  const hexHeight = hexWidth * GRID_CONFIG.HEX_RATIO;
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
