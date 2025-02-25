/** The Tri-place solver. */

modules["triplace"] = {
  name: "Tri-place",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false((puzzle.row * puzzle.col - puzzle.symbol.size) % 3 === 0, "The grid cannot be divided into 3-ominoes!");

    const sums = [];
    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);

      if (pos === "sudoku_1" && Number.isInteger(num)) {
        const area_points = [];
        let cur = c + 1;
        while (cur < puzzle.col && !puzzle.symbol.has(new BasePoint(r, cur, BaseDir.CENTER).toString())) {
          area_points.push([r, cur]);
          cur++;
        }

        fail_false(area_points.length > 0, `Invalid kakuro clue at (${r}, ${c}).`);
        sums.push([num, area_points]);
      }

      if (pos === "sudoku_2" && Number.isInteger(num)) {
        const area_points = [];
        let cur = r + 1;
        while (cur < puzzle.row && !puzzle.symbol.has(new BasePoint(cur, c, BaseDir.CENTER).toString())) {
          area_points.push([cur, c]);
          cur++;
        }

        fail_false(area_points.length > 0, `Invalid kakuro clue at (${r}, ${c}).`);
        sums.push([num, area_points]);
      }
    }

    solver.add_program_line(defined("hole"));
    solver.add_program_line(grid(puzzle.row, puzzle.col, true));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(all_shapes("omino_3", "grid"));

    for (const [i, o_type] of Object.keys(OMINOES[3]).entries()) {
      const o_shape = OMINOES[3][o_type];
      solver.add_program_line(general_shape("omino_3", i, o_shape, "grid", "grid", "edge"));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      fail_false(symbol_name.startsWith("kakuro"), `Invalid symbol at (${r}, ${c}).`);
      solver.add_program_line(`hole(${r}, ${c}).`);

      const edges = [
        [r, c - 1, r, c, "left"],
        [r, c + 1, r, c + 1, "left"],
        [r - 1, c, r, c, "top"],
        [r + 1, c, r + 1, c, "top"],
      ];

      for (const [r1, c1, r2, c2, dir] of edges) {
        const prefix = puzzle.symbol.has(new BasePoint(r1, c1, d, pos).toString()) ? "not " : "";
        solver.add_program_line(`${prefix}edge_${dir}(${r2}, ${c2}).`);
      }
    }

    const t_be = tag_encode("belong_to_shape", "omino", 3, "grid");
    let area_id = 0;
    for (const [num, coord_list] of sums) {
      solver.add_program_line(area(area_id, coord_list));

      const edge_tag =
        coord_list.length > 1 && coord_list[0][0] === coord_list[1][0] ? "edge_left(R, C + 1)" : "edge_top(R + 1, C)";

      solver.add_program_line(
        `:- #count { R, C: area(${area_id}, R, C), ${t_be}(R, C, 0, _), ${edge_tag} } != ${num}.`
      );
      area_id++;
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_left", 2));
    solver.add_program_line(display("edge_top", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VbRb5s+EH7PX1H5+R4wxmB4y6/L9pLRbe1UVQhFJGVLlER0pEwTUf733hmUxPSmSf1pnTRNhMvddyb+7uNsZ/etKeoSpKSPMuABehDo0N5S+vb2+utm9bgpkwsYN4/LqkYH4CqFL8VmV46yflA+2rdx0o6hfZdkwhdgbylyaD8m+/Z90qbQXmNKgERsip4U4KM7Obm3Nk/eZQdKD/0UfdU9dofuulg3ddXFH5KsvQFBs/xnnyVXbKvvpeh+wMaLajtfETAvHrGS3XL10Gd2zX21bvqxMj9AO+7IThiy6kSW3I4seUOyfTVEdrGqF5tyNv0NdOP8cEDRPyHhWZIR988n15zc62SPNrVWJnshvTA8VoyvSMrICSPvPPS92Al93wkD6YZuNgqcMFZu6GRVqN3QIalih2TgktQuSe07rLRLUp+RREnuUBJFiILz1hKKyA4xYjzEiPYQI+5DjAoYYobBqJQBFlC1Q4yKGmJMHQEzr2bqCJlnQ+bZiMEMw88wusTMHLYphhiji/SYibF5OZCRHzuXAxkhsDEZkHt9ktMbe5MBNTdSMxLJkNFSci9CRoxy0nATmWeCYOO/tTuCb+0NbhXQKmvfWOtZq62d2jETa2+tvbQ2sDa0YyLabF6wHXUr8GV0hJYoQWzwrNEGfNIDi8Rv8A12EPnGgPII/yX1TOGhx1z670XzUSYm91/Li7Sqt8UGD5m02c7L+hRfL4uHUuDZfhiJH8Le2Ef4T+Hfcf9Hjnt6Ad4rr7L/u+gzVPe4QKG9AvHQzIrZosIGQwkpjeuYTxwX88/S/fp+ln51DXADyUdP",
    },
  ],
};
