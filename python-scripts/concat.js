const fs = require("fs");

const preproc = JSON.parse(fs.readFileSync("eval_preproc.json"));
const tie_data = JSON.parse(fs.readFileSync("tie_data.json"));
console.log("Tie Data");
console.log(tie_data.slice(0, 1));
console.log("Preproc");
console.log(preproc.slice(0, 1));

tie_data.forEach((tie, idx) => {
  const ts = preproc.find((person) => person.full_name === tie.user);
  if (ts) tie_data[idx].tie_strength = ts.tie_strength;
  else tie_data[idx].tie_strength = 0;
});

fs.writeFileSync("tie_data_concat.json", JSON.stringify(tie_data));
