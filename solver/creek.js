/** The Creek solver. */

function creek_covering(target, r, c, color = "black") {
  /**
   * Generate a constraint to check the color covering of cells.
   */
  // prettier-ignore
  return `:- { ${color}(${r - 1}, ${c - 1}); ${color}(${r - 1}, ${c}); ${color}(${r}, ${c - 1}); ${color}(${r}, ${c}) } != ${target}.`;
}

modules["creek"] = {
  name: "Creek",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent());
    solver.add_program_line(grid_color_connected("not gray"));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d, BaseDir.TOP_LEFT);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(creek_covering(num, r, c, "gray"));
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
      data: "m=edit&p=7VXPj9o8EL3zVyCfWmkOSez8vFR0u+2FZr+vUK1WUYQCawpqULaBVFsj/vcdT6KNiffQHkpVqTIePZ6fx4+xjfffmqKW4Hr6wyNwwMUmYkGdhz51p2vz7aGUyRgmzWFT1QgAblJYF+VejjI9EVs+Oqo4URNQH5KMuQyYRz0H9X9yVB8TlYKa4RCDCLlpK/IQXvfwlsY1umpJ10GctjhAeIdwta1XpVxMcRSZ/5JMzYHpdd7SbA3ZrvouWedDf19Vu+VWE8vigL9lv9k+dCP75r762nRaNz+BmrR2Zy/Y5b1dDVu7Gv0uu/L+i3x8yWmcn05Y8U/odZFk2vbnHkY9nCVHjGlyZNwJ9dw36AwwAybkTqwZ3KdnxnU1w03GH2o8PtR4lMdkhNP57BnKbOYRnqURVh7ybM7yLT8+acw8fjRkAvJjZg5odTNPaDkMbY21VmjVMKLVzbUiSxOTnzPGqnxMdTY0wiHGWF04VDFT4w0rL6z9Ep49i6p6phlWXnBLwy2Nte+i3eVnDR5Gl47kHcX3FD2KczyxoDjFdxQdij7FKWmuKd5SvKIoKAakCfWZ/8lbwXwsuAcswN8QtVfkAt4yv/u7PGvh38flo4zNmnpdrCT+PaXNbinrcVrVu6Jk+BScRuyRUc+4flj+vQ6Xfx109Z1feiP+/OXMsLBBCOoG2EOzKBarqmSAZdM8Xp0hf3H3eIPZelvLdflj/GpTHYq6GS9lsXvN8tET",
    },
    { url: "https://puzz.link/p?creek/10/10/qbdccdbdbibiceeeddcblbbcdcdddboabbb", test: false },
  ],
};
