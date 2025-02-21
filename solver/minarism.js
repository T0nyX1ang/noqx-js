/** The Minarism solver. */

modules["minarism"] = {
  name: "Minarism",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row === puzzle.col, "This puzzle must be square.");
    const n = puzzle.row;
    solver.add_program_line(defined("white_h"));
    solver.add_program_line(defined("white_v"));
    solver.add_program_line(defined("black_h"));
    solver.add_program_line(defined("black_v"));

    solver.add_program_line(grid(n, n));
    solver.add_program_line(fill_num(Array.from({ length: n }, (_, i) => i + 1)));
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(unique_num("grid", "col"));

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      if (d === BaseDir.LEFT.description && c > 0 && symbol_name === "inequality__1") {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r}, ${c - 1}, N1), N < N1.`);
      }

      if (d === BaseDir.TOP.description && r > 0 && symbol_name === "inequality__2") {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r - 1}, ${c}, N1), N < N1.`);
      }

      if (d === BaseDir.LEFT.description && c > 0 && symbol_name === "inequality__3") {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r}, ${c - 1}, N1), N > N1.`);
      }

      if (d === BaseDir.TOP.description && r > 0 && symbol_name === "inequality__4") {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r - 1}, ${c}, N1), N > N1.`);
      }
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_type(pos, "normal");

      if (d === BaseDir.CENTER.description) {
        fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
        solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      }

      if (d === BaseDir.TOP.description && r > 0 && Number.isInteger(num)) {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r - 1}, ${c}, N1), |N - N1| != ${num}.`);
      }

      if (d === BaseDir.LEFT.description && c > 0 && Number.isInteger(num)) {
        solver.add_program_line(`:- number(${r}, ${c}, N), number(${r}, ${c - 1}, N1), |N - N1| != ${num}.`);
      }
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNb9pAEL37V0R7nsN+2RjfaJr2krofoYqQZSGTusIq1BRw1S7iv2dmbGpCF1WRmvRSLR495s3MPu+Md/OtKdYlDHCZGCQoXEZafiJJv8MaV9tFmVzAqNnO6zUCgLcpfC4WmzLIuqA82Llh4kbgXieZUAKExkeJHNz7ZOfeJG4C7gYpAQp9122QRnjVw1vmCV22TiURp4gjARHCCcLqa4nKF9X2Zxv6LsncGATt9ILzCYpl/b0UnRL6f1cvZxU5ZsUW32Yzr1Yds2k+1V+aLlble3CjVnDqEWx6wQRbwYROBXdv9OSCh/l+j0f/ASVPk4zUf+xh3MObZIc2TXZCR1GXGwGeKxY0SpInPPJojjFHniHH2N5jJXuoMwePMqce/VuM1ie725CzflVGmYrFTkjsgApoeHCI2A+h4xgJ+5DA0xWahZ5kEIFz7c8wMjxDKNLqIzSV8u0RD5BQPoLk+ogh7eElKMP4iKGfsIpUeUpZTSfsyzD05j7CnlFlLZXyEuc2D717YH9fcZc12zFOKTjD9iVbyTZke80xV2xv2V6ytWwjjhnQnD/ySyDJNOTYSbypjgfvieRl2vI9e1jh3/+XB5lIm+WsXF+k9XpZLPDWuJkXq1LgFb0PxA/BD3ZEgf1/a//DW5vaIB81sc8woX+Qk+H54gwffTUgVs20mN7VOGgyf3a5+E3lwT0=",
    },
  ],
};
