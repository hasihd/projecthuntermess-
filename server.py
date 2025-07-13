from http.server import SimpleHTTPRequestHandler, HTTPServer

def run_server():
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f'Сервер запущен на порту {port}')
    print(f'Откройте в браузере: http://localhost:{port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()