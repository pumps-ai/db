// 支付相关函数
window.PaymentFunctions = {
    showPayment: async function() {
        console.log('Showing payment modal - function called');
        try {
            // 检查元素是否存在
            const modalElement = document.getElementById('paymentModal');
            const qrCodeElement = document.getElementById('qrCode');
            const statusElement = document.getElementById('paymentStatus');
            
            if (!modalElement) {
                console.error('Payment modal element not found');
                return;
            }
            if (!qrCodeElement) {
                console.error('QR code element not found');
                return;
            }
            if (!statusElement) {
                console.error('Status element not found');
                return;
            }

            console.log('All elements found, proceeding with payment flow');
            
            // 清除之前的二维码
            qrCodeElement.innerHTML = '';
            
            // 显示支付窗口时添加flex布局
            modalElement.style.display = 'flex';
            statusElement.innerHTML = '<div class="status-spinner"></div><p>正在创建订单...</p>';

            // 使用您的固定收款码
            const payUrl = 'https://qr.alipay.com/fkx11878hfpqmxqtsoqta9f'; // 保持不变，因为这个收款码是一样的
            
            console.log('Creating QR code for order:', { payUrl });
            
            // 生成二维码
            new QRCode(qrCodeElement, {
                text: payUrl,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            console.log('QR code created');

            // 更新状态显示
            statusElement.innerHTML = `
                <p>请使用支付宝扫码支付</p>
                <p style="color: #666; font-size: 12px; margin-top: 10px;">支付完成后请刷新页面</p>
            `;
            
            // 开始轮询支付状态
            this.checkPaymentStatus(payUrl, 'premium');
        } catch (error) {
            console.error('Payment error:', error);
            const statusElement = document.getElementById('paymentStatus');
            if (statusElement) {
                statusElement.innerHTML = `
                    <p style="color: red;">创建订单失败，请稍后重试</p>
                    <button onclick="PaymentFunctions.closePaymentModal()" class="cancel-button">关闭</button>
                `;
            }
        }
    },

    checkPaymentStatus: function(orderId, featureType) {
        let checkCount = 0;
        const maxChecks = 60;
        
        const checkInterval = setInterval(() => {
            checkCount++;
            // 模拟检查支付状态
            if (checkCount >= maxChecks) {
                clearInterval(checkInterval);
                document.getElementById('paymentStatus').innerHTML = `
                    <p style="color: red;">支付超时，请重试</p>
                    <button onclick="PaymentFunctions.closePaymentModal()" class="cancel-button">关闭</button>
                `;
            }
        }, 2000);
    },

    closePaymentModal: function() {
        document.getElementById('paymentModal').style.display = 'none';
        document.getElementById('qrCode').innerHTML = '';
        document.getElementById('paymentStatus').innerHTML = '<div class="status-spinner"></div><p>正在创建订单...</p>';
    },

    // 支付成功后的处理
    handlePaymentSuccess: function() {
        // 开始计时
        TimerManager.startTimer();
        
        // 更新状态显示
        document.getElementById('paymentStatus').innerHTML = `
            <p style="color: green;">支付成功！</p>
            <p style="font-size: 12px; color: #666;">使用时间：1小时</p>
        `;
        
        // 关闭支付窗口
        setTimeout(() => {
            this.closePaymentModal();
            // 刷新页面以更新状态
            window.location.reload();
        }, 1500);
    }
};

// 添加初始化检查
console.log('PaymentFunctions loaded:', !!window.PaymentFunctions); 