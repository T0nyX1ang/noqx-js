/** The Kurochute solver. */

function count_sight(src_cell, distance, color = "black") {
  /**
   * Generate a rule to count the number of color cells in the distance of sight.
   */
  const [r, c] = src_cell;
  const cells = [
    [r + distance, c],
    [r - distance, c],
    [r, c + distance],
    [r, c - distance],
  ];
  return `:- { ${cells.map(([r0, c0]) => `${color}(${r0}, ${c0})`).join(";")} } != 1.`;
}

modules["kurochute"] = {
  name: "Kurochute",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(avoid_adjacent_color("black"));
    solver.add_program_line(grid_color_connected("not black", 4, [puzzle.row, puzzle.col]));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      if (typeof num === "number") {
        solver.add_program_line(count_sight([r, c], num));
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
      data: "m=edit&p=7VZNj9o8EL7zK1Y+zyG280Fyqeh26YWybaFaraIIhTQr0AaFBvKqMuK/78wkwknEoa8q0UOryKN55osn43HM4UedVjlIDVKCHoMDEh9PK3A9H6QKeDnts9weizy6g0l93JQVKgCP0ym8pMUhH8VtVDI6mTAyEzAfo1hIAULhkiIB8yU6mU+RmYNZoEuAi7ZZE6RQfbDqE/tJu2+M0kF93uqoPqOabausyFezxvI5is0SBP3Oe84mVezK/3LR8iCclbv1lgzr9Igvc9hs963nUH8vX+s2ViZnMJOG7uIKXW3pktrQJe0KXXqL36db7MtrRMPkfMaGf0Wqqygm1t+sOrbqIjqhnEcnoX1KfYcsml0ROkSDukBX9iGF01C0cIwQp6WFHkEb7FEp9wJ9KmWDA7dXKqDKnoVUynrHqlc5pFxbOfR6UDrkttHSIb8tJp1+cSmJWRdTfCdfkb9TX/W54qHoxw+aJl1ijwfoggd8XMrvYG5cJ993+n6/vwvSH/x+MMgfE+7EhwN+4aBe2I9XkvjbnVOS+osfgwvu9gsHS/J4PbOcslQslzh9YDTLDywdlh7LGcc8sHxiec/SZelzTEDz+4sTzrOtcAy1iNxm3G/ALda00dcfGpm/3JOMYrGoq5c0y/EDNq9367y6m5fVLi0E3hXnkfgpePG8uf+uj5tfH9R8539dIn/+xMfYV0+DeQSxr1fpKisLgf89gOx4Hof2m7PHz4J4rasy29THXCSjNw==",
    },
  ],
};
