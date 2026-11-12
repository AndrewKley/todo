#!/usr/bin/env python3
"""Serve the planner at http://127.0.0.1:8000 using Python's standard library."""

import errno
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import sys
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent
RESOURCES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/styles.css": ("styles.css", "text/css; charset=utf-8"),
    "/app.js": ("app.js", "text/javascript; charset=utf-8"),
}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self._serve(send_body=True)

    def do_HEAD(self):
        self._serve(send_body=False)

    def _serve(self, send_body):
        try:
            path = urlsplit(self.path).path
        except ValueError:
            self.send_error(404)
            return

        resource = RESOURCES.get(path)
        if resource is None:
            self.send_error(404)
            return

        filename, content_type = resource
        target = ROOT / filename
        try:
            # Keep even an allowlisted filename from escaping through a symlink.
            if target.resolve().parent != ROOT:
                self.send_error(404)
                return
            content = target.read_bytes()
        except OSError:
            self.send_error(404)
            return

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        if send_body:
            self.wfile.write(content)


def main():
    host = os.environ.get("TODO_HOST", "127.0.0.1")
    try:
        server = ThreadingHTTPServer((host, 8000), Handler)
    except OSError as error:
        if error.errno == errno.EADDRINUSE:
            print("Cannot start server: port 8000 is already in use.", file=sys.stderr)
        else:
            print(f"Cannot start server: {error}", file=sys.stderr)
        return 1

    print(f"Planner: http://{host}:8000", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
