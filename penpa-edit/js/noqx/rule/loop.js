/** Utility for loops. */

function single_loop(color = "white", path = false) {
  /**
   * Generate a single loop constraint with loop signs.
   */
  let constraint = "pass_by_loop(R, C) :- grid(R, C), #count { D: grid_direction(R, C, D) } = 2.\n";

  const visit_constraints = ["not pass_by_loop(R, C)"];
  if (path) {
    visit_constraints.push("not dead_end(R, C)");
    constraint += ":- dead_end(R, C), grid(R, C), #count { D: grid_direction(R, C, D) } != 1.\n";
  }

  constraint += `:- grid(R, C), ${color}(R, C), ${visit_constraints.join(", ")}.\n`;
  constraint += ':- grid(R, C), grid_direction(R, C, "l"), not grid_direction(R, C - 1, "r").\n';
  constraint += ':- grid(R, C), grid_direction(R, C, "u"), not grid_direction(R - 1, C, "d").\n';
  constraint += ':- grid(R, C), grid_direction(R, C, "r"), not grid_direction(R, C + 1, "l").\n';
  constraint += ':- grid(R, C), grid_direction(R, C, "d"), not grid_direction(R + 1, C, "u").';
  return constraint;
}


function intersect_loop(color = "white", path = false) {
  /**
   * Generate a loop (which can intersect itself) constraint with loop signs.
   */
  let rule = "pass_by_loop(R, C) :- grid(R, C), #count { D: grid_direction(R, C, D) } = 2.\n";
  rule += "intersection(R, C) :- grid(R, C), #count { D: grid_direction(R, C, D) } = 4.\n";
  rule += "pass_by_loop(R, C) :- intersection(R, C).\n";

  const visit_constraints = ["not pass_by_loop(R, C)"];
  if (path) {
    visit_constraints.push("not dead_end(R, C)");
    rule += ":- dead_end(R, C), grid(R, C), #count { D: grid_direction(R, C, D) } != 1.\n";
  }

  rule += `:- grid(R, C), ${color}(R, C), ${visit_constraints.join(", ")}.\n`;
  rule += ':- grid(R, C), grid_direction(R, C, "l"), not grid_direction(R, C - 1, "r").\n';
  rule += ':- grid(R, C), grid_direction(R, C, "u"), not grid_direction(R - 1, C, "d").\n';
  rule += ':- grid(R, C), grid_direction(R, C, "r"), not grid_direction(R, C + 1, "l").\n';
  rule += ':- grid(R, C), grid_direction(R, C, "d"), not grid_direction(R + 1, C, "u").';
  return rule;
}

function directed_loop(color = "white", path = false) {
  /**
   * Generate a directed loop constraint with loop signs.
   */
  let constraint = `pass_by_loop(R, C) :- grid(R, C), ${color}(R, C), #count { D: grid_in(R, C, D) } = 1, #count { D: grid_out(R, C, D) } = 1, grid_in(R, C, D0), not grid_out(R, C, D0).\n`;

  const visit_constraints = ["not pass_by_loop(R, C)"];
  if (path) {
    visit_constraints.push("not path_start(R, C)");
    visit_constraints.push("not path_end(R, C)");
    constraint += ":- path_start(R, C), grid(R, C), #count { D: grid_out(R, C, D) } != 1.\n";
    constraint += ":- path_start(R, C), grid(R, C), #count { D: grid_in(R, C, D) } != 0.\n";
    constraint += ":- path_end(R, C), grid(R, C), #count { D: grid_in(R, C, D) } != 1.\n";
    constraint += ":- path_end(R, C), grid(R, C), #count { D: grid_out(R, C, D) } != 0.\n";
  }

  constraint += `:- grid(R, C), ${color}(R, C), ${visit_constraints.join(", ")}.\n`;
  constraint += ':- grid(R, C), grid_in(R, C, "l"), not grid_out(R, C - 1, "r").\n';
  constraint += ':- grid(R, C), grid_in(R, C, "u"), not grid_out(R - 1, C, "d").\n';
  constraint += ':- grid(R, C), grid_in(R, C, "r"), not grid_out(R, C + 1, "l").\n';
  constraint += ':- grid(R, C), grid_in(R, C, "d"), not grid_out(R + 1, C, "u").\n';
  constraint += ':- grid(R, C), grid_out(R, C, "l"), not grid_in(R, C - 1, "r").\n';
  constraint += ':- grid(R, C), grid_out(R, C, "u"), not grid_in(R - 1, C, "d").\n';
  constraint += ':- grid(R, C), grid_out(R, C, "r"), not grid_in(R, C + 1, "l").\n';
  constraint += ':- grid(R, C), grid_out(R, C, "d"), not grid_in(R + 1, C, "u").\n';
  return constraint.trim();
}

