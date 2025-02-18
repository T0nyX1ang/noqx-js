/** The Binario solver. */

function unique_linecolor(colors, _type = "row") {
  /**
   * Generates a constraint for unique row / column in a grid.
   * At least one pair of cells in the same row / column should have different colors.
   *
   * A grid rule should be defined first.
   */
  if (_type === "row") {
    const colors_row = colors
      .map((color) => `#count { C : grid(R1, C), grid(R2, C), ${color}(R1, C), not ${color}(R2, C) } = 0`)
      .join(", ")
      .replace("not not ", "");
    return `:- grid(R1, _), grid(R2, _), R1 < R2, ${colors_row}.`;
  }

  if (_type === "col") {
    const colors_col = colors
      .map((color) => `#count { R : grid(R, C1), grid(R, C2), ${color}(R, C1), not ${color}(R, C2) } = 0`)
      .join(", ")
      .replace("not not ", "");
    return `:- grid(_, C1), grid(_, C2), C1 < C2, ${colors_col}.`;
  }

  throw new Error("Invalid line type, must be one of 'row', 'col'.");
}

modules["binairo"] = {
  name: "Binairo",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row % 2 === 0 && puzzle.col % 2 === 0, "total rows and columns must both be even!");
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("circle_M__1"));
    solver.add_program_line(invert_c("circle_M__1", "circle_M__2"));
    solver.add_program_line(count(puzzle.row / 2, "circle_M__1", "row"));
    solver.add_program_line(count(puzzle.col / 2, "circle_M__1", "col"));
    solver.add_program_line(unique_linecolor(["circle_M__1", "circle_M__2"], "row"));
    solver.add_program_line(unique_linecolor(["circle_M__1", "circle_M__2"], "col"));
    solver.add_program_line(avoid_rect(1, 3, "circle_M__1"));
    solver.add_program_line(avoid_rect(1, 3, "circle_M__2"));
    solver.add_program_line(avoid_rect(3, 1, "circle_M__1"));
    solver.add_program_line(avoid_rect(3, 1, "circle_M__2"));

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      if (symbol_name === "circle_M__1") {
        solver.add_program_line(`:- circle_M__2(${r}, ${c}).`);
      } else {
        solver.add_program_line(`:- circle_M__1(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("circle_M__1"));
    solver.add_program_line(display("circle_M__2"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VfRa9s+EH7PXzH0rAfrdLJlv2VZu5e222/NKMWY0nYeDUvnrUm24ZD/vdLZLPDTVwpjG4UVx8fl85fTJ92dIq++bi7vWk1Z/FivM23CVZRebu+M3Nl4zRfrZVu90NPN+qa7C47Wbw4P9cfL5aqd1COrmWz7suqnun9d1coorSjcRjW6/6/a9seVuu5urxZK96fhudImPDgamBTcg717Js+jNxtAkwX/ZPSDex7cdft5vRq+vq3qfq5VHOml/DS66rb71qpRSfw+jB6Aq+X3mxFbbT50nzYjyzQ73U8fkWr3UqM7SI0ekBpnEKVeL+6ul+3F8W9VWza7XVjxd0HvRVVH6e/3rt+7p9U22BOxRux5tVV5EcJQGOantCBW5WVAzf/RwiFu4SEXRvCEIniG3KgsQcsYN4lgMoPhGBnAcNImg5qNibEBbDGMY1Ocecq2GWRbOHdjsUDGQ3JMTAo7PKTDS+VyDOPYOcyvyXHsIsZOpyOlk7JLHKSMRZkEISkIAD/AhjVMuCAIZ54ILizRA2yYNCK4sGTxdBh2DklBABhPBxcEOZgGKiI7DSJ7A4CxEo+H9DhICSdvM7iwVpo7hQ0sNouTZnG7WkkagGHSLE6alS5O2Qx7x0qKAQxzaXG72gJuj1YaMIX9AzBsEuuxkhIG4QwuLONcMm5Xxg3IOJdMcPJMsCDYwlwyzg5zVAJgHBv3JePNlHNYPow3Uy6wwAIvFW5XxgXB+G+bPZ48Lh+WLk5gh7deJ3+jAIbF5iTFAIYCHYHJh+PQoRyKSOw8nJl0b8W+EpuJdWKPhHMg9kzsTCyLzYVTxFPXL5/L/pCc2g3n+8cv98x75v17vGZSq1l3+6VbLdatCm+yu4n6oeSubSDw88vt33+5jaufPbWt9KnJCZt7M7kH",
    },
  ],
};
