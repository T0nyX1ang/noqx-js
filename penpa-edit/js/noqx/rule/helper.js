/** Helper functions for generation solvers and rules. */

function tag_encode(name, ...data) {
  /** Encode a valid tag predicate without spaces or hyphens. */
  const tag_data = [name];
  for (const d of data) {
    // recommended data sequence: *_type, src_r, src_c, color
    if (d !== null && d !== undefined) {
      tag_data.push(String(d).replace("-", "_").replace(" ", "_"));
    }
  }
  return tag_data.join("_");
}

function reverse_op(op) {
  /** Return the reverse of the given operator. */
  const op_rev_dict = {
    eq: "!=",
    ge: "<",
    gt: "<=",
    le: ">",
    lt: ">=",
    ne: "=",
  };
  return op_rev_dict[op];
}

function target_encode(target) {
  /** Encode a target number for comparison. */
  if (typeof target === "number") {
    return ["!=", target];
  }
  return [reverse_op(target[0]), target[1]];
}

function validate_type(_type, target_type) {
  /** Validate any matching type. */
  if (_type === null || _type === undefined) {
    throw new Error("Type cannot be null.");
  }
  if ((typeof target_type === "number" || typeof target_type === "string") && _type !== target_type) {
    throw new Error(`Invalid type ${_type}.`);
  }
  if (!(typeof target_type === "number" || typeof target_type === "string") && !target_type.includes(_type)) {
    throw new Error(`Invalid type ${_type}.`);
  }
}

function validate_direction(r, c, d, target = BaseDir.CENTER) {
  /** Validate the direction of any element. */
  if (d !== target.description) {
    throw new Error(`The element in (${r}, ${c}) should be placed in the ${target.description}.`);
  }
}

function fail_false(express, msg) {
  /** Raise error if the expression is false. Works like an assertion in the background. */
  if (!express) {
    throw new Error(msg);
  }
}

function full_bfs(rows, cols, edges, clues = null) {
  /** Generate a dict of rooms with their unique clue. */
  const unexplored_cells = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      unexplored_cells.add(`${r},${c}`); // Store as string instead of array
    }
  }
  const clue_to_room = new Map();
  const rc_set = new Set();

  if (clues !== null && clues !== undefined) {
    for (const point of clues.keys()) {
      const [r, c, _, __] = extract_point(point);
      rc_set.add(`${r},${c}`);
    }
  }

  function* get_neighbors(r, c) {
    /** Get the neighbors of a cell. */
    if (edges.get(new BasePoint(r, c, BaseDir.LEFT).toString()) !== true) {
      yield [r, c - 1];
    }
    if (edges.get(new BasePoint(r, c + 1, BaseDir.LEFT).toString()) !== true) {
      yield [r, c + 1];
    }
    if (edges.get(new BasePoint(r, c, BaseDir.TOP).toString()) !== true) {
      yield [r - 1, c];
    }
    if (edges.get(new BasePoint(r + 1, c, BaseDir.TOP).toString()) !== true) {
      yield [r + 1, c];
    }
  }

  function single_bfs(start_cell) {
    let clue_cell = null;
    const connected_component = new Set();
    connected_component.add(start_cell);
    unexplored_cells.delete(start_cell);

    const queue = [start_cell]; // make a queue for BFS
    while (queue.length > 0) {
      const cell = queue.shift();
      const [r, c] = cell.split(",").map(Number);
      for (const [nr, nc] of get_neighbors(r, c)) {
        const neighbor = `${nr},${nc}`;
        if (unexplored_cells.has(neighbor)) {
          // Now much faster
          connected_component.add(neighbor);
          unexplored_cells.delete(neighbor);
          queue.push(neighbor);
        }
      }
      if (clues && rc_set.has(cell)) {
        clue_cell = [r, c];
      }
    }
    return [clue_cell, Array.from(connected_component).map((str) => str.split(",").map(Number))];
  }

  while (unexplored_cells.size !== 0) {
    const start_cell = Array.from(unexplored_cells)[Math.floor(Math.random() * unexplored_cells.size)];
    const [clue, room] = single_bfs(start_cell);
    clue_to_room.set(room, clue);
  }

  return clue_to_room;
}
