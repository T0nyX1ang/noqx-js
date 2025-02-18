/** The Aquarium solver. */

function area_gravity(color = "black") {
  /**
   * Generates a constraint to fill the colored areas according to gravity.
   */
  const target = `:- area(A, R, C), area(A, R1, C1), R1 >= R, ${color}(R, C), not ${color}(R1, C1).`;
  return target.replace("not not ", "");
}

modules["aquarium"] = {
  name: "Aquarium",
  category: "shade",
  solve: async function solve(puzzle) {
    solver.reset();
    solver.register_puzzle(puzzle);
    solver.add_program_line(grid(puzzle.row, puzzle.col));
    solver.add_program_line(shade_c("gray"));
    solver.add_program_line(area_gravity("gray"));

    const areas = full_bfs(puzzle.row, puzzle.col, puzzle.edge);
    for (const [i, ar] of Array.from(areas.keys()).entries()) {
      solver.add_program_line(area(i, ar));
    }

    for (const [point, num] of puzzle.text.entries()) {
      const [r, c, d, pos] = extract_point(point);
      validate_direction(r, c, d);
      validate_type(pos, "normal");

      if (r === -1 && 0 <= c && c < puzzle.col && Number.isInteger(num)) {
        solver.add_program_line(count(num, "gray", "col", c));
      }

      if (c === -1 && 0 <= r && r < puzzle.row && Number.isInteger(num)) {
        solver.add_program_line(count(num, "gray", "row", r));
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
      data: "m=edit&p=7VZNb+M2EL37Vyx05kH8FKlLkW6TXlJv26QIFoIROF5tN2gCb524KBTkv++b4dBijALbougWBQrb5NPzm9HMcEjp4df9ejcqrelro2oVkHI+8E9rw79WPpe3j3dj/0qd7B8/bHcASr05O1Pv13cP42LQbN2uFk9T6qcTNX3bD41uVGPw081KTT/0T9N3/bRU0wX+apQGd55FBvB0hlf8P6HXmdQt8FIw4FvAze1uczden2fm+36YLlVD9/marQk299vfxkbioOvN9v7mloib9SOSefhw+1H+edi/2/6yF61ePavpJId7WsKNc7h2DpdgDpfQH4RLWfzD4abV8zPK/iMCvu4Hiv2nGcYZXvRPGJf9U2MtmTrEktemsY6IryrCHyvCMdERYSsiEuErIh0RriUiVYQ+Vhgiuorgu1SBBVZUcXSsQJcVIrGicqrbY4k2x150Tqe28qyJFRNYU0WnI2sOGaG8mov8lsczHg2Pl1gDNVkev+Gx5dHzeM6aUyyNiZ0yEaU02DoxAqOKhDv3EndYIcKhnXFMyiQUmXBqlW0zjxkYC8g8tnrBXYAea8DYw4/wwQAjWeYRD5WUbQ1sM48ZWOJMdsYdYk7or2LbFQ18HnhoOsklUC4lL4ofrch68KnkhRwLDogzlhyBk8Qc9YwD8oqSV6IcJRforc62mIGzBjNwydEhlxwPZmVNjgczsNTTwI/J92Lbgk1QlnqasANP7VxsaTcQtvBJG4E1iOGgB/bi38O/F584ia2Xmnv4CeInwE+U2CL4KLYRtlFsI2xjZVv77ySGDvcttnSvTuLp6JEw+3Ft5jErpwvvwWc/mMGXGHCvJHGm+AI7nXvA4clSsE3opZT7xEb0mKwX4yiaiB4r+WJNDxpaU1l3iz7B9YylBzADy1pA70oP0FoXPfWw9J6lPpdetdgLNhQMTRAN+tZK31r08wtcbDXy0pJXC1vBtK9xLf0A/3QeM4bGid5B40rP4F41ptOZ+wo5FqypVyWvFhpdepj6udIbqUmLGhZsUB864Nk/9ZvwnnqywkH8YA/aIHrstUOdCdMhyRi5B8nFU90q7KWGHrn7kjv0dORyPFST6pyh45oxamJEb+Cn7E28u8z7C5h94kC94mP1NY+Ox8DHbUcPxD/5yGxkQagHYn5+/v1j/rOxDVh+ehl7+cFL2X+NWy2G5mK/e7/ejHh3OX338/hqud3dr+9wtdzf34y7co1Xx+dF83vDv8HSm+j/b5P/0tskLUH7l94pv8Ce+Ew4w3ShcEBPb1TzcX+9vt5s0WOoHfHYTcf8F48em3q1+AQ=",
    },
  ],
};
