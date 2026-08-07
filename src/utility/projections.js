// Solves for the projective transform that maps `origin` onto `target`, returned
// as the 4x4 matrix projectiveMatrixToCssValue() serialises into matrix3d().
//
// PRECONDITION: `origin` is the axis-aligned rectangle (0,0)-(w,0)-(w,h)-(0,h).
// Both call sites satisfy this, because they build `origin` with
// getElementCorners(), which anchors the rectangle at {x: 0, y: 0}.
//
// That precondition is what makes the closed form below possible. A general
// rectangle-to-quadrilateral homography is the classic unit-square-to-quad
// mapping pre-scaled by 1/w and 1/h, so there is no linear system to solve:
// one 2x2 determinant replaces the 8x8 Gaussian elimination this used to hand
// to numeric.solve(). Same result to ~1e-10 px, and no dependency.
export function findProjectiveMatrix(origin, target) {
    const width = origin.bottomRight.x - origin.topLeft.x;
    const height = origin.bottomRight.y - origin.topLeft.y;

    const { x: x0, y: y0 } = target.topLeft;
    const { x: x1, y: y1 } = target.topRight;
    const { x: x2, y: y2 } = target.bottomRight;
    const { x: x3, y: y3 } = target.bottomLeft;

    // Both are zero exactly when the target is a parallelogram, i.e. when the
    // mapping is affine and needs no perspective term. A rotated map produces
    // this case, so it is the common path, not an edge case.
    const sumX = x0 - x1 + x2 - x3;
    const sumY = y0 - y1 + y2 - y3;

    let a11, a21, a12, a22, a13, a23;

    if (sumX === 0 && sumY === 0) {
        a11 = x1 - x0;
        a21 = x3 - x0;
        a13 = 0;

        a12 = y1 - y0;
        a22 = y3 - y0;
        a23 = 0;
    } else {
        const dx1 = x1 - x2, dy1 = y1 - y2;
        const dx2 = x3 - x2, dy2 = y3 - y2;
        const denominator = dx1 * dy2 - dx2 * dy1;

        a13 = (sumX * dy2 - dx2 * sumY) / denominator;
        a23 = (dx1 * sumY - sumX * dy1) / denominator;

        a11 = x1 - x0 + a13 * x1;
        a21 = x3 - x0 + a23 * x3;

        a12 = y1 - y0 + a13 * y1;
        a22 = y3 - y0 + a23 * y3;
    }

    return [[a11 / width, a21 / height, 0, x0],
    [a12 / width, a22 / height, 0, y0],
    [0, 0, 1, 0],
    [a13 / width, a23 / height, 0, 1]];
}
