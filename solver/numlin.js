/** The Numberlink solver. */

function no_2x2_path_bit() {
  /**
   * Generate a rule that no 2x2 path (bit version) is allowed.
   * A reachable path rule should be defined first.
   */
  const points = [[0, 0], [0, 1], [1, 0], [1, 1]]; // prettier-ignore
  const tag = tag_encode("reachable", "grid", "bit", "adj", "loop");
  let rule = `bit_same(R, C, B) :- grid(R, C), bit_range(B), ${points
    .map(([r, c]) => `${tag}(R + ${r}, C + ${c}, B)`)
    .join(", ")}.\n`;

  rule += `bit_no(R, C, B) :- grid(R, C), bit_range(B), ${points
    .map(([r, c]) => `not ${tag}(R + ${r}, C + ${c}, B)`)
    .join(", ")}.\n`;

  rule += "bit_same(R, C, B) :- bit_no(R, C, B).\n";
  rule += "no_2x2(R, C) :- grid(R, C), bit_range(B), not bit_same(R, C, B).\n";
  rule += "no_empty(R, C) :- grid(R, C), bit_range(B), not bit_no(R, C, B).\n";
  rule += ":- grid(R, C), no_empty(R, C), not no_2x2(R, C).\n";

  return rule.trim();
}

modules["numlin"] = {
  name: "Numberlink",
  category: "loop",
  aliases: ["numberlink"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    const locations = {};
    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      locations[clue] = locations[clue] || [];
      locations[clue].push([r, c]);
    }

    fail_false(Object.keys(locations).length > 0, "No clues found.");
    for (const [n, pair] of Object.entries(locations)) {
      fail_false(pair.length === 2, `Element ${n} is unmatched.`);
    }

    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));

    const [rule, nbit] = num_binary_range(Object.keys(locations).length);
    solver.add_program_line(rule);

    if (puzzle.param["visit_all"]) {
      solver.add_program_line("numlin(R, C) :- grid(R, C).");
    } else {
      solver.add_program_line(shade_c("numlin"));
    }

    if (puzzle.param["no_2x2"]) {
      solver.add_program_line(no_2x2_path_bit());
    }

    solver.add_program_line(fill_path("numlin"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(single_loop("numlin", true));

    for (const [id, pair] of Array.from(Object.values(locations)).entries()) {
      const [r0, c0] = pair[0];
      const [r1, c1] = pair[1];
      solver.add_program_line(clue_bit(r0, c0, id + 1, nbit));
      solver.add_program_line(clue_bit(r1, c1, id + 1, nbit));
    }

    solver.add_program_line("numlin(R, C) :- clue(R, C).");
    solver.add_program_line("dead_end(R, C) :- clue(R, C).");
    solver.add_program_line(grid_bit_color_connected("numlin", "loop"));
    solver.add_program_line(avoid_unknown_src_bit("numlin", "loop"));

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
      data: "m=edit&p=7VPBbptAEL3zFdae58Cy2Ia9EcfuhZK2cRVFK4SwSxVUXFJsqmgt/3tmBizcyJVSJfKpWvP09s0svB3PbH+1eVPAFJcKwAWJS7k+PxOXfse1LHdVoUcQtbuHukECcLNYwPe82haO6bNSZ29DbSOwH7QRUoDw8JEiBftZ7+1HbROwtxgSIFGLuyQP6XygdxwnNutE6SJPeo70Hum6bNZVkcWd8kkbuwRB37ni00TFpv5diN4H7df1ZlWSsMp3eJntQ/nYR7btt/pH2+fK9AA26uzGZ+yqwS7Rzi6xM3bpFm+2W5U/i6dzTsP0cMCKf0GvmTZk++tAg4He6j1iovfCm9LRCG10f4tQExKuBsF3SZifCAEJ14Mw4YzZIExZOMkI5It3hJxx8tnQe/GOUP3hA+1KNn3PuGD0GJd4J7CK8ZrRZRwzxpwzZ7xjnDH6jBPOmVJV/qlub7Ej/DHeLQywTiFQIdQrDRrP53k8rvH771LHiBi7a5TUzSavsMeSdrMqmuMe5/ngiCfBj1F4xP8/4pcfcaq+e7GGfZ/5MVjYvuPB3oB4bLM8W9fYY1g7CuJY/C3gvz5w8VvjXKbOMw==",
      config: { visit_all: false, no_2x2: false },
    },
    {
      data: "m=edit&p=7VRNi9swEL37Vyw662DJX7Ju6XbTi+t+bMqyGLM4qcuatdetE5dFIf89M2MbOSU9lMKSw+Lo8Z5mhJ5Gymx/9UVXchHgz1Pc5QK+0FU0hAINY/pW1a4u9RVf9LvHtgPC+aflkv8o6m3pZGNW7uxNrM2Cmw86Y4JxJmEIlnPzRe/NR21Sbm4hxLiAuWRIkkBvLL2jOLLrYVK4wNORA70Huqm6TV0+JMPMZ52ZFWe4zztajZQ17e+SjT5Qb9pmXeHEutjBYbaP1c8xsu2/t0/9mCvyAzeLwW5yxq5n7SId7CI7YxdP8d926+q5fDnnNM4PB6j4V/D6oDO0/c1SZemt3gOmes8iCUvxmulSmHJBSis9kJ6VPkjfyhgkPJZRCjcAHVrthaAjq32Mz3SIe8PDmnSE8Ximcb3dXdD2s7jCfIGvdJyI1YkBKSjBnk7K0wPIABPscWUk/lhAFuY6Ot1SUsHsGaRCC1NNoMaCKn1PuCSUhCu4CG48wveELmFAmFDODeEd4TWhTxhSToRX+U+X/Qp2Mn9oGn/7sDJv0YuO5k7GEmgwV2nbNUUNbSbtm3XZTRpa+sFhL4wG/T39ty7/+l0eq+9e2t//0uxAQ2LP9HqhmE8sd44=",
    },
    {
      url: "https://puzz.link/p?numlin/26/26/zz-15gdx-12nfs-16j8x4v-11zxes9kfs8zg4lbm6k5ubv2r-14n1q-10z5v7zeq3n3r1v-13u9k-11mdl6zgas2k-10sczxav-16x7jcs-15n-13x-14g-12zz",
      test: false,
    },
  ],
  parameters: {
    visit_all: { name: "Visit all cells", type: "checkbox", default: true },
    no_2x2: { name: "No 2x2 path", type: "checkbox", default: true },
  },
};
