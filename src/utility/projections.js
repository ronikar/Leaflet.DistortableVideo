import numeric from "numeric";

export function findProjectiveMatrix(origin, target) {
    let matrix = [];
    let b = [];

    _addCondition(matrix, b, origin.topLeft, target.topLeft);
    _addCondition(matrix, b, origin.topRight, target.topRight);
    _addCondition(matrix, b, origin.bottomLeft, target.bottomLeft);
    _addCondition(matrix, b, origin.bottomRight, target.bottomRight);

    const x = numeric.solve(matrix, b);

    return [[x[0], x[1], 0, x[2]],
    [x[3], x[4], 0, x[5]],
    [0, 0, 1, 0],
    [x[6], x[7], 0, 1]];
}

function _addCondition(matrix, b, origin, target) {
    const { x, y } = origin;
    const firstCondition = [x, y, 1, 0, 0, 0, -target.x * x, -target.x * y];
    const secondCondition = [0, 0, 0, x, y, 1, -target.y * x, -target.y * y];
    matrix.push(firstCondition);
    b.push(target.x);

    matrix.push(secondCondition);
    b.push(target.y);
}