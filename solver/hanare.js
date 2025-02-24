/** The Hanare-gumi solver. */

function hanare_constraint(color = "white") {
  /**
   * Generate a constraint for hanare-gumi.
   */
  let rule = `row_pair(R, R1, C) :- number(R, C, _), number(R1, C, _), R1 > R, R1 - R - 1 = #count { R2: ${color}(R2, C), R2 >= R, R2 <= R1 }.\n`;
  rule += ":- row_pair(R, R1, C), number(R, C, N), number(R1, C, N1), |N - N1| != R1 - R - 1.\n";
  rule += `col_pair(R, C, C1) :- number(R, C, _), number(R, C1, _), C1 > C, C1 - C - 1 = #count { C2: ${color}(R, C2), C2 >= C, C2 <= C1 }.\n`;
  rule += ":- col_pair(R, C, C1), number(R, C, N), number(R, C1, N1), |N - N1| != C1 - C - 1.\n";
  return rule.trim();
}

modules["hanare"] = {
  name: "Hanare-gumi",
  category: "num",
  aliases: ["hanaregumi"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(hanare_constraint());

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(fill_num([ar.length], "area", i, "white"));
      solver.add_program_line(count(1, "not white", "area", i));
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(color === BaseColor.GREEN, `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`white(${r}, ${c}).`);
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      fail_false(Number.isInteger(num), `Clue at (${r}, ${c}) must be an integer.`);
      solver.add_program_line(`number(${r}, ${c}, ${num}).`);
      solver.add_program_line(`not white(${r}, ${c}).`);
    }

    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7Vddj+I2FH3nV4z87ErxR2I7b9Mt05cp25apVqsIIYbN7qBC2cKkqoL473OufR1UiWhbdbtVpQowJ9cn9574nphw/LVbHVqpCnobL/GNl1U+frSv4qfg18PmedvWN/K2e37aHwCkfH13J9+vtsd20jBrMTn1oe5vZf9t3QglpND4KLGQ/Q/1qf+u7qeyn2NKSI3YfSIRnF7gm2H+VQqqAnjGGPAt4HpzWG/b5X2KfF83/YMUVOfreDZBsdv/1grWQcfr/e5xQ4HH1TMu5vi0+cgzx+7d/ueOuWpxlv1tkju7Itdc5BJMcgldkUun/cNyw+J8xrL/CMHLuiHtP12gv8B5fcI4q0+isji1RK9jZ4QrcWiHQxWn8zFOUfHEt3G8i6OO4wPyyt7E8Zs4FnEs43gfOVOU00pLrStRa9hBWWDPGC4zOmHtpLaKMeI2xwOwSdggj+U8tpC6hNCIDbBjXAIHxnBwVTBGzopzluBUzCnBccwpocGxhhJ8l/nQ4FhDBQ2ONVR0lzDHQY9nPQ56POtxuF7P1+tQK3AtD05gjgcnMMdDW2Bt3ktTcH4fgFlDwO1acK0AjmJOAEcljinAUYmDHMBJs6FbXXNcKWA0P2IDnPTgPOCkx6gSOOlBDmlM0m+UA05rhXzAzNfgWOagp4Z7inzASadBHw33EedJU3LcIl5yHD01uafICX9c/MAa8A3M/TLq4iXyRvaSRTx7CfkHL5FPBi+R37IfyEu8tiX6Uqb1iZ5hbdEb2WMValVcq0Kt7DHyRvYYeSP7yoGTfUXeoJsvYuTPvvLgZF95aPasmXzime/h1ewr+AT+GLyhA9cK4LCvoh8K7kWBvrOv4KnBS9EbijnkDfYVvi++Ip9kX5FPVPYPeq2yZ8iT7BlN/uGeoneDf9C7wT/oHTzBfUc8e4Y8YLmWRS3LtdC7wT+4x40lb2CzeRO3nFdxtHGs4lbkaAP8k1uk4MbyvsGtdenKXJrzaS4kyYpbrqq0RKoimWmr/fu75ycvq8FK0u/2H1+0u//HYotJI+bd4f1q3eJnbvruQ3sz2x92qy2OZt3usT3kYzxlnCfidxE/jaGHlv8fPP6lBw9qQfGXHj++wD3xCTlNP5fYq/vXUnzslqvleg+PYe1ivLgexzPA1bjz1+NBj/BH8viRuthdxibM2EQ5UnokjkeLz8IfW6KxJR1rwWfI88UNh31YPK1+wf+prz50u41YTF4A",
    },
    {
      url: "https://puzz.link/p?hanare/10/10/3162k3o9gjhb7mfbiie020t0a0vv2e400l8q6zzzzm9q",
      text: false,
    },
  ],
};
