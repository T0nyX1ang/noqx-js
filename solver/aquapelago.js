/** The Aquapelago solver. */

modules["aquapelago"] = {
  name: "Aquapelago",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(adjacent("x"));
    solver.add_program_line(avoid_adjacent_color("black", 4));
    solver.add_program_line(avoid_rect(2, 2, "not black"));
    solver.add_program_line(grid_color_connected("not black", 4, [puzzle.row, puzzle.col]));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(grid_src_color_connected([r, c], null, null, "black", "x"));
        solver.add_program_line(count_reachable_src(num, [r, c], "grid", "black", "x"));
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

    solver.add_program_line(display("black"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZBb9pMEL3zK6I5z8Frr43xpaJp+C6U9CtUUbSykHEdBcXU1OCqWsR/z8ysFWOVqpEqcagis2+GN7PLm9nVmt33JqsLVBF/ghg9VPREOpIRxiMZXvss1vuySK5w3Owfq5ocxNvJBB+yclcMTJuVDg52lNgx2v8SAwoQfBoKUrT/Jwf7MbEztHMKAWripi7JJ/emc+8kzt61I5VH/sz5PO2e3Hxd52WxnFKUmE+JsQsE/p33Mptd2FQ/Cmh18Pe82qzWTKyyPRWze1xv28iu+Vo9NW2uSo9ox07u/IzcoJPLrpPL3hm5XMXfyy231Tmho/R4pIZ/JqnLxLDqL50bd+48OYD2IdEIeigmDMXE2plIzEiJUcrlqKFLUqNArO+5NN93s/zYLRl4sbPK5QXaxYOwjYe8HsmYtTJIO2+kOxeiyO1sS7C2HsEqDbw7IUiIAd0RrNzAsCOkht4iUo3h4/jCcF2Uc0JJiX15Um1vntRtIOgY6UCf4V70fl+60ltH+mMgPGVE9cs61DOVHAjvBSeCvuCCdhZtIPhB0BMMBaeScyN4J3gtqAUjyRny2Xj16aFyfISId9jt5AW0Ge3LjfT7J3yL/8vxdGBg3tQPWV7Q9TdrNquivppV9SYrgd40xwH8BBkmoHT99vK5+MuHm++98hK52L3xBzmG+hoFaG8Rts0yW+ZVCfTPBZnXv/IXV08XH3xr6vVTtiogHTwD",
    },
  ],
};
