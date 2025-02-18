/** The Balance Loop solver. */

function balance_rule() {
  const rule = [
    ':- black(R, C), segment(R, C, N1, N2, "T"), |R - N1| = |C - N2|.',
    ':- black(R, C), segment(R, C, N1, N2, "V"), |R - N1| = |R - N2|.',
    ':- black(R, C), segment(R, C, N1, N2, "H"), |C - N1| = |C - N2|.',
    ':- white(R, C), segment(R, C, N1, N2, "T"), |R - N1| != |C - N2|.',
    ':- white(R, C), segment(R, C, N1, N2, "V"), |R - N1| != |R - N2|.',
    ':- white(R, C), segment(R, C, N1, N2, "H"), |C - N1| != |C - N2|.',
  ].join("\n");
  return rule;
}

function count_balance(target, src_cell) {
  const [r, c] = src_cell;
  const rule = [
    `:- segment(${r}, ${c}, N1, N2, "T"), |${r} - N1| + |${c} - N2| != ${target}.`,
    `:- segment(${r}, ${c}, N1, N2, "V"), |${r} - N1| + |${r} - N2| != ${target}.`,
    `:- segment(${r}, ${c}, N1, N2, "H"), |${c} - N1| + |${c} - N2| != ${target}.`,
  ].join("\n");
  return rule;
}

modules["balance"] = {
  name: "Balance Loop",
  category: "loop",
  aliases: ["balanceloop"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(defined("white"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("balance"));
    solver.add_program_line(fill_path("balance"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("balance", "loop"));
    solver.add_program_line(single_loop("balance"));
    solver.add_program_line(loop_sign("balance"));
    solver.add_program_line(balance_rule());

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      solver.add_program_line(`balance(${r}, ${c}).`);
      solver.add_program_line(loop_segment([r, c]));

      if (symbol_name === "circle_L__1") {
        solver.add_program_line(`white(${r}, ${c}).`);
        const num = puzzle.text.get(new BasePoint(r, c, BaseDir.CENTER).toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(count_balance(num, [r, c]));
        }
      }

      if (symbol_name === "circle_L__2") {
        solver.add_program_line(`black(${r}, ${c}).`);
        const num = puzzle.text.get(new BasePoint(r, c, BaseDir.CENTER).toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(count_balance(num, [r, c]));
        }
      }
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
      data: "m=edit&p=7Vbfb5swEH7PXxH52Q82vwK8ZV27lyzd1k5VhVBEMqZGIyVLylQR5X/v3RkK5Vxp0aa+bEJY5+/sj+/MZ8P+Z5Xtcql9GUk3lEpquAIVQgdix6VbNdf1+qHI47GcVg935Q4CKS8vLuT3rNjno6QZlY4OdRTXU1l/iBPhCEm3FqmsP8eH+mNcz2R9BSkhNWAziLSQDoTnXXhDeYzODKgVxHMTTyC8hXC13q2KfDEzRJ/ipL6WAp/zjmZjKDblr1yYadRflZvlGoFl9gDF7O/W2yazr76VP6pmrE6Psp6+Ltft5GJo5GJkkYtV/LHcYn2fP9qURunxCCv+BbQu4gRlf+3CsAuv4gO08/ggvACmhtIzL0V4E2Qaiw4IAQieu4HT5HULuAB4Xdcb5Cc4v084iWhC2w3Vi26E3f78SA+BoQKtsIT+I7QaVqHVUIZ2GI+DpbxEhtVoF3ncjsXFal7wem0Fz4jPWHyfIVhDt4w6wL7fcQSsogCV9EaEWE+PIWTVhKijNyJChm7pdTSsxVH9lwOG0WSb29Y2Dliyb2PjHo7icxhKTgItAxRVcxSVM5SsxXjJXwwlmzGU3MZ4yXIcteo15mPExoEW2CrZeJFzkyEtsHU1jDU5NzmUw2RTDpNXOTcZ1gJj8Rwm83Ju8rAFtusmP3NusrUFtusmi3NucjqDjd0HMPj9glzvUHsN56esXWrfU6uo9amd0Zhzam+oPaPWozagMRM8gU86o/sb71Q5wnfh1UUh7gCoDgNPSQ8c7lLkw0q4v6k5gfH4Q/Da5f9b2XSUiBl8iMfzcrfJCvgcz6vNMt+1ffj1OY7Eo6Abvhlaev//ht7+bwhXX73Zfvs72z+BhW32qawvpdhWi2yxKsFjsHZtErbua0mwGhjr9CScEfYEnCIs8eZrBicQWLPI7ld5UZZbkY6eAA==",
    },
    { url: "https://puzz.link/p?balance/10/10/q1i8k8k0i1g8h1g9k9h0j1h8k8g0h9g0i1k9k9i0q", test: false },
    { url: "https://puzz.link/p?balance/10/10/0g00zg0l0m0k0k0k0k0h0m0k0n0l0h", test: false },
  ],
};
