/** The Firefly (Hotaru Beam) solver. */

function convert_direction_to_edge() {
  let rule = 'edge_top(R, C) :- grid_out(R, C, "r").\n';
  rule += 'edge_top(R, C) :- grid_in(R, C, "r").\n';
  rule += 'edge_left(R, C) :- grid_out(R, C, "d").\n';
  rule += 'edge_left(R, C) :- grid_in(R, C, "d").\n';
  return rule.trim();
}

function restrict_num_bend(r, c, num, color) {
  let rule = `reachable(${r}, ${c}, ${r}, ${c}).\n`;
  rule += `reachable(${r}, ${c}, R, C) :- ${color}(R, C), grid(R1, C1), reachable(${r}, ${c}, R1, C1), adj_loop_directed(R1, C1, R, C).\n`;
  rule += `bend(R, C) :- ${color}(R, C), grid_in(R, C, "l"), not grid_out(R, C, "r").\n`;
  rule += `bend(R, C) :- ${color}(R, C), grid_in(R, C, "u"), not grid_out(R, C, "d").\n`;
  rule += `bend(R, C) :- ${color}(R, C), grid_in(R, C, "r"), not grid_out(R, C, "l").\n`;
  rule += `bend(R, C) :- ${color}(R, C), grid_in(R, C, "d"), not grid_out(R, C, "u").\n`;
  rule += `:- #count{ R, C: grid(R, C), reachable(${r}, ${c}, R, C), bend(R, C) } != ${num}.\n`;

  rule += "firefly_all(R, C) :- firefly(R, C).\n";
  rule += "firefly_all(R, C) :- dead_end(R, C).\n";
  return rule;
}

modules["firefly"] = {
  name: "Hotaru Beam",
  category: "loop",
  aliases: ["hotaru", "hotarubeam", "firefly"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("dead_end"));
    solver.add_program_line(defined("firefly_all"));
    solver.add_program_line(grid(puzzle.row + 1, puzzle.col + 1));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("{ firefly(R, C) } :- grid(R, C), not dead_end(R, C).");
    solver.add_program_line(fill_path("firefly", true));
    solver.add_program_line(adjacent("loop_directed"));
    solver.add_program_line(directed_loop("firefly"));
    solver.add_program_line(grid_color_connected("firefly_all", "loop_directed"));
    solver.add_program_line(convert_direction_to_edge());

    const drdc = { 1: [0, 1], 2: [1, 0], 3: [0, -1], 4: [-1, 0] };
    const dict_dir = { 1: "r", 2: "d", 3: "l", 4: "u" };

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d, BaseDir.TOP_LEFT);
      const [shape, style] = symbol_name.split("__");
      if (shape !== "firefly") continue;

      const [dr, dc] = drdc[style];
      const clue = puzzle.text.get(new BasePoint(r, c, BaseDir.TOP_LEFT, "normal").toString());

      if (Number.isInteger(clue)) {
        solver.add_program_line(restrict_num_bend(r + dr, c + dc, clue, "firefly"));
      }

      solver.add_program_line(`dead_end(${r}, ${c}).`);
      solver.add_program_line(`grid_out(${r}, ${c}, "${dict_dir[style]}").`);
      solver.add_program_line(`{ grid_in(${r}, ${c}, D) } :- direction(D), D != "${dict_dir[style]}".`);
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
      data: "m=edit&p=7VbfT9s8FH3vX1H5aZP8kMT5/cZY9710ZRtMCEVVlZYwqrUKX9pMzFX/d66Pw2JsUAVIPKE0V7fH914f2ye2N/+3ZVNxP1Q/kXKP+/REiYc3TGK8XvecLberKh/yo3Z7XTfkcH4y4VflalMNCpVIz3Swk1kuj7j8Ly9YwHj3Trn8nu/k11xOuDylJkaxXI7J8xkPyB317jnalXesQd8jf6L9mNwLchfLZrGqZmNd6FteyDPOVD+fkK1ctq7/VEyn4f+iXs+XCpiXWxrL5np507Vs2sv6d9vF+tM9l0ea7ugRuqKnq1xNV3mP0FWjeDXd6vJXdfsY02y639OM/yCus7xQtH/2btq7p/mO7CTfMREHKpdocCpA9UScKkAYSBLaSIokE8m8+8nqkNATCqHl7pHIygr9zEYCu3IYIMusI8AwNJAQWWZMBM4GoMdpFk5Q2KScOnQy347JEqtwhqQeiHwM3KgSBbFCIgMRoGfUjULEGECEGTXLxCBjAsjxDCRBiJmUPuyJlt3H4l/8W/yAs6tlU12t/kKenQIo/CEKFQgbhRJCG4Ua7FitCLuuVoXNQSvDrqvV4cRCIU5vUInTG5TiVIBanFjMjsMBsnFiIR0nFvJxYiEhhy90ZMdqMTkoBGWPQovK5qCF5VSAupxYKMxFVQWbr5aawwFye9gbie0LJBfAntEWxKWA/QzrwUawY8SMYM9hj2FD2BgxidrEnrXNmap/GR0Wp7RqWao+j4DORpo+cZBiESX6GHSed7y7HhRsRIfZcFI363JFR9qkXc+r5v4/XR/2A3bL8JIEfR6+3yje/kahZt974w/utd9/Icdqk+JRyrg84eymnZWzRU0ao7k70Djqv/KnmlOPi+zp7APNB4rH6vZNsn5JNu1Tzy375itHO+P9ATH8cF1vy6Ydzqty/ZFNB3c=",
    },
    { url: "https://puzz.link/p?firefly/10/10/4.40g20c32j1.b3.h32d41a23c4.d3.b2.g3.j2.a3.e1.d1.b10h30", test: false },
  ],
};
