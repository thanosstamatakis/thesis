const fs = require("fs");

const friends = JSON.parse(fs.readFileSync("manual_eval.json"));

fs.writeFileSync(
  "eval_preproc.json",
  JSON.stringify(
    friends
      // .filter((f) => !f.hasOwnProperty("tie_strength"))
      .map((f) => {
        if (f.full_name === "Αγγελική Λιακοπούλου") {
          return { ...f, tie_strength: 20 };
        } else if (!f.hasOwnProperty("tie_strength")) {
          return { ...f, tie_strength: 0 };
        } else {
          return f;
        }
      })
      .map((f) => {
        return { full_name: f.full_name, tie_strength: f.tie_strength };
      })
  )
);
