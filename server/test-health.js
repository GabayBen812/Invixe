const http = require('http');

// Test basic health check
function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Basic Health Check - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('Basic Health Check Response:');
        console.log(JSON.stringify(healthData, null, 2));
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test detailed health check
        testDetailedHealthCheck();
      } catch (error) {
        console.error('Error parsing health check response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing basic health check:', error.message);
  });

  req.end();
}

// Test detailed health check
function testDetailedHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/health/detailed',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Detailed Health Check - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('Detailed Health Check Response:');
        console.log(JSON.stringify(healthData, null, 2));
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test readiness check
        testReadinessCheck();
      } catch (error) {
        console.error('Error parsing detailed health check response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing detailed health check:', error.message);
  });

  req.end();
}

// Test readiness check
function testReadinessCheck() {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/health/ready',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Readiness Check - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('Readiness Check Response:');
        console.log(JSON.stringify(healthData, null, 2));
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test liveness check
        testLivenessCheck();
      } catch (error) {
        console.error('Error parsing readiness check response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing readiness check:', error.message);
  });

  req.end();
}

// Test liveness check
function testLivenessCheck() {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/health/live',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Liveness Check - Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('Liveness Check Response:');
        console.log(JSON.stringify(healthData, null, 2));
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('All health check endpoints tested successfully!');
      } catch (error) {
        console.error('Error parsing liveness check response:', error);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error testing liveness check:', error.message);
  });

  req.end();
}

// Start testing
console.log('Testing Invixe Server Health Check Endpoints...\n');
testHealthCheck();
