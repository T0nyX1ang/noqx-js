/** The Yajilin solver. */

modules["yajilin"] = {
  name: "Yajilin",
  category: "loop",
  aliases: ["yajirin"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("gray"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("{ black(R, C); white(R, C) } = 1 :- grid(R, C), not gray(R, C).");
    solver.add_program_line(fill_path("white"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(avoid_adjacent_color("black", 4));
    solver.add_program_line(grid_color_connected("white", "loop"));
    solver.add_program_line(single_loop("white"));

    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`gray(${r}, ${c}).`);

      // empty clue or space or question mark clue (for compatibility)
      if (typeof clue === "string" && (clue.length === 0 || /^\s*$/.test(clue) || clue === "?")) {
        continue;
      }

      fail_false(typeof clue === "string" && clue.includes("_"), "Please set all NUMBER to arrow sub and draw arrows.");
      const [num, d2] = clue.split("_");
      fail_false(/^\d+$/.test(num) && /^\d+$/.test(d2), `Invalid arrow or number clue at (${r}, ${c}).`);
      solver.add_program_line(yaji_count(parseInt(num), [r, c], parseInt(d2), "black"));
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})..`);
      solver.add_program_line(`black(${r}, ${c}).`);
    }

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("black", 2));
    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRRb5tADH7Pr6j87AeOu1ByL1PWNXth6bZkqiqEEGFUZUtGR8LUXZT/Xp+PjEwlU6tKnSZN5JyPz/bx2Rxef2+yukDh2Z8Mkf7pUiLk5YcBL6+95uVmWegTHDebm6omgHgxmeB1tlwXg7iNSgZbM9JmjOatjkEAgk9LQILmg96ad9pM0czIBRgSF7kgn+B5By/Zb9GZI4VHeEqYNhMErwjmZZ0vizRyzHsdmzmCfc5rzrYQVtWPAlod9j6vVovSEotsQ8Wsb8rb1rNuPldfmzZWJDs0Yyc32stVnVzZybXQybWoR66t4tlyl+W34q5P6SjZ7ajjH0lrqmMr+1MHww7O9JbsVG9Bejb1Fcmwr4b2GwreK7W6WyqQlpKp7KiQ08QhNfJd1EGi8DjTT+172nNi+JCTba53wCnl4g65gHN/qaUaBFdyxXbC1mc7p0LRSLZv2Hpsh2wjjjlne8n2jK1iG3DMqW3VI5sJKgCtXEufIwqUT50YhdRzETqgFCqqWiJI+hYteqTyWLrv9/dr+O9xySCGWVNfZ3lBZz6is38yrepVtqS7abNaFPX+nqbNbgB3wCuWdnj9H0AvP4Bs970njaG//yHHZoYqQHOBcNukWZpXdLyobX/kT4/w4RP5Y/v0Pjfaz4QjTjcm+p00VfodNHceOF78DdHMgp/Zl5JOFySDew==",
    },
    {
      url: "https://puzz.link/p?yajilin/19/13/g24g33f45o23d30g32z43k41y11a11a42zo33a14a12b11d31a32c21e11t36g31e21y",
      test: false,
    },
  ],
};
