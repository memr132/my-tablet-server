const express = require('express');
const multer = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Choose where files are stored on your tablet:
// This creates a 'cloud-storage' folder right inside your project directory!
// (Or change to '/data/data/com.termux/files/home/storage/shared/Download' for Android Downloads)
const STORAGE_DIR = path.join(__dirname, 'cloud-storage');
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Setup Multer for handling file uploads safely
const multerUpload = require('multer');
const storage = multerUpload.diskStorage({
  destination: (req, file, cb) => cb(null, STORAGE_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multerUpload({ storage });

// API: Get list of files in storage
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(STORAGE_DIR).map(file => {
      const stats = fs.statSync(path.join(STORAGE_DIR, file));
      return {
        name: file,
        size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
        modified: stats.mtime.toLocaleString(),
        isDirectory: stats.isDirectory()
      };
    });
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read storage' });
  }
});

// API: Upload files endpoint
app.post('/api/upload', upload.array('files'), (req, res) => {
  res.json({ success: true, message: 'Files uploaded successfully!' });
});

// API: Download specific file
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(STORAGE_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// API: Delete specific file
app.delete('/api/files/:filename', (req, res) => {
  const filePath = path.join(STORAGE_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Serve the Classic & Futuristic Professional Web UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Cloud | Tablet Server</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #090d16;
      --card-bg: #111827;
      --border: #1f2937;
      --accent: #38bdf8;
      --accent-hover: #0ea5e9;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      background: var(--card-bg);
      border-bottom: 1px solid var(--border);
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo span { color: var(--accent); }
    .status-badge {
      font-size: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      background: rgba(56, 189, 248, 0.1);
      color: var(--accent);
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    main {
      max-width: 1100px;
      width: 100%;
      margin: 2.5rem auto;
      padding: 0 1.5rem;
      flex: 1;
    }
    /* Upload Dropzone */
    .dropzone {
      background: var(--card-bg);
      border: 1px dashed #374151;
      border-radius: 8px;
      padding: 2.5rem;
      text-align: center;
      transition: all 0.2s ease;
      cursor: pointer;
      margin-bottom: 2.5rem;
      position: relative;
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: var(--accent);
      background: rgba(17, 24, 39, 0.8);
    }
    .dropzone input[type="file"] {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .dropzone h3 {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0.4rem;
      color: var(--text-main);
    }
    .dropzone p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    /* File Table */
    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .table-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .table-header h2 {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      padding: 0.85rem 1.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border);
      background: rgba(0,0,0,0.2);
    }
    td {
      padding: 1rem 1.5rem;
      font-size: 0.875rem;
      border-bottom: 1px solid rgba(31, 41, 55, 0.6);
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: rgba(255,255,255,0.015); }
    .file-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      color: var(--text-main);
    }
    .file-icon {
      color: var(--accent);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      background: rgba(56, 189, 248, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }
    .actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-main);
      padding: 0.4rem 0.85rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
    }
    .btn:hover { border-color: #6b7280; background: rgba(255,255,255,0.05); }
    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #000;
      font-weight: 600;
    }
    .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); }
    .btn-danger:hover { border-color: #ef4444; color: #ef4444; }
    #progress-container {
      display: none;
      margin-top: 1rem;
      background: rgba(0,0,0,0.3);
      border-radius: 4px;
      overflow: hidden;
      height: 6px;
    }
    #progress-bar {
      height: 100%;
      background: var(--accent);
      width: 0%;
      transition: width 0.2s;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">NEXUS<span>CLOUD</span> // TABLET NODE</div>
    <div class="status-badge">ONLINE &bull; SECURE TUNNEL</div>
  </header>
  
  <main>
    <div class="dropzone" id="dropzone">
      <input type="file" id="file-input" multiple>
      <h3>Drop files here or click to select</h3>
      <p>Instant direct transmission to Android Storage Node</p>
      <div id="progress-container"><div id="progress-bar"></div></div>
    </div>

    <div class="table-container">
      <div class="table-header">
        <h2>Storage Index</h2>
        <button class="btn" onclick="fetchFiles()">&#8635; Refresh</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Modified</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody id="file-table-body">
          <tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading storage index...</td></tr>
        </tbody>
      </table>
    </div>
  </main>

  <script>
    const fileInput = document.getElementById('file-input');
    const dropzone = document.getElementById('dropzone');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      uploadFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => uploadFiles(fileInput.files));

    function uploadFiles(files) {
      if (!files.length) return;
      const formData = new FormData();
      for (let file of files) formData.append('files', file);

      progressContainer.style.display = 'block';
      progressBar.style.width = '0%';

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload', true);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          progressBar.style.width = percentComplete + '%';
        }
      };
      xhr.onload = () => {
        progressContainer.style.display = 'none';
        fetchFiles();
      };
      xhr.send(formData);
    }

    async function fetchFiles() {
      const tbody = document.getElementById('file-table-body');
      try {
        const res = await fetch('/api/files');
        const files = await res.json();
        if (!files.length) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">No files in storage yet. Upload your first file above.</td></tr>';
          return;
        }
        tbody.innerHTML = files.map(f => \`
          <tr>
            <td>
              <div class="file-name">
                <span class="file-icon">FILE</span>
                <span>\${f.name}</span>
              </div>
            </td>
            <td style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-muted);">\${f.size}</td>
            <td style="font-size: 0.8rem; color: var(--text-muted);">\${f.modified}</td>
            <td class="actions">
              <a href="/download/\${encodeURIComponent(f.name)}" class="btn btn-primary" download>Download</a>
              <button onclick="deleteFile('\${encodeURIComponent(f.name)}')" class="btn btn-danger">Delete</button>
            </td>
          </tr>
        \`).join('');
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #ef4444;">Failed to load storage index.</td></tr>';
      }
    }

    async function deleteFile(name) {
      if (!confirm('Are you sure you want to permanently delete this file?')) return;
      await fetch('/api/files/' + name, { method: 'DELETE' });
      fetchFiles();
    }

    fetchFiles();
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Nexus Cloud Tablet Server live on port ${PORT}`);
});
