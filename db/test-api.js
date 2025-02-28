import API_CONFIG from './config/api-keys.js';

async function testOpenAIConnection() {
    try {
        const response = await fetch(API_CONFIG.OPENAI.API_ENDPOINT.trim(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.OPENAI.API_KEY}`
            },
            body: JSON.stringify({
                model: API_CONFIG.OPENAI.MODELS.GPT35,
                messages: [{
                    role: "user",
                    content: "Hello, this is a test message."
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API连接成功！");
        console.log("响应数据:", data);
        return true;
    } catch (error) {
        console.error("API连接测试失败:", error);
        return false;
    }
}

// 执行测试
testOpenAIConnection(); 