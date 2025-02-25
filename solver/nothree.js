/** The No Three solver. */

function no_consecutive_same_distance(color = "black") {
  /**
   * Generate a rule to avoid consecutive black cells with the same distance.
   */
  const min_r = `MinR = #max { R0: grid(R0, C), ${color}(R0, C), R0 < R }`;
  const max_r = `MaxR = #min { R0: grid(R0, C), ${color}(R0, C), R0 > R }`;
  const min_c = `MinC = #max { C0: grid(R, C0), ${color}(R, C0), C0 < C }`;
  const max_c = `MaxC = #min { C0: grid(R, C0), ${color}(R, C0), C0 > C }`;
  let rule = `:- grid(R, C), black(R, C), ${min_r}, ${max_r}, grid(MinR, C), grid(MaxR, C), R - MinR = MaxR - R.\n`;
  rule += `:- grid(R, C), black(R, C), ${min_c}, ${max_c}, grid(R, MinC), grid(R, MaxC), C - MinC = MaxC - C.`;
  return rule;
}

modules["nothree"] = {
  name: "No Three",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent());
    solver.add_program_line(avoid_adjacent_color("black"));
    solver.add_program_line(grid_color_connected("not black", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(no_consecutive_same_distance("black"));

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      fail_false(symbol_name.startsWith("circle_SS"), "Invalid symbol type.");

      if (d === BaseDir.CENTER.description) {
        solver.add_program_line(`black(${r}, ${c}).`);
      }

      if (d === BaseDir.TOP.description) {
        solver.add_program_line(`:- { black(${r - 1}, ${c}); black(${r}, ${c}) } != 1.`);
      }

      if (d === BaseDir.LEFT.description) {
        solver.add_program_line(`:- { black(${r}, ${c}); black(${r}, ${c - 1}) } != 1.`);
      }

      if (d === BaseDir.TOP_LEFT.description) {
        solver.add_program_line(
          `:- { black(${r}, ${c}); black(${r - 1}, ${c}); black(${r}, ${c - 1}); black(${r - 1}, ${c - 1}) } != 1.`
        );
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

    solver.add_program_line(display("black"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VXRbpswFH3nK6b7fB+wDaz1W9Z1e+nSbWSKIoQih7oNGhUZhKlylH/v9YUp2gbS1mnry2T56OT4GA7XcNN+6UxjMaGhzjBEQUMmCU8RRTzDYSzKfWX1C5x1+23dEEG8nuOtqVobZIMpDw7uXLsZurc6AwnIU0CO7oM+uHfardCltAQYkXZFTABKopcnuuR1zy56UYTE5wMnuiJalE1R2XWa9tJ7nbkFgr/RK97uKdzXXy30+/h3Ud9vSi9szJ4ept2Wu2Gl7W7qz93gFfkR3azPm37L6/MMedUpr6d9Xs9G8vptf57X3tzZttuMhT3Pj0eq+keKu9aZT/7pRM9ONNUHwjmjYFzpAyQRXUbQnb6LByKKJ/RkXI8n/PGEPxn3Sznul7Gc0NWoruSErsavo9SYn2r0hislGRdUSHSK8TVjyBgzXrHnknHJeMEYMSbseemP4hcPi2oBWvpooKOfT+4vZcuk5CbQj/jpPA8ySLvm1hSW3tp0a3YWqDscA3gAnpkiW/S/YTxPw/AnED65bTzPh5FRbZVCd42w69ZmXdQV0F8Osi5/T6fX/Ef9nz8tfW3Q7srGVHemMg+lbSEPHgE=",
    },
    {
      url: "https://puzz.link/p?nothree/10/10/genceemeienei6eiemeeemeiemenemeiemeeemei6eieneiemecene",
      test: false,
    },
  ],
};
