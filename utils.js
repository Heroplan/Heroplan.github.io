// utils.js: 包含通用的辅助函数。

/**
 * 设置一个 Cookie。
 * @param {string} name - Cookie 的名称。
 * @param {string} value - Cookie 的值。
 * @param {number} days - Cookie 的有效天数。
 */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

/**
 * 获取指定名称的 Cookie 值。
 * @param {string} name - 要获取的 Cookie 的名称。
 * @returns {string|null} 如果找到则返回 Cookie 的值，否则返回 null。
 */
function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * 将远程英雄图片URL转换为本地路径。
 * @param {string} url - 原始图片 URL。
 * @returns {string} 本地图片路径。
 */
function getLocalImagePath(url) {
    if (!url || typeof url !== 'string') return '';
    try {
        const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
        return 'imgs/heroes/' + filename;
    } catch (e) { return ''; }
}

/**
 * 复制文本到剪贴板的后备方法 (用于不支持新API的浏览器)。
 * @param {string} text - 要复制的文本。
 * @returns {boolean} 是否复制成功。
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (err) {
        document.body.removeChild(textArea);
        return false;
    }
}

/**
 * 将文本复制到剪贴板 (优先使用现代API)。
 * @param {string} text - 要复制的文本。
 * @returns {Promise<void>} 一个在复制成功时解析的 Promise。
 */
function copyTextToClipboard(text) {
    return new Promise((resolve, reject) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(resolve).catch(() => {
                if (fallbackCopyTextToClipboard(text)) resolve();
                else reject(new Error('Fallback copy command failed.'));
            });
        } else {
            if (fallbackCopyTextToClipboard(text)) resolve();
            else reject(new Error('Clipboard API not available and fallback failed.'));
        }
    });
}

/**
 * 根据来源和自定义排序规则，获取英雄的技能标签数组。
 * @param {object} hero - 英雄对象。
 * @param {string} source - 来源 ('heroplan', 'nynaeve', 'bbcamp', 'both')。
 * @returns {string[]} - 排序后的技能标签数组。
 */
function getSkillTagsForHero(hero, source) {
    if (!hero) return [];

    let tags = [];
    const cnTags = hero.cn_skill_info?.flatMap(cat => Object.values(cat)[0]) || [];

    switch (source) {
        case 'heroplan':
            tags = hero.types || [];
            break;
        case 'nynaeve':
            tags = hero.skill_types || [];
            break;
        case 'bbcamp':
            tags = cnTags;
            break;
        case 'both':
        default:
            tags = [...new Set([...(hero.types || []), ...(hero.skill_types || []), ...cnTags])];
            break;
    }

    // 自定义排序逻辑
    const priorityCategories = ["基础技能", "特殊效果", "增益效果", "负面效果"];
    const orderArrays = {
        "基础技能": skillTagOrder_base,
        "特殊效果": skillTagOrder_special,
        "增益效果": skillTagOrder_buff,
        "负面效果": skillTagOrder_debuff
    };

    tags.sort((a, b) => {
        // 获取每个标签所属的分类
        const categoryA = state.skillTagToCategoryMap[a];
        const categoryB = state.skillTagToCategoryMap[b];

        // 获取分类的优先级（在 priorityCategories 中的位置）
        const priorityIndexA = categoryA ? priorityCategories.indexOf(categoryA) : -1;
        const priorityIndexB = categoryB ? priorityCategories.indexOf(categoryB) : -1;

        // --- 1. 按“分类”进行一级排序 ---
        if (priorityIndexA !== priorityIndexB) {
            if (priorityIndexA !== -1 && priorityIndexB !== -1) return priorityIndexA - priorityIndexB;
            if (priorityIndexA !== -1) return -1; // a有分类，b没有，a排前面
            if (priorityIndexB !== -1) return 1;  // b有分类，a没有，b排前面
        }

        // --- 2. 如果分类相同，则按您定义的“分类内部顺序”进行二级排序 ---
        if (priorityIndexA !== -1) { // 这意味着 a 和 b 都在同一个优先分类中
            const sortOrder = orderArrays[categoryA]; // 获取该分类对应的排序规则数组
            if (sortOrder) {
                const indexA = sortOrder.indexOf(a);
                const indexB = sortOrder.indexOf(b);

                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
            }
        }

        // --- 3. 如果都不在任何优先分类和排序规则中，则按默认方式排序 ---
        return a.localeCompare(b, 'zh-CN');
    });

    return tags.filter(Boolean);
}

/**
 * 从多语言混合的英雄名称中提取英文名。
 * @param {object} hero - 英雄对象。
 * @param {string} currentLang - 当前语言环境 ('cn', 'tc', 'en')。
 * @returns {string|null} 提取出的英文名，如果不存在则为 null。
 */
