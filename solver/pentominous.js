/** The Pentominous solver. */

function avoid_adj_same_pentomino(color = "grid") {
  /**
   * Generates a constraint to avoid adjacent ominos with the same type.
   * An split by edge rule, an omino rule should be defined first.
   */
  const t_be = tag_encode("belong_to_shape", `omino_5`, color);
  let constraint = "split_by_edge(R, C, R + 1, C) :- grid(R, C), grid(R + 1, C), edge_top(R + 1, C).\n";
  constraint += "split_by_edge(R, C, R, C + 1) :- grid(R, C), grid(R, C + 1), edge_left(R, C + 1).\n";
  constraint += "split_by_edge(R, C, R1, C1) :- split_by_edge(R1, C1, R, C).\n";
  constraint += `:- grid(R, C), grid(R1, C1), ${t_be}(R, C, T, _), ${t_be}(R1, C1, T, _), split_by_edge(R, C, R1, C1).`;
  return constraint;
}

modules["pentominous"] = {
  name: "Pentominous",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    const shaded = puzzle.surface.size;
    fail_false((puzzle.row * puzzle.col - shaded) % 5 === 0, "The grid cannot be divided into 5-ominoes!");
    solver.add_program_line(defined("hole"));
    solver.add_program_line(grid(puzzle.row, puzzle.col, true));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(all_shapes("omino_5", "grid"));
    solver.add_program_line(avoid_adj_same_pentomino("grid"));

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})..`);
      solver.add_program_line(`hole(${r}, ${c}).`);

      const edges = [
        [r, c - 1, r, c, BaseDir.LEFT.description],
        [r, c + 1, r, c + 1, BaseDir.LEFT.description],
        [r - 1, c, r, c, BaseDir.TOP.description],
        [r + 1, c, r + 1, c, BaseDir.TOP.description],
      ];

      for (const [r1, c1, r2, c2, direc] of edges) {
        const prefix =
          puzzle.surface.has(new BasePoint(r1, c1).toString()) &&
          puzzle.surface.get(new BasePoint(r1, c1).toString()) === color
            ? "not "
            : "";
        solver.add_program_line(`${prefix}edge_${direc}(${r2}, ${c2}).`);
      }
    }

    const shape_dict = {};
    for (const [i, o_type] of Object.keys(OMINOES[5]).entries()) {
      const o_shape = OMINOES[5][o_type];
      shape_dict[o_type] = i;
      solver.add_program_line(general_shape("omino_5", i, o_shape, "grid", "grid", "edge"));
    }

    for (const [point, shape_name] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Object.keys(shape_dict).includes(shape_name), `Shape ${shape_name} is not defined!`);
      const t_be = tag_encode("belong_to_shape", "omino_5", "grid");
      solver.add_program_line(`:- not ${t_be}(${r}, ${c}, ${shape_dict[String(shape_name)]}, _).`);
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
      data: "m=edit&p=7VRRb9owEH7nV1T3fA9xHIKTN9bBNInRbtAxZkUo0HRFA6ULzTQZ8d97Pocmk4jWqVqnSVPw+fN3Z/L5nLvdtzItMhSe/UmFNNMTCMXDVyEPr3qm6/tNFp9hv7y/zQsCiBfDId6km13W0VVU0tmbKDZ9NG9iDT4gDwEJmvfx3ryLzQTNhFyAAXEjQgLQJzio4Yz9Fp07UniExxUmOCe4WherTbYYOeYy1maKYN/zindbCNv8ewZuG69X+Xa5tsQyvafD7G7Xd5VnV17nX8sqViQHNH0nd3BCrqzlWujkWnRCrj3FH5YbJYcDpf0DCV7E2mq/qqGq4STeQy+EOEBQyk0RT5HHk/ACmilwTIHSt/8+Jrnu+kBKS8waBP2VhssG0bPEx5pQHDGsiahribc1ITx6tYZ5kyFNGqYNpktiNVw1GY753GBClmuz+8iw3k9Hho4l4j3ZOdshW5/tlNKDRrJ9zdZj22U74pgB2xnbc7YB25BjejbBT7wCl9/ny4GwR1mIFEKoKIkOiCOgdFjgK0E1TAtJWATo+5RLxlTf9ootjjz0I9pJWAYBSptvxtQUuvRJyF+eXEvXOn5+uv8el3Q0TMriJl1lVGmD6y/Z2TgvtumGVuNyu8yK45oa3aEDP4CHlrZv/u99f6n32SvwXrj8ntsNNGX3sTzRXCDclYt0scrpU6MUOndVsa1uV8Rt7qquW9zHUm91u+o/7Q57wW86grBth/LbHKLN4bW9PHr6y1/8e6A2mXQeAA==",
    },
  ],
};
