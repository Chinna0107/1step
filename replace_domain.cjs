const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (['.html', '.jsx', '.js', '.cjs', '.css', '.xml', '.txt'].includes(path.extname(file))) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk(__dirname);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  content = content.replace(/onestepfinancecare\.com/gi, '1stepfinancecare.com');
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated: ', file);
  }
});
console.log('Done replacing domain.');
