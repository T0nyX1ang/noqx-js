/** The Heyablock solver. */

modules["heyablock"] = {
  name: "Heyablock",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("not gray", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(area_color_connected("gray", 4));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);
      let flag = true;
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "normal").toString());
        if (Number.isInteger(num)) {
          flag = false;
          solver.add_program_line(count(num, "gray", "area", i));
        }
      }

      if (flag) {
        solver.add_program_line(count(["gt", 0], "gray", "area", i));
      }
    }

    for (let r = 0; r < puzzle.row; r++) {
      const borders_in_row = Array.from({ length: puzzle.col - 1 }, (_, c) => c + 1).filter((c) =>
        puzzle.edge.has(new BasePoint(r, c, BaseDir.LEFT).toString())
      );

      for (let i = 0; i < borders_in_row.length - 1; i++) {
        const [b1, b2] = [borders_in_row[i], borders_in_row[i + 1]];
        solver.add_program_line(avoid_rect(1, b2 - b1 + 2, "not gray", [r, b1 - 1]));
      }
    }

    for (let c = 0; c < puzzle.col; c++) {
      const borders_in_col = Array.from({ length: puzzle.row - 1 }, (_, r) => r + 1).filter((r) =>
        puzzle.edge.has(new BasePoint(r, c, BaseDir.TOP).toString())
      );

      for (let i = 0; i < borders_in_col.length - 1; i++) {
        const [b1, b2] = [borders_in_col[i], borders_in_col[i + 1]];
        solver.add_program_line(avoid_rect(b2 - b1 + 2, 1, "not gray", [b1 - 1, c]));
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
      data: "m=edit&p=7VVdT9tKEH3Pr0D7vA/eD9trv1SUhr7Q0DZUCEVRZIIpEYnCTUg/HOW/c2Z2jEFCheqqXFW6Srw+ezyemT2znl3/s6lWtTYJ/V3QuOPnTeDLhoyvRH4ns9t5Xe7p/c3t1XIFoPXx4aG+rObrujcSq3Fv2xRls6+b9+VIGaWVxWXUWDefym3zoWz6uhnikdIB3FE0soD9Dp7yc0IHkTQJ8EAw4BngdLaazuvJUWQ+lqPmRCuK85bfJqgWy2+1kjxoPl0uzmdEnFe3WMz6anYjT9abi+X1RmzNeKeb/Zju8Il0XZcuwZguoSfSpVX84XSL8W4H2T8j4Uk5oty/dDB0cFhuMQ7KrXIJXnWoNVdGOYup7aaBHL9BpkKkRPj7aUZvd+aZxzTtptmjpyZ5bG0SMu9iG0/BH87p/YdzCt6+j/wNr+KMx0MeLY8nWKRuHI/veEx4THk8Yps+1m6N09bmqrTYmyYFLgTn2jojuAB2EVvwXngL3gvvDHAqGD69+PTgU+E9+LTlESuVWB4+M/GZgs+ET8HnLY9YucTK4DMXnxn4IHwOPgifI1aQWDl8BvEZwBfCB/BFy+faJRIrFMDiswBvhC/Am8jDFjjGgi1w9Alb7azw0NaJtrAFjrFgq51oC1tg4aGtE21hCyyxoK0TbWGrXSo8tHWiLWyBJRa0da22sLcem451TrraUV1oszG2XR2pRh6bkrHvakr1os3IGK3wvr60H7ApGaNN+lZPqoX4D/Df1oj0D+I/wH9bL6pFEP/catsawX8Q/4HacOsf6ypkXQXWVbS6kebRP+5dLUhnG/3j3tWFNLfRP+5djUh/agysOc6Dtl5UC+oQjC0wrQsf0yl/Ugc8eh4z/tRy6jYv7EfciYJWrHlsTv/+E382txGWRyfd4x+1sL+MG/dGarhZXVbTGgdD/+JrvTdYrhbVHLPBZnFer9o5zuVdT/1QfHF79f8f1f/RUU0lSH7rwH6Fb+KZdEZQFw2xOdbqZjOpJtMl9hi0+xWPr+yl9q++WjQBdVX/rL5X17Ua9+4A",
    },
    { url: "https://puzz.link/p?heyablock/10/10/498g17buntfqsh12247obovv003o00vv3o3o726h22j2h4g6g2", test: false },
    {
      url: "https://puzz.link/p?heyablock/15/10/4i894gi914i2944i894gi914i294000vvv000vvv000vvv000vvv0001122222024024311331235234",
      test: false,
    },
  ],
};
