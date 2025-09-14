#!/usr/bin/env python3
import http.server, socketserver, webbrowser, threading, sys, os

PORT = int(os.environ.get("PORT", "8080"))
Handler = http.server.SimpleHTTPRequestHandler

class NoCacheHandler(Handler):
    def end_headers(self):
        # Avoid dev cache confusion
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def open_browser():
    url = f"http://localhost:{PORT}/"
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("0.0.0.0", PORT), NoCacheHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}/  (Press Ctrl+C to stop)")
        threading.Timer(0.8, open_browser).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")
            httpd.server_close()