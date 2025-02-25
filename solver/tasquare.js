/** The Tasquare solver. */

modules["tasquare"] = {
  name: "Tasquare",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("black"));
    solver.add_program_line(adjacent(4));
    solver.add_program_line(grid_color_connected("not black", 4, [puzzle.row, puzzle.col]));
    solver.add_program_line(all_rect("black", true));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      solver.add_program_line(`not black(${r}, ${c}).`);
      if (Number.isInteger(num)) {
        solver.add_program_line(grid_src_color_connected([r, c], null, null, "black"));
        solver.add_program_line(count_reachable_src(num + 1, [r, c], "grid", "black"));
      } else {
        solver.add_program_line(count_adjacent(["gt", 0], [r, c], "black"));
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

    solver.add_program_line(display());
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VVBj9o8EL3zK5DPc4gTJ4Tc6H5LL5RtG6oViiIUaFaggsIHpKqM+O87M07XdGParqrlUFXg0cyzPX5+Hsf7/+tiV4KU9A9i8AA9UGHETUqfm9f8JqvDuky6MKgPy2qHDsDdcAgPxXpfdrJmVN456n6iB6DfJpmQAoSPTYoc9IfkqN8legw6xS4BCrGRGeSje2vde+4n78aA0kN/3PjoTtE15Gcjg7xPMj0BQeu84dnkik31tRQND4oX1Wa+ImBeHHAz++Vq2/Ts68/Vl7oZK/MT6IGhmzroBpYuuYYueQ66tIs/p7veVi6i/fx0QsE/ItVZkhHrT9aNrZsmR7Tj5CiCmKZ2kYU5FaH8Z0BEQGjDCEMshibseRiqp7CvMAxsSNntXOlRLjta+hRjVT3FlNxOlwFlP4tDSm8XlyHlP+tnrmf54+ebkTGtYBFUQbIW0+9aIP7D0RhBWiiv1EYpewtljVooS9VGnRyMcG2Y9XPAThpGzTbMojpgNxP3xo3SDtjBBNUesuY+2wmWJOiA7X9sPbYh2xGPuWV7z/aGrWIb8ZgeFfVvlr1QuC2FJ4Wb9s0dOK+BV+KWBVTk7R9djb8UzTuZSOvdQ7Eo8Us1rjfzctcdV7tNscY4XRbbUuDjcOqIb4Ib32P17724+ntB4nsvejWucGN+QSfTUwhC0HcgtvWsmC0qrCpU7We46r8mnoKKL+A9Nx4EF3DfjUfqhfkv5HGse/XTxU+iOBSmpkXeeQQ=",
    },
    {
      url: "https://puzz.link/p?tasquare/21/15/g.k..k4k.x.h.i8j2q.u4i2l2jar.2l.h.zhak8i8h9j2.x1m.n2g.h.l.j2h3g1k2g4r.o1i3h.i.j.l1zj2g4i..g.i.h./",
      test: false,
    },
  ],
};
