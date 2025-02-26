/** The Tapa solver. */

const tapa_pattern_ref = {};
const tapa_pattern_idx = {};

function tapa_parse_pattern(pattern) {
  /**
   * Parse 8-neighboring pattern to tapa clue sorted in increasing order.
   */
  if (pattern === "11111111") return [8];
  if (pattern === "00000000") return [0];

  const idx = pattern.indexOf("0");
  pattern = pattern.slice(idx) + pattern.slice(0, idx);

  const result = [];
  let cur = 0;
  while (cur < pattern.length) {
    let total = 0;
    if (pattern[cur] === "1") {
      while (cur < pattern.length && pattern[cur] === "1") {
        total += 1;
        cur += 1;
      }
      result.push(total);
    }
    cur += 1;
  }

  return result.sort((a, b) => a - b);
}

function tapa_pattern_rule() {
  /**
   * Generate pattern reference dictionary and tapa pattern map.
   */
  for (let i = 0; i < 256; i++) {
    const pat = i.toString(2).padStart(8, "0");
    const parsed = tapa_parse_pattern(pat);
    const parsed_key = parsed.join(",");

    if (tapa_pattern_ref[parsed_key]) {
      tapa_pattern_ref[parsed_key].push(i);
    } else {
      tapa_pattern_ref[parsed_key] = [i];
    }
  }

  let rule = "";
  let i = 0;
  for (const [pat, vals] of Object.entries(tapa_pattern_ref)) {
    tapa_pattern_idx[pat] = i;
    for (const v of vals) {
      rule += `valid_tapa_map(${i}, ${v}).\n`;
    }
    i++;
  }

  return rule.trim();
}

function tapa_clue_in_target(clue, target) {
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

function tapa_parse_clue(r, c, clue) {
  /**
   * Parse tapa clue to binary pattern.
   */
    const result = new Set();
    for (const pattern of Object.keys(tapa_pattern_ref)) {
      const pattern_list = pattern.split(",").map(Number);
      if (pattern_list.length === clue.length && tapa_clue_in_target(clue, pattern_list)) {
        result.add(tapa_pattern_idx[pattern]);
      }
    }

    let rule = "";
    for (const num of result) {
      rule += `valid_tapa(${r}, ${c}, ${num}).\n`;
    }
    return rule.trim();
}

function tapa_color_to_binary(r, c, color = "black") {
  /**
   * Map the color to a binary number.
   */
  let rule = `binary(R, C, 0) :- -1 <= R, R <= ${r}, -1 <= C, C <= ${c}, not grid(R, C).\n`;
  rule += `binary(R, C, 0) :- grid(R, C), not ${color}(R, C).\n`;
  rule += `binary(R, C, 1) :- grid(R, C), ${color}(R, C).`;

  return rule;
}

/**
 * Generate rules for a valid tapa clue.
 */
function valid_tapa(r, c) {
  const num_seg = [];
  const binary_seg = [];
  const direc = [
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
  ];

  direc.forEach(([dr, dc], i) => {
    binary_seg.push(`${2 ** (7 - i)} * N${i}`);
    num_seg.push(`binary(${r + dr}, ${c + dc}, N${i})`);
  });

  return `:- not valid_tapa(${r}, ${c}, P), valid_tapa_map(P, N), ${num_seg.join(", ")}, N = ${binary_seg.join(" + ")}.`; // prettier-ignore
}

modules["tapa"] = {
  name: "Tapa",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(tapa_color_to_binary(puzzle.row, puzzle.col, "black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("black", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(avoid_rect(2, 2, "black"));
    solver.add_program_line(tapa_pattern_rule());

    const clue_dict = {};
    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      fail_false(pos.startsWith("tapa"), `Clue at ${[r, c]} should be set to 'Tapa' sub.`);
      clue_dict[[r, c]] = clue_dict[[r, c]] || [];
      clue_dict[[r, c]].push(clue);

      if (clue_dict[[r, c]].length === 1) {
        solver.add_program_line(`not black(${r}, ${c}).`);
        solver.add_program_line(valid_tapa(r, c));
      }
    }

    for (const [rc, clue] of Object.entries(clue_dict)) {
      const [r, c] = rc.split(",").map(Number);
      solver.add_program_line(tapa_parse_clue(r, c, clue));
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`black(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display());
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZNj9owEL3zK1Y+zyG243xdKrpdeqFsW6hWqyhCgWa1qEGhgVSVEf99x+O0MQFVW1WiFxQxery88bwx/mD7vcnrAgQH7oOMwANEEMkAVIiYc2GD1z6z1a4skhsYNrvnqkYAcD8awVNebotB2qqywV7HiR6Cfp+kjDNgAj+cZaA/JXv9IdET0FN8xcBHbmxFAuFdBx/ovUG3luQe4gliHzHCR4TLVb0si/nYMh+TVM+AmTpvKdtAtq5+FKz1Yb4vq/ViZYhFvsNmts+rTftm23ytvjWtlmcH0ENrd3rGruzsGmjtGnTGruni3+2Wm+qc0Tg7HHDCP6PVeZIa1186GHVwmuwxTpI9U4FJfYMuAN3heCoyBP5Iv4iICNkRMe8R3JPEuBSnLFwvDicoUQinGpct51I+UUepga3pVghIdlwh7Jvn8am1mFp2GOFZxskTXtz3JWRofbkUqbCHjlKn7oUimdO2CGgs10NAGjcr7M+ziKwDx5T0qJzZBr8ZasbVcNK4LiWnkY4Y27BLSdUfyac0pxGp7Pw6jG3NHSfy+lkRZblzJE+WmYyp/BFzPDQuYU4L+ZHiiKKgOMN1DlpSfEfRo6gojklzR/GB4i1Fn2JAmtDslFfuJaYES3xgZvkJu7Eu4C1VeCC/8lFX5VX5pycbpGza1E/5ssCLZdKsF0V9M6nqdV4yvMMPA/aT0SeVKPev1/rFr3Uz+d5fXe7//3xMcV7xlNL3wDbNPJ8vq5Lhf0IwfBid8Bd3j4co2+WbnGWDFw==",
    },
    { url: "https://puzz.link/p?tapa/10/10/i0ha0t1h2hb0t3h4h.q.h5h6ha0o.g.h7h8g.o./", test: false },
  ],
};
