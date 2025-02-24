/** The Patchwork solver. */

function count_patchwork_src(target, src_cell, color = "black") {
  /**
   * Generate a constraint to count the reachable patchwork cells starting from a source.
   */
  const tag = tag_encode("reachable", "grid", "src", "adj", "edge");
  const [src_r, src_c] = src_cell;
  return `:- #count{ R, C: ${tag}(${src_r}, ${src_c}, R, C), ${color}(R, C) } != ${target}.`;
}

function patchwork_avoid_area_adjacent(color = "black") {
  /**
   * Generate a constraint to avoid the same color in adjacent edges.
   */
  const constraint = [
    `:- grid(R, C), grid(R - 1, C), edge_top(R, C), ${color}(R, C), ${color}(R - 1, C).`,
    `:- grid(R, C), grid(R, C - 1), edge_left(R, C), ${color}(R, C), ${color}(R, C - 1).`,
  ];
  return constraint.join("\n");
}

modules["patchwork"] = {
  name: "Patchwork",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line("{ black(R, C); white(R, C) } = 1 :- grid(R, C), not gray(R, C).");
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(all_rect_region(true));
    solver.add_program_line(patchwork_avoid_area_adjacent("black"));
    solver.add_program_line(patchwork_avoid_area_adjacent("white"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(grid_src_color_connected([r, c], null, null, null, "edge"));
        solver.add_program_line(count_patchwork_src(num, [r, c], "black"));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (color === BaseColor.GRAY) {
        solver.add_program_line(`gray(${r}, ${c}).`);
      } else if (color === BaseColor.BLACK) {
        solver.add_program_line(`black(${r}, ${c}).`);
        solver.add_program_line(`not gray(${r}, ${c}).`);
      } else {
        solver.add_program_line(`white(${r}, ${c}).`);
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("black"));
    solver.add_program_line(display("edge_left"));
    solver.add_program_line(display("edge_top"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZNb9s8DL7nVxQ662B9+PMyZJ27S5duS4eiMIzATd01WAJ3Tj0MCvLfS1LqHL+Lm+bN1mHA4Jh8/JCSSEqms/zaFHXJhYc/FXHQcGkR0S2jgG7PXeez+3mZHPFhc39b1QA4Pzs54TfFfFkOMueVD1YmTsyQm7dJxiTjdAuWc/MhWZl3iRlxMwYT4xFwp4AE4xJg2sILsiM6tqTwAI8cBngJcDqrp/NycmqZ90lmzjnDdV7TaIRsUX0rmR1Gz9NqcTVDopjfzB23bK6rL43zEvmam6ENNH0MVLeBqjZQhDZQRFsCxfgPDvSquIeqL29nd9vCjfP1Ggr+EQKeJBnG/qmFUQvHyYopjyURZ0pZFZPS2qqQlB+RCqxLaMnQekbCqoBUbF1in5Tw7NzCk07bMULY6YWwo4SwCwjl/JRdQmjH+3YR4Tv/wPkFuA7kMcI8YG5ba3uuKAc6aj8ImLXjgXl1CMywMwSTzJhqCcyzM4Ry6oyh7DL2apOhUf4Gg5n+h6HoNufB7LsM1qG7OlZkI0CohUhWIC9JnpCUJM9hy7lRJN+Q9Ej6JE/JJyV5QfKYpCYZkE+Ih+bZxwpC1XCeIE8JpYeNgicN0Uq7X4dHyrSEyWM8phKmRyBVzKWGQ6cAaw8wRIFYKC4lFBixDB2/M9VM2c7Xvfy/j8sHGRs39U0xLaFdpNefy6NRVS8K7HWjZnFV1o/P0KfXA/ad0Z0pbPv/WveLt24svvfMN+1XvU6HvviZGXMluDnj7K6ZFJNpBdsBtSNe/mZ+33X39Nd+Dx9s49O2EfWZXW/qM7sW1Wd23Wy7WUvdZ1D7GsKoxxBvLVTKAxHvadiRzc5aPFlJ+EL8uVr0bsTO7T+wIoJLH/5Z/B/zE4en1/Dzu/HinQk+1fngAQ==",
    },
  ],
};
