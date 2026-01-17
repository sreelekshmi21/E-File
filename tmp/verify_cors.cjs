const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET',
    headers: {
        'Origin': 'http://localhost:5173'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    if (res.headers['access-control-allow-origin'] === 'http://localhost:5173') {
        console.log('SUCCESS: CORS header correct.');
    } else {
        console.log('FAILURE: CORS header missing or incorrect.');
    }
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
