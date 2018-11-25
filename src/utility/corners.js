export function isCorners(value) {
    const { topLeft, topRight, bottomLeft, bottomRight } = value;

    return !!topLeft && !!topRight && !!bottomLeft && !!bottomRight;
}

export function getElementCorners(element) {
    const jElement = $(element);
    return calculateRectangleCorners({ x: 0, y: 0 }, jElement.height(), jElement.width());
}

export function calculateRectangleCorners(topLeft, height, width) {
    const { x: left, y: top } = topLeft;
    const right = left + width;
    const bottom = top + height;

    const topRight = { x: right, y: top };
    const bottomRight = { x: right, y: bottom };
    const bottomLeft = { x: left, y: bottom };

    return { topLeft, topRight, bottomRight, bottomLeft };
}

export function areSomeCornersEqual(corners) {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;

    if (areCornersEqual(topLeft, topRight)) return true;

    const arr = [topLeft, topRight];
    if (arr.some(corner => areCornersEqual(corner, bottomRight))) return true;

    arr.push(bottomRight);

    return arr.some(corner => areCornersEqual(corner, bottomLeft));
}

export function areCornersEqual(corner, otherCorner) {
    return corner.x === otherCorner.x && corner.y === otherCorner.y;
}

export function getXCoordinates(corners) {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;
    return [topLeft.x, topRight.x, bottomRight.x, bottomLeft.x];
}

export function getYCoordinates(corners) {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;
    return [topLeft.y, topRight.y, bottomRight.y, bottomLeft.y];
}