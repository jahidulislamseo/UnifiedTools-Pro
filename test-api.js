async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: "Test prompt",
                message: "test",
                model: "meta-llama/llama-3.3-70b-instruct:free"
            })
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

test();
