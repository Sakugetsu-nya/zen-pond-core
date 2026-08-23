from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os, sys

BASE = "/zen-pond"
ROOT = os.path.join(os.path.dirname(__file__), "deploy")

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        if path.startswith(BASE + "/") or path == BASE:
            path = path[len(BASE):] or "/"
        return super().translate_path(path)

    def log_message(self, fmt, *args):
        # quiet logs
        pass

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f"本地预览：http://localhost:{port}{BASE}/  (或 http://127.0.0.1:{port}{BASE}/)")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
