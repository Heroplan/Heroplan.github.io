// chat-simulator.js: 管理聊天模拟器的所有功能。

// --- 颜色转换帮助函数 ---

/**
 * 将 HSV (色相, 饱和度, 明度) 颜色值转换为 RGB 值。
 * @param {number} h - 色相 (0-1)。
 * @param {number} s - 饱和度 (0-1)。
 * @param {number} v - 明度 (0-1)。
 * @returns {{r: number, g: number, b: number}} RGB对象。
 */
function hsvToRgb(h, s, v) {
    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * 将 RGB 颜色值转换为十六进制颜色代码。
 * @param {number} r - 红色值 (0-255)。
 * @param {number} g - 绿色值 (0-255)。
 * @param {number} b - 蓝色值 (0-255)。
 * @returns {string} 十六进制颜色代码 (e.g., "#FF5733")。
 */
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// --- UI 更新函数 ---

/**
 * 根据当前的 HSV 状态更新颜色选择器UI（预览框、光标位置、HEX值）。
 */
function updateColorPickerUI() {
    const { r, g, b } = hsvToRgb(state.hsv.h, state.hsv.s, state.hsv.v);
    const hex = rgbToHex(r, g, b);
    const svBox = document.getElementById('sv-box');
    const svCursor = document.getElementById('sv-cursor');
    const hueSlider = document.getElementById('hue-slider');
    const hueCursor = document.getElementById('hue-cursor');
    const colorPreviewBox = document.getElementById('color-preview-box');
    const colorHexCodeInput = document.getElementById('color-hex-code');

    if (svBox) svBox.style.backgroundColor = `hsl(${state.hsv.h * 360}, 100%, 50%)`;
    if (svCursor) {
        svCursor.style.left = `${state.hsv.s * 100}%`;
        svCursor.style.top = `${(1 - state.hsv.v) * 100}%`;
    }
    if (hueCursor) hueCursor.style.top = `${state.hsv.h * 100}%`;
    if (colorPreviewBox) colorPreviewBox.style.backgroundColor = hex;
    if (colorHexCodeInput) colorHexCodeInput.value = hex;
}

/**
 * 在文本框的当前光标位置插入文本。
 * @param {HTMLTextAreaElement} textarea - 文本框元素。
 * @param {string} textToInsert - 要插入的文本。
 */
function insertTextAtCursor(textarea, textToInsert) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + textToInsert + text.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    textarea.focus();
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * 根据输入框的内容更新聊天预览区域。
 */
function updateChatPreview() {
    const chatSimulatorInput = document.getElementById('chat-simulator-input');
    const chatSimulatorPreview = document.getElementById('chat-simulator-preview');
    if (!chatSimulatorInput || !chatSimulatorPreview) return;

    const rawText = chatSimulatorInput.value;
    let html = '';
    let currentColor = '#FFFFFF';

    // 使用正则表达式分割文本、颜色代码和表情符号
    const tokens = rawText.split(/(\[#[A-Fa-f0-9]{6}\]|:[a-zA-Z0-9_]+:)/g).filter(Boolean);

    tokens.forEach(token => {
        const colorMatch = token.match(/^\[(#[A-Fa-f0-9]{6})\]$/);
        const emojiMatch = token.match(/^:([a-zA-Z0-9_]+):$/);

        if (colorMatch) {
            currentColor = colorMatch[1]; // 更新当前颜色
        } else if (emojiMatch && emojiList.includes(emojiMatch[1])) {
            // 如果是表情符号，则渲染为图片
            const emojiName = emojiMatch[1];
            html += `<img src="imgs/emoticons/${emojiName}.webp" alt="${token}" style="width: 20px; height: 20px; vertical-align: middle;">`;
        } else {
            // 普通文本，应用当前颜色
            const textWithBreaks = token.replace(/\n/g, '<br>');
            html += `<span style="color: ${currentColor};">${textWithBreaks}</span>`;
        }
    });
    chatSimulatorPreview.innerHTML = html;
}

// --- 主事件监听器设置函数 ---

/**
 * 为聊天模拟器的所有组件绑定事件监听器。
 * 此函数只在第一次打开聊天模拟器时执行一次。
 */
function addChatSimulatorEventListeners() {
    const showChatSimulatorBtn = document.getElementById('show-chat-simulator-btn');
    if (!showChatSimulatorBtn) return;

    showChatSimulatorBtn.addEventListener('click', () => {
        initAndShowChatSimulatorView(); // 切换到聊天模拟器视图

        // 使用标志位确保初始化逻辑只执行一次
        if (state.isSimulatorInitialized) return;
        const previewWrapper = document.getElementById('chat-simulator-preview-wrapper');
        const savedHeight = getCookie('chatPreviewHeight');
        if (savedHeight && previewWrapper) {
            previewWrapper.style.flexBasis = savedHeight;
            // 以下两行确保 flex-basis 生效
            previewWrapper.style.flexGrow = '0';
            previewWrapper.style.flexShrink = '0';
        }

        const favoriteColorBtn = document.getElementById('favorite-color-btn');
        const favoriteColorsGrid = document.getElementById('favorite-colors-grid');
        const chatSimulatorInput = document.getElementById('chat-simulator-input');
        const insertColorBtn = document.getElementById('insert-color-btn');
        const chatSimulatorCopyBtn = document.getElementById('chat-simulator-copy-btn');
        const emojiGrid = document.getElementById('emoji-grid');
        const svBox = document.getElementById('sv-box');
        const hueSlider = document.getElementById('hue-slider');
        const splitter = document.getElementById('io-splitter');

        let favoriteColors = getCookie('favoriteColors') ? JSON.parse(getCookie('favoriteColors')) : [];

        // 渲染已收藏的颜色
        function renderFavoriteColors() {
            if (!favoriteColorsGrid) return;
            favoriteColorsGrid.innerHTML = '';
            favoriteColors.forEach(color => {
                const item = document.createElement('div');
                item.className = 'favorite-color-item';
                item.style.backgroundColor = color;
                item.dataset.color = color;
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-favorite-btn';
                removeBtn.innerHTML = '&times;';
                removeBtn.title = '移除此颜色';
                item.appendChild(removeBtn);

                item.addEventListener('click', (e) => {
                    if (e.target !== removeBtn) {
                        insertTextAtCursor(chatSimulatorInput, `[${item.dataset.color}]`);
                    }
                });
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // 阻止冒泡到item的点击事件
                    favoriteColors = favoriteColors.filter(c => c !== color);
                    setCookie('favoriteColors', JSON.stringify(favoriteColors), 365);
                    renderFavoriteColors();
                });
                favoriteColorsGrid.appendChild(item);
            });
        }

        // 收藏当前颜色按钮
        if (favoriteColorBtn) {
            favoriteColorBtn.addEventListener('click', () => {
                const currentColor = document.getElementById('color-hex-code').value;
                if (currentColor && !favoriteColors.includes(currentColor)) {
                    favoriteColors.unshift(currentColor);
                    setCookie('favoriteColors', JSON.stringify(favoriteColors), 365);
                    renderFavoriteColors();
                }
            });
        }

        // 绑定核心输入和按钮事件
        if (chatSimulatorInput) chatSimulatorInput.addEventListener('input', updateChatPreview);
        if (insertColorBtn) insertColorBtn.addEventListener('click', () => {
            const colorCode = `[${document.getElementById('color-hex-code').value}]`;
            insertTextAtCursor(chatSimulatorInput, colorCode);
        });
        if (chatSimulatorCopyBtn) {
            chatSimulatorCopyBtn.addEventListener('click', () => {
                if (!chatSimulatorInput.value) return;
                copyTextToClipboard(chatSimulatorInput.value).then(() => {
                    const originalText = chatSimulatorCopyBtn.innerText;
                    const langDict = i18n[state.currentLang];
                    chatSimulatorCopyBtn.innerText = langDict.chatCopied || 'Copied!';
                    chatSimulatorCopyBtn.disabled = true;
                    setTimeout(() => {
                        chatSimulatorCopyBtn.innerText = originalText;
                        chatSimulatorCopyBtn.disabled = false;
                    }, 2000);
                }).catch(err => { console.error('复制失败:', err); alert('复制失败。'); });
            });
        }

        // 填充表情符号网格
        if (emojiGrid && emojiGrid.children.length === 0) {
            emojiList.forEach(emojiName => {
                const img = document.createElement('img');
                img.src = `imgs/emoticons/${emojiName}.webp`;
                img.alt = `:${emojiName}:`;
                img.title = `:${emojiName}:`;
                img.addEventListener('click', () => insertTextAtCursor(chatSimulatorInput, `:${emojiName}:`));
                emojiGrid.appendChild(img);
            });
        }

        // --- 颜色选择器拖动逻辑 ---
        const handleHueMove = (e) => { e.preventDefault(); const rect = hueSlider.getBoundingClientRect(); const y = (e.clientY || e.touches[0].clientY) - rect.top; state.hsv.h = Math.max(0, Math.min(1, y / rect.height)); updateColorPickerUI(); };
        const handleSVMove = (e) => { e.preventDefault(); const rect = svBox.getBoundingClientRect(); const x = (e.clientX || e.touches[0].clientX) - rect.left; const y = (e.clientY || e.touches[0].clientY) - rect.top; state.hsv.s = Math.max(0, Math.min(1, x / rect.width)); state.hsv.v = 1 - Math.max(0, Math.min(1, y / rect.height)); updateColorPickerUI(); };
        const stopDragging = () => { state.isDraggingHue = false; state.isDraggingSV = false; };

        hueSlider.addEventListener('mousedown', (e) => { state.isDraggingHue = true; handleHueMove(e); });
        svBox.addEventListener('mousedown', (e) => { state.isDraggingSV = true; handleSVMove(e); });
        window.addEventListener('mousemove', (e) => { if (state.isDraggingHue) handleHueMove(e); if (state.isDraggingSV) handleSVMove(e); });
        window.addEventListener('mouseup', stopDragging);
        hueSlider.addEventListener('touchstart', (e) => { state.isDraggingHue = true; handleHueMove(e); }, { passive: false });
        svBox.addEventListener('touchstart', (e) => { state.isDraggingSV = true; handleSVMove(e); }, { passive: false });
        window.addEventListener('touchmove', (e) => { if (state.isDraggingHue) handleHueMove(e); if (state.isDraggingSV) handleSVMove(e); }, { passive: false });
        window.addEventListener('touchend', stopDragging);

        // --- 上下拖动条逻辑 ---
        if (splitter && previewWrapper && chatSimulatorInput) {
            let isDraggingSplitter = false;
            const onDragStart = (e) => { e.preventDefault(); isDraggingSplitter = true; window.addEventListener('mousemove', onDragMove); window.addEventListener('mouseup', onDragEnd); window.addEventListener('touchmove', onDragMove, { passive: false }); window.addEventListener('touchend', onDragEnd); };
            const onDragMove = (e) => { if (!isDraggingSplitter) return; e.preventDefault(); const clientY = e.touches ? e.touches[0].clientY : e.clientY; const panel = splitter.parentElement; const panelRect = panel.getBoundingClientRect(); const newPreviewHeight = clientY - panelRect.top - (splitter.offsetHeight / 2); const minHeight = 50; if (newPreviewHeight >= minHeight && (panel.offsetHeight - newPreviewHeight - splitter.offsetHeight) >= minHeight) { previewWrapper.style.flexBasis = `${newPreviewHeight}px`; } };
            const onDragEnd = () => { if (!isDraggingSplitter) return; isDraggingSplitter = false; if (previewWrapper.style.flexBasis) setCookie('chatPreviewHeight', previewWrapper.style.flexBasis, 365); window.removeEventListener('mousemove', onDragMove); window.removeEventListener('mouseup', onDragEnd); window.removeEventListener('touchmove', onDragMove); window.removeEventListener('touchend', onDragEnd); };
            splitter.addEventListener('mousedown', onDragStart);
            splitter.addEventListener('touchstart', onDragStart, { passive: false });
        }


        // 首次加载时更新UI
        updateColorPickerUI();
        renderFavoriteColors();
        state.isSimulatorInitialized = true;
    });
}