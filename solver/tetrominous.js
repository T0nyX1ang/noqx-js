/** The Tetrominous solver. */

function avoid_adj_same_tetromino(color = "grid") {
  /**
   * Generates a constraint to avoid adjacent ominos with the same type.
   * An split by edge rule, an omino rule should be defined first.
   */
  const t_be = tag_encode("belong_to_shape", `omino_4`, color);
  let constraint = "split_by_edge(R, C, R + 1, C) :- grid(R, C), grid(R + 1, C), edge_top(R + 1, C).\n";
  constraint += "split_by_edge(R, C, R, C + 1) :- grid(R, C), grid(R, C + 1), edge_left(R, C + 1).\n";
  constraint += "split_by_edge(R, C, R1, C1) :- split_by_edge(R1, C1, R, C).\n";
  constraint += `:- grid(R, C), grid(R1, C1), ${t_be}(R, C, T, _), ${t_be}(R1, C1, T, _), split_by_edge(R, C, R1, C1).`;
  return constraint;
}

modules["tetrominous"] = {
  name: "Tetrominous",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    const shaded = puzzle.surface.size;
    fail_false((puzzle.row * puzzle.col - shaded) % 4 === 0, "The grid cannot be divided into 4-ominoes!");
    solver.add_program_line(defined("hole"));
    solver.add_program_line(grid(puzzle.row, puzzle.col, true));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(all_shapes("omino_4", "grid"));
    solver.add_program_line(avoid_adj_same_tetromino("grid"));

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
    for (const [i, o_type] of Object.keys(OMINOES[4]).entries()) {
      const o_shape = OMINOES[4][o_type];
      shape_dict[o_type] = i;
      solver.add_program_line(general_shape("omino_4", i, o_shape, "grid", "grid", "edge"));
    }

    for (const [point, shape_name] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Object.keys(shape_dict).includes(shape_name), `Shape ${shape_name} is not defined!`);
      const t_be = tag_encode("belong_to_shape", "omino_4", "grid");
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
      data: "m=edit&p=7VNNj9owEL3nV6x8nkM+TADf6BaqSjS0hWq1iiIUstkuKijbQKrKiP/Om3FoDqXqx6rbS2X5+XlmnLwZe3afm7wuKcaIBuRTgBHGscxAa5l+Oxbr/aY0VzRq9g9VDUI0m0zoPt/sSi9tozLvYIfGjsi+MqkKFckMVEb2nTnYN8YmZOdwKdKwTcECRSHouKM34md27YyBD560HPQWtFjXxaZcTp3lrUntghT/54WcZqq21ZdSuWOyL6rtas2GVb5HMruH9WPr2TV31aemjQ2yI9mRkzu+IDfq5DJ1cpldkMtZ/GW5w+x4RNnfQ/DSpKz9Q0cHHZ2bgwpDZTSpyC3aLT1eEJBwgOavziDTXZvSfTa87gxxjw3zztCXI5zZ2SARi7MBXw7MAXgrOBEMBRdQRjYSfCnoC/YEpxIzFrwRvBbUgrHE9Dm3X8zepfh0OSgSijIcILsYPcL5R8wjwr7lsHOhop9KT8NQ2s6N3p/zzMOtNPV9XpR4JeO7j+VVUtXbfINd0mxXZX3eo0mPnvqqZKZQjcf9v2//Td/yFfjP/H6f2k4pqvvt6ZOdkXpslvmyqPDUUMLW7brhh27XIJfdkY5/04GO/M7x7FVDM2feCQ==",
    },
  ],
};
