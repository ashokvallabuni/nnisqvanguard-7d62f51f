const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('c:\\Users\\ashok\\nnisqvanguard-7d62f51f-1\\src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Backgrounds
    content = content.replace(/#F0F4F9/gi, '#112240');
    content = content.replace(/#070A0F/gi, '#112240');
    content = content.replace(/bg-white/g, 'bg-[#0A192F]');
    
    // Texts
    content = content.replace(/#0A192F/gi, '#F0F4F9');
    
    // Secondary Text
    content = content.replace(/#64748B/gi, '#94A3B8');
    
    // Borders
    content = content.replace(/#CBD5E1/gi, '#1E2D4A');
    
    // Adjust colors that might be white text that were changed?
    // Wait, the previous script changed text-white to text-[#0A192F]. 
    // Now text-[#0A192F] is being changed to text-[#F0F4F9], which is effectively off-white text! This is correct.
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed ' + filePath);
    }
  }
});
