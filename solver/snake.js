/** The Snake solver. */

function exclude_checkboard_shape(color = "black") {
  /**
   * Exclude checkboard-shape shading.
   */
  let rule = `:- ${color}(R, C), not ${color}(R, C + 1), not ${color}(R + 1, C), ${color}(R + 1, C + 1).\n`;
  rule += `:- not ${color}(R, C), ${color}(R, C + 1), ${color}(R + 1, C), not ${color}(R + 1, C + 1).`;
  return rule;
}

function simple_shade_path(color = "black", adj_type = 4) {
  /**
   * Generate a rule to ensure the shaded path is a simple path.
   * An adjacent rule should be defined first.
   */
  const adj_count = `#count { R1, C1: ${color}(R1, C1), adj_${adj_type}(R, C, R1, C1) }`;

  let constraint = `pass_by_loop(R, C) :- grid(R, C), ${color}(R, C), ${adj_count} = 2.\n`;
  constraint += `dead_end(R, C) :- grid(R, C), ${color}(R, C), ${adj_count} = 1.\n`;
  constraint += `:- { dead_end(R, C) } != 2.\n`;
  constraint += `:- grid(R, C), ${color}(R, C), not pass_by_loop(R, C), not dead_end(R, C).`;
  return constraint;
}

modules["snake"] = {
  name: "Snake",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("gray"));
    solver.add_program_line(exclude_checkboard_shape("gray"));
    solver.add_program_line(avoid_rect(2, 2, "gray"));
    solver.add_program_line(simple_shade_path("gray"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      if (r === -1 && c >= 0 && c < puzzle.col && Number.isInteger(num)) {
        solver.add_program_line(count(num, "gray", "col", c));
      }

      if (c === -1 && r >= 0 && r < puzzle.row && Number.isInteger(num)) {
        solver.add_program_line(count(num, "gray", "row", r));
      }
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "circle_L__1") {
        solver.add_program_line(`gray(${r}, ${c}).`);
        solver.add_program_line(`:- dead_end(${r}, ${c}).`);
      }
      if (symbol_name === "circle_L__2") {
        solver.add_program_line(`gray(${r}, ${c}).`);
        solver.add_program_line(`:- not dead_end(${r}, ${c}).`);
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
      data: "m=edit&p=7VXPj9o8EL3zV6x89iG2E/LjUtHt0gvNtg2fVihCKKRZgTY0NCFVZcT/vjPjbMNuLPVbVeW0MhnNex7bz2N7aH60WV1w4eJPBdzhAprnO/S5/pg+p2vz7aEsois+aQ+bqgaH89vplN9nZVOMUhwJbTk66jDSE64/RikTjDMJn2BLrr9ER/0p0guuE+hiPABuZoIkuDe9e0f96F0bUjjgx50P7gLcfFvnZbGaGeZzlOo5Z7jOexqNLttVPwvW6UCcV7v1Fol1doDNNJvtvutp2m/VQ9vFiuWJ64mRm1jkql4uukYueha5uIu/l1vuK5vQcHk6QcK/gtRVlKLq/3o36N0kOoKNoyNTIQ59ByrMqTBXAOH1UAEMeugClD0cA4Tb8gQDgOo39JznEIPPl/JxMrwlBgqB8f1aYoz9/ezSwf4zrHDCJzGwH0G7WsCuPJ96nieZhbiXASsEpgAmeUGTeguNkwzpAFcc0NKRVlrao5V1Senaoz1vSMP+p5QFSXYOx821IvuBrEPWIzujmBuyd2SvybpkxxTj44X5n1eK0h7AuYIwae7X+an8I22p55tSM2hvfFeCU5a09X2WF1Az4na3LuqruKp3WQk42WT7gkGZPo3YL0YfvVn3rXJfvHJj8p1X1e8LvK8/yEkhr/AC9S1n+3aVrfIKbhVkDXnfs/MqfA0fI09/HFC7qfLbAl4OvHiaoBKx5nv2gI/pEQ==",
    },
    { url: "https://puzz.link/p?snake/11/11/00000000000000000000000000000000000000000957664857598o9", test: false },
    {
      url: "https://puzz.link/p?snake/15/15/13a3b00000a3d3a00000a3a4a00030a3a3a10000d3aca03001a3a3a10039a3d3a00100j3a39zp",
      test: false,
    },
  ],
};
