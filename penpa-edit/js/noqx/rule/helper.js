/** Helper functions for generation solvers and rules. */

function tagEncode(name, ...data) {
  /** Encode a valid tag predicate without spaces or hyphens. */
  const tagData = [name];
  for (const d of data) {
    // recommended data sequence: *_type, src_r, src_c, color
    if (d !== null && d !== undefined) {
      tagData.push(String(d).replace("-", "_").replace(" ", "_"));
    }
  }
  return tagData.join("_");
}

function reverseOp(op) {
  /** Return the reverse of the given operator. */
  const opRevDict = { eq: "!=", ge: "<", gt: "<=", le: ">", lt: ">=", ne: "=" };
  return opRevDict[op];
}

function targetEncode(target) {
  /** Encode a target number for comparison. */
  if (typeof target === "number") {
    return ["!=", target];
  }
  return [reverseOp(target[0]), target[1]];
}

function validateType(_type, targetType) {
  /** Validate any matching type. */
  if (_type === null || _type === undefined) {
    throw new Error("Type cannot be 'null'.");
  }
  if (
    (typeof targetType === "number" || typeof targetType === "string") &&
    _type !== targetType
  ) {
    throw new Error(`Invalid type '${_type}'.`);
  }
  if (
    !(typeof targetType === "number" || typeof targetType === "string") &&
    !targetType.includes(_type)
  ) {
    throw new Error(`Invalid type '${_type}'.`);
  }
}

function validateDirection(r, c, d, target = BaseDir.CENTER) {
  /** Validate the direction of any element. */
  if (d !== target) {
    throw new Error(
      `The element in (${r}, ${c}) should be placed in the ${target.value}.`
    );
  }
}

function failFalse(express, msg) {
  /** Raise error if the expression is false. Works like an assertion in the background. */
  if (!express) {
    throw new Error(msg);
  }
}

function fullBFS(rows, cols, edges, clues = null) {
  /** Generate a dict of rooms with their unique clue. */
  const unexploredCells = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      unexploredCells.add([r, c]);
    }
  }
  const clueToRoom = {};
  const rcSet = clues ? new Set(clues.map(([r, c]) => [r, c])) : new Set();

  function* getNeighbors(r, c) {
    /** Get the neighbors of a cell. */
    if (edges.get(new Point(r, c, BaseDir.LEFT)) !== true) {
      yield [r, c - 1];
    }
    if (edges.get(new Point(r, c + 1, BaseDir.LEFT)) !== true) {
      yield [r, c + 1];
    }
    if (edges.get(new Point(r, c, BaseDir.TOP)) !== true) {
      yield [r - 1, c];
    }
    if (edges.get(new Point(r + 1, c, BaseDir.TOP)) !== true) {
      yield [r + 1, c];
    }
  }

  function singleBFS(startCell) {
    let clueCell = null;
    const connectedComponent = new Set([startCell]);
    unexploredCells.delete(startCell);

    const queue = [startCell]; // make a queue for BFS
    while (queue.length > 0) {
      const [r, c] = queue.shift();
      for (const neighbor of getNeighbors(r, c)) {
        if (unexploredCells.has(neighbor)) {
          connectedComponent.add(neighbor);
          unexploredCells.delete(neighbor);
          queue.push(neighbor);
        }
      }
      if (clues && rcSet.has([r, c])) {
        clueCell = [r, c];
      }
    }
    return [clueCell, Array.from(connectedComponent)];
  }

  while (unexploredCells.size !== 0) {
    const startCell =
      Array.from(unexploredCells)[
        Math.floor(Math.random() * unexploredCells.size)
      ]; // get a random start cell
    const [clue, room] = singleBFS(startCell);
    clueToRoom[room] = clue;
  }

  return clueToRoom;
}
