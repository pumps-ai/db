import PAYMENT_CONFIG from '../config/payment-config.js';

// 支付管理模块
const PaymentManager = {
    // 支付状态存储键名
    STORAGE_KEY: 'vibration_payment_status',
    
    // 检查功能是否可用
    checkFeatureAvailable: function(featureType) {
        const paymentStatus = this.getPaymentStatus();
        if (!paymentStatus) return false;
        
        const now = new Date().getTime();
        const expireTime = paymentStatus.expireTime;
        
        // 检查是否在有效期内
        if (now > expireTime) {
            this.clearPaymentStatus();
            return false;
        }
        
        // 高级功能统一检查
        return paymentStatus.featureType === 'premium';
    },
    
    // 创建订单
    createOrder: async function(featureType) {
        try {
            const response = await fetch(`${PAYMENT_CONFIG.ALIPAY.GATEWAY}/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchantId: PAYMENT_CONFIG.ALIPAY.MERCHANT_ID,
                    appId: PAYMENT_CONFIG.ALIPAY.APP_ID,
                    amount: PAYMENT_CONFIG.PRICES[featureType],
                    featureType: featureType,
                    notifyUrl: PAYMENT_CONFIG.ALIPAY.NOTIFY_URL,
                    returnUrl: PAYMENT_CONFIG.ALIPAY.RETURN_URL
                })
            });

            if (!response.ok) throw new Error('创建订单失败');
            return await response.json();
        } catch (error) {
            console.error('创建订单错误:', error);
            throw error;
        }
    },

    // 获取剩余时间
    getRemainingTime: function() {
        const status = this.getPaymentStatus();
        if (!status) return 0;
        
        const now = new Date().getTime();
        const remaining = status.expireTime - now;
        return Math.max(0, remaining);
    },

    // 格式化剩余时间
    formatRemainingTime: function(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}分${seconds}秒`;
    },
    
    // 保存支付状态
    savePaymentStatus: function(orderInfo) {
        const now = new Date().getTime();
        const paymentStatus = {
            orderId: orderInfo.orderId,
            startTime: now,
            expireTime: now + PAYMENT_CONFIG.DURATIONS.ONE_HOUR,
            featureType: orderInfo.featureType
        };
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(paymentStatus));
        this.startExpirationTimer(paymentStatus);
        return paymentStatus;
    },
    
    // 启动过期计时器
    startExpirationTimer: function(status) {
        const remaining = status.expireTime - new Date().getTime();
        if (remaining <= 0) return;

        // 每分钟更新一次剩余时间显示
        const timer = setInterval(() => {
            const currentRemaining = this.getRemainingTime();
            if (currentRemaining <= 0) {
                clearInterval(timer);
                this.clearPaymentStatus();
                alert('使用时间已到期，请重新购买。');
                window.location.reload();
            }
        }, 60000);
    },
    
    // 获取支付状态
    getPaymentStatus: function() {
        const status = localStorage.getItem(this.STORAGE_KEY);
        return status ? JSON.parse(status) : null;
    },
    
    // 清除支付状态
    clearPaymentStatus: function() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

export default PaymentManager; 