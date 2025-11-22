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
    document.cookie = name + "=" + (value !== null && value !== undefined ? value : "") + expires + "; path=/; SameSite=Lax";
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
 * 获取用于显示的名称（如家族、来源），如果关闭了“显示活动名称”，则只显示核心名称。
 * @param {string} value - 原始值。
 * @param {string} type - 类型 ('family' 或 'source')。
 * @returns {string} 格式化后的显示名称。
 */
function getDisplayName(value, type) {
    const showEventNameCheckbox = document.getElementById('show-event-name-checkbox');
    // 如果复选框不存在或已选中，直接返回翻译后的值
    if (!showEventNameCheckbox || showEventNameCheckbox.checked) {
        return state.family_values[String(value).toLowerCase()] || value;
    }

    // 如果未选中，则尝试去除前缀
    let translatedValue = state.family_values[String(value).toLowerCase()] || value;
    if (type === 'family' || type === 'source') {
        const parts = translatedValue.split(' - ');
        if (parts.length > 1) {
            return parts.slice(1).join(' - ').trim(); // 返回 " - " 之后的所有部分
        }
    }
    return translatedValue;
}

// 为 Nynaeve 技能类型创建反向查找表
// 这些表将中文标签映射回其原始的英文键，以便进行排序
const nynaeveCnToEnMap = Object.fromEntries(Object.entries(skillTypeTranslations_cn).map(([en, cn]) => [cn, en]));
const nynaeveTcToEnMap = Object.fromEntries(Object.entries(skillTypeTranslations_tc).map(([en, tc]) => [tc, en]));
/**
 * 根据来源和自定义排序规则，获取英雄的技能标签数组。
 * @param {object} hero - 英雄对象。
 * @param {string} source - 来源 ('heroplan', 'nynaeve', 'bbcamp', 'both')。
 * @returns {string[]} - 排序后的技能标签数组。
 */
