/** The Statue Park solver. */

modules["statuepark"] = {
  name: "Statue Park",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    const shapeset = puzzle.param["shapeset"];
    let omino_num, omino_count_type;

    if (shapeset === "tetro") {
      omino_num = 4;
      omino_count_type = 1;
    } else if (shapeset === "pento") {
      omino_num = 5;
      omino_count_type = 1;
    } else if (shapeset === "double_tetro") {
      omino_num = 4;
      omino_count_type = 2;
    } else {
      throw new Error("Shape set not supported.");
    }

    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("not gray", 4, [puzzle.row, puzzle.col]));

    solver.add_program_line(all_shapes(`omino_${omino_num}`, "gray"));

    for (const [i, o_type] of Object.keys(OMINOES[omino_num]).entries()) {
      const o_shape = OMINOES[omino_num][o_type];
      solver.add_program_line(general_shape(`omino_${omino_num}`, i, o_shape, "gray", "grid", 4));
      solver.add_program_line(count_shape(omino_count_type, `omino_${omino_num}`, i, "gray", "grid"));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "circle_M__2") {
        solver.add_program_line(`gray(${r}, ${c}).`);
      }
      if (symbol_name === "circle_M__1") {
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`gray(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("gray"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      url: "https://puzz.link/p?statuepark/12/12/3g3g6000515100003ala0i003g3a0060515160003g3g0000//p",
      config: { shapeset: "pento" },
      test: false,
    },
    {
      data: "m=edit&p=7VZNa9tAEL37V5Q5T0Gz+rCsm+vGvThJW7uEIIRRVKURlaPUjtpmjf97ZkcqgngOpZAUShH7eH4az74ZxrvefWvzbYlESB76MXrIDIMwwoBiDGksy+ufVXVfl8krnLb3N82WCeL5fI7Xeb0rR2kflY32dpLYKdp3SQoECIYXQYb2Q7K3pwkUzeaqArRLfg9I/GLRRRqmJwO9kPeOzTqRPOZnPWd6ybSotkVdrhed8j5J7QrBbfZGvu0obJrvJfRm3OfOAAtX9Y+bXtu1n5uvbR9F2QHtVNza5S+j8WDUH4w62hl1TDHq/D+b0Ul2OHC/P7LVdZI6158GGg90mewZzwRJ8DLZQ+hzGuJtOmunYg3CSFPHY02NSVXVvHGoqm4381SdGFXVY1Vnk1iLJc/TZbffUQ7y1NREatVEatlEat1ELvexE6NWTkbPbQI9Wm0UGb0nvt4TX69SHxrSpobHbC7DZgRXPItofcG3gp5gKLiQmBPBC8GZYCAYSczYTfNvzjsE3GCuKmK/8fHwP5O31DdyhD59wn9BzUYpLNvtdV6UfBjNms1ds6vuS+Aj/zCCnyAr9d0N8v8WeOlbwPXe++O74O/8VFPuazBGe45w167zddHUwP8g0OmRf6S/uHv+PcNDdfv6Ib/9AtnoEQ==",
      config: { shapeset: "double_tetro" },
    },
  ],
  parameters: {
    shapeset: {
      name: "Shape Set",
      type: "select",
      default: {
        tetro: "Tetrominoes",
        pento: "Pentominoes",
        double_tetro: "Double Tetrominoes",
      },
    },
  },
};
