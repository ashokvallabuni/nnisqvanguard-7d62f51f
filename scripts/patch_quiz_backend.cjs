const fs = require('fs');
let code = fs.readFileSync('src/lib/quiz.functions.ts', 'utf8');

code = code.replace(
  /await supabase\.from\(['"]quiz_attempts['"]\)\.insert\(\{([\s\S]*?)\}\);/,
  (m, inner) => {
    const cleaned = inner.replace(/\s*status,/, '');
    return `await supabase.from("quiz_attempts").insert({${cleaned}});`;
  }
);

fs.writeFileSync('src/lib/quiz.functions.ts', code, 'utf8');
console.log('Removed status from insert');
