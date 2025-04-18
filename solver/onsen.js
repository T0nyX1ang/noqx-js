/** The Onsen-Meguri solver. */

function onsen_rule(target, _id, area_id, r, c) {
  /**
   * Generates a rule for an Onsen-Meguri puzzle.
   * An area fact, a grid direction fact and an area border fact should be defined first.
   */
  let rule = `onsen(${_id}, ${r}, ${c}).\n`;
  rule += `onsen(${_id}, R, C) :- grid(R, C), adj_loop(R, C, R1, C1), onsen(${_id}, R1, C1).\n`;

  if (target !== "?") {
    const num = parseInt(target);
    rule += `:- area(A, R, C), onsen(${_id}, R, C), #count { R1, C1: area(A, R1, C1), onsen(${_id}, R1, C1) } != ${num}.`;
  } else {
    const anch = `#count { R1, C1: area(${area_id}, R1, C1), onsen(${_id}, R1, C1) } = N`;
    rule += `:- area(A, R, C), onsen(${_id}, R, C), ${anch}, #count { R1, C1: area(A, R1, C1), onsen(${_id}, R1, C1) } != N.`;
  }

  rule += ":- onsen_loop(R, C), not onsen(_, R, C).\n";
  return rule.trim();
}

function onsen_global_rule() {
  /**
   * Generates global rules for an Onsen-Meguri puzzle.
   */
  // any area, any onsen area, go through border at most twice
  let rule =
    ":- area(A, _, _), onsen(O, _, _), #count { R, C, D: onsen(O, R, C), area_border(A, R, C, D), grid_direction(R, C, D) } > 2.\n";

  // two different onsen loops cannot be connected
  rule += ":- onsen(O1, R, C), onsen(O2, R, C), O1 != O2.\n";
  return rule.trim();
}

modules["onsen"] = {
  name: "Onsen-Meguri",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line(shade_c("onsen_loop"));
    solver.add_program_line(fill_path("onsen_loop"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(single_loop("onsen_loop"));

    let onsen_id = 0;
    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(area_border(i, ar, puzzle.edge));
      solver.add_program_line(count(["gt", 0], "onsen_loop", "area", i));

      for (const [r, c] of ar) {
        const point = new BasePoint(r, c, BaseDir.CENTER, "normal").toString();
        if (puzzle.text.has(point)) {
          const num = puzzle.text.get(point);
          solver.add_program_line(`onsen_loop(${r}, ${c}).`);
          solver.add_program_line(onsen_rule(Number.isInteger(num) ? num : "?", onsen_id, i, r, c));
          onsen_id++;
        }
      }
    }

    fail_false(onsen_id > 0, "No onsen clues found.");
    solver.add_program_line(onsen_global_rule());

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
      data: "m=edit&p=7VRRb9owEH7nVyA/30McJ46dN9bRvTC6rUxVFUUIaLaiQdNBM1VB/Pd+di5LpFXqpm48TSaXz+fzcd/nc/bfq8WuoARDGQpIYqgg8o8O3K8ds/XDpkiHNKoebssdANHF+Tl9WWz2xSDjqHxwqG1aj6h+l2YiFOQfKXKqP6aH+n1aj6m+xJIgCd8ESAoKAccdvPLrDp01ThkATxusAa8BV+vdalPMJ02iD2lWz0i4/3njdzsotuWPQjTb/HxVbpdr51guHkBmf7u+55V9dVN+qzhW5keqR025k2fKVV25DjblOvSvyt2s74rH5yq1+fEIxT+h1nmaubI/d9B08DI9wE7Tg4gCbMXRNocitJuKIepkh3EOxVPskX7ntbfn3obezpCYauXtW28Db2NvJz5mjP+TKiEZGZGGyBjFJGPNGP649Rtg2+AYPaglY8RojoktyQTFOYyulAnHaHRsEjJGjCPgcIIYwzEJ8hvOnyDGcoxBjOUYEwIrxpbCgGOsBOb8NgTmGBsBxx5jnULJfscxajlq4KTj2+rgOMYtx54mjm+riePrTsfzQh7NeXRPEw1euuXV08HxTdhv4DfsdxxNy1EBR8ylpwM4/tQBHKVtOErbaeL5sg54Azd58GZNcPhXvgXOvI281b41EteRf9Szr+lCoQx0swbFxaQgs2r68sUCsxDcewOn9Ldn+SATE9zs4bTcbRcb3O/xzdfebFptl8WunePLehyIR+Ef3FBJ0f+P7ek/tk794GTt+5vN+kI5GYTl/qf6gsR9NV/MVyV6DNq9bhHX65eFk7PHbRXl3b64E/ngCQ==",
    },
    { url: "http://pzv.jp/p.html?onsen/10/10/akkh92j6mt9pjvfti91svv1vvovv3g3f04ti3m2n1j1x1zq2v3n3", test: false },
    { url: "https://puzz.link/p?onsen/10/10/ebvsrdlpn5bmq7v7kcgj9ac41au4d36hn0bm.n.zzzz.n./", test: false },
    {
      url: "https://puzz.link/p?onsen/15/15/9018m2kqm9jbr3a9f853qcfj996k6esa8alac2v892cvv0sj4086g5lb4a6qqeh7q2404c5nvq8cvi30m098zzzzzzj.u..zzzzi",
      test: false,
    },
  ],
};
