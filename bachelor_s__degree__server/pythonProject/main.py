import json
import os
import logging
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from datetime import datetime


class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            data['timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            with open(os.path.join(os.getcwd(), 'data.json'), 'a') as file:
                json.dump(data, file)
                file.write('\n')

            self.send_response(200)
        except json.JSONDecodeError:
            logging.error("Error decoding JSON")
            self.send_response(400)
        except Exception as e:
            logging.error(f"Error writing to file: {e}")
            self.send_response(500)
        finally:
            self.end_headers()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    server_address = ('', 8080)
    with ThreadingHTTPServer(server_address, RequestHandler) as httpd:
        logging.info('HTTP server running on port 8080...')
        httpd.serve_forever()
