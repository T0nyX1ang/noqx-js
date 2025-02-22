/** The Nondango solver. */

function avoid_diagonal_3(color = "black") {
  /**
   * Generate a constraint to avoid diagonal in a row of three.
   */
  const rule = [
    `:- ${color}(R, C), ${color}(R + 1, C + 1), ${color}(R + 2, C + 2).`,
    `:- ${color}(R, C), ${color}(R + 1, C - 1), ${color}(R + 2, C - 2).`,
  ].join("\n");
  return rule;
}

modules["nondango"] = {
  name: "Nondango",
  category: "var",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("drawable"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line("{ circle_M__1(R, C) } :- drawable(R, C).");
    solver.add_program_line("circle_M__2(R, C) :- drawable(R, C), not circle_M__1(R, C).");
    solver.add_program_line(avoid_rect(1, 3, "circle_M__1"));
    solver.add_program_line(avoid_rect(1, 3, "circle_M__2"));
    solver.add_program_line(avoid_rect(3, 1, "circle_M__1"));
    solver.add_program_line(avoid_rect(3, 1, "circle_M__2"));
    solver.add_program_line(avoid_diagonal_3("circle_M__1"));
    solver.add_program_line(avoid_diagonal_3("circle_M__2"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
      solver.add_program_line(count(1, "circle_M__2", "area", i));
    }

    for (const [point, symbol_name] of puzzle.symbol.entries()) {
      const [r, c, d, _] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(symbol_name, ["circle_M__1", "circle_M__2", "circle_M__4"]);

      if (symbol_name === "circle_M__4") {
        solver.add_program_line(`drawable(${r}, ${c}).`);
      }

      if (symbol_name === "circle_M__1") {
        fail_false(
          puzzle.symbol.has(new BasePoint(r, c, BaseDir.CENTER, "nondango_mark").toString()),
          `Invalid symbol at (${r}, ${c}).`
        );
        solver.add_program_line(`:- circle_M__2(${r}, ${c}).`);
      }

      if (symbol_name === "circle_M__2") {
        fail_false(
          puzzle.symbol.has(new BasePoint(r, c, BaseDir.CENTER, "nondango_mark").toString()),
          `Invalid symbol at (${r}, ${c}).`
        );
        solver.add_program_line(`:- circle_M__1(${r}, ${c}).`);
      }
    }

    solver.add_program_line(display("circle_M__1"));
    solver.add_program_line(display("circle_M__2"));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZNT9tAEL3nV6A978Gza8de3yiFXvhoCxVCVhSF4BbUoNBA2spR/jtvZreKUQchtSWnyvLsy2Q8++bt7Nr335aTRWsrXL6ymSVcPndyuyzInaXr7OZh1tY7dnf5cD1fAFh7cnBgP09m9+2gSVGjwaoLdbdru3d1Y8hY43CTGdnuQ73qjuruwnan+MtYgu8wBjnA/Q08l/8Z7UUnZcDHCQNeAE5vFtNZOz6Knvd1051Zw/O8kacZmtv599YkHvx7Or+9vGHH5ezHdfLdL6/mX5cpikZr2+0+T9RviDKMRBkpRJn/qxENo/UaUn8E1XHdMOtPG1ht4Gm9gj0WS2Iv6pVxQ6TJMU2fmnGV5vWZ6vWqN2jenFRvrnoLzVuoHAqnevUMasVFqXmHqg5DtbZSraJUOZTqbKU6W6nOVqk6VGptlTpbpc4W1LxBXbegqh7Ufgj6bGptlKnTUaZmpkwVnkithEglTaTnpmdyqzoTKUJjnx3IbnNiz7AZbefFvhWbiS3EHkrMPvYlVTiAK3B1yFs5YBAU7IHBSnAOjAYTXACDluAhMLgILoEhvuAKGJIDu6zAkR7jMQLHeIzAMR4jH/sJ4xXAkjKmDBhrJJiAI0+MwJGnc4jnA4OxR7xP8R7xPsV7xPPxIdgDx7owAse6MAInnh48faqrCJbKmBPjU31C0iRwjb26KNVCzK3HJ08ccnDgQ4OfHSJnmXKWrHlP55A4BNaqp49LOR3X2KuLjzLJDz580Eh+5OTDQfLz2vXWi7eF5GfNezq7X9qyVj198lRjDj4FP4smOpdW2hObix1Ki5X8NvjL9wXmUk57+heN/yLzxqG5n1wQb5u/R4PG7F99aXeO54vbyQyv5NPryV1r8L2zHpifRu4Gq2vz/59AW/wEYtmzP27sV+rWF+g00BX93J1Yc7ccT8bTOfoJqrHfh9/8W2eP7TYaPAI=",
    },
  ],
};
