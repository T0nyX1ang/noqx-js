/** The N Cells solver. */

function count_reachable_edge(target) {
  /**
   * Generates a constraint for counting grids in a region divided by edges.
   * An edge rule and a grid_branch_color_connected rule should be defined first.
   */
  const tag = tag_encode("reachable", "grid", "branch", "adj", "edge");

  return `:- grid(R0, C0), #count { R, C: ${tag}(R0, C0, R, C) } != ${target}.`;
}

modules["ncells"] = {
  name: "N Cells",
  category: "region",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    fail_false(Number.isInteger(Number(puzzle.param.region_size)), "Invalid region size.");
    const size = parseInt(puzzle.param.region_size);
    fail_false((puzzle.row * puzzle.col) % size === 0, "It's impossible to divide grid into regions of this size!");

    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(edge(puzzle.row, puzzle.col));
    solver.add_program_line(adjacent("edge"));
    solver.add_program_line(grid_branch_color_connected(null, "edge"));
    solver.add_program_line(count_reachable_edge(size));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(count_adjacent_edges(num, [r, c]));
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} edge_${d}(${r}, ${c}).`);
    }

    solver.add_program_line(display("edge_top", 2));
    solver.add_program_line(display("edge_left", 2));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7Vjfb+JGEH7nrzj5eR92vb9sv1TplfQl5dpeqtPJQogQ2kMlIiWhqhzlf79vx+ZwHMabKwfXVpXFMuw3uzOeGX875u6PzXQ9F0oKpYTOBL5xGZUJY53w2tBHNtfl4n45L16Js839h9UaghBvzs/Fr9Pl3XxQNlrjwUOVF9WZqL4vyiRNBH1UMhbVT8VD9UNRjUT1FlAiFOYuIKlEpBCHO/Ed4UF6XU8qCXnUyBDfQ5wt1rPlfHJRz/xYlNWlSIKdb2l1EJOb1Z/zpF5Gv2erm6tFmLia3uNm7j4sbhvkbnO9+n3T6Krxo6jOaneHe9zVO3eDWLsbpKO5u7xd7XM0Hz8+IuA/w9VJUQavf9mJ2U58WzxgHBUPiXHbe6yzkhgfJpCkTxNZmNCtibyzxMrOEqs6E440Wkuc7Wh407Hiyco3u4mM/GgtyXVHQ8m0Y0ZJ0mktUpIMPdEhX1qmlewGRcluVJQinfZMSnfd3kd3b1vp7n0r88yfOr7tfWw3BcqSTnufOsRtHffMH/csPu5pfFAUikrjPY3nNKY0XqJyRKVp/I5GSaOl8YJ0hjS+o/E1jYZGRzo+1N5nVefh7qB6EZc8Q00ahIMEh4gHAVzWCKHWSMi2Qt4op9aK1CLVWiQaHKg9tguyy3cydIDtdCyKJcheQgcb6WhQSl1T7dPL/jfmxoMyGV7/Nn81Wq1vpkvw1mhzczVfb3/jiHgcJH8l9Cl1OHH+PzVOfmqE4MsTP52HkkWJuH56REX1RiS3m8l0MluhyBC8BnaAPQsb3QunuYAKv7nBastvLgGbXhi0xNr2PbBz6X7AOMMAVnJbcYC33FaMcecdt0J/7n18QRvcfdTpxxHMwsiv6ckvSg8dFAuj9NBPsXDIb8bCaLV52NiciyeTfueYIDjHxNM5z9Y9XEdXwsKZSD0ouycu6Fc4GOWYoh/kYI+U9cEpYP6J9arXtX542wJwcNMVsKvrRqFvc56Ktu3EfhitCwPkzMPdA6gvRSAsF52iStlHJMrLEVaPHDiHsHr0uIqcR/9WOvu6nBChqwjZRTqICPyCzfmEagXKwFtmH6x4RlEeq9lS1KgWzVcLwbzngADnLCzBZpK3LfEHlOJtK9jm4RQ8nGZ8vjMENeupFtQaC+OFkqFNFPheAG+ezArPcTbXE3nHdDhWM1tZridibbBb8cY5GygCLbTjCxDUrV1PCSHLLIz3+K+Q/jjFHvK4H/WpOC5ZHDHTR2aiF3Rlf7/l623aYi1frFeIdBov6HL4mMfgI77axjqsf2QXfvK/RvCv4XjwEQ==",
    },
  ],
  parameters: {
    region_size: {
      name: "Region Size",
      type: "number",
      default: 5,
    },
  },
};
