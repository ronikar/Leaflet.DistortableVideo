// Static file server over the repo root, so the fixtures can load dist/,
// examples/vendor/ and examples/media/ by path. Browsers refuse media and XHR
// over file://, so the tests need real HTTP.

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { join, normalize, extname } from 'node:path';

const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.map': 'application/json',
    '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png',
};

export async function serve(root) {
    const server = createServer(async (req, res) => {
        // strip the query and refuse to escape the root
        const rel = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
        const path = join(root, rel);

        try {
            const info = await stat(path);
            if (info.isDirectory()) throw new Error('directory');
            res.writeHead(200, {
                'content-type': TYPES[extname(path)] ?? 'application/octet-stream',
                'content-length': info.size,
            });
            createReadStream(path).pipe(res);
        } catch {
            res.writeHead(404).end('not found');
        }
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    return {
        origin: `http://127.0.0.1:${port}`,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}
