/** The Hinge solver. */

function symmetry_hinge(color = "black") {
  /**
   * Generate the symmetry rule of hinge.
   */
  let rule = `symmetry(R, C, R0, C0, "H") :- grid(R, C), ${color}(R, C), ${color}(R - 1, C), edge_top(R, C), symmetry_axis(R, C, R0, C0, "H").\n`;
  rule += `symmetry(R, C, R0, C0, "V") :- grid(R, C), ${color}(R, C), ${color}(R, C - 1), edge_left(R, C), symmetry_axis(R, C, R0, C0, "V").\n`;
  rule += `symmetry(R, C, R0, C0, D) :- grid(R, C), ${color}(R, C), adj_4(R, C, R1, C1), symmetry(R1, C1, R0, C0, D).\n`;

  rule += `:- grid(R, C), ${color}(R, C), symmetry(R, C, R0, C0, D0), symmetry(R, C, R1, C1, D1), (R0, C0, D0) != (R1, C1, D1).\n`;
  rule += `:- grid(R, C), ${color}(R, C), not symmetry(R, C, _, _, _).\n`;

  rule += ':- symmetry(R, C, R0, C0, "H"), not symmetry(R0 * 2 - 1 - R, C, R0, C0, "H").\n';
  rule += ':- symmetry(R, C, R0, C0, "V"), not symmetry(R, C0 * 2 - 1 - C, R0, C0, "V").\n';
  return rule.trim();
}

modules["hinge"] = {
  name: "Hinge",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent());
    solver.add_program_line(symmetry_hinge("gray"));

    // horizontal symmetry axis check
    for (let r = 1; r < puzzle.row; r++) {
      let c = 0;
      while (c < puzzle.col) {
        if (puzzle.edge.has(new BasePoint(r, c, BaseDir.TOP).toString())) {
          let c0 = c;
          while (c < puzzle.col && puzzle.edge.has(new BasePoint(r, c, BaseDir.TOP).toString())) {
            solver.add_program_line(`edge_top(${r}, ${c}).`);
            solver.add_program_line(`symmetry_axis(${r}, ${c}, ${r}, ${c0}, "H").`);
            c++;
          }
        }
        c++;
      }
    }

    // vertical symmetry axis check
    for (let c = 1; c < puzzle.col; c++) {
      let r = 0;
      while (r < puzzle.row) {
        if (puzzle.edge.has(new BasePoint(r, c, BaseDir.LEFT).toString())) {
          let r0 = r;
          while (r < puzzle.row && puzzle.edge.has(new BasePoint(r, c, BaseDir.LEFT).toString())) {
            solver.add_program_line(`edge_left(${r}, ${c}).`);
            solver.add_program_line(`symmetry_axis(${r}, ${c}, ${r0}, ${c}, "V").`);
            r++;
          }
        }
        r++;
      }
    }

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge, puzzle.text);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      const rc = areas.get(ar);
      if (rc !== null && rc !== undefined) {
        const num = puzzle.text.get(new BasePoint(...rc, BaseDir.CENTER, "normal").toString());
        if (Number.isInteger(num)) {
          solver.add_program_line(count(num, "gray", "area", i));
        }
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
      data: "m=edit&p=7VZdT+NGFH3Pr0B+nof5tGf8smIp7Asbtg0rhKwoCsGUqIlCE7KqHOW/c+71NUYpK7qqSqWqSjxzfDK+c+65MxNvft9O17Uyhr4uKq2AlA85X8ZYvrR8LuePi7o8Usfbx/vVGkCpi7MzdTddbOpBJaPGg12TyuZYNZ/KKjOZyiwuk41V83O5az6XzUg1I/yUqQjuvB1kAU97eMW/EzppSaOBh4IBrwFn8/VsUU/OW+ZLWTWXKqN5PvLTBLPl6ludiQ66n62WN3MibqaPSGZzP3+QXzbb29VvWxlrxnvVHH9fruvlEmzlEnpFLmXxD8tN4/0etv8CwZOyIu1fexh7OCp3aIflLnOWHvXQ0tYmc5EIlKojvDkgcn7kJeF5et0zURMTXxA5ER96IjGR94TRxYES4w5nNuFQrSkOxZgiEPMsBnkazvaa2zNuLbeXMEM1jtufuNXcBm7PecwpPLKFUZYmsljDhQV2gh0wkmfsgTE14wCMBBnnwEiNcQEMfxlH4CQ4KUuWEQ5a2Vzi5IjT8RF8Ej4F5WA3YfTK2ZZHr5wX3oMPwgfwhfAF+NjphP4oemJUTrd5oUf8lkevnBPegffCe/C58Dl4yQu9ckn45JTXL3jJFz00iB7k5SIKzZjOntZn9MASJyJ+bH1G/6wfPXDrM3pg8Rn+WFpgjOF/ann2hJYzY8zlpaYedaFVzZ5TfSWOR02D1CigRlJrZzCXkZim6L3KEVPioO/9obxED3rlTZcvckniSUrgZS1F+KNlLo0xRsYY8E54B94L78HTJuR5wcv6QQ8s8+bQnIvmHJrzTjPVUeIEelawQ8wgMS14J7wGb0VnAq/FH9Qa94LhoawBm7B3knibaA23uVOOuJeY0GkFW9TIiX4HPgiPfeGC+BbgJx0FjOFz6NYncumwxZqhs4zjg7fd2kbu3ZrU8ISOnU6DJq+w6a94659w67nN+Ugo6PT8i+crn6yRRLUxcdj+/aPoTW2Vwz/1K5/w32XHgyobbdd301mNv8TT21/ro+FqvZwucDfcLm/qdXePN5L9IPsj46ty9ILz/0vKv/SSQiXQP/Sq8g675w05FdzF/mouVPawnUwnsxXWGLxj3v2Jf3f12P7jwRM=",
    },
    {
      url: "https://puzz.link/p?hinge/14/12/k1ag51905514k4kgii2i8qa29800a010000rtg060s007o0007o30e0o0cfjg00-2bh26262626g2h",
      test: false,
    },
  ],
};
