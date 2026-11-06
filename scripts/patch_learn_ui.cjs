const fs = require("fs");

let content = fs.readFileSync("src/routes/_authenticated/learn.$slug.$moduleSlug.tsx", "utf8");

const oldSnippet = ` if (result.is_correct) {
 toast.success("Correct answer! +10 XP");`;

const newSnippet = ` if (result.is_correct) {
 toast.success("Correct answer! +10 XP");
 if ((result as any).certificateNumber) {
 toast.success(\`🎓 Course Complete! Certificate issued: \${(result as any).certificateNumber}\`, {
 duration: 8000,
 });
 queryClient.invalidateQueries({ queryKey: ["my-certificates"] });
 }`;

const normContent = content.replace(/\r\n/g, "\n");
const normOld = oldSnippet.replace(/\r\n/g, "\n");

if (normContent.includes(normOld)) {
  const updated = normContent.replace(normOld, newSnippet);
  fs.writeFileSync("src/routes/_authenticated/learn.$slug.$moduleSlug.tsx", updated, "utf8");
  console.log("Successfully patched learn.$slug.$moduleSlug.tsx with certificate toast!");
} else {
  console.error("Could not find matching oldSnippet in learn.$slug.$moduleSlug.tsx!");
  process.exit(1);
}

