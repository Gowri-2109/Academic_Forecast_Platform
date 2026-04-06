const axios = require('axios');
async function run() {
    try {
        const res = await axios.post('http://localhost:5000/api/predict/run-all');
        console.log(res.data.message);
    } catch (e) {
        console.error('Error triggering predictions:', e.message);
    }
}
run();
