/** The Tapa-like Loop solver. */

const tapaloop_pattern_ref = {};
const tapaloop_pattern_idx = {};

function single_shape(...shape_d) {
  const n_edge = shape_d.reduce((sum, x) => sum + (x === null ? 0 : x), 0);
  if (n_edge < 0 || n_edge > 2) return null;

  const remain = n_edge === 1 ? 1 : 0;
  const shape_str = shape_d.map((x) => (x === null ? remain : x)).join("");
  return shape_str;
}

function parse_shape_clue(inner, outer) {
  const shapes = Array(8).fill(null);
  shapes[0] = single_shape(outer[0], null, inner[0], inner[7]);
  shapes[1] = single_shape(inner[0], null, inner[1], 0);
  shapes[2] = single_shape(inner[1], outer[1], null, inner[2]);
  shapes[3] = single_shape(0, inner[2], null, inner[3]);
  shapes[4] = single_shape(inner[4], inner[3], outer[2], null);
  shapes[5] = single_shape(inner[5], 0, inner[4], null);
  shapes[6] = single_shape(null, inner[6], inner[5], outer[3]);
  shapes[7] = single_shape(null, inner[7], 0, inner[6]);

  if (shapes.includes(null)) return null;

  if (inner.reduce((a, b) => a + b) === 8) return [8];

  let idx = 0;
  if (inner.reduce((a, b) => a + b) !== 0) {
    while (inner[idx] === 0 || inner[(idx + 7) % 8] === 1) {
      idx++;
    }
  }

  const clues = [];
  let curr_num = 0;
  for (let i = idx; i < idx + 8; i++) {
    const e = inner[i % 8];
    const s = shapes[i % 8];
    if (e) {
      curr_num++;
    } else {
      if (curr_num > 0) {
        clues.push(curr_num + 1);
      } else if (s !== "0000") {
        clues.push(1);
      }
      curr_num = 0;
    }
  }

  if (curr_num > 0) {
    clues.push(curr_num);
  }

  if (clues.length === 0) {
    return [0];
  }

  return clues.sort((a, b) => a - b);
}

function tapaloop_pattern_rule() {
  for (let i = 0; i < 4096; i++) {
    const pat = i.toString(2).padStart(12, "0");
    const inner = Array.from(pat.slice(0, 8), Number);
    const outer = Array.from(pat.slice(8), Number);
    const parsed = parse_shape_clue(inner, outer);

    if (!parsed) continue;

    const parsed_key = parsed.toString();
    if (tapaloop_pattern_ref[parsed_key]) {
      tapaloop_pattern_ref[parsed_key].push(i);
    } else {
      tapaloop_pattern_ref[parsed_key] = [i];
    }
  }

  let rule = "";
  let i = 0;
  for (const [pat, vals] of Object.entries(tapaloop_pattern_ref)) {
    tapaloop_pattern_idx[pat] = i;
    for (const v of vals) {
      rule += `valid_tapaloop_map(${i}, ${v}).\n`;
    }
    i++;
  }

  return rule.trim();
}

function tapaloop_clue_in_target(clue, target) {
  /**
   * Check if clue is in target.
   */
  for (const c of clue) {
    if (c === "?") {
      continue;
    }
    if (target.indexOf(c) === -1) {
      return false;
    }
    target.splice(target.indexOf(c), 1);
  }
  return true;
}

function tapaloop_parse_clue(r, c, clue) {
  /**
   * Parse tapaloop clue to binary pattern.
   */
  const result = new Set();
  for (const pattern of Object.keys(tapaloop_pattern_ref)) {
    const pattern_list = pattern.split(",").map(Number);
    if (pattern_list.length === clue.length && tapaloop_clue_in_target(clue, pattern_list)) {
      result.add(tapaloop_pattern_idx[pattern]);
    }
  }

  let rule = "";
  for (const num of result) {
    rule += `valid_tapaloop(${r}, ${c}, ${num}).\n`;
  }
  return rule.trim();
}

function tapaloop_direction_to_binary(r, c) {
  let constraint = `binary(R, C, D, 0) :- -1 <= R, R <= ${r}, -1 <= C, C <= ${c}, not grid(R, C), direction(D).\n`;
  constraint += "binary(R, C, D, 0) :- grid(R, C), direction(D), not grid_direction(R, C, D).\n";
  constraint += "binary(R, C, D, 1) :- grid(R, C), grid_direction(R, C, D).";
  return constraint;
}

function valid_tapaloop(r, c) {
  const num_seg = [];
  const binary_seg = [];
  const direc = [
    [-1, -1, "r"],
    [-1, 0, "r"],
    [-1, 1, "d"],
    [0, 1, "d"],
    [1, 1, "l"],
    [1, 0, "l"],
    [1, -1, "u"],
    [0, -1, "u"],
    [-1, -1, "l"],
    [-1, 1, "u"],
    [1, 1, "r"],
    [1, -1, "d"],
  ];

  direc.forEach(([dr, dc, d], i) => {
    binary_seg.push(`${2 ** (11 - i)} * N${i}`);
    num_seg.push(`binary(${r + dr}, ${c + dc}, "${d}", N${i})`);
  });

  const rule = `:- not valid_tapaloop(${r}, ${c}, P), valid_tapaloop_map(P, N), ${num_seg.join(", ")}, N = ${binary_seg.join(" + ")}.`; // prettier-ignore
  return rule;
}

