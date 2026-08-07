// Applies a transform to an element. Only the -webkit- prefix is still worth
// carrying, for older WebKit; -khtml-, -moz-, -ms- and -o- never shipped a
// matrix3d implementation that unprefixed CSS does not already cover.
export function setTransform(element, value) {
    element.style.webkitTransform = value;
    element.style.transform = value;
}

// transform-origin is constant for the lifetime of the layer, so it is set once
// rather than rewritten on every projection.
export function setTransformOrigin(element, value) {
    element.style.webkitTransformOrigin = value;
    element.style.transformOrigin = value;
}

export function projectiveMatrixToCssValue(matrix) {
    const matrixValues = [];

    // matrix3d() takes its arguments in column-major order.
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++)
            matrixValues.push(matrix[j][i]);
    }

    return `matrix3d(${matrixValues.join(',')})`;
}

export function getScale3dCssValue(origin, target) {
    return `scale3d(${target.width / origin.width}, ${target.height / origin.height}, 1)`;
}

export function getTranslate3dCssValue(tx, ty, tz = 0) {
    return `translate3d(${tx}px, ${ty}px, ${tz}px)`;
}
