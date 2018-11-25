export function getCssWithPrefixes(key, value) {
    return {
        ["-webkit-" + key]: value,
        ["-khtml-" + key]: value,
        ["-moz-" + key]: value,
        ["-ms-" + key]: value,
        ["-o-" + key]: value,
        [key]: value
    };
}

export function projectiveMatrixToCssValue(matrix) {
    const matrixValues = [];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++)
            matrixValues.push(matrix[j][i].toFixed(20));
    }

    return `matrix3d(${matrixValues.join(',')})`;
}

export function getScale3dCssValue(origin, target) {
    return `scale3d(${target.width / origin.width}, ${target.height / origin.height}, 1)`;
}

export function getTranslate3dCssValue(tx, ty, tz = 0) {
    return `translate3d(${tx}px, ${ty}px, ${tz}px)`;
}