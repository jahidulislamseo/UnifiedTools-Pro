const fs = require('fs');
const path = require('path');

async function testAnalyze() {
    try {
        const imagePath = 'C:\\Users\\Jahidul Islam\\.gemini\antigravity\\brain\\d3c9def6-5c39-44ac-a18a-2674cfb466a4\\test_plumbing_service_1778395318842.png';
        const stats = fs.statSync(imagePath);
        const fileSizeInBytes = stats.size;
        
        // Simulating form data for vision test
        const res = await fetch('http://localhost:3000/api/ai/analyze', {
            method: 'POST',
            body: new URLSearchParams({
                // Note: Real browser sends multipart/form-data, but for a simple test we can check the API endpoint behavior
            })
        });
        
        // Actually, let's use a real form-data test to be 100% sure
        console.log("Starting Vision Test with real image...");
    } catch (e) {
        console.error("Vision test prep failed:", e.message);
    }
}

// I'll use a more robust form-data test via node
const FormData = require('form-data');
const fetch = require('node-fetch');

async function fullVisionTest() {
    try {
        const form = new FormData();
        const imagePath = 'C:\\Users\\Jahidul Islam\\.gemini\\antigravity\\brain\\d3c9def6-5c39-44ac-a18a-2674cfb466a4\\test_plumbing_service_1778395318842.png';
        form.append('file', fs.createReadStream(imagePath));
        form.append('businessInfo', 'Home plumbing service in Dhaka');
        form.append('model', 'google/gemini-flash-1.5:free');

        const res = await fetch('http://localhost:3000/api/ai/analyze', {
            method: 'POST',
            body: form
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.log("Vision Test Error:", e.message);
    }
}

fullVisionTest();
