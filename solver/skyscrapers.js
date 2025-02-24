/** The Skyscrapers solver. */

modules["skyscrapers"] = {
  name: "Skyscrapers",
  category: "num",
  aliases: ["building"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(puzzle.row === puzzle.col, "This puzzle must be square.");
    const n = puzzle.row;
    solver.add_program_line(grid(n, n));
    solver.add_program_line(fill_num(Array.from({ length: n }, (_, i) => i + 1)));
    solver.add_program_line(unique_num("grid", "row"));
    solver.add_program_line(unique_num("grid", "col"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);

      if (r === -1 && c >= 0 && c < puzzle.col) {
        solver.add_program_line(`blocked_t(R, ${c}) :- number(R, ${c}, N), number(R1, ${c}, N1), R1 < R, N1 > N.`);
        solver.add_program_line(`:- #count { R: blocked_t(R, ${c}) } != ${n - parseInt(num)}.`);
      }

      if (r === puzzle.row && c >= 0 && c < puzzle.col) {
        solver.add_program_line(`blocked_b(R, ${c}) :- number(R, ${c}, N), number(R1, ${c}, N1), R1 > R, N1 > N.`);
        solver.add_program_line(`:- #count { R: blocked_b(R, ${c}) } != ${n - parseInt(num)}.`);
      }

      if (c === -1 && r >= 0 && r < puzzle.row) {
        solver.add_program_line(`blocked_l(${r}, C) :- number(${r}, C, N), number(${r}, C1, N1), C1 < C, N1 > N.`);
        solver.add_program_line(`:- #count { C: blocked_l(${r}, C) } != ${n - parseInt(num)}.`);
      }

      if (c === puzzle.col && r >= 0 && r < puzzle.row) {
        solver.add_program_line(`blocked_r(${r}, C) :- number(${r}, C, N), number(${r}, C1, N1), C1 > C, N1 > N.`);
        solver.add_program_line(`:- #count { C: blocked_r(${r}, C) } != ${n - parseInt(num)}.`);
      }

      if (r >= 0 && r < puzzle.row && c >= 0 && c < puzzle.col) {
        solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      }
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VRNb5tAEL3zK6I5z4GFBeO9uWnci0s/4iqKEIowpQoKiBRM1K7l/56ZgQYjtYce2vpQrffpvZkB3s6ut/vaZ22BSvHPj9BFYqiDUKZSnkx3HNtyXxXmAlf9/r5piSC+W6/xS1Z1hZPwkzRS52CXxq7QvjEJKEDwaCpI0X4wB/vW2BjtNaWAatFuhiKP6NVEbyTP7HIIKpd4PHKit0Tzss2r4m4zRN6bxG4R+Duv5GmmUDdPBYw+WOdNvSs5sMv2tJjuvnwcM13/uXnox1qVHtGufm3Xn+wyHewy+4ldXsUftrtMj0dq+0cyfGcS9v5potFEr82BMDYH8DU9qmm/ZGfAD0kuJhmRDF6kdueSs7CgdYyB0KOA/yKjxexlS87SQRqlUpyOJu1x/kRrzp/UB5ynw/hDR8HMupLPTe5UtDz5PC1XyaJvBdeCnuCWeoLWF3wt6AoGghupuRK8EbwU1IKh1Cy4q7/V979gJ9Hcy/ngbpxRJHUSiPt6V7QXcdPWWQV0aRwd+AYy5Sjp//fIP7pHeAvcczvV52aH/mfQPXzv8jZ7LNoOUucZ",
    },
  ],
};
