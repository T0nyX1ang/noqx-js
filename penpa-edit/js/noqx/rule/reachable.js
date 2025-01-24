/** Utility for reachable things and connectivity tests. */

function gridColorConnected(color = "black", adjType = 4, gridSize = null) {
  validateType(adjType, [4, 8, "x", "loop", "loop_directed"]);
  const tag = tagEncode("reachable", "grid", "adj", adjType, color);

  let initial;
  if (gridSize === null) {
    initial = `${tag}(R, C) :- (R, C) = #min{ (R1, C1): grid(R1, C1), ${color}(R1, C1) }.`;
  } else {
    const [R, C] = gridSize;
    initial = `${tag}(R, C) :- (_, R, C) = #min{ (|R1 - ${Math.floor(
      R / 2
    )}| + |C1 - ${Math.floor(
      C / 2
    )}|, R1, C1): grid(R1, C1), ${color}(R1, C1) }.`;
  }

  const propagation = `${tag}(R, C) :- ${tag}(R1, C1), ${color}(R, C), adj_${adjType}(R, C, R1, C1).`;
  const constraint = `:- grid(R, C), ${color}(R, C), not ${tag}(R, C).`;
  return `${initial}\n${propagation}\n${constraint}`;
}

function borderColorConnected(rows, cols, color = "black", adjType = 4) {
  validateType(adjType, [4, 8, "x"]);
  const tag = tagEncode("reachable", "border", "adj", adjType, color);
  const borders = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        borders.push([r, c]);
      }
    }
  }
  const initial = borders
    .map(([r, c]) => `${tag}(${r}, ${c}) :- ${color}(${r}, ${c}).`)
    .join("\n");
  const propagation = `${tag}(R, C) :- ${tag}(R1, C1), ${color}(R, C), adj_${adjType}(R, C, R1, C1).`;
  const constraint = `:- grid(R, C), ${color}(R, C), not ${tag}(R, C).`;
  return `${initial}\n${propagation}\n${constraint}`;
}

function areaColorConnected(color = "black", adjType = 4) {
  validateType(adjType, [4, 8, "x"]);
  const tag = tagEncode("reachable", "area", "adj", adjType, color);
  const initial = `${tag}(A, R, C) :- area(A, _, _), (R, C) = #min{ (R1, C1): area(A, R1, C1), ${color}(R1, C1) }.`;
  const propagation = `${tag}(A, R, C) :- ${tag}(A, R1, C1), area(A, R, C), ${color}(R, C), adj_${adjType}(R, C, R1, C1).`;
  const constraint = `:- area(A, R, C), ${color}(R, C), not ${tag}(A, R, C).`;
  return `${initial}\n${propagation}\n${constraint}`;
}

function gridSrcColorConnected(
  srcCell,
  includeCells = null,
  excludeCells = null,
  color = "black",
  adjType = 4
) {
  if (color === null) {
    validateType(adjType, ["edge"]);
  } else {
    validateType(adjType, [4, 8, "x", "edge", "loop", "loop_directed"]);
  }

  const tag = tagEncode("reachable", "grid", "src", "adj", adjType, color);
  const [r, c] = srcCell;
  let initial = `${tag}(${r}, ${c}, ${r}, ${c}).`;

  if (includeCells) {
    initial +=
      "\n" +
      includeCells
        .map(([incR, incC]) => `${tag}(${r}, ${c}, ${incR}, ${incC}).`)
        .join("\n");
  }

  if (excludeCells) {
    initial +=
      "\n" +
      excludeCells
        .map(([excR, excC]) => `not ${tag}(${r}, ${c}, ${excR}, ${excC}).`)
        .join("\n");
  }

  if (adjType === "edge") {
    const propagation = `${tag}(${r}, ${c}, R, C) :- ${tag}(${r}, ${c}, R1, C1), grid(R, C), adj_edge(R, C, R1, C1).`;
    const constraint = `:- ${tag}(${r}, ${c}, R, C), ${tag}(${r}, ${c}, R, C + 1), edge_left(R, C + 1).\n`;
    constraint += `:- ${tag}(${r}, ${c}, R, C), ${tag}(${r}, ${c}, R + 1, C), edge_top(R + 1, C).`;
    return `${initial}\n${propagation}\n${constraint}`;
  }

  const propagation = `${tag}(${r}, ${c}, R, C) :- ${tag}(${r}, ${c}, R1, C1), grid(R, C), ${color}(R, C), adj_${adjType}(R, C, R1, C1).`;
  return `${initial}\n${propagation}`;
}

function bulbSrcColorConnected(srcCell, color = "black", adjType = 4) {
  if (color === null) {
    validateType(adjType, ["edge"]);
  } else {
    validateType(adjType, [4, "edge"]);
  }

  const tag = tagEncode("reachable", "bulb", "src", "adj", adjType, color);
  const [r, c] = srcCell;
  const initial = `${tag}(${r}, ${c}, ${r}, ${c}).`;

  let bulbConstraint = "";
  if (adjType === 4) {
    bulbConstraint = `${color}(R, C), adj_${adjType}(R, C, R1, C1), (R - ${r}) * (C - ${c}) == 0`;
  }

  if (adjType === "edge") {
    bulbConstraint = `adj_${adjType}(R, C, R1, C1), (R - ${r}) * (C - ${c}) == 0`;
  }

  const propagation = `${tag}(${r}, ${c}, R, C) :- ${tag}(${r}, ${c}, R1, C1), ${bulbConstraint}.`;
  return `${initial}\n${propagation}`;
}

