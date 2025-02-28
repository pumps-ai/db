// 使用相对路径
import PaymentManager from './payment-manager.js';
import PAYMENT_CONFIG from '../config/payment-config.js';

// 添加调试日志
console.log('Payment handler module loaded');

// 导出初始化函数
export async function initPayment() {
    console.log('Initializing payment functions');
    
    try {
        // 支付处理函数
        window.showPayment = async function() {
            console.log('Showing payment modal');
            try {
                // 清除之前的二维码
                document.getElementById('qrCode').innerHTML = '';
                
                // 显示支付窗口
                document.getElementById('paymentModal').style.display = 'block';
                document.getElementById('paymentStatus').innerHTML = '<div class="status-spinner"></div><p>正在创建订单...</p>';

                // 创建订单
                const order = await PaymentManager.createOrder('premium');
                
                // 生成支付二维码
                new QRCode(document.getElementById("qrCode"), {
                    text: order.payUrl,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });

                // 更新状态显示
                document.getElementById('paymentStatus').innerHTML = '<p>请使用支付宝扫码支付</p>';
                
                // 开始轮询支付状态
                checkPaymentStatus(order.orderId, 'premium');
            } catch (error) {
                console.error('Payment error:', error);
                document.getElementById('paymentStatus').innerHTML = `
                    <p style="color: red;">创建订单失败，请稍后重试</p>
                    <button onclick="closePaymentModal()" class="cancel-button">关闭</button>
                `;
            }
        };

        // 检查支付状态
        window.checkPaymentStatus = function(orderId, featureType) {
            let checkCount = 0;
            const maxChecks = 60; // 最多检查60次
            
            const checkInterval = setInterval(async () => {
                checkCount++;
                
                try {
                    const response = await fetch(`${PAYMENT_CONFIG.ALIPAY.GATEWAY}/check-payment?orderId=${orderId}`);
                    const result = await response.json();
                    
                    if (result.paid) {
                        // 支付成功
                        clearInterval(checkInterval);
                        PaymentManager.savePaymentStatus({orderId, featureType});
                        document.getElementById('paymentStatus').innerHTML = '<p style="color: green;">支付成功！</p>';
                        setTimeout(() => {
                            closePaymentModal();
                            window.location.reload(); // 刷新页面以更新状态
                        }, 1500);
                        return;
                    }
                    
                    if (checkCount >= maxChecks) {
                        clearInterval(checkInterval);
                        document.getElementById('paymentStatus').innerHTML = `
                            <p style="color: red;">支付超时，请重试</p>
                            <button onclick="closePaymentModal()" class="cancel-button">关闭</button>
                        `;
                    }
                } catch (error) {
                    console.error('检查支付状态失败:', error);
                    document.getElementById('paymentStatus').innerHTML = `
                        <p style="color: red;">检查支付状态失败，请刷新页面重试</p>
                        <button onclick="closePaymentModal()" class="cancel-button">关闭</button>
                    `;
                    clearInterval(checkInterval);
                }
            }, 2000); // 每2秒检查一次
        };

        // 关闭支付窗口
        window.closePaymentModal = function() {
            document.getElementById('paymentModal').style.display = 'none';
            document.getElementById('qrCode').innerHTML = '';
            document.getElementById('paymentStatus').innerHTML = '<div class="status-spinner"></div><p>正在创建订单...</p>';
        };

        console.log('Payment handler initialized successfully');
        return true;
    } catch (error) {
        console.error('Payment initialization failed:', error);
        throw error;
    }
} 