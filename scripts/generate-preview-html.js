const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname, '..', 'README.md');
let markdown = fs.readFileSync(readmePath, 'utf8');

// Basic markdown-to-html helper for the non-HTML parts of README
function parseMarkdownToHtml(md) {
  let html = md;

  // Convert markdown tables to HTML tables
  // Replace ### header titles
  html = html.replace(/####\s+(.*)/g, '<h4>$1</h4>');
  html = html.replace(/###\s+(.*)/g, '<h3>$1</h3>');
  html = html.replace(/##\s+(.*)/g, '<h2>$1</h2>');
  html = html.replace(/#\s+(.*)/g, '<h1>$1</h1>');

  // Convert bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert code blocks
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Replace markdown tables: | col1 | col2 |
  const lines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  const newLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (line.includes('---')) {
        // Separator line, ignore
        continue;
      }
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (!inTable) {
        inTable = true;
        tableHtml = '<table width="100%"><thead><tr>' + cells.map(c => `<th align="left">${c}</th>`).join('') + '</tr></thead><tbody>';
      } else {
        tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
      }
    } else {
      if (inTable) {
        tableHtml += '</tbody></table>';
        newLines.push(tableHtml);
        inTable = false;
        tableHtml = '';
      }
      newLines.push(lines[i]);
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table>';
    newLines.push(tableHtml);
  }

  return newLines.join('\n');
}

const parsedBody = parseMarkdownToHtml(markdown);

const fullHtml = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>README Preview - Material 3 Expressive Screen UI</title>
  <style>
    :root {
      --bg: #0d1117;
      --text: #c9d1d9;
      --border: #30363d;
      --card-bg: #161b22;
      --link: #58a6ff;
    }
    html[data-theme="light"] {
      --bg: #ffffff;
      --text: #24292f;
      --border: #d0d7de;
      --card-bg: #f6f8fa;
      --link: #0969da;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: background-color 0.2s, color 0.2s;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }
    .toolbar-title {
      font-weight: 700;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .theme-btn {
      background: #6750A4;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .theme-btn:hover {
      background: #7965b2;
    }
    .readme-container {
      max-width: 980px;
      width: 100%;
      padding: 32px 24px;
      box-sizing: border-box;
      line-height: 1.6;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 10px 14px;
    }
    th {
      background: var(--card-bg);
    }
    pre {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      overflow: auto;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 85%;
    }
    a {
      color: var(--link);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    picture img {
      max-width: 100%;
      height: auto;
    }
    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 28px 0;
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      <span>📄 README.md Preview (Pixel / M3E Style)</span>
    </div>
    <div style="display: flex; gap: 12px; align-items: center;">
      <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">🌓 Switch to Light Mode</button>
      <a href="/" style="font-size: 13px; font-weight: 600;">Back to Canvas App ➔</a>
    </div>
  </div>

  <div class="readme-container">
    ${parsedBody}
  </div>

  <script>
    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      document.getElementById('themeBtn').innerText = next === 'dark' ? '🌓 Switch to Light Mode' : '🌓 Switch to Dark Mode';
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'readme-preview.html'), fullHtml);
console.log('Generated public/readme-preview.html successfully!');
