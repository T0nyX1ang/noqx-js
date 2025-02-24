/** The Putteria solver. */

function putteria_fill_constraint() {
  /**
   * Generate a constraint for the number filling in putteria.
   */
  return ":- area(A, _, _), #count { R, C : area(A, R, C), number(R, C, N) } != 1.";
}

function putteria_avoid_num_adjacent(adj_type = 4) {
  /**
   * Generate a constraint to avoid adjacent cells with the same number.
   */
  return `:- number(R, C, _), number(R1, C1, _), adj_${adj_type}(R, C, R1, C1).`;
}

modules["putteria"] = {
  name: "Putteria",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent());
    solver.add_program_line(putteria_avoid_num_adjacent());
    solver.add_program_line(unique_num("not gray", "row"));
    solver.add_program_line(unique_num("not gray", "col"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(fill_num(Array.from({ length: 1 }, (_, i) => ar.length + i), "area", i, "gray")); // prettier-ignore
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`gray(${r}, ${c}).`);
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      } else {
        // compatibility with puzz.link
        solver.add_program_line(`gray(${r}, ${c}).`);
      }
    }

    solver.add_program_line(putteria_fill_constraint());
    solver.add_program_line(display("gray", 2));
    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVNb9s4EL37VwQ88yB+itItmzq9ZJ1unSIIBMNwHKUxasOpP4pChv973lBDyAFsZIFFtzkUsujH0XD4OG80Wn/fTla1LHCZIDOpcJmQxTtY+mV83cw287o8k+fbzdNyBSDl9eWlfJzM13WvYq9Rb9cUZXMum49lJZSQQuNWYiSbf8pd83fZ9GUzxCMhA2xXrZMG7HfwNj4ndNEaVQY8YAx4BzidrabzenzVWj6VVXMjBe3zV1xNUCyWP2rBPGg+XS7uZ2S4n2xwmPXT7JmfrLcPy29b9lWjvWzOW7qDI3RNR5dgS5fQEbp0il9Mtxjt90j7ZxAelxVx/9LB0MFhuRPGizJIYW38c+3MB/zBYcAOlTgDzVa26PrKQIteGWj5K4PKMlhMN1cac9fNNcW03dzQ85znIKLKHca7OF7GUcfxBgeRjYnjhzhmcXRxvIo+fRxCoWxVkYtSI2LwwAXjXGoiR7jIgA1j2FWyB2DFuAAGOWCdKWAQj1gDO8YGGDkhrBBTtzG1gl0nuwVu+WiFvUy7l9awG7ZrB4xURgwOtuWgNThY5mCw1vFaCw6OOVjsRbpEDH/P/g6cPXN22MvzXg57kWyEPeLkHMcjTs5xPHzy5OOB2xxqj/iB4+fwCeyTg1vB3HLwL5g/GokuOCcBfArmU6DRZAkb4HZfyn/SC1pBI45DOWe9Yp5ZI+gDfJDzpBHlPGmkwF8d5F+lPGNt0kuTXryWtEjaafjr5I+zJ+1Ii6QXWqc2zNmQXkkj8Ew6Wpw96UjaWd7Xkta8lrRL+jqsdbyWdHRJU9Kd1zrS/UDfVA8O53V8XtLXs7+nGkhawyfVgwcHf6BvnnQk3dmHNE01kFMNsA9pmuohwCewT4BPqgd611I9QOuuBsCnYD4Fcl5QzvES38ZX+SKONo4+vuI5dbJ/2evahvbfu8mbdCq8rfTZPLyo2b0jy6hXieF29TiZ1viC9B++1meD5WoxmWM22C7u61Wa4wO+74mfIt6xh9s/3/Tf9E0nCbL3Vu1v0KmaoUQ3aa6leN6OJ+PpEjWG3JEdXemo3drjdnPC/5T9VJxT+x7h+b9nE+0DBDabejWbiFHvBQ==",
    },
    { url: "https://puzz.link/p?putteria/7/7/4dvovcel0eprhelnrgk.zzi", test: false },
  ],
};
