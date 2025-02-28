// 计时管理器
window.TimerManager = {
    // 存储功能过期时间
    expiryTime: null,
    
    // 开始计时
    startTimer: function() {
        // 设置过期时间为当前时间+1小时
        this.expiryTime = Date.now() + (60 * 60 * 1000); // 1小时
        
        // 存储到localStorage
        localStorage.setItem('functionExpiryTime', this.expiryTime);
        
        // 开始检查计时
        this.checkTimer();
    },
    
    // 检查计时
    checkTimer: function() {
        const remaining = this.expiryTime - Date.now();
        
        if (remaining <= 5 * 60 * 1000) { // 剩余5分钟
            // 显示警告
            this.showWarning();
        }
        
        if (remaining <= 0) { // 时间到
            // 禁用功能
            this.disablePremiumFeatures();
            return;
        }
        
        // 每分钟检查一次
        setTimeout(() => this.checkTimer(), 60000);
    },
    
    // 显示警告
    showWarning: function() {
        const warningDiv = document.createElement('div');
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
        warningDiv.innerHTML = `
            <p style="margin: 0; font-weight: bold;">使用时间即将到期</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">剩余5分钟，请及时保存工作</p>
        `;
        document.body.appendChild(warningDiv);
    },
    
    // 禁用付费功能
    disablePremiumFeatures: function() {
        // 清除localStorage
        localStorage.removeItem('functionExpiryTime');
        
        // 显示提示
        alert('使用时间已到期，请重新付费使用');
        
        // 刷新页面
        window.location.reload();
    },
    
    // 检查是否在有效期内
    isValid: function() {
        const storedTime = localStorage.getItem('functionExpiryTime');
        if (!storedTime) return false;
        
        this.expiryTime = parseInt(storedTime);
        return Date.now() < this.expiryTime;
    }
}; 