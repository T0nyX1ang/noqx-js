/** The Kakuro solver. */

modules["kakuro"] = {
  name: "Kakuro",
  category: "num",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);

    const sums = [];
    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);

      if (pos === "sudoku_1" && Number.isInteger(num)) {
        const area_points = [];
        let cur = parseInt(c) + 1;
        while (cur < puzzle.col && !puzzle.symbol.has(new BasePoint(r, cur, BaseDir.CENTER).toString())) {
          area_points.push([r, cur]);
          cur += 1;
        }

        fail_false(area_points.length > 0, `Invalid kakuro clue at (${r}, ${c})`);
        sums.push([num, area_points]);
      }

      if (pos === "sudoku_2" && Number.isInteger(num)) {
        const area_points = [];
        let cur = parseInt(r) + 1;
        while (cur < puzzle.row && !puzzle.symbol.has(new BasePoint(cur, c, BaseDir.CENTER).toString())) {
          area_points.push([cur, c]);
          cur += 1;
        }

        fail_false(area_points.length > 0, `Invalid kakuro clue at (${r}, ${c})`);
        sums.push([num, area_points]);
      }

      if (pos === "normal" && Number.isInteger(num)) {
        solver.add_program_line(`number(${r}, ${c}, ${num}).`); // initial conditions
      }
    }

    solver.add_program_line(defined("area", 3));
    solver.add_program_line(defined("number", 3));
    solver.add_program_line(grid(puzzle.row, puzzle.col));

    let area_id = 0;
    for (const [sum_clue, coord_list] of sums) {
      solver.add_program_line(area(area_id, coord_list));
      solver.add_program_line(fill_num(Array.from({ length: 9 }, (_, i) => i + 1), "area", area_id)); // prettier-ignore
      solver.add_program_line(`:- #sum { N, R, C: area(${area_id}, R, C), number(R, C, N) } != ${sum_clue}.`);
      area_id += 1;
    }

    solver.add_program_line(unique_num("grid", "area"));
    solver.add_program_line(display("number", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZNb9s8DL7nVxQ66yBK8uct65pdunRbOxSFYQzJliFBGrjIxzA4yH8vSdlO43CHd0DxYtjgmCEfyeJDUl/LyXK3rjQY+rlU4z8+HlJ+bRrza5rnbrF9nOUXerjbzqs1KlrfjEb6++RxMxsUTa9ysK+zvB7q+l1eKFBaWXxBlbr+mO/r93k91vUtNikNiF2HThbVq6N6z+2kXQYQDOpj1F347AHVQD7YH/KivtOKvLzhb0lVq+rHTDUsyP5araYLAqaTLYaymS+empbN7lu13DV9oTzoevhrsu5IltRAlrQ+2SaaVyVry8MBU/4J6X7JC2L++aimR/U236Mc53vlE/oUqwJcF0QB0cxahiOlPfrIbEymbyxnuDFrzDhj721rxq1JsMDgGNQZPTQ2D2WxdMGOuLs72p5Hw2CCnTDBdnS009P2zLHdkAFAWjR+2w4+sGv9Q8p84tbMeLiWrTUcN3Q2MLvOu4XgrWVrseXE9sDeTWvHbHfebRaiadk59PQyGw5CdC0913zf8vEYV5dNrNUD1oqrYXU3qXCSKUfdsKInGIXWxyicPkYh9TFKWh+jQvYxCqePUUh9jIrSw7zg1wt+veA3EuKNhHgjId5I4BcJ/GLKcx8TuMRCDhKBSyJw4cnew1LBRybEC0YgCEbwAkZINa48CRSc4xoUQF4JZ6CQR7BCwkGaiSBNJ1wDEih9Ls0o4P3mDJTyGUmxRxIlaQqBNIcglijFZ5nHpT3iLdqyvMNdW9eO5VuWhmXE8pr7XLG8Z3nJ0rOMuU9C+/5/OhnCSRD2mFeiU7hwxTh9oj8PKweFGu9W09n6YlytV5NHPJtv+Vx+Yc8nTzOFF6LDQP1U/BaO7lf/7kj/wx2J0m9+ez3wuVnf/B2rFCdsV41y8Aw=",
    },
    {
      url: "https://puzz.link/p?kakuro/15/15/m-dm.ffl-7l9-mQjmIBmbam-anWZs.jSpBjo.7goP4lJ9m..nAjo74lf-.lUUrF9l7-qHNq-clKTrO4l.-clgIoibn.JbmHglfgo.gOo7NpA-.s7Hnb-m-fm-7m-7m-hl-4l.-Dm-Em46BfgJjhSK79acVZD",
      test: false,
    },
  ],
};
