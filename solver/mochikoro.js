/** The Mochikoro solver. */

modules["mochikoro"] = {
  name: "Mochikoro",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(invert_c("black", "green"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent(8));
    solver.add_program_line(grid_color_connected("not black", 8, [puzzle.row, puzzle.col]));
    solver.add_program_line(avoid_rect(2, 2, "black"));
    solver.add_program_line(all_rect("green"));

    fail_false(Array.from(puzzle.text.keys()).length > 0, "No clues found.");
    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      solver.add_program_line(`clue(${r}, ${c}).`);
      solver.add_program_line(bulb_src_color_connected([r, c], "not black", 4));
      if (Number.isInteger(num)) {
        solver.add_program_line(count_rect_src(num, [r, c], "not black", 4));
      }
    }

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      if (BaseColor.DARK.includes(color)) {
        solver.add_program_line(`black(${r}, ${c}).`);
      } else {
        solver.add_program_line(`not black(${r}, ${c}).`);
      }
    }

    const tag = tag_encode("reachable", "bulb", "src", "adj", 4, "not black");
    solver.add_program_line(
      `:- clue(R, C), clue(R1, C1), (R, C) != (R1, C1), ${tag}(R, C, R, C1), ${tag}(R1, C1, R, C1).`
    );
    solver.add_program_line(display("black"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVRi5tAEH73VxzzPA+uu5rcvpT0eulL6rVNSjhEgrEekTNsamIpG/Lfb3aUmhYPehykUIrZj2++Hcdvx3Wz/9ZkdYFCuJ8co4/EUIURDyECHn53LcpDVegrnDSHjamJIN5Np/iQVfvCS7qs1Dvaa20naN/rBAQgBDQEpGg/6aP9oG2Mdk5TgIq0WZsUEL3t6ZLnHbtpReETjztO9J5oXtZ5VaxmrfJRJ3aB4J7zlu92FLbmewGdDxfnZrsunbDODrSY/abcdTP75qt5bLpckZ7QTlq78wG7srfraGvXsQG7bhWvt1vtzJDR6/R0ooZ/JqsrnTjXX3o67ulcHwljfYTQp1vp3bbvBEL5axi5woo8dkLEwpteGI1JUD9D4QuKZR8HruBZrH6vKCJXoX+kGLkK47NYncXkWrD3e8YpY8C4oKWhlYzvGH3GkHHGObeMS8YbRsUYcc7INecP2wcyAK0QJK0vaHt5AW+JpE9w4Ar/XTX1Epg39UOWF7Tj42a7Luqr2NTbrAI6XE4e/AAevMvU//Pm4ueNa77/olPn73/FCfWVviV7h7BrVtkqNxXQnxWyLp/Rn8t/aZ3X1794N+nood2Rb8pHUxtIvSc=",
    },
    {
      url: "https://puzz.link/p?mochikoro/22/13/4l2k4m3w4p5h1n2x2v4i2h4k2h5p2k4m5j4q2t2u3n4g4l3o4o2n2j2zk2g1n1o",
      test: false,
    },
  ],
};