function getSkillTagsForHero(hero, source) {
    if (!hero) return [];

    // 根据当前语言获取对应的 Nynaeve 反向查找表
    const nynaeveReverseMap = state.currentLang === 'cn' ? nynaeveCnToEnMap :
        state.currentLang === 'tc' ? nynaeveTcToEnMap : null;

    // 为 Nynaeve 标签定义统一的排序函数
    const sortNynaeveTags = (tags) => {
        tags.sort((a, b) => {
            // 在排序前，将中文标签转换回英文键
            const englishA = nynaeveReverseMap ? (nynaeveReverseMap[a] || a) : a;
            const englishB = nynaeveReverseMap ? (nynaeveReverseMap[b] || b) : b;

            const indexA = nynaeveSkillTypeOrder.indexOf(englishA);
            const indexB = nynaeveSkillTypeOrder.indexOf(englishB);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
        return tags;
    };

    // 为 bbcamp 标签定义统一的排序函数
    const sortBbcampTags = (tags) => {
        const priorityCategories = ["基础技能", "特殊效果", "增益效果", "负面效果"];
        const orderArrays = { "基础技能": skillTagOrder_base, "特殊效果": skillTagOrder_special, "增益效果": skillTagOrder_buff, "负面效果": skillTagOrder_debuff };

        tags.sort((a, b) => {
            const categoryA = state.skillTagToCategoryMap[a];
            const categoryB = state.skillTagToCategoryMap[b];
            const priorityIndexA = categoryA ? priorityCategories.indexOf(categoryA) : -1;
            const priorityIndexB = categoryB ? priorityCategories.indexOf(categoryB) : -1;

            if (priorityIndexA !== priorityIndexB) {
                if (priorityIndexA !== -1 && priorityIndexB !== -1) return priorityIndexA - priorityIndexB;
                if (priorityIndexA !== -1) return -1;
                if (priorityIndexB !== -1) return 1;
            }
            if (priorityIndexA !== -1) {
                const sortOrder = orderArrays[categoryA];
                if (sortOrder) {
                    const chineseKeyA = skillTagReverseMap[a] || a;
                    const chineseKeyB = skillTagReverseMap[b] || b;
                    const indexA = sortOrder.indexOf(chineseKeyA);
                    const indexB = sortOrder.indexOf(chineseKeyB);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                }
            }
            return a.localeCompare(b, state.currentLang === 'cn' ? 'zh-CN' : 'zh-TW');
        });
        return tags;
    };

    const cnTags = hero.cn_skill_info?.flatMap(cat => Object.values(cat)[0]) || [];
    const nynaeveTags = hero.skill_types || [];
    const heroplanTags = hero.types || [];

    if (source === 'both') {
        const sortedCnTags = sortBbcampTags([...cnTags]);
        const sortedNynaeveTags = sortNynaeveTags([...nynaeveTags]);
        const sortedHeroplanTags = [...heroplanTags].sort((a, b) => a.localeCompare(b));

        const combinedTags = [...sortedCnTags, ...sortedNynaeveTags, ...sortedHeroplanTags];
        return Array.from(new Set(combinedTags)).filter(Boolean);
    }

    let tags = [];
    switch (source) {
        case 'heroplan':
            tags = [...heroplanTags].sort((a, b) => a.localeCompare(b));
            break;
        case 'nynaeve':
            tags = sortNynaeveTags([...nynaeveTags]);
            break;
        case 'bbcamp':
        default:
            tags = sortBbcampTags([...cnTags]);
            break;
    }

    return tags.filter(Boolean);
}

/**
 * 从多语言混合的英雄名称中提取英文名 (v3 - 详情页权威规则版)
 * @param {object} hero - 英雄对象。
 * @returns {string|null} 提取出的英文名。
 */
function extractEnglishName(hero) {
    if (!hero || !hero.name) return null;

    let heroName = hero.name;

    // --- 步骤 1: 提取详情页 getSkinInfo 函数的逻辑，用于分离出基础名称 ---
    // 这个逻辑会先尝试移除名称末尾的皮肤标识（如 C1, 玻璃, 卡通等）
    const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
    const skinMatch = heroName.match(skinPattern);
    let baseName = heroName; // 默认为完整名称

    if (skinMatch && skinMatch[1]) {
        const potentialSkin = skinMatch[1].toLowerCase();
        if (potentialSkin.match(/^c\d+$/) ||
            ['glass', 'toon', '玻璃'].includes(potentialSkin) ||
            potentialSkin.endsWith('卡通') ||
            potentialSkin.endsWith('皮肤') ||
            potentialSkin.endsWith('皮膚')) {
            baseName = heroName.substring(0, heroName.length - skinMatch[0].length).trim();
        }
    }

    // --- 步骤 2: 应用详情页的括号解析规则到处理过的 baseName 上 ---
    // 这是你确认过的“100%准确”的逻辑
    const singleAltLangNamePattern = /^(.*?)\s*\(([^)]+)\)/;
    const singleAltLangMatch = baseName.match(singleAltLangNamePattern);

    if (singleAltLangMatch && singleAltLangMatch[2] && /[a-zA-Z]/.test(singleAltLangMatch[2]) && !/[\u4e00-\u9fa5]/.test(singleAltLangMatch[2])) {
        return singleAltLangMatch[2].trim();
    }

    // 如果上述规则不匹配（例如纯英文名），我们提供一个备用方案
    const multiLangMatch = baseName.match(/^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/);
    if (multiLangMatch && multiLangMatch[3] && /[a-zA-Z]/.test(multiLangMatch[3])) {
        return multiLangMatch[3].trim();
    }

    // 最后的备用方案，适用于没有括号的纯英文名
    if (!/\(/.test(baseName)) {
        return baseName;
    }

    return null;
}

/**
 * 应用自定义语言名称到英雄数据
 * @param {string} langCode - 语言代码
 */
function applyCustomLanguageNames(langCode) {
    if (!window.searchNameData || !window.searchNameData[langCode]) {
        console.warn(`未找到 ${langCode} 语言的数据`);
        return;
    }

    const langData = window.searchNameData[langCode];
    let updatedCount = 0;

    state.allHeroes.forEach(hero => {
        if (!hero.heroId) return;

        // 使用部分匹配模式查找对应的翻译
        // 查找所有以 hero.heroId 开头的键
        const matchingKeys = Object.keys(langData).filter(key =>
            hero.heroId.startsWith(key)
        );

        if (matchingKeys.length > 0) {
            // 选择最长的匹配（最具体的匹配）
            const bestMatch = matchingKeys.reduce((longest, current) =>
                current.length > longest.length ? current : longest
            );

            // 应用翻译
            hero.name = langData[bestMatch];
            updatedCount++;
        }
    });

    console.log(`已将 ${updatedCount} 个英雄名称更新为 ${langCode} 语言`);
}

/**
 * 从服务器加载核心数据 (英雄、家族等)。
 * @param {string} lang - 要加载的语言版本 ('cn', 'tc', 'en')。
 * @returns {Promise<boolean>} 数据是否加载成功。
 */
async function loadData(lang) {
    // 从 Cookie 中读取保存的语言设置
    const savedLang = getCookie('search_lang');
    if (savedLang) {
        const langSelector = document.getElementById('search-lang-selector'); // 获取新按钮
        langSelector.value = savedLang;
    }
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
        // 如果 savedLang 不为 cn、tc、en，则使用 window.searchNameData 进行名称替换
        if (savedLang && savedLang !== 'current') {
            await loadExtraNameData(savedLang);
            applyCustomLanguageNames(savedLang);
        }

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

/**
 * 根据英雄颜色返回对应的亮色到标准色的CSS线性渐变背景。
 * @param {string} colorName - 英雄的颜色名称。
 * @returns {string} CSS background 字符串。
 */
function getHeroColorLightGradient(colorName) {
    const colorMap = {
        '红': { light: '#ef8b38', standard: '#660610' }, '紅': { light: '#ef8b38', standard: '#660610' }, 'red': { light: '#ef8b38', standard: '#660610' },
        '蓝': { light: '#83e2f6', standard: '#113159' }, '藍': { light: '#83e2f6', standard: '#113159' }, 'blue': { light: '#83e2f6', standard: '#113159' },
        '绿': { light: '#b4e48b', standard: '#175b07' }, '綠': { light: '#b4e48b', standard: '#175b07' }, 'green': { light: '#b4e48b', standard: '#175b07' },
        '黄': { light: '#e6e402', standard: '#725404' }, '黃': { light: '#e6e402', standard: '#725404' }, 'yellow': { light: '#e6e402', standard: '#725404' },
        '紫': { light: '#c177c3', standard: '#491b4c' }, 'purple': { light: '#c177c3', standard: '#491b4c' }
    };
    const colors = colorMap[String(colorName).toLowerCase()];
    if (colors) {
        // 从上方的标准色，渐变到下方的亮色
        return `linear-gradient(to bottom, ${colors.standard} 0%, ${colors.light} 100%)`;
    }
    return 'none'; // 如果颜色未定义，则不显示背景
}

/**
 * 根据英雄星级、突破和天赋等级生成段位图标的完整HTML。
 * @param {object} hero - 英雄对象。
 * @param {string} lbSetting - 当前的突破设置 ('none', 'lb1', 'lb2')。
 * @param {string} talentSetting - 当前的天赋设置 ('none', 'talent20', 'talent25')。
 * @param {number} nodeCount - 当前已激活的天赋节点数量。
 * @returns {string} 包含所有段位元素的HTML字符串。
 */
function generateRankHtml(hero, lbSetting, talentSetting, nodeCount = 0) {
    if (!hero || !hero.star) return '';

    let ascensionLevels = 0;
    if (hero.star === 1) ascensionLevels = 2;
    else if (hero.star === 2 || hero.star === 3) ascensionLevels = 3;
    else if (hero.star >= 4) ascensionLevels = 4;

    if (ascensionLevels === 0) return '';

    let lbCount = 0;
    if (lbSetting === 'lb1') lbCount = 1;
    else if (lbSetting === 'lb2') lbCount = 2;

    let barsHtml = '';
    for (let i = 0; i < ascensionLevels; i++) {
        const isLimitBreakBar = i < lbCount;
        const barImage = isLimitBreakBar ? 'ascension_bar_limitbreak.webp' : 'ascension_bar.webp';
        barsHtml += `<img src="imgs/other/${barImage}" class="ascension-bar" alt="ascension bar">`;
    }

    let talentNodeHtml = '';
    // 使用传入的实际节点数量 nodeCount
    const talentCount = nodeCount;

    if (talentCount > 0) {
        // 判断使用哪个图标，并显示实际的天赋点数
        const nodeImage = talentCount >= 21 ? 'node_master.webp' : 'node.webp';
        talentNodeHtml = `
            <div class="talent-node-container">
                <img src="imgs/talents/${nodeImage}" class="talent-node-image" alt="talent node">
                <span class="talent-node-text">${talentCount}</span>
            </div>
        `;
    }

    return `<div class="hero-avatar-rank-container">${barsHtml}${talentNodeHtml}</div>`;
}


// 用于保存原始 console 方法的全局对象
const _originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
};

// 空函数，用于“静音”console
const _emptyFunc = () => { };

/**
 * 全局切换所有 console 日志记录的开关
 * @param {boolean} enable - true为开启日志, false为关闭日志
 */
function toggleConsoleLogging(enable) {
    if (enable) {
        // 开启日志: 恢复所有原始的 console 方法
        console.log = _originalConsole.log;
        console.warn = _originalConsole.warn;
        console.error = _originalConsole.error;
        console.info = _originalConsole.info;
        console.debug = _originalConsole.debug;
        //console.log("日志记录功能已开启。");
    } else {
        // 关闭日志: 将所有 console 方法替换为空函数
        //console.log("日志记录功能已关闭。");
        console.log = _emptyFunc;
        console.warn = _emptyFunc;
        console.error = _emptyFunc;
        console.info = _emptyFunc;
        console.debug = _emptyFunc;
    }
}

/**
 * 预加载一组指定的静态资源（图片、音频），让浏览器提前缓存它们
 * @param {string[]} assetUrls - 要预加载的资源URL数组
 */
function preloadAssets(assetUrls) {
    if (!Array.isArray(assetUrls)) {
        console.error("preloadAssets: 提供的参数不是一个数组。");
        return;
    }

    assetUrls.forEach(url => {
        try {
            const fileExtension = url.split('.').pop().toLowerCase();

            // 根据文件扩展名判断是图片还是音频
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
                const img = new Image();
                img.src = url;
            } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
                const audio = new Audio();
                audio.preload = 'auto'; // 设置为自动预加载
                audio.src = url;
            }
        } catch (e) {
            console.warn(`预加载资源失败: ${url}`, e);
        }
    });
}

/**
 * 将 "YYYY-MM-DD" 格式的日期字符串格式化为用户本地化的日期格式。
 * @param {string} dateString - "YYYY-MM-DD" 格式的日期字符串。
 * @returns {string} 本地化格式的日期字符串，或原始字符串（如果格式无效）。
 */
function formatLocalDate(dateString) {
    // 检查输入是否为有效的 "YYYY-MM-DD" 格式
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString; // 如果格式不符或为空，直接返回原始值
    }

    try {
        // 拆分字符串以避免因时区问题导致的日期偏差
        const parts = dateString.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 月份在JavaScript中是从0开始的
        const day = parseInt(parts[2], 10);
        const date = new Date(year, month, day);

        // 让浏览器根据用户的系统/浏览器设置自动决定区域格式
        // 传入 undefined 作为第一个参数，会使用运行时的默认locale
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        console.error("日期格式化失败:", dateString, e);
        return dateString; // 如果发生错误，返回原始字符串
    }
}
