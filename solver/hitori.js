/** The Hitori solver. */

modules["hitori"] = {
  name: "Hitori",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(unique_num("not black", "row"));
    solver.add_program_line(unique_num("not black", "col"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(avoid_adjacent_color());
    solver.add_program_line(grid_color_connected("not black", 4, [puzzle.row, puzzle.col]));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`black(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display());
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VbLbttKDN37K4xZz2Ko52Pnpkk3qdPWuQgCQTBkV0GE2lAqW0Uhw/8eklJKz7iL3kWTTSGIIDmjw6PDMeXd965sK53g5SfaaMDLDzy+PZPybcbrtt5vqmyqZ93+sWnR0frm6ko/lJtdNcnHXcXk0KdZP9P9hyxXoLTy8AZV6P5zdug/Zv1c9wtcUjrA3PWwyUP3Utw7XifvYkiCQX8++ujeo7uu2/WmWl4PmU9Z3t9qRXXe8dPkqm3zo1IjD4rXzXZVU2JV7vFldo/107iy674237pxLxRH3c8GuosXukRnpOsLXXIHuuT9hi499pfppsXxiLJ/QcLLLCfu/4mbiLvIDmjn2UF5ET5KvebOKC8mpClSe0kkbiJ1Er7BRCQhuOseJnwJfXedKggDn/C9X2FA6KfbA8IXuIDQQwkJPZAwcJ8OLfSQ0KV26HIPCT2W0OUeuvgh4VsJ0vcEwdU3ogpWwn6DiCokEtr8Ixs9InRpReT2LiJtZXvsso8JXYrF9tmICV1qx3bfYvdcJKStgCWutgmhS+cSV5mE8KXRiYuf2ucutc9F6uqakq5SLnW1SQlfdAfjHjww7huAsQ8fGLt3YEhg4QTGPR0AZ1XgrApQFRESgKqcoILbRgCqI9IAkNT2DlttHAbAI+Ge7RVbj+0tTgzd+2zfszVsQ7bXvOeS7R3bC7YB24j3xDRz/nAq8TwKhjnkDSPqFbjlHol1elFTXzEuJrladO1Dua5wrM+77apqp/Om3ZYbhd/R40T9VHxz34N/n9Y3+rRSC8z/+sC+/S8rR3XxfPc3Wj11y3K5bjYK/51pzsdn+Vdnjz8/9Vjvm7ZWxeQZ",
    },
    {
      url: "https://puzz.link/p?hitori/10/10/1174453399113445756a2345678aa82513328aa85417a698323227a9411566517a43236688115329986a115274aa99886611",
      test: false,
    },
  ],
};
