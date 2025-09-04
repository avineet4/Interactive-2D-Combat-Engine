// Spatial partitioning for collision optimization
const spatialGrid = new Map();
const gridSize = 50; // Grid cell size

export function rectsOverlap(x1, y1, width1, height1, x2, y2, width2, height2) {
  // Early exit optimization
  if (x1 >= x2 + width2 || x2 >= x1 + width1) return false;
  if (y1 >= y2 + height2 || y2 >= y1 + height1) return false;
  return true;
}

export function boxOverlap(box1, box2) {
  return rectsOverlap(
    box1.x,
    box1.y,
    box1.width,
    box1.height,
    box2.x,
    box2.y,
    box2.width,
    box2.height
  );
}

export function getAcutalBoxDimensions(position, direction, box) {
  const x1 = position.x + box.x * direction;
  const x2 = x1 + box.width * direction;

  return {
    x: Math.min(x1, x2),
    y: position.y + box.y,
    width: box.width,
    height: box.height,
  };
}
