/** The Fill-a-pix solver. */

modules["fillpix"] = {
  name: "Fill-a-pix",
  category: "shade",
  aliases: ["fillapix", "mosiak"],
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(adjacent(8, true));

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");
      if (Number.isInteger(num)) {
        solver.add_program_line(count_adjacent(num, [r, c], "gray", 8));
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
      data: "m=edit&p=7VdPbxo/EL3zKSKffdix9/+lStOkl5T0V1JF0QohQjcKKogUQlUt4rtn/Ex/O+tNpfbQpIcIdjQ8z3jejGdts/m2na5rTYn72lxHmviTRjkeyvk3Pz8/l/OHRV0e6ePtw91qzYrWF2dn+na62NSD6mA1HuyaomyOdfO+rBQprQw/pMa6+a/cNR/KZqibEQ8pnTN27o0Mq6eteoVxp514kCLWhwed1WtWZ/P1bFFPzj3ysayaS61cnLfwdqparr7X6sDD/Z6tljdzB9xMHziZzd38/jCy2X5Zfd0ebGm8182xpzt6gq5t6TrV03XaE3RdFn+ZbjHe77nsn5jwpKwc98+tmrfqqNyxHJY7FUfOlVeG/Nqo2DjACiAOgTQEcgfEAigckLRAgigSoMAlQZSoBVK4vBFASCyFi5gjBTEBZCDmluEA5GG2OXhIC0SRFjYEwnrkSWgBHhLIAqAAD8G0AA8xaYESCoCi0IQiUOsgoCKqSBRGIhPWkQzoidUhg8JlArGYWdrYno3vpVQiqJVInBLURs6T9OZJwvYh3wwdpFcNv/odG+Qlc0/DhqAMNZReGeaRfHwbScT3gESKPoLouUQwT9Eixq9pB8E8HQSVF1U1BC/B2RCyENENwUtENwQ+HRvUWcYymEd6mTAvY8OOMhY2kqHvjQ6CWBKJe5x9t8i8/DYhvfw+0bHp1SdFLJlFBs4yll/3DhJ2uMnC98L4TujM3IvldxBZn7znlcNLRi8QXXr1+sf4PUHwsb5/xPtl/fsu3gtL4PO/F+/7hN3/GvIM0kBe8uGgGwv5DjKCTCDPYXMKeQV5AhlDprDJ3PHymwcQjp6cDwvOwfjT6Bm4VbG/2vzqwxeg19F/e3Q8qNRou76dzmq+Aw23y5t6fTRcrZfTheJL536gfig8lWXz+PUe+kL3ULcE0R/dRl9+b6q4urxDNBda3W8n08lstVD8V0YDpx7+7Ox5AxsPHgE=",
    },
  ],
};
