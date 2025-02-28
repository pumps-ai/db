// 支付配置文件
const PAYMENT_CONFIG = {
    // 支付宝配置
    ALIPAY: {
        GATEWAY: "https://api.example.com/alipay",  // 支付网关
        APP_ID: "你的支付宝AppID",  // 支付宝应用ID
        MERCHANT_ID: "你的商户ID",  // 商户ID
        NOTIFY_URL: "https://api.example.com/payment/notify",  // 支付通知URL
        RETURN_URL: "https://your-domain.com/payment/return"  // 支付完成返回URL
    },
    
    // 价格配置（单位：元）
    PRICES: {
        VIBRATION_ANALYSIS: 0.99,  // 振动分析功能价格
        OPTIMIZATION: 0.99,  // 优化功能价格
        premium: 0.99  // 统一价格
    },
    
    // 使用时长配置（单位：毫秒）
    DURATIONS: {
        ONE_HOUR: 60 * 60 * 1000  // 1小时
    }
};

export default PAYMENT_CONFIG; 