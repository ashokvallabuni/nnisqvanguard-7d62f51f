const fs = require('fs');
const filePath = 'src/routes/_authenticated/learn.$slug.$moduleSlug.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
lines.slice(425, 450).forEach((l, i) => console.log(i + 426, JSON.stringify(l)));
