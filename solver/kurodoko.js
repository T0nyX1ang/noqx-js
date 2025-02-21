/** The Kurodoko solver. */

modules["kurodoko"] = {
  name: "Kurodoko",
  category: "shade",
  aliases: ["kuromasu"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent());
    solver.add_program_line(avoid_adjacent_color("black"));
    solver.add_program_line(grid_color_connected("not black"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      solver.add_program_line(bulb_src_color_connected([r, c], "not black"));

      if (Number.isInteger(num)) {
        solver.add_program_line(count_reachable_src(num, [r, c], "bulb", "not black"));
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
      data: "m=edit&p=7VXBjtowEL3zFWjOc4jjxBDf6HbphbJtoVqtogiFNKtFGxQaSFUZ8e87M0lJUPfQHkqlqgp+em9mHL+MZbP/WqdVjkrxT4/RQ2IYhEaGUr4Mr32Wm0OR2yFO6sNTWRFBvJtO8TEt9vkgbquSwdFF1k3QvbMxKEDwaShI0H20R/feujm6BaUAA4rNmiKf6G1H7yXP7KYJKo/4vOGG6APRbFNlRb6aUZYiH2zslgi8zhuZzRS25bccWh+ss3K73nBgnR7oY/ZPm12b2ddfyue6rVXJCd2ksbv4YZfttHZ1Z5dpY5fZH7Nb7MrXjEbJ6UQN/0RWVzZm1587Ou7owh4J5/YI2qepykPTbAoEY37VkHy2gZAL/E6GJMOzNMFF1vBsfZZj71JycXCWkbmQyuPJPa145W4ppbjedNrn+p4OeLW+5uVGnQ55fk8bru9/qjLR5YojdjDuaX5DT0ecj1pNDVXS1gfBqaAvuKSuo9OCbwU9wVBwJjW3gveCN4KBoJGaEe/bL+4saA3WR9D0/UGzzVfwFmu6HV55wn83mgxiWNTVY5rldBjn9XadV8N5WW3TAujeOw3gO8igM0DX6P+r8OpXITff+60L8e+f4pj6qgN0dwi7epWusrIA+h9Fieuf4ld3T0cdnuuqpF6XkAxeAA==",
    },
    {
      url: "https://puzz.link/p?kurodoko/9/9/h3j4g3j4l.j4g3j.ldl.j5g6j.l7j5g6j5h",
      test: false,
    },
  ],
};