function extractEnglishName(hero, currentLang) {
    if (!hero || !hero.name) return null;
    let heroName = hero.name;
    if (heroName.includes('Experience Mimic') || heroName.includes('经验拟态兽') || heroName.includes('經驗模仿怪')) {
        const pattern = /\(([^)]+)\)/;
        const match = heroName.match(pattern);
        if (match && match[1] && match[1].includes('Experience Mimic')) {
            const baseName = match[1];
            const afterParenthesesIndex = heroName.lastIndexOf(')') + 1;
            const suffix = heroName.substring(afterParenthesesIndex).trim();
            const allowedSuffixes = ['ice', 'nature', 'dark', 'holy', 'fire', 'holy'];
            if (suffix && allowedSuffixes.includes(suffix.toLowerCase())) {
                return `${baseName} ${suffix}`;
            }
            return baseName;
        }
    }
    let tempName = heroName;
    const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
    const skinMatch = tempName.match(skinPattern);
    if (skinMatch && skinMatch[1]) {
        const potentialSkin = skinMatch[1].toLowerCase();
        if (potentialSkin.match(/^c\d+$/) ||
            ['glass', 'toon', '玻璃'].includes(potentialSkin) ||
            potentialSkin.endsWith('卡通') || potentialSkin.endsWith('皮肤') || potentialSkin.endsWith('皮膚')) {
            tempName = tempName.substring(0, tempName.length - skinMatch[0].length).trim();
        }
    }
    if (currentLang === 'en') {
        return tempName;
    }
    const multiLangNamePattern = /^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/;
    const multiLangMatch = tempName.match(multiLangNamePattern);
    if (multiLangMatch && multiLangMatch[3] && /[a-zA-Z]/.test(multiLangMatch[3])) {
        return multiLangMatch[3].trim();
    }
    const singleAltLangNamePattern = /^(.*?)\s*\(([^)]+)\)/;
    const singleAltLangMatch = tempName.match(singleAltLangNamePattern);
    if (singleAltLangMatch && singleAltLangMatch[2] && /[a-zA-Z]/.test(singleAltLangMatch[2]) && !/[\u4e00-\u9fa5]/.test(singleAltLangMatch[2])) {
        return singleAltLangMatch[2].trim();
    }
    return null;
}

/**
 * 从服务器加载核心数据 (英雄、家族等)。
 * @param {string} lang - 要加载的语言版本 ('cn', 'tc', 'en')。
 * @returns {Promise<boolean>} 数据是否加载成功。
 */
async function loadData(lang) {
    try {
        const response = await fetch(`./data_${lang}.json?v=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!data.allHeroes || !data.families_bonus || !data.family_values) {
            throw new Error("一个或多个数据键在JSON文件中缺失。");
        }

        state.allHeroes = data.allHeroes;
        state.families_bonus = data.families_bonus;
        state.family_values = data.family_values;

        return true;
    } catch (error) {
        console.error("加载或解析数据文件失败:", error);
        const resultsWrapper = document.getElementById('results-wrapper');
        if (resultsWrapper) {
            resultsWrapper.innerHTML = `<p style='color: var(--md-sys-color-error); font-weight: bold;'>错误：加载数据失败。请检查控制台获取详细信息。</p>`;
        }
        const pageLoader = document.getElementById('page-loader-overlay');
        if (pageLoader) {
            pageLoader.classList.add('hidden');
        }
        return false;
    }
}

/**
 * 根据颜色名称获取对应的辉光边框CSS类名。
 * @param {string} colorName - 颜色名称 (如 '红', 'blue')。
 * @returns {string} CSS类名 (如 'red-glow-border')。
 */
const getColorGlowClass = (colorName) => {
    const colorMap = {
        '红': 'red', '紅': 'red', 'red': 'red', '蓝': 'blue', '藍': 'blue', 'blue': 'blue',
        '绿': 'green', '綠': 'green', 'green': 'green', '黄': 'yellow', '黃': 'yellow', 'yellow': 'yellow',
        '紫': 'purple', 'purple': 'purple', '白': 'white', 'white': 'white',
        '黑': 'black', 'black': 'black',
    };
    const standardColor = colorMap[String(colorName).toLowerCase()];
    return standardColor ? `${standardColor}-glow-border` : '';
};

/**
 * 根据颜色名称获取对应的十六进制颜色代码。
 * @param {string} colorName - 颜色名称。
 * @returns {string} 十六进制颜色代码。
 */
const getColorHex = (colorName) => {
    const colorMap = {
        '红': '#ff7a4c', '紅': '#ff7a4c', 'red': '#ff7a4c',
        '蓝': '#41d8fe', '藍': '#41d8fe', 'blue': '#41d8fe',
        '绿': '#70e92f', '綠': '#70e92f', 'green': '#70e92f',
        '黄': '#f2e33a', '黃': '#f2e33a', 'yellow': '#f2e33a',
        '紫': '#e290ff', 'purple': '#e290ff',
    };
    return colorMap[String(colorName).toLowerCase()] || 'inherit';
};