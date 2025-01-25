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
  if (d !== target) {
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
      unexplored_cells.add([r, c]);
    }
  }
  const clue_to_room = {};
  const rc_set = clues ? new Set(clues.map(([r, c]) => [r, c])) : new Set();

  function* get_neighbors(r, c) {
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

  function single_bfs(start_cell) {
    let clue_cell = null;
    const connected_component = new Set([start_cell]);
    unexplored_cells.delete(start_cell);

    const queue = [start_cell]; // make a queue for BFS
    while (queue.length > 0) {
      const [r, c] = queue.shift();
      for (const neighbor of get_neighbors(r, c)) {
        if (unexplored_cells.has(neighbor)) {
          connected_component.add(neighbor);
          unexplored_cells.delete(neighbor);
          queue.push(neighbor);
        }
      }
      if (clues && rc_set.has([r, c])) {
        clue_cell = [r, c];
      }
    }
    return [clue_cell, Array.from(connected_component)];
  }

  while (unexplored_cells.size !== 0) {
    const start_cell = Array.from(unexplored_cells)[Math.floor(Math.random() * unexplored_cells.size)]; // get a random start cell
    const [clue, room] = single_bfs(start_cell);
    clue_to_room[room] = clue;
  }

  return clue_to_room;
}
