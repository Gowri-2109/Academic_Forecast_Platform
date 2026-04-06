const fs = require('fs');
const path = require('path');

const files = [
    'c:\\Academic Forecast Platform\\frontend\\src\\pages\\faculty\\IssuesTracker.jsx',
    'c:\\Academic Forecast Platform\\frontend\\src\\pages\\faculty\\Queries.jsx'
];

const patterns = [
    { from: /background:\s*'white'/g, to: "background: 'var(--card-bg)'" },
    { from: /backgroundColor:\s*'white'/g, to: "backgroundColor: 'var(--card-bg)'" },
    { from: /background:\s*'#f8f9fa'/g, to: "background: 'var(--table-header-bg, var(--input-bg))'" },
    { from: /background:\s*'#fffbf0'/g, to: "background: 'rgba(254, 243, 199, 0.1)'" }, // Pending query bg
    { from: /color:\s*'#333'/g, to: "color: 'var(--text-main)'" },
    { from: /color:\s*'#555'/g, to: "color: 'var(--text-muted)'" },
    { from: /color:\s*'#666'/g, to: "color: 'var(--text-muted)'" },
    { from: /color:\s*'#888'/g, to: "color: 'var(--text-muted)'" },
    { from: /color:\s*'#ccc'/g, to: "color: 'var(--text-muted)'" },
    { from: /borderBottom:\s*'1px solid #eee'/g, to: "borderBottom: '1px solid var(--border-color)'" },
    { from: /borderBottom:\s*'2px solid #eee'/g, to: "borderBottom: '2px solid var(--border-color)'" },
    { from: /border:\s*'1px solid #eee'/g, to: "border: '1px solid var(--border-color)'" },
    { from: /border:\s*'1px solid #ccc'/g, to: "border: '1px solid var(--border-color)'" },
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        for (const p of patterns) {
            content = content.replace(p.from, p.to);
        }
        fs.writeFileSync(file, content);
        console.log(`Updated ${path.basename(file)}`);
    } else {
        console.log(`${file} not found`);
    }
}