function count_area_pass(target, _id) {
  /**
   * Generate a rule that counts the times that a loop passes through an area.
   */
  return `:- #count { R, C, D: area_border(${_id}, R, C, D), grid_direction(R, C, D) } != ${2 * target}.`;
}

function separate_item_from_loop(inside_item, outside_item) {
  /**
   * Generate a constraint to make outside_items outside of the loop, and make inside_items inside of loop.
   */
  let rule = "outside_loop(-1, C) :- grid(_, C).\n";
  rule += 'outside_loop(R, C) :- grid(R, C), outside_loop(R - 1, C), not grid_direction(R, C, "r").\n';
  rule += 'outside_loop(R, C) :- grid(R, C), not outside_loop(R - 1, C), grid_direction(R, C, "r").\n';

  let constraint = "";
  if (inside_item.length > 0) {
    constraint = `:- ${inside_item}(R, C), outside_loop(R, C).\n`;
  }

  if (outside_item.length > 0) {
    constraint += `:- ${outside_item}(R, C), not outside_loop(R, C).\n`;
  }

  return (rule + constraint).trim();
}

function loop_sign(color = "white") {
  /**
   * Generate a constraint to generate general loop signs.
   */ const pairs = ["lu", "ld", "ru", "rd", "lr", "ud"];
  return pairs
    .map((pair) => {
      const [d1, d2] = pair.split("");
      return `loop_sign(R, C, "${d1}${d2}") :- grid(R, C), ${color}(R, C), grid_direction(R, C, "${d1}"), grid_direction(R, C, "${d2}").`;
    })
    .join("\n")
    .trim();
}

function loop_segment(src_cell) {
  /**
   * Generate a rule for a loop segment.
   */
  const [r, c] = src_cell;

  const max_u = `#max { R0: grid(R0 + 1, ${c}), not loop_sign(R0, ${c}, "ud"), R0 < ${r} }`;
  const min_d = `#min { R0: grid(R0 - 1, ${c}), not loop_sign(R0, ${c}, "ud"), R0 > ${r} }`;
  const max_l = `#max { C0: grid(${r}, C0 + 1), not loop_sign(${r}, C0, "lr"), C0 < ${c} }`;
  const min_r = `#min { C0: grid(${r}, C0 - 1), not loop_sign(${r}, C0, "lr"), C0 > ${c} }`;

  let rule = `segment(${r}, ${c}, N1, N2, "T") :- loop_sign(${r}, ${c}, "lu"), N1 = ${max_u}, N2 = ${max_l}.\n`;
  rule += `segment(${r}, ${c}, N1, N2, "T") :- loop_sign(${r}, ${c}, "ld"), N1 = ${min_d}, N2 = ${max_l}.\n`;
  rule += `segment(${r}, ${c}, N1, N2, "T") :- loop_sign(${r}, ${c}, "ru"), N1 = ${max_u}, N2 = ${min_r}.\n`;
  rule += `segment(${r}, ${c}, N1, N2, "T") :- loop_sign(${r}, ${c}, "rd"), N1 = ${min_d}, N2 = ${min_r}.\n`;
  rule += `segment(${r}, ${c}, N1, N2, "V") :- loop_sign(${r}, ${c}, "ud"), N1 = ${max_u}, N2 = ${min_d}.\n`;
  rule += `segment(${r}, ${c}, N1, N2, "H") :- loop_sign(${r}, ${c}, "lr"), N1 = ${max_l}, N2 = ${min_r}.\n`;

  return rule.trim();
}

function loop_straight(color = "white") {
  /**
   * Generate a rule for straight passing through a cell.
   */
  const pairs = ["lr", "ud"];
  return pairs
    .map((pair) => {
      const [d1, d2] = pair.split("");
      return `straight(R, C) :- grid(R, C), ${color}(R, C), grid_direction(R, C, "${d1}"), grid_direction(R, C, "${d2}").`;
    })
    .join("\n")
    .trim();
}

function loop_turning(color = "white") {
  /**
   * Generate a rule for turning through a cell.
   */
  const pairs = ["lu", "ld", "ru", "rd"];
  return pairs
    .map((pair) => {
      const [d1, d2] = pair.split("");
      return `turning(R, C) :- grid(R, C), ${color}(R, C), grid_direction(R, C, "${d1}"), grid_direction(R, C, "${d2}").`;
    })
    .join("\n")
    .trim();
}