modules["tapaloop"] = {
  name: "Tapa-Like Loop",
  category: "loop",
  aliases: ["tapalikeloop", "tapa-like-loop", "tapalike", "tapa-like", "tll"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));

    if (puzzle.param["visit_all"]) {
      solver.add_program_line("tapaloop(R, C) :- grid(R, C), not black(R, C).");
    } else {
      solver.add_program_line("{ tapaloop(R, C) } :- grid(R, C), not black(R, C).");
    }

    solver.add_program_line(direction("lurd"));
    solver.add_program_line(fill_path("tapaloop"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("tapaloop", "loop"));
    solver.add_program_line(single_loop("tapaloop"));
    solver.add_program_line(tapaloop_direction_to_binary(puzzle.row, puzzle.col));
    solver.add_program_line(tapaloop_pattern_rule());

    const clue_dict = {};
    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      fail_false(pos.startsWith("tapa"), `Clue at ${[r, c]} should be set to 'Tapa' sub.`);
      clue_dict[[r, c]] = clue_dict[[r, c]] || [];
      clue_dict[[r, c]].push(clue);

      if (clue_dict[[r, c]].length === 1) {
        solver.add_program_line(`black(${r}, ${c}).`);
        solver.add_program_line(valid_tapaloop(r, c));
      }
    }

    for (const [rc, clue] of Object.entries(clue_dict)) {
      const [r, c] = rc.split(",").map(Number);
      solver.add_program_line(tapaloop_parse_clue(r, c, clue));
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
      data: "m=edit&p=7ZRRb5swEMff+RSVn/2AMSHEL1XWNXthdFszVRVCEcmYikrmjISpcpTv3rszaZyGh02tOk2aiC/Hz4b735nz+mdbNCUXPv5kzOEfrlDENII4ouF317Ta1KU64+N2c6cbcDi/mkz496Jel17Wrcq9rRkpM+bmg8qYYJwFMATLufmstuajMik31zDFuACW2EUBuJcH94bm0buwUPjgp+CH9rFbcBdVs6jLWWLJJ5WZKWcY5x09jS5b6l8l63Tg/UIv5xWCebGBZNZ31aqbWbff9H3brRX5jpuxlZv0yJUHuehauej1yMUsXiy3rn6U+qFP6ijf7aDkX0DsTGWo++vBjQ/utdqCTdWWSR8fhV0RHPTB++ToGYgEAUxkTwIk5+cOkSckJEnCQUNC0iUUyyVxTMEcInyKJh0iIormkICywM/hiZBqN7ywqR6RwXPZIuxBNtwRGp4iUu6SiF71VEkouKCy35KdkA3ITmFXuJFk35P1yQ7IJrTmkuwN2QuyIdmI1gxxX/9o518iB/YbNmUUw9cCBwSkKclDKH9Taibt8XJ8Df49lnsZS6Ahz1LdLIsaujJtl/Oy2d/DEbjz2AOjkUk8Uf+fin/hVMTy+2/WIa/TsBlUtmsxbq44W7WzYrbQ8JFB8faT0HX9k9CkJxNvniB0OtsUq6Ku7sta6xXLvUc=",
    },
    {
      data: "m=edit&p=7VVNb5tAEL3zK6I972E/AJu9WG4a90LpR1xFEUIRdqiMgouLTRWt5f+emQEEjemhqtRGVbTep8fbmZ3HrjXsv9dplXHp40/7XHAJw5eKpjcNaIp2LPNDkZkLPq8Pm7ICwvmHxYJ/TYt95sRtVOIcbWDsnNt3JmaScaZgSpZw+8kc7XtjI26vYYlxCVrYBCmgVz29oXVkl40oBfAIuNuk3QJd59W6yO7CRvloYrvkDOu8oWykbFv+yFjrA5/X5XaVo7BKD/Ay+02+a1f29X35ULexMjlxO2/shiN2dW8XaWMX2YhdfIs/tlvk37LyccxqkJxOcOSfweydidH3l55Oe3ptjoCROTLfw1RXo08ODmHHQKKkNVxVJ0kxpTA88E5SLkqz2WygaT2i+ZSqhtu5Eyqh5FD0RJM8kILG3aCsEl3ZQRzuc7afUuT5majH0ieU/kyj0j9J0xEpOK+hRRs3CNTy/LS0RwfdS3Alki7mlnBBqAiXcG/casK3hILQIwwp5orwhvCS0CX0KWaCN/9b/42/YCd2FTWZXw/vdf1/Xk+cmIXQzi6istqmBfS0qN6usqp7hg/IyWGPjGasIcV9/ab8g28KHr94ad3jpdmBfsYO6S4t8oesKMsdS5wn",
      config: { visit_all: true },
    },
    {
      url: "https://puzz.link/p?tapaloop/17/17/g2h3h2yarhajh2x4h2haiyaihaih3xabhajh+2lyaihaih2w3h3h2y3haihabx2hajhaiyajhaihajx2hajhajy2h2h3g",
      test: false,
    },
  ],
  parameters: {
    visit_all: { name: "Visit all cells", type: "checkbox", default: false },
  },
};
