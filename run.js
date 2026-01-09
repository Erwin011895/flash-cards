const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url'); // Import the url module

const PORT = 8000;
const STATIC_DIR = path.join(__dirname, '');

const server = http.createServer((req, res) => {
    // Parse the URL to get the pathname, ignoring query parameters
    // console.log(req.url); // /list.html?type=hiragana

    // const parsedUrl = url.parse(req.url, true);
    // const pathname = parsedUrl.pathname;
    const pathname = req.url.substring(1, req.url.indexOf('?') !== -1 ? req.url.indexOf('?') : req.url.length);;

    // Determine the file path, defaulting to index.html for the root URL
    const filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);
    const extname = String(path.extname(filePath)).toLowerCase(); // Ensure extname is a string and lowercase
    let contentType = 'text/html';

    // Set appropriate content type for common file types
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json': // Add JSON content type
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.gif': // Add GIF content type
            contentType = 'image/gif';
            break;
        case '.svg': // Add SVG content type
            contentType = 'image/svg+xml';
            break;
        case '.ico': // Add ICO content type
            contentType = 'image/x-icon';
            break;
    }

    // Read the file and serve it
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                // File not found
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // Server error
                res.writeHead(500);
                res.end('500 Internal Server Error');
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});