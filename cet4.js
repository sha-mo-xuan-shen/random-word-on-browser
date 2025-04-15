onload = function() {
    const $html = document.documentElement;
    const $body = document.body;
    // 示例单词和定义数组
    var words = []
    var definitions =[]
        // 加载外部 JSON 文件
        const jsonUrl = chrome.runtime.getURL('data/kaoyan.json');//在这里修改要更换的单词表
        fetch(jsonUrl)
        .then(response => response.json())
        .then(data => {
            words = data.map(item => item.word);
            definitions = data.map(item => item.definition);
        })
        .catch(err => console.error('加载单词失败:', err));
    
    function createBubble(e) {
        if (words.length === 0) return;
        const bubble = document.createElement("b");
        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words[randomIndex];
        const definition = definitions[randomIndex];
        
        // 将页面坐标转换为百分比单位
        // 先计算偏移量对应的 vw/vh（例如20px和50px）
        const offsetX = 20 / window.innerWidth * 100; // 20px 对应的 vw
        const offsetY = 50 / window.innerHeight * 100; // 50px 对应的 vh
        
        // 初始位置转换为 vw/vh 单位
        let posX = (e.pageX / window.innerWidth * 100) - offsetX;
        let posY = (e.pageY / window.innerHeight * 100) - offsetY;
        const initialPosY = posY;  // 用于计算移动距离
        
        // 动画参数：将原来基于像素的数值转换为 vh 的比例值
        // 每帧上移 0.5px 转换为 vh：0.5 / window.innerHeight * 100
        const speedVh = (0.3 / window.innerHeight) * 100;
        // 800px 上移距离转换为 vh
        const removeThreshold = (800 / window.innerHeight) * 100;
        // 每 50px 更换一次颜色，转成 vh
        const colorChangeThresholdIncrement = (50 / window.innerHeight) * 100;
        let nextColorThreshold = colorChangeThresholdIncrement;
        
        // 设置气泡样式，使用 vw 和 vh 单位定位
        Object.assign(bubble.style, {
            color: getRandomColor(),
            position: "absolute",
            left: `${posX}vw`,
            top: `${posY}vh`,
            fontSize: "22px",
            fontWeight: "bold",
            padding: "2px 5px",
            borderRadius: "3px",
            backgroundColor: "rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 9999,
            userSelect: "none",
            opacity: "1"
        });
        bubble.textContent = word;
        
        let animationFrameId = null;
        
        function animate() {
            posY -= speedVh; // 每帧上移 speedVh vh 单位
            bubble.style.top = `${posY}vh`;
            
            // 当前移动的距离
            const distanceMoved = initialPosY - posY;
            // 根据移动距离调整透明度
            bubble.style.opacity = `${Math.max(0, 1 - (distanceMoved / removeThreshold))}`;
            
            // 当移动距离超过下一个颜色更换的阈值时更换颜色
            if (distanceMoved >= nextColorThreshold) {
                bubble.style.color = getRandomColor();
                nextColorThreshold += colorChangeThresholdIncrement;
            }
            
            // 当移动距离达到移除阈值时，停止动画并移除气泡
            if (distanceMoved >= removeThreshold) {
                cancelAnimationFrame(animationFrameId);
                bubble.remove();
                return;
            }
            
            animationFrameId = requestAnimationFrame(animate);
        }
        
        // 鼠标移入时暂停动画，并显示定义
        bubble.addEventListener('mouseenter', () => {
            cancelAnimationFrame(animationFrameId);
            bubble.textContent = definition;
            bubble.style.backgroundColor = "rgba(0,0,0,0.5)";
        });
        
        // 鼠标移出时恢复动画并显示单词
        bubble.addEventListener('mouseleave', () => {
            bubble.textContent = word;
            bubble.style.backgroundColor = "rgba(0,0,0,0.2)";
            animationFrameId = requestAnimationFrame(animate);
        });
        
        // 启动动画
        animationFrameId = requestAnimationFrame(animate);
        $body.appendChild(bubble);
    }
    
    $html.addEventListener('click', createBubble);
    
    function getRandomColor() {
        return `hsl(${Math.random() * 360}, 70%, 60%)`;
    }
};
