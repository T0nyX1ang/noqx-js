/** The Battleship solver. */

function battleship_refine(solution) {
  for (const point of solution.symbol.keys()) {
    const [r, c, d, pos] = extract_point(point);
    const has_top = solution.symbol.has(`${r - 1},${c},${d},${pos}`);
    const has_left = solution.symbol.has(`${r},${c - 1},${d},${pos}`);
    const has_bottom = solution.symbol.has(`${r + 1},${c},${d},${pos}`);
    const has_right = solution.symbol.has(`${r},${c + 1},${d},${pos}`);

    const fleet_name = solution.symbol.get(point).split("__")[0];

    // center part
    if (!has_top && !has_bottom && !has_left && !has_right) {
      solution.symbol.set(point, `${fleet_name}__1`);
    }

    // middle part
    if ((has_top && has_bottom) || (has_left && has_right)) {
      solution.symbol.set(point, `${fleet_name}__2`);
    }

    // left part
    if (!has_left && has_right && !has_top && !has_bottom) {
      solution.symbol.set(point, `${fleet_name}__3`);
    }

    // top part
    if (!has_top && has_bottom && !has_left && !has_right) {
      solution.symbol.set(point, `${fleet_name}__4`);
    }

    // right part
    if (!has_right && has_left && !has_top && !has_bottom) {
      solution.symbol.set(point, `${fleet_name}__5`);
    }

    // bottom part
    if (!has_bottom && has_top && !has_left && !has_right) {
      solution.symbol.set(point, `${fleet_name}__6`);
    }
  }

  return solution;
}

