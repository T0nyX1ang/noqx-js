/** The Tentaisho (Spiral Galaxies) solver. */

function galaxy_constraint(glxr, glxc) {
  /**
   * Generate a constraint for spiral galaxies.
   */
  const r = Math.floor((glxr - 1) / 2);
  const c = Math.floor((glxc - 1) / 2);
  const tag = tag_encode("reachable", "grid", "src", "adj", "edge");
  let rule = `:- grid(R, C), ${tag}(${r}, ${c}, R, C), not ${tag}(${r}, ${c}, ${glxr} - R - 1, ${glxc} - C - 1).`;
  rule += `\n:- grid(R, C), ${tag}(${r}, ${c}, R, C), edge_top(R, C), not edge_top(${glxr} - R, ${glxc} - C - 1).\n`;
  rule += `:- grid(R, C), ${tag}(${r}, ${c}, R, C), edge_left(R, C), not edge_left(${glxr} - R - 1, ${glxc} - C).\n`;
  return rule.trim();
}

modules["tentaisho"] = {
  name: "Tentaisho",
  category: "region",
  aliases: ["spiralgalaxies"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("hole"));
    solver.add_program_line(grid(puzzle.row, puzzle.col, true));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));

    const reachables = [];
    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      fail_false(symbol_name.startsWith("circle_SS"), "Invalid symbol type.");

      if (d === BaseDir.CENTER.description) {
        reachables.push([r, c]);
        solver.add_program_line(galaxy_constraint(r * 2 + 1, c * 2 + 1));
      }

      if (d === BaseDir.TOP_LEFT.description) {
        reachables.push([r - 1, c - 1]);
        solver.add_program_line(galaxy_constraint(r * 2, c * 2));
        solver.add_program_line(`not edge_top(${r}, ${c - 1}).`);
        solver.add_program_line(`not edge_top(${r}, ${c}).`);
        solver.add_program_line(`not edge_left(${r - 1}, ${c}).`);
        solver.add_program_line(`not edge_left(${r}, ${c}).`);
      }

      if (d === BaseDir.TOP.description) {
        reachables.push([r - 1, c]);
        solver.add_program_line(galaxy_constraint(r * 2, c * 2 + 1));
        solver.add_program_line(`not edge_top(${r}, ${c}).`);
      }

      if (d === BaseDir.LEFT.description) {
        reachables.push([r, c - 1]);
        solver.add_program_line(galaxy_constraint(r * 2 + 1, c * 2));
        solver.add_program_line(`not edge_left(${r}, ${c}).`);
      }
    }

    fail_false(reachables.length > 0, "Please provide at least one clue.");
    for (const [r, c] of reachables) {
      const excluded = reachables.filter(([r1, c1]) => r1 !== r || c1 !== c);
      solver.add_program_line(grid_src_color_connected([r, c], null, excluded, null, "edge"));
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c})..`);
      solver.add_program_line(`hole(${r}, ${c}).`);

      const edges = [
        [r, c - 1, r, c, BaseDir.LEFT.description],
        [r, c + 1, r, c + 1, BaseDir.LEFT.description],
        [r - 1, c, r, c, BaseDir.TOP.description],
        [r + 1, c, r + 1, c, BaseDir.TOP.description],
      ];

      for (const [r1, c1, r2, c2, direc] of edges) {
        const prefix =
          puzzle.surface.has(new BasePoint(r1, c1).toString()) &&
          puzzle.surface.get(new BasePoint(r1, c1).toString()) === color
            ? "not "
            : "";
        solver.add_program_line(`${prefix}edge_${direc}(${r2}, ${c2}).`);
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    const tag = tag_encode("reachable", "grid", "src", "adj", "edge");
    const spawn_points = reachables.map(([r, c]) => `not ${tag}(${r}, ${c}, R, C)`).join(", ");
    solver.add_program_line(`:- grid(R, C), not hole(R, C), ${spawn_points}.`);

    solver.add_program_line(display("edge_left", 2));
    solver.add_program_line(display("edge_top", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZfb9NADH/vp5ju+R7uX5JL3soovIwOyNBURVGVdhmr6JTRLgil6nef7cuoIHcb2tAQEkpj/2I7zs++f91+batNzaXAn7YcNFxGWrqVjekW/XW2ul3X2REft7dXzQYA56dTflmtt/Wo6IPK0a5Ls27Mu7dZwRTjdEtW8u5DtuveZd2Mdzm4GDdgOwEkGVcAJwd4Tn5Ex84oBeBpjwHOAC5Xm+W6nue5M73Piu6MM/zQK3odIbtuvtXMvUfPy+Z6sULDorqFYrZXq5ves20vmi9tHyvLPe/Gju/kni9+peerD3wROr6IPHyxjOfzrS8+19t24SOblvs9dP0j0J1nBTL/dID2APNsx2LJMsNZrJzSThlSSa9SUtaSSl2IFO4NKRKnZdxrFy2VSyz1ve7jdf++dsmlwXggM812ICXJGRDTYC8kFHzoEjSORZDGY44FmNXQHHnNFjh5klj85DBaan8WqaFknz1C+zC9xO764i3mH8Zr469V47h47EYF7MTTY7cYP+QTqUDrA32IAl2OEn+bY4V1eQYr0M84UG+cwIz02a2/b4nw80wkTGGfPcHx+jUPTM83NEkVyTNYSrzTJF+TFCQjkicUMyF5TvKYpCEZU0yCi/E3l+twnTyNDosELJjUwiBJaC4BBd0kgNMOgZYJ17h8NWILGBz60UoK7Q6Nn6/o37OVo4Ll7eayWtawy05gvz2aNpvrag1P+VV1UzM42/Yj9p3RXWg8Kf8fd3/nuMMREC+8ip67qAuYCzKRvDvl7KadV/NlA3MLWveAYwITSsG/MCNY0J1ypZ/oNkoFHJEIJTSCq8j8wYSP1Pfg937sWkG328j8btgNAw4RYAvbZsBhhoW/+PyD3bgc3QE=",
    },
    {
      url: "https://puzz.link/p?tentaisho/19/22/hafheneweo2ffneneyerfgezy0eg4fifhafnezgfnfmegepel3epfzzt6989ezq7ehfehfwfnezk2dezq4b88fzveweofznfhefezzu54ffzzmedb4b3ezuejflexezg4fl7ezel72eregfztflefzzheifhbeztewen9ekejemer6eret8fpe",
      test: false,
    },
  ],
};
