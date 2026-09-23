import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        '.bp3d': 'application/octet-stream',
        '.bin': 'application/octet-stream',
        '.glb': 'model/gltf-binary',
        '.gltf': 'model/gltf+json',
    })

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Content-Disposition', 'inline')
        super().end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

def run():
    os.chdir(DIRECTORY)
    global PORT
    httpd = None
    for p in range(8080, 8100):
        try:
            httpd = ThreadedHTTPServer(("127.0.0.1", p), Handler)
            PORT = p
            break
        except OSError:
            continue

    url = f"http://127.0.0.1:{PORT}"
    print(f"Server dang chay tai: {url}")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer da dung.")
        httpd.server_close()

if __name__ == '__main__':
    run()
