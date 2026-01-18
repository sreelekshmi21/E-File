import handler from 'serve-handler';
import http from 'http';

const server = http.createServer((request, response) => {
    return handler(request, response, {
        public: 'dist',
        rewrites: [
            { source: '**', destination: '/index.html' }
        ]
    });
});

server.listen(5173, '0.0.0.0', () => {
    console.log('Frontend running at http://0.0.0.0:5173');
});