modules["battleship"] = {
  name: "Battleship",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));

    let fleet_name = "battleship_B";
    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      const [shape, style] = symbol_name.split("__");
      validate_direction(r, c, d);
      fail_false(shape.startsWith("battleship"), `Invalid battleship shape: ${shape}.`);
      fail_false(fleet_name === "" || fleet_name === shape, "Multiple fleet shapes are not allowed.");

      fleet_name = shape;
      if (style !== "7" && style !== "8") {
        solver.add_program_line(`${fleet_name}(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not ${fleet_name}(${r}, ${c}).`);
      }

      if (style === "1") {
        solver.add_program_line(`:- grid(${r + 1}, ${c}), ${fleet_name}(${r + 1}, ${c}).`);
        solver.add_program_line(`:- grid(${r - 1}, ${c}), ${fleet_name}(${r - 1}, ${c}).`);
        solver.add_program_line(`:- grid(${r}, ${c + 1}), ${fleet_name}(${r}, ${c + 1}).`);
        solver.add_program_line(`:- grid(${r}, ${c - 1}), ${fleet_name}(${r}, ${c - 1}).`);
      }

      if (style === "2") {
        fail_false(
          0 < c && c < puzzle.col - 1 && 0 < r && r < puzzle.row - 1,
          `Ship at (${r}, ${c}) is outside of the board.`
        );
        solver.add_program_line(`:- #count { R, C: ${fleet_name}(R, C), adj_4(${r}, ${c}, R, C) } != 2.`);
      }

      if (style === "3") {
        fail_false(c < puzzle.col - 1, `Ship at (${r}, ${c}) is outside of the board.`);
        solver.add_program_line(`:- grid(${r}, ${c - 1}), ${fleet_name}(${r}, ${c - 1}).`);
        solver.add_program_line(`:- grid(${r}, ${c + 1}), not ${fleet_name}(${r}, ${c + 1}).`);
      }

      if (style === "4") {
        fail_false(r < puzzle.row - 1, `Ship at (${r}, ${c}) is outside of the board.`);
        solver.add_program_line(`:- grid(${r - 1}, ${c}), ${fleet_name}(${r - 1}, ${c}).`);
        solver.add_program_line(`:- grid(${r + 1}, ${c}), not ${fleet_name}(${r + 1}, ${c}).`);
      }

      if (style === "5") {
        fail_false(c > 0, `Ship at (${r}, ${c}) is outside of the board.`);
        solver.add_program_line(`:- grid(${r}, ${c + 1}), ${fleet_name}(${r}, ${c + 1}).`);
        solver.add_program_line(`:- grid(${r}, ${c - 1}), not ${fleet_name}(${r}, ${c - 1}).`);
      }

      if (style === "6") {
        fail_false(r > 0, `Ship at (${r}, ${c}) is outside of the board.`);
        solver.add_program_line(`:- grid(${r + 1}, ${c}), ${fleet_name}(${r + 1}, ${c}).`);
        solver.add_program_line(`:- grid(${r - 1}, ${c}), not ${fleet_name}(${r - 1}, ${c}).`);
      }
    }

    solver.add_program_line(shade_c(fleet_name));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("x"));
    solver.add_program_line(avoid_adjacent_color(fleet_name, "x"));
    solver.add_program_line(general_shape("battleship", 1, OMINOES[1]["."], fleet_name, "grid", 4));
    solver.add_program_line(general_shape("battleship", 2, OMINOES[2]["I"], fleet_name, "grid", 4));
    solver.add_program_line(general_shape("battleship", 3, OMINOES[3]["I"], fleet_name, "grid", 4));
    solver.add_program_line(general_shape("battleship", 4, OMINOES[4]["I"], fleet_name, "grid", 4));
    solver.add_program_line(all_shapes("battleship", fleet_name, "grid"));
    solver.add_program_line(count_shape(4, "battleship", 1, fleet_name, "grid"));
    solver.add_program_line(count_shape(3, "battleship", 2, fleet_name, "grid"));
    solver.add_program_line(count_shape(2, "battleship", 3, fleet_name, "grid"));
    solver.add_program_line(count_shape(1, "battleship", 4, fleet_name, "grid"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      if (r === -1 && c >= 0 && c < puzzle.col && Number.isInteger(num)) {
        solver.add_program_line(count(num, fleet_name, "col", c));
      }

      if (c === -1 && r >= 0 && r < puzzle.row && Number.isInteger(num)) {
        solver.add_program_line(count(num, fleet_name, "row", r));
      }
    }

    solver.add_program_line(display(fleet_name));
    await solver.solve();

    for (const solution of solver.solutions) {
      battleship_refine(solution);
    }

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VTPb9s8DL37ryh05kH0r9i+DGnX7NK525KhCAwjcDp/SLAEzpJ4GBTkfy9Ju7XmGhh6WPcNGBwRL4+U9EhJPHyri30JiPzzItBACPwglIHoytDtN1sfN2VyAeP6uKr2BABuJxP4r9gcSidDma1z52TixIzBvEsyhQqUSwNVDuZjcjLvE5OCmZJLARJ30wS5BK87eCd+RlcNiZpw2mKCc4LL4kh6Dqv1bnHZsB+SzMxA8V6XsgJDta2+l6rVwv/vq+1yzUS3QOs51F+qr3Ubi/kZzLiRPB+Q7HWSGTaSGQ1I5kxeQXKcn89U/k8kepFkrP9zB6MOTpMT2TQ5Kc/jqW9IS3NGyvMf038kAiboDJ+IsE+MmNAWETHhW0Tcm+Lr3i4+MuFZhNufIrtYSsN+xEgirEVjibCEoZYQaw66EmNpxSYdaxkM+jth+CwmkpinBKi8KEWeU5EDjg7g+emrkGsZDnlQc828QZfLLnfQJaX3B10RH/Vo0BVz9Ul430X6J5KFK3ZGtweMJ/atWC02EHsjMddi78ReifXFhhIz4vv3ohtqF/I3ycn8SNrezx+1v7+Ny51MpfV2We4v0mq/LTbUI6arYlcqaspnR/1QMuhWUY//16f/cJ/mo9D/t7fwCzkZVZhei7kFtasXxeK+ojtG9Xsh/+pZ0SPPnQc=",
    },
  ],
};
