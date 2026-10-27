import http.server, sys, functools

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

http.server.ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(H, directory=sys.argv[1])).serve_forever()
