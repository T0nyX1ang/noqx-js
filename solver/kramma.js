/** The KaitoRamma solver. */

function straight_line() {
  /**
   * Generate a straight line rule.
   */
  const rule = [
    ":- grid(R, C), grid(R + 1, C), edge_left(R, C), not edge_left(R + 1, C).",
    ":- grid(R, C), grid(R + 1, C), not edge_left(R, C), edge_left(R + 1, C).",
    ":- grid(R, C), grid(R, C + 1), edge_top(R, C), not edge_top(R, C + 1).",
    ":- grid(R, C), grid(R, C + 1), not edge_top(R, C), edge_top(R, C + 1).",
  ].join("\n");

  return rule;
}

modules["kramma"] = {
  name: "KaitoRamma",
  category: "region",
  aliases: ["kaitoramma"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(defined("white"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(straight_line());
    solver.add_program_line(avoid_unknown_src(null, "edge"));

    const tag = tag_encode("reachable", "grid", "src", "adj", "edge", null);
    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "circle_M__1") {
        solver.add_program_line(`white(${r}, ${c}).`);
        solver.add_program_line(grid_src_color_connected([r, c], null, null, null, "edge"));
        solver.add_program_line(`:-${tag}(${r}, ${c}, R, C), black(R, C).`);
      }

      if (symbol_name === "circle_M__2") {
        solver.add_program_line(`black(${r}, ${c}).`);
        solver.add_program_line(grid_src_color_connected([r, c], null, null, null, "edge"));
        solver.add_program_line(`:-${tag}(${r}, ${c}, R, C), white(R, C).`);
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7Vbva9s8EP6ev6LcZw10ku3Y/pZlyb6k6bZmlGJMcFOvNUvqLj+2twr533s6G8LwlUHLAi8MR5cnj06nR2edlM2PXbEuFWr/sbGib3oCjLmZOOKm22dWbZdleqYGu+19vSag1MV4rL4Vy03Zy1qvvLd3SeoGyn1MMzCguCHkyn1O9+48hUW9uqlAuUvqB4XUMSGEoAzB0RFecb9Hw4ZETXjaYoLXBBfVerEs55OG+ZRmbqbAT/aeR3sIq/pnCc0w/t0IIOJm+eu+5Ta72/r7rvXC/KDcgNW6kSDUHoV62Aj1SBDq9f81oUl+OFC+v5DUeZp51V+PMD7Cy3RPdsoW2V6ne7CWwiBN00g7Z2lgA2JNh41E31jyDcQIgY/QZcUIIUqzhUZkE4mNxLVFfWm2vtfb8e173y7r9XbYWFxFIsZNQolFraUQqMUYqMWFIIo5RhRThEae0ohLRCtmH61fTjcI75cuHfjXItByEN4y3Snl3YGhnJPI6xZoIbFUF2OuDsN2RsWjnGX7ga1mG7KdsM+I7RXbIduAbcQ+fV9+ry7Q18mBCOkFJjEdvCZUxlAO7R8lZrY5+n9/wv8fl/cyGN3elWfTer0qlnRoDuvVY72ptiXQ1XTowX/ALbP+pvt3W536tvK51ycuibdWaEZ5BYOGq0m5CwWPu3kxX9S0vyh5TbehP0uBfrH7LaOpol8c15R4p/vkGaQzBJ6qh3dPxcMd5L1n",
    },
  ],
};
