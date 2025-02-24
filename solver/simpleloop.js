/** The Simple Loop solver. */

modules["simpleloop"] = {
  name: "Simple Loop",
  category: "loop",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(defined("black"));
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(direction("lurd"));
    solver.add_program_line("simpleloop(R, C) :- grid(R, C), not black(R, C).");
    solver.add_program_line(fill_path("simpleloop"));
    solver.add_program_line(adjacent("loop"));
    solver.add_program_line(grid_color_connected("simpleloop", "loop"));
    solver.add_program_line(single_loop("simpleloop"));

    for (const [point, color] of puzzle.surface.entries()) {
      const [r, c, _, __] = extract_point(point);
      fail_false(BaseColor.DARK.includes(color), `Invalid color at (${r}, ${c}).`);
      solver.add_program_line(`black(${r}, ${c}).`);
    }

    for (const [point, draw] of puzzle.line.entries()) {
      const [r, c, _, d] = extract_point(point);
      solver.add_program_line(`:-${draw ? " not" : ""} grid_direction(${r}, ${c}, "${d}").`);
    }

    solver.add_program_line(display("grid_direction", 3));
    await solver.solve();

    return solver.solutions;
  },
  examples: [
    {
      data: "m=edit&p=7VZNb9pMEL7zK9Ce57Cf/rrRNPRCSd9CFUWWhRzqKFZNTQFXkRH/PbMzG3EoUSPlFZcis888OzPrnZ2VZ9j+6spNBVr6n0lAgsInThMaiVM0ZHjm9a6psiGMut1ju0ECcDMew0PZbKtBHryKwb5Ps34E/acsF1oADSUK6P/L9v3nrJ9BP0OTAIu6CTIlQCO9PtJbsnt2xUolkU8DR3qHdFlvlk21mLDmS5b3cxB+nw+02lOxan9XgpfRfNmu7muvuC93eJjtY70Olm33vf3RBV9VHKAfcbiTE+GaY7iecrienQjXn+Ld4Tb1z+rpVKRpcThgxr9irIss92F/O9LkSGfZXjgrMgvCJSQiTSJVJJSULJVjqdmsdJjblGUU5rFhmQR9GvQpz7Xk92rJfjq8T0e8jwl2I2OWhtcZF/QuYpm8SPazYZ01vJ91/F4b8T42Cn5x8It5vU348Dbl0zsZpGY/F+JzdF5M2DTbIyrCO8IxoSacY1ahN4QfCSWhI5yQzzXhLeEVoSWMyCf29/LGm3t/OHhPMR4MP2qBw9+RQZaC0pg2pCiRY4qQxxZ8kswbj5A7rhp/f9zF7+L37/kVg1zMus1Duaywgk+wkg+n7WZVNgJ75WEgngSNHL9A7DGX9nn29umzL89Wiv+fzpBjYkMph/4GxLpblItl2wj8BwZs5Or+ivWl4L9i5h5w2uhbyR+Ws6cHG4/Y1qt1Uw2btl2LYvAM",
    },
    { url: "https://puzz.link/p?simpleloop/15/15/124000400000a0004g0002008h12000482008400004i1", test: false },
  ],
};
