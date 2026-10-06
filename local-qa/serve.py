"""Isolated Studio: local assets only; no production API or persistence."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import json
import subprocess
import argparse
from urllib.parse import unquote
ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser()
parser.add_argument('--port',type=int,default=4174)
args=parser.parse_args()
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self,p):
        p=p.split('?')[0].split('#')[0]
        if p=='/':return str(ROOT/'local-qa/site/index.html')
        base=ROOT/'local-qa/site' if p.startswith('/_qa/') else ROOT/'dist'
        relative=p[5:] if p.startswith('/_qa/') else p.lstrip('/')
        target=(base/unquote(relative)).resolve()
        if not target.is_relative_to(base.resolve()):return str(base/'__blocked_path__')
        return str(target)
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('Content-Security-Policy',"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'self'")
        self.send_header('X-Local-QA','production-disconnected')
        super().end_headers()
    def blocked(self):
        b=json.dumps({'error':'local_qa_only','cloud':False}).encode()
        self.send_response(503);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(b)));self.end_headers()
        if self.command!='HEAD':self.wfile.write(b)
    def do_GET(self):
        if self.path.startswith(('/api/','/mcp')):return self.blocked()
        super().do_GET()
    def do_POST(self):
        if self.path!='/_qa/workspace-export':return self.blocked()
        origin=self.headers.get('Origin')
        if origin!=f'http://127.0.0.1:{self.server.server_port}':return self.blocked()
        size=int(self.headers.get('Content-Length','0'))
        if not 0<size<55*1024*1024:return self.blocked()
        result=subprocess.run(['node',str(ROOT/'studio/render/save-export.mjs')],input=self.rfile.read(size),capture_output=True,cwd=ROOT)
        if result.returncode:
            body=json.dumps({'error':result.stderr.decode()[:1200]}).encode();code=400
        else:body=result.stdout;code=201
        self.send_response(code);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
    do_PUT=do_PATCH=do_DELETE=do_OPTIONS=blocked
print(f'Local Apartment Studio: http://127.0.0.1:{args.port}/_qa/workspace/',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
