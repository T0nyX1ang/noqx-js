/** The Haisu solver. */

function adj_before() {
  /**
   * Generate a rule to constrain adjacent connectivity.
   */
  let adj = 'adj_before(R, C - 1, R, C) :- grid(R, C), grid_in(R, C, "l").\n';
  adj += 'adj_before(R - 1, C, R, C) :- grid(R, C), grid_in(R, C, "u").\n';
  adj += 'adj_before(R, C + 1, R, C) :- grid(R, C), grid_in(R, C, "r").\n';
  adj += 'adj_before(R + 1, C, R, C) :- grid(R, C), grid_in(R, C, "d").\n';
  return adj.trim();
}

function connected_directed_path(color = "white") {
  /**
   * Generate a directed path rule to constrain connectivity.
   */
  const initial = "reachable_path(R, C) :- path_start(R, C).\n";
  const propagation = `reachable_path(R, C) :- ${color}(R, C), reachable_path(R1, C1), adj_before(R1, C1, R, C).\n`;
  const constraint = `:- grid(R, C), ${color}(R, C), not reachable_path(R, C).`;
  return initial + propagation + constraint;
}

function haisu_rules() {
  /**
   * Generate constraints for haisu.
   */
  let rule = "clue(R, C) :- number(R, C, _).\n";
  rule += "clue_area(A) :- clue(R, C), area(A, R, C).\n";
  rule += "area_max_num(A, N) :- clue_area(A), #max { N0 : area(A, R, C), number(R, C, N0) } = N.\n";
  rule += "area_possible_num(A, 0..N) :- clue_area(A), area_max_num(A, N).\n";
  return rule.trim();
}

function haisu_count() {
  /**
   * Partial sum method for haisu.
   */
  let rule = "haisu_count(R, C, A, 0) :- path_start(R, C), clue_area(A).\n";
  rule += "area_in(A, R, C) :- area_border(A, R, C, D), grid_in(R, C, D).\n";
  rule +=
    "haisu_count(R, C, A, N) :- clue_area(A), area_possible_num(A, N), grid(R, C), adj_before(R1, C1, R, C), haisu_count(R1, C1, A, N), not area_in(A, R, C).\n";
  rule +=
    "haisu_count(R, C, A, N) :- clue_area(A), area_possible_num(A, N), grid(R, C), adj_before(R1, C1, R, C), haisu_count(R1, C1, A, N - 1), area_in(A, R, C).\n";
  rule += ":- clue_area(A), grid(R, C), haisu_count(R, C, A, N1), haisu_count(R, C, A, N2), N1 < N2.\n";
  rule += ":- number(R, C, N), area(A, R, C), not haisu_count(R, C, A, N).\n";
  return rule.trim();
}

modules["haisu"] = {
  name: "Haisu",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(
      Array.from(puzzle.text.values()).includes("S") && Array.from(puzzle.text.values()).includes("G"),
      "S and G squares must be provided."
    );
    solver.add_program_line(defined("number", 3));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("haisu(R, C) :- grid(R, C).");
    solver.add_program_line(fill_path("haisu", true));
    solver.add_program_line(directed_loop("haisu", true));
    solver.add_program_line(connected_directed_path("haisu"));
    solver.add_program_line(haisu_rules());
    solver.add_program_line(adj_before());
    solver.add_program_line(haisu_count());

    let s_index = [];
    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(area_border(i, ar, puzzle.edge));

      for (const [r, c] of ar) {
        if (puzzle.text.get(new BasePoint(r, c, BaseDir.CENTER, "normal").toString()) === "S") {
          s_index = ar;
        }
      }
    }

    for (const [point, clue] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (clue === "S") {
        solver.add_program_line(`path_start(${r}, ${c}).`);
      }

      if (clue === "G") {
        solver.add_program_line(`path_end(${r}, ${c}).`);
      }

      if (Number.isInteger(clue)) {
        const adjusted_clue = s_index.some(([sr, sc]) => sr === r && sc === c) ? clue - 1 : clue;
        solver.add_program_line(`number(${r}, ${c}, ${adjusted_clue}).`);
      }
    }

    solver.add_program_line(display("grid_in", 3));
    solver.add_program_line(display("grid_out", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7ZRNb9pAEIbv/Ipoz3Pw2l7b60tFU8iF0g+oosiyIiBusQqlBVxFRvz3vDNeYkdCqqpEVQ6V8fDOFzyzu/buVzXbFhTjChLySOMKvFDuyOPP6ZqW+1WRXlC/2i83WwiiD8MhfZ2tdkUvc1V571DbtO5TfZVmSitSPm6tcqo/pYf6fVoPqJ4gpUgjNmqKfMhBK68lz+qyCWoPeuw05A3kotwuVsXtqIl8TLN6Sor/5610s1Trze9COQ72F5v1vOTAfLbHMLtl+dNldtXd5nvlanV+pLrf4I7O4AYtLssGl9UZXJ7i2bir8kdxf47U5scjVvwzWG/TjLG/tDJp5SQ9wI7TgwoitPImy6aoIIEbPLohu2oCSBcw3pO84bz/6EacVW/a8sh/Uh5zvi2POauu2vKEA20+CTts4NVCfSN2KNYXO8VQVAdi34n1xBqxI6kZYFYdGNIhBvbxizjdOrSNDiPSJnbakuY5WJsYGiOyxsnXsXYavbHrjQHI3KLRa11vgjls0Gjrke+5XhtAYzBoxMjXTS9i0Mb9LziN4zQdNubhJRcNBuMYTIeZOaMTJ9h4C4QH9YmrTzqcYNP2xIZ66+ptlx9baBtmfEMzJxb1Wpb2UmwoNpIlj/mU/dU5fP7u/hEn80HeubDGL+3lvUyN8GxejDfb9WyFJ3Rw963jjav1vNiefLwbjz11r+SWpyT8/7r8969LXn3vtR3W14aDx0ctZ+WuUnnvAQ==",
    },
    {
      url: "https://puzz.link/p?haisu/9/9/199103msp7vvv4pre00bs6poj0068sr1ugp2g2g2g2u2g2k2k2g2u2g2g2g2p",
      test: false,
    },
    {
      url: "https://puzz.link/p?haisu/13/9/5948l0l2la55d8220gg44110000vg305c0cc00000000fvol3t1k3h25g5y5r6i7jao5zq",
      test: false,
    },
  ],
};
