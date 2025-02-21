/** The Mochinyoro solver. */

modules["mochinyoro"] = {
  name: "Mochinyoro",
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
    solver.add_program_line(no_rect("black"));

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
      data: "m=edit&p=7VVRj5pAEH73V1zmeR5YFhB5aez17Iv12mpzuRBikHKRFItFaa5r/O83M9AA3jWpaWKTptH98s3szO7HjIy7b1VcpqgUf7WPFhJDx/VkKWXLsprPItvnaXCF42q/LkoiiLeTCT7E+S4dhE1UNDiYUWDGaN4GIShAsGkpiNB8CA7mXWBmaOa0BajIN62DbKI3Lb2TfWbXtVNZxGcNJ3pPNMnKJE+X09rzPgjNAoHveS3ZTGFTfE+h0cF2UmxWGTtW8Z4eZrfOts3OrvpcfKmaWBUd0YxrufOfcllOI1e3cpnWcpm9IJfT/lxuvi1eEjqKjkcq+EeSugxCVv2ppX5L58GBcBYcQHuc+opU1F0BxyYHt70xh2RS3xvT1SfhnnPiGFq9fF/18v3+cSO+rGP6vVxljXrbSrl922bxnXjdP07p/m3KYfUd22XxHdtj7d2HUUOW3/ecnOnznU7H5mdoM6jMSop9LzgRtAUX1As0WvCNoCXoCk4l5kbwTvBa0BH0JGbI3fzNfgMXx0bQVAOnbv4FtIWaS/X84/673mgQwrwqH+IkpVd0Vm1WaXk1K8pNnANNw+MAHkFWqHm4/h+QFx+QXHzrrDH599/ikOpK75K5RdhWy3iZFDnQvyuKX//Cf278uf7n51+8ajRi6FeQrLOvP4qygGjwBA==",
    },
    {
      url: "https://puzz.link/p?mochinyoro/17/17/hdzmenajfzh71zw4zu6i5zu3zw-108zh2jcn9zmbh",
      test: false,
    },
  ],
};
