/** The Rail Pool solver. */

function len_segment_area(color = "grid") {
  /**
   * Generate a rule to get the length of segments.
   */
  let rule = `nth_horizontal(R, C, 0) :- grid_direction(R, C, "r"), not grid_direction(R, C, "l").\n`;
  rule += `nth_horizontal(R, C, N) :- grid_direction(R, C, "l"), nth_horizontal(R, C - 1, N - 1).\n`;
  rule += `nth_vertical(R, C, 0) :- grid_direction(R, C, "d"), not grid_direction(R, C, "u").\n`;
  rule += `nth_vertical(R, C, N) :- grid_direction(R, C, "u"), nth_vertical(R - 1, C, N - 1).\n`;

  rule += `len_horizontal(R, C, N) :- nth_horizontal(R, C, 0), ${color}(R, C + N), nth_horizontal(R, C + N, N), not grid_direction(R, C + N, "r").\n`;
  rule += `len_vertical(R, C, N) :- nth_vertical(R, C, 0), ${color}(R + N, C), nth_vertical(R + N, C, N), not grid_direction(R + N, C, "d").\n`;
  rule += `len_horizontal(R, C, L) :- ${color}(R, C), nth_horizontal(R, C, N), len_horizontal(R, C - N, L).\n`;
  rule += `len_vertical(R, C, L) :- ${color}(R, C), nth_vertical(R, C, N), len_vertical(R - N, C, L).\n`;

  rule += `area_len(A, L) :- ${color}(R, C), area(A, R, C), len_horizontal(R, C, L).\n`;
  rule += `area_len(A, L) :- ${color}(R, C), area(A, R, C), len_vertical(R, C, L).\n`;
  return rule.trim();
}

modules["railpool"] = {
  name: "Rail Pool",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("railpool(R, C) :- grid(R, C), not black(R, C).");
    solver.add_program_line(fill_path("railpool"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("railpool", "loop"));
    solver.add_program_line(single_loop("railpool"));
    solver.add_program_line(len_segment_area("railpool"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        let len_data = 0;
        for (let j = 0; j < 4; j++) {
          const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, `tapa_${j}`).toString());
          if (Number.isInteger(num)) {
            solver.add_program_line(`:- not area_len(${i}, ${num}).`);
            len_data++;
          }
          len_data += num === "?" ? 1 : 0;
        }
        solver.add_program_line(`:- #count{ N: area_len(${i}, N) } != ${len_data}.`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`black(${r}, ${c}).`);
    }

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVNT+NIEL3nV6A+96G//NG+IIaBvWTD7oYRQlYUhWCGaBLCJHg0cpT/zqt2OfaQjEBCQnNYOW69vH5d9braZa+/l5NVIT0um0olNS6bqnCnjn6Kr8vZ07zIjuRJ+XS/XAFIeXF+Lu8m83XRy1k16m0qn1Unsvory4UWUhjcWoxk9W+2qf7OqqGshpgS0oHr1yIDeNbCqzBP6LQmtQIeADtgwGvA6Ww1nRfjfs38k+XVpRSU51NYTVAslj8KwT7o/3S5uJkR8VAu7uZMrsvb5beSZXq0ldVJ7bR/wKk95JTIl05Z8G6nN5MnlH19P3s8ZNePtltU/D8YHmc5ef/SwrSFw2wjUicyBzwAdrrZr0RNEdVhMhfHxx0m3mN8YFoiTl9KEkUMjnxHmD3JXiYfmI4Zv5fa15laQquQqavRuvbXpcxeem328muT/EqhSDrbYLwO43kYTRgvUU9Z2TB+DqMKYxTGftCcocDax1J7xDWI7xNpNPwCG+VbbKw0FnslbGPgWm+M62BoyDJhh7UxdkQ4NsC2xpFqMWkijp8gThIxjqRJUUXCKfw0ONJYy/Fj6GPWRxS/wdBEnDfBWs/xPfJ6PEmBTzsYmoTjG+S1jPGCMRaHFHjab4OhMXUdtKf6cC4ND5r3pZCLcdDQ+Qce3jT71/Cv2bOitQ2GRnFMA2+O1zrEpE4IPLztMDSmqQ/qH/MZxfAc87lEVKsGQxOxhwTePOfy8ODZP16nO0yalD1E2Dv1UYgPDzHXJKJcDYYmYg8Gax3Hd4jvOKalvTAmjW3qQzVhn5qeQ86lEHOHoVFcqxQx08Yz+WfeQ099afCAX4XH/DSMLoxxePwTetm88XVUv4je02nCUv19SkYlHZ1F82pJxQGi80T5bN2Pr5rOoadPX/eK/ixm1MvFsFzdTaYFPgX92UNxNFiuFhP6jp3dfu38G5SLm2LV/McnedsTP0W4c4tQ7v+v9Md/pan66sOa442P/St2clSXu0tWF1I8luPJeLrEmaCAYbJuuN9M1j14eBLNuzfx4btH3496zw==",
    },
  ],
};