function countReachableSrc(
  target,
  srcCell,
  mainType = "grid",
  color = "black",
  adjType = 4
) {
  if (color === null) {
    validateType(adjType, ["edge"]);
  } else if (mainType === "grid") {
    validateType(adjType, [4, 8, "x", "edge", "loop", "loop_directed"]);
  } else if (mainType === "bulb") {
    validateType(adjType, [4]);
  } else {
    throw new Error("Invalid main type, must be one of 'grid', 'bulb'.");
  }

  const [srcR, srcC] = srcCell;
  const tag = tagEncode("reachable", mainType, "src", "adj", adjType, color);
  const [rop, num] = targetEncode(target);

  return `:- { ${tag}(${srcR}, ${srcC}, R, C) } ${rop} ${num}.`;
}

function countRectSrc(target, srcCell, color = null, adjType = 4) {
  if (color === null) {
    validateType(adjType, ["edge"]);
  }

  const tag = tagEncode("reachable", "bulb", "src", "adj", adjType, color);
  const [rop, num] = targetEncode(target);
  const [srcR, srcC] = srcCell;
  const countR = `#count { R: ${tag}(${srcR}, ${srcC}, R, C) } = CR`;
  const countC = `#count { C: ${tag}(${srcR}, ${srcC}, R, C) } = CC`;

  return `:- ${countR}, ${countC}, CR * CC ${rop} ${num}.`;
}

function avoidUnknownSrc(color = "black", adjType = 4) {
  if (color === null) {
    validateType(adjType, ["edge"]);
    const tag = tagEncode("reachable", "grid", "src", "adj", adjType);
    return `:- grid(R, C), not ${tag}(_, _, R, C).`;
  }

  validateType(adjType, [4, 8, "loop", "loop_directed"]);
  const tag = tagEncode("reachable", "grid", "src", "adj", adjType, color);

  return `:- grid(R, C), ${color}(R, C), not ${tag}(_, _, R, C).`;
}

function clueBit(r, c, id, nbit) {
  let rule = `clue(${r}, ${c}).\n`;
  for (let i = 0; i < nbit; i++) {
    if ((id >> i) & 1) {
      rule += `clue_bit(${r}, ${c}, ${i}).\n`;
    }
  }
  return rule.trim();
}

function numBinaryRange(num) {
  const nbit = Math.floor(Math.log2(num)) + 1;
  const rule = `bit_range(0..${nbit - 1}).\n`;
  return [rule.trim(), nbit];
}

function gridBitColorConnected(color = "black", adjType = "loop") {
  validateType(adjType, [4, 8, "x", "loop", "loop_directed"]);

  const tag = tagEncode("reachable", "grid", "bit", "adj", adjType);
  let rule = `{ ${tag}(R, C, B) } :- grid(R, C), ${color}(R, C), bit_range(B).\n`;
  rule += `${tag}(R, C, B) :- clue_bit(R, C, B).\n`;
  rule += `not ${tag}(R, C, B) :- grid(R, C), ${color}(R, C), bit_range(B), clue(R, C), not clue_bit(R, C, B).\n`;
  rule += `${tag}(R, C, B) :- ${tag}(R1, C1, B), grid(R, C), bit_range(B), ${color}(R, C), adj_${adjType}(R, C, R1, C1).\n`;
  rule += `not ${tag}(R, C, B) :- not ${tag}(R1, C1, B), grid(R, C), grid(R1, C1), bit_range(B), ${color}(R, C), ${color}(R1, C1), adj_${adjType}(R, C, R1, C1).\n`;
  return rule.trim();
}

function avoidUnknownSrcBit(color = "black", adjType = 4) {
  const tag = tagEncode("reachable", "grid", "bit", "adj", adjType);
  return `:- grid(R, C), ${color}(R, C), not ${tag}(R, C, _).`;
}

function gridBranchColorConnected(color = "black", adjType = 4) {
  if (color === null) {
    validateType(adjType, ["edge"]);
  } else {
    validateType(adjType, [4, 8, "x", "edge"]);
  }

  const tag = tagEncode("reachable", "grid", "branch", "adj", adjType, color);

  if (adjType === "edge") {
    const initial = `${tag}(R, C, R, C) :- grid(R, C).`;
    const propagation = `${tag}(R0, C0, R, C) :- ${tag}(R0, C0, R1, C1), grid(R, C), adj_edge(R, C, R1, C1).`;
    const constraint = `:- ${tag}(R, C, R, C + 1), edge_left(R, C + 1).\n`;
    constraint += `:- ${tag}(R, C, R + 1, C), edge_top(R + 1, C).\n`;
    constraint += `:- ${tag}(R, C + 1, R, C), edge_left(R, C + 1).\n`;
    constraint += `:- ${tag}(R + 1, C, R, C), edge_top(R + 1, C).`;
    return `${initial}\n${propagation}\n${constraint}`;
  }

  const initial = `${tag}(R, C, R, C) :- grid(R, C), ${color}(R, C).`;
  const propagation = `${tag}(R0, C0, R, C) :- ${tag}(R0, C0, R1, C1), grid(R, C), ${color}(R, C), adj_${adjType}(R, C, R1, C1).`;
  return `${initial}\n${propagation}`;
}
