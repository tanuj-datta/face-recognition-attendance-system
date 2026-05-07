const fs = require('fs');
const path = require('path');

const projectDir = __dirname;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.prisma') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

const allFiles = walk(projectDir);

for (const file of allFiles) {
  if (file === __filename) continue; 
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Specific replacements first
  content = content.replace(/Faculty Console/g, 'Admin Console');
  content = content.replace(/Faculty Login/g, 'Admin Console Login');
  content = content.replace(/Faculty Dashboard/g, 'Admin Dashboard');
  content = content.replace(/\/faculty\//g, '/admin/');
  content = content.replace(/\/faculty'/g, "/admin'");
  content = content.replace(/\/faculty"/g, '/admin"');
  content = content.replace(/\/faculty`/g, '/admin`');
  
  // Generic replacements
  content = content.replace(/\bfaculty\b/g, 'admin');
  content = content.replace(/\bFaculty\b/g, 'Admin');
  content = content.replace(/\bFACULTY\b/g, 'ADMIN');

  // Fix up possible bad overlaps
  content = content.replace(/Admin Console Console/g, 'Admin Console');
  content = content.replace(/Admin Console Login Login/g, 'Admin Console Login');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}

const facultyDir = path.join(projectDir, 'app', 'faculty');
const adminDir = path.join(projectDir, 'app', 'admin');
if (fs.existsSync(facultyDir)) {
  fs.renameSync(facultyDir, adminDir);
  console.log(`Renamed directory app/faculty to app/admin`);
} else {
  console.log(`Directory app/faculty does not exist`);
}
