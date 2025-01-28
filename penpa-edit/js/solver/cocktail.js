/** The Cocktail Lamp solver. */

modules["cocktail"] = {
  name: "Cocktail Lamp",
  category: "shade",
  aliases: ["cocktaillamp"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent(8));
    solver.add_program_line(grid_color_connected("gray", 8, [puzzle.row, puzzle.col]));
    solver.add_program_line(area_color_connected("gray", 4));
    solver.add_program_line(avoid_rect(2, 2, "gray"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(rc[0], rc[1], BaseDir.CENTER, "normal").toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(count(num, "gray", "area", i));
        }
      }
    }

    for (const [point, draw] of puzzle.edge.entries()) {
      const [r, c, d, _] = extract_point(point);
      if (d === BaseDir.TOP.description && r > 0 && draw) {
        solver.add_program_line(`:- gray(${r}, ${c}), gray(${r - 1}, ${c}).`);
      }
      if (d === BaseDir.LEFT.description && c > 0 && draw) {
        solver.add_program_line(`:- gray(${r}, ${c}), gray(${r}, ${c - 1}).`);
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`gray(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not gray(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("gray"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZNb9w2EL3vrzB4JlCRww9Jl8JN7V5cp+26CILFwlhvlMaojY3X3qKQ4f+eN8NhVBUG0qBoegkWSz5So5nH4eNQ93eHzX6wjqxzllrbWIdfJG9DTNb5LP9GfxfXDzdDf2SPDw/vdnsAa1+entq3m5v7YbFSq/Xicez68diOP/Qr44w1Hn9n1nb8uX8cf+zHEzsu8cjYFnNnxcgDnkzwlTxn9KJMugb4XDHga8Dt9X57M1yelZmf+tV4YQ3H+U7eZmhud38MRnnweLu7vbrmiavNAxZz/+76vT65P7zZ/X5QW7d+suNxobt8hi5NdBkWuoyeocur+I/pduunJ6T9FxC+7FfM/dcJthNc9o9oz/tHQwmv8m7LzhhqMfQfhyFiyErQIT+dhrGbGWeaPW3zbNjNh865+djPQzli538ZBx5DnnWc5tFcZv/mWyS1znTzCL7h8UTXN/Ole8cMJg9IkJM0vZb2VFov7QWyaEeS9ntpG2mjtGdic4Lk+hysZxoe7nME9oozcCi49cBYnOBgiWkKjsBq3+FQNki+4GTJYfGCW2DQFtwBY0nA8AFc7Mk1ljySI9gDl1jwYYkaxYhFJRZ5+A/FP94DLjzxHrD6J/CMhScR7KPaB/hM6jOAWyrcKIJDUg4R3JJyi7DPap/ALSu3BP+t+k/g1iq3BD6t8smI22ncjFidxsrg2SnPFrE6jdUmGxq178gGp3G7CFz8h6YBLjxDg9rnCh+8Z4Mv9sEFG6hwCw4+qfjEe8CFG94DLhyCb23gc8SY4D+of3LAhRt8oM6qf1TfENU+IFbSWAE8k/IMiJU0VgTPpDwj7LPaR9jnqh/WWNUMTdqDljwfTMGsSc0V1k41Vw1yrtoTLfHBFcwa031BHkjzhn7Snsc+8sEWjH30VT/wozlEP2mPdUVqT6xJtUceSHOIftIha4wLg2Dsu+aQIua5OgnGfNUka4wLh2DWqmopsVar9mBfNcka48IiGOvKVUvw06qfFn6qJqEx4ronmLWq9nxmNc/oP2pS9KbnHT2w7i/yHDTP6Cd9svb0vKMHrhqDvVd7D3uv9qw9Pe/oocmqMdZw1ST8VK2y9rjwisagST370ClwnYefqlXWnp599MBsj+L3SkrgC2mDtElKY+br5x9eUHI1wTH7bMtt9e9L8ie5rVDO+M547he/PlkvVmZ52L/dbAd8f5y8+W04Ot/tbzc3GJ0fbq+G/ZH7Jhh8+z0tzJ9G/nJrh6+fg//T5yBvQfNZH4Vf4Jh9gs4K2cVBHF9a8/5wubnc7iAw5E7m8+fN4078+/wXXy3qitnc7QezXnwA",
    },
    { url: "https://puzz.link/p?cocktail/10/10/107668sgg1l3q54f0qfee0e0fevvf70c0cf7dh853h1g2h1", test: false },
    {
      url: "https://puzz.link/p?cocktail/17/35/0gf1sfdrdfrvnar28dkkmpab4k3i4jt99ugkvdo7nd5n6irjmdpn6sr36c1jj09tqgctc0ve8tb9b9qapr5as8be6dr575jbcphpc5cidpitt9h41fhj2poh2g2l29f0e70e8041h0t3hpk01u01n1o0hh76003hvc08000gs080e7s0oue607v0o7ha2dd1dte8371ji01o610ao6180ca790dt5fkg42rck531h314h56g28j2g6h4g2k1632g4i0h25h34111",
      test: false,
    },
  ],
};
