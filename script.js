document.addEventListener('DOMContentLoaded', function () {
    // --- 全局變量 ---
    let filteredHeroes = [];
    let allHeroes = [];
    let families_bonus = [];
    let family_values = {};
    let currentLang = 'cn';
    let currentSort = { key: 'power', direction: 'desc' };
    let temporaryFavorites = null; // 用于临时存储分享的收藏列表
    const speedOrder_cn = ['充能', '魔法', '冥河', '飞速', '快速', '潮汐', '中等', '杀手', '慢', '非常慢'];
    const speedOrder_tc = ['充能', '魔法', '冥河', '飛速', '快速', '潮汐', '中等', '殺手', '慢速', '非常慢'];
    const speedOrder_en = ['Charge', 'Magic', 'Styx', 'Very Fast', 'Fast', 'Changing Tides', 'Average', 'Slayer', 'Slow', 'Very Slow'];


    // --- DOM 元素 ---
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const langSelectBtn = document.getElementById('lang-select-btn');
    const langOptions = document.getElementById('lang-options');
    const resultsWrapper = document.getElementById('results-wrapper');
    const resultsTable = resultsWrapper ? resultsWrapper.querySelector('.manual-table') : null;
    const resultsCountEl = document.getElementById('results-count');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const openFiltersBtn = document.getElementById('open-filters-btn');
    const filtersModal = document.getElementById('filters-modal');
    const filtersModalOverlay = document.getElementById('filters-modal-overlay');
    const closeFiltersModalBtn = document.getElementById('close-filters-modal-btn');
    const pageLoader = document.getElementById('page-loader-overlay');
    const shareFavoritesBtn = document.getElementById('share-favorites-btn');
    const openFavoritesBtn = document.getElementById('open-favorites-btn');
    const filterInputs = {
        name: document.getElementById('name-input'), star: document.getElementById('star-select'),
        color: document.getElementById('color-select'), speed: document.getElementById('speed-select'),
        class: document.getElementById('class-select'), family: document.getElementById('family-select'),
        source: document.getElementById('source-select'),
        aetherpower: document.getElementById('aetherpower-select'),
        types: document.getElementById('type-input'),
        effects: document.getElementById('effects-input'), passives: document.getElementById('passives-input'),
        power: document.getElementById('power-input'), attack: document.getElementById('attack-input'),
        defense: document.getElementById('defense-input'), health: document.getElementById('health-input'),
        releaseDateType: document.getElementById('release-date-type'),
        releaseDateInput: document.getElementById('release-date-input'),
    };

    // --- 語言和文本管理 ---
    const i18n = {
        cn: {
            pageTitle: "帝国与谜题英雄资料库 | Heroplan",
            headerTitle: "Heroplan浏览器", poweredBy: "由", driven: "驱动",
            sponsoredBy: "赞助", translatedBy: "译者制作", footerInfo: "英雄数据持续更新 | 简繁体中文版",
            filterHeroes: "筛选英雄", standardFilters: "标准筛选", nameLabel: "名称:", avatarLabel: "头像", namePlaceholder: "输入英雄名称",
            starLabel: "星级:", colorLabel: "颜色:", speedLabel: "法速:", classLabel: "职业:", familyLabel: "家族:",
            sourceLabel: "起源:", aetherPowerLabel: "以太力量:", advancedFilters: "高级筛选",
            skillTypeLabel: "特殊技能类别:", skillTypePlaceholder: "例如：增益,异常,治疗", skillTextLabel: "特殊技能文本:",
            passiveSkillLabel: "被动技能文本:", filterBy: "筛选:", all: "全部", hero: "英雄", skin: "服装", favorites: "收藏",
            daysSinceRelease: "距离发布日期天数大于:", daysPlaceholder: "1年半548 2年730", minPower: "战力",
            minAttack: "攻击", minDefense: "防御", minHealth: "生命", resetFilters: "重置筛选",
            shareFavorites: "分享收藏", openFavorites: "打开收藏", shareFavoritesCopied: "列表已复制!",
            footerGameName: "《帝国与谜题》", footerPlatform: "英雄数据查询平台",
            footerCredit: "© 2025 heroplan.github.io | 非官方资料站",
            resultsCountText: (count) => `筛选列表中有 ${count} 位英雄`, noResults: "没有找到匹配的英雄", modalHeroDetails: "ℹ️ 英雄详情",
            closeBtnTitle: "关闭", modalOrigin: "起源", modalCoreStats: "📊 核心属性", modalSkillDetails: "📖 技能详情",
            modalSkillName: "📄 名称:", modalSpeed: "⌛ 法速:", modalSkillType: "🏷️ 技能类型:",
            modalSpecialSkill: "✨ 特殊技能:", modalPassiveSkill: "🧿 被动技能:",
            modalFamilyBonus: (family) => `👪 家族加成 (${family}):`, modalSkin: "服装:", none: "无", detailsCloseBtn: "关闭",
            shareButtonTitle: "分享", favoriteButtonTitle: "收藏", favColumnHeader: "☆"
        },
        tc: {
            pageTitle: "帝國與謎題英雄資料庫 | Heroplan",
            headerTitle: "Heroplan瀏覽器", poweredBy: "由", driven: "驅動",
            sponsoredBy: "贊助", translatedBy: "譯者製作", footerInfo: "英雄數據持續更新 | 簡繁中文版",
            filterHeroes: "篩選英雄", standardFilters: "標準篩選", nameLabel: "名稱:", avatarLabel: "頭像", namePlaceholder: "輸入英雄名稱",
            starLabel: "星級:", colorLabel: "顏色:", speedLabel: "法速:", classLabel: "職業:", familyLabel: "家族:",
            sourceLabel: "起源:", aetherPowerLabel: "以太力量:", advancedFilters: "高級篩選",
            skillTypeLabel: "特殊技能類別:", skillTypePlaceholder: "例如：增益,異常,治療", skillTextLabel: "特殊技能文本:",
            passiveSkillLabel: "被動技能文本:", filterBy: "篩選:", all: "全部", hero: "英雄", skin: "服裝", favorites: "收藏",
            daysSinceRelease: "距離發佈日期天數大於:", daysPlaceholder: "1年半548 2年730", minPower: "戰力",
            minAttack: "攻擊", minDefense: "防禦", minHealth: "生命", resetFilters: "重置篩選",
            shareFavorites: "分享收藏", openFavorites: "打開收藏", shareFavoritesCopied: "列表已複製!",
            footerGameName: "《帝國與謎題》", footerPlatform: "英雄數據查詢平台",
            footerCredit: "© 2025 heroplan.github.io | 非官方資料站",
            resultsCountText: (count) => `篩選清單中有 ${count} 位英雄`, noResults: "沒有找到匹配的英雄", modalHeroDetails: "ℹ️ 英雄詳情",
            closeBtnTitle: "關閉", modalOrigin: "起源", modalCoreStats: "📊 核心屬性", modalSkillDetails: "📖 技能詳情",
            modalSkillName: "📄 名稱:", modalSpeed: "⌛ 法速:", modalSkillType: "🏷️ 技能類型:",
            modalSpecialSkill: "✨ 特殊技能:", modalPassiveSkill: "🧿 被動技能:",
            modalFamilyBonus: (family) => `👪 家族加成 (${family}):`, modalSkin: "服裝:", none: "無", detailsCloseBtn: "關閉",
            shareButtonTitle: "分享", favoriteButtonTitle: "收藏", favColumnHeader: "☆"
        },
        en: {
            pageTitle: "Empires & Puzzles Hero Database | Heroplan",
            headerTitle: "Heroplan Browser", poweredBy: "Powered by", driven: "",
            sponsoredBy: "Sponsored by", translatedBy: "Developed by", footerInfo: "Hero data is continuously updated | EN/CN Version",
            filterHeroes: "Filter Heroes", standardFilters: "Standard Filters", nameLabel: "Name:", avatarLabel: "Avatar", namePlaceholder: "Enter hero name",
            starLabel: "Stars:", colorLabel: "Color:", speedLabel: "Speed:", classLabel: "Class:", familyLabel: "Family:",
            sourceLabel: "Origin:", aetherPowerLabel: "Aether Power:", advancedFilters: "Advanced Filters",
            skillTypeLabel: "Skill Type:", skillTypePlaceholder: "e.g. buff, ailment, heal", skillTextLabel: "Skill Text:",
            passiveSkillLabel: "Passive Text:", filterBy: "Filter by:", all: "All", hero: "Hero", skin: "Costume", favorites: "Favorites",
            daysSinceRelease: "Days since release>", daysPlaceholder: "1.5y=548 2y=730", minPower: "Power",
            minAttack: "Attack", minDefense: "Defense", minHealth: "Health", resetFilters: "Reset Filters",
            shareFavorites: "Share Favorites", openFavorites: "Open Favorites", shareFavoritesCopied: "List Copied!",
            footerGameName: "Empires & Puzzles", footerPlatform: "Hero Data Platform",
            footerCredit: "© 2025 heroplan.github.io | Unofficial Fan Site",
            resultsCountText: (count) => `Found ${count} heroes in the list`, noResults: "No matching heroes found", modalHeroDetails: "ℹ️ Hero Details",
            closeBtnTitle: "Close", modalOrigin: "Origin", modalCoreStats: "📊 Core Stats", modalSkillDetails: "📖 Skill Details",
            modalSkillName: "📄 Name:", modalSpeed: "⌛ Speed:", modalSkillType: "🏷️ Skill Type:",
            modalSpecialSkill: "✨ Special Skill:", modalPassiveSkill: "🧿 Passive Skill:",
            modalFamilyBonus: (family) => `👪 Family Bonus (${family}):`, modalSkin: "Costume:", none: "None", detailsCloseBtn: "Close",
            shareButtonTitle: "Share", favoriteButtonTitle: "Favorite", favColumnHeader: "☆"
        }
    };

    function applyLanguage(lang) {
        if (lang === 'cn') {
            document.documentElement.lang = 'zh-CN';
        } else if (lang === 'tc') {
            document.documentElement.lang = 'zh-TW';
        } else {
            document.documentElement.lang = 'en';
        }
        document.body.setAttribute('data-lang', lang);
        currentLang = lang;

        const langDict = i18n[lang] || i18n.cn; // Fallback to 'cn'
        document.title = langDict.pageTitle;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (key === 'headerTitle' && el.tagName === 'H1') {
                // Special handling for the H1 with a link inside
                const link = el.querySelector('a');
                if (link) link.textContent = langDict[key];
            } else {
                const translation = langDict[key];
                if (typeof translation === 'function') {
                    // We handle functional translations like resultsCountText separately
                } else if (translation !== undefined) {
                    el.textContent = translation;
                }
            }
        });
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-key-placeholder');
            if (langDict[key]) { el.placeholder = langDict[key]; }
        });
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }

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

    // --- 主題管理 ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark-theme');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        setCookie('theme', newTheme, 365);
    }

    // --- 語言切換 ---
    function changeLanguage(lang) {
        setCookie('language', lang, 365);
        window.location.reload();
    }

    // --- 收藏夹管理 ---
    function getFavorites() {
        try {
            const favorites = localStorage.getItem('heroFavorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            console.error("Failed to get favorites from localStorage", e);
            return [];
        }
    }

    function saveFavorites(favoritesArray) {
        try {
            localStorage.setItem('heroFavorites', JSON.stringify(favoritesArray));
        } catch (e) {
            console.error("Failed to save favorites to localStorage", e);
        }
    }

    function isFavorite(hero) {
        if (!hero.english_name) return false;
        const favorites = getFavorites();
        const identifier = `${hero.english_name}-${hero.costume_id}`;
        return favorites.includes(identifier);
    }

    function toggleFavorite(hero) {
        if (!hero.english_name) {
            console.warn("Cannot favorite hero with no English name:", hero.name);
            return false;
        }
        let favorites = getFavorites();
        const identifier = `${hero.english_name}-${hero.costume_id}`;
        const index = favorites.indexOf(identifier);

        if (index > -1) {
            favorites.splice(index, 1); // Remove from favorites
        } else {
            favorites.push(identifier); // Add to favorites
        }
        saveFavorites(favorites);
        return index === -1; // Return true if added, false if removed
    }

    // --- 英雄数据处理 ---
    function extractEnglishName(hero) {
        if (!hero || !hero.name) return null;
        let heroName = hero.name;

        // 步骤1：针对“经验拟态兽”的特殊处理
        // 这个逻辑只对包含特定关键词的英雄生效
        if (heroName.includes('Experience Mimic') || heroName.includes('经验拟态兽')) {
            const pattern = /\(([^)]+)\)/; // 找到第一个括号内的内容
            const match = heroName.match(pattern);

            // 确认括号里是 "Experience Mimic"
            if (match && match[1] && match[1].includes('Experience Mimic')) {
                const baseName = match[1]; // "Experience Mimic"

                // 找到括号后的后缀
                const afterParenthesesIndex = heroName.lastIndexOf(')') + 1;
                const suffix = heroName.substring(afterParenthesesIndex).trim();

                // 定义仅对拟态兽生效的颜色后缀
                const allowedSuffixes = ['ice', 'nature', 'dark', 'holy', 'fire'];

                if (suffix && allowedSuffixes.includes(suffix.toLowerCase())) {
                    // 如果后缀匹配，则拼接后返回，例如 "Experience Mimic Nature"
                    return `${baseName} ${suffix}`;
                }
                // 如果没有颜色后缀，则只返回基础名
                return baseName;
            }
        }

        // 步骤2：恢复使用您之前确认正常的、针对C1/C2/Toon等的通用解析逻辑
        // 这个逻辑现在不会处理“经验拟态兽”，因为它已在上面被提前处理并返回
        let tempName = heroName;
        const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
        const skinMatch = tempName.match(skinPattern);
        if (skinMatch && skinMatch[1]) {
            const potentialSkin = skinMatch[1].toLowerCase();
            if (potentialSkin.match(/^c\d+$/) ||
                potentialSkin === 'glass' ||
                potentialSkin === 'toon' ||
                potentialSkin === '玻璃' ||
                potentialSkin.endsWith('卡通') ||
                potentialSkin.endsWith('皮肤') ||
                potentialSkin.endsWith('皮膚')) {
                tempName = tempName.substring(0, tempName.length - skinMatch[0].length).trim();
            }
        }

        if (currentLang === 'en') {
            return tempName;
        }

        const multiLangNamePattern = /^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/;
        const multiLangMatch = tempName.match(multiLangNamePattern);
        if (multiLangMatch && multiLangMatch[3]) {
            const potentialEnglishName = multiLangMatch[3].trim();
            if (/[a-zA-Z]/.test(potentialEnglishName)) {
                return potentialEnglishName;
            }
        }

        const singleAltLangNamePattern = /^(.*?)\s+\((.*?)\)$/;
        const singleAltLangMatch = tempName.match(singleAltLangNamePattern);
        if (singleAltLangMatch && singleAltLangMatch[2]) {
            const potentialEnglishName = singleAltLangMatch[2].trim();
            if (/[a-zA-Z]/.test(potentialEnglishName) && !/[\u4e00-\u9fa5]/.test(potentialEnglishName)) {
                return potentialEnglishName;
            }
        }

        return null;
    }

    // --- 数据加载方式更新 ---
    async function loadData(lang) {
        try {
            const response = await fetch(`./data_${lang}.json?v=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            allHeroes = data.allHeroes;
            families_bonus = data.families_bonus;
            family_values = data.family_values;

            if (!allHeroes || !families_bonus || !family_values) {
                throw new Error("一个或多个数据键在JSON文件中缺失。");
            }
            return true;
        } catch (error) {
            console.error("加载或解析数据文件失败:", error);
            if (resultsWrapper) resultsWrapper.innerHTML = `<p style='color: var(--md-sys-color-error); font-weight: bold;'>Error: Failed to load data. Check console for details.</p>`;
            if (pageLoader) pageLoader.classList.add('hidden');
            return false;
        }
    }

    function adjustStickyHeaders() {
        const resultsHeader = document.querySelector('.results-header');
        const tableThead = document.querySelector('.manual-table > thead');

        if (resultsHeader && tableThead) {
            const headerHeight = resultsHeader.offsetHeight;
            tableThead.style.top = `${headerHeight - 1}px`;
        }
    }

    const getColorGlowClass = (colorName) => {
        // Use a mapping to handle different languages
        const colorMap = {
            '红色': 'red', '紅色': 'red', 'red': 'red',
            '蓝色': 'blue', '藍色': 'blue', 'blue': 'blue',
            '绿色': 'green', '綠色': 'green', 'green': 'green',
            '黄色': 'yellow', '黃色': 'yellow', 'yellow': 'yellow',
            '紫色': 'purple', '紫色': 'purple', 'purple': 'purple',
            '白色': 'white', '白色': 'white', 'white': 'white',
            '黑色': 'black', '黑色': 'black', 'black': 'black',
        };
        const standardColor = colorMap[String(colorName).toLowerCase()];
        return standardColor ? `${standardColor}-glow-border` : '';
    };

    const getColorHex = (colorName) => {
        const colorMap = {
            '红色': '#ff7a4c', '紅色': '#ff7a4c', 'red': '#ff7a4c',
            '蓝色': '#41d8fe', '藍色': '#41d8fe', 'blue': '#41d8fe',
            '绿色': '#70e92f', '綠色': '#70e92f', 'green': '#70e92f',
            '黄色': '#f2e33a', '黃色': '#f2e33a', 'yellow': '#f2e33a',
            '紫色': '#e290ff', '紫色': '#e290ff', 'purple': '#e290ff',
        };
        return colorMap[String(colorName).toLowerCase()] || 'inherit';
    };

    function populateFilters() {
        const CUSTOM_SORT_CN = {
            'speed': ['充能', '魔法', '冥河', '飞速', '快速', '潮汐', '中等', '杀手', '慢', '非常慢'],
            'star': ['5', '4', '3', '2', '1'],
        };
        const CUSTOM_SORT_TC = {
            'speed': ['充能', '魔法', '冥河', '飛速', '快速', '潮汐', '中等', '殺手', '慢速', '非常慢'],
            'star': ['5', '4', '3', '2', '1'],
        };
        const CUSTOM_SORT_EN = {
            'speed': ['Charge', 'Magic', 'Styx', 'Very Fast', 'Fast', 'Changing Tides', 'Average', 'Slayer', 'Slow', 'Very Slow'],
            'star': ['5', '4', '3', '2', '1'],
        };

        const CUSTOM_SORT = { cn: CUSTOM_SORT_CN, tc: CUSTOM_SORT_TC, en: CUSTOM_SORT_EN }[currentLang];
        const locale = { cn: 'zh-CN', tc: 'zh-TW', en: 'en-US' }[currentLang];

        const getSortedValues = (key, values) => {
            values = values.map(v => String(v || ''));
            if (key === 'family' || key === 'source') {
                const translatedValues = values.map(v => ({
                    original: v,
                    translated: family_values[v.toLowerCase()] || v
                }));
                return translatedValues.sort((a, b) => a.translated.localeCompare(b.translated, locale)).map(item => item.original);
            }
            if (key === 'AetherPower') { return values.sort((a, b) => a.localeCompare(b, locale)); }
            if (CUSTOM_SORT[key]) {
                const customOrder = CUSTOM_SORT[key];
                return values.slice().sort((a, b) => {
                    const indexA = customOrder.indexOf(a);
                    const indexB = customOrder.indexOf(b);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    if (indexA !== -1) return -1;
                    if (indexB !== -1) return 1;
                    return a.localeCompare(b, locale);
                });
            }
            return values.sort((a, b) => a.localeCompare(b, locale));
        };
        const createOptions = (values, key) => {
            const sortedValues = getSortedValues(key, values);
            const noneText = i18n[currentLang].none || 'None';
            const options = [`<option value="${noneText}">${noneText}</option>`, ...sortedValues.map(opt => {
                const displayText = (key === 'family' || key === 'source') ? (family_values[String(opt).toLowerCase()] || opt) : opt;
                return `<option value="${opt}">${displayText}</option>`;
            })];
            return options.join('');
        };
        const initFilter = (key) => {
            const heroDataKey = key === 'aetherpower' ? 'AetherPower' : key;
            const uniqueValues = [...new Set(allHeroes.map(h => h[heroDataKey]).filter(v => v != null && v !== ''))];
            if (filterInputs[key]) {
                filterInputs[key].innerHTML = createOptions(uniqueValues, heroDataKey);
            }
        };
        initFilter('star');
        initFilter('color');
        initFilter('speed');
        initFilter('class');
        initFilter('family');
        initFilter('source');
        initFilter('aetherpower');
        document.querySelectorAll('.filter-card select').forEach(select => { select.style.textAlign = 'center'; });
    }

    function openDetailsModal(hero) {
        renderDetailsInModal(hero);
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        modal.scrollTop = 0;
        history.pushState({ modal: 'details' }, null);
    }
    function closeDetailsModal() { if (!modal.classList.contains('hidden')) { history.back(); } }
    function openFiltersModal() {
        filtersModal.classList.remove('hidden');
        filtersModalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'filters' }, null);
    }
    function closeFiltersModal() { if (!filtersModal.classList.contains('hidden')) { history.back(); } }
    function loadFilterStates() {
        const filterSections = [
            { contentId: 'standard-filters-content', button: document.querySelector('#standard-filters-header .toggle-button') },
            { contentId: 'advanced-filters-content', button: document.querySelector('#advanced-filters-header .toggle-button') }
        ];
        filterSections.forEach(section => {
            if (!section.contentId || !section.button) return;
            const contentElement = document.getElementById(section.contentId);
            const savedState = getCookie(section.contentId + '_state');
            if (savedState === 'expanded') {
                contentElement.classList.remove('collapsed');
                section.button.classList.add('expanded');
            } else {
                contentElement.classList.add('collapsed');
                section.button.classList.remove('expanded');
            }
        });
    }

    function applyFiltersAndRender() {
        const filters = Object.fromEntries(Object.entries(filterInputs).map(([key, el]) => [key, el.value.toLowerCase()]));
        const noneValue = i18n[currentLang].none.toLowerCase();

        const favoritesListToUse = temporaryFavorites !== null ? temporaryFavorites : getFavorites();

        const containsAllKeywords = (text, keywords) => {
            if (!text) return false;
            text = String(text).toLowerCase();
            return keywords.every(keyword => text.includes(keyword));
        };

        filteredHeroes = allHeroes.filter(hero => {
            // 步骤1：确定英雄是否符合基础类别筛选 (收藏、英雄、皮肤、或全部)
            let matchesBaseFilter = false;
            const releaseDateType = filters.releaseDateType;

            if (releaseDateType === 'favorites') {
                if (hero.english_name) {
                    const heroIdentifier = `${hero.english_name}-${hero.costume_id}`;
                    if (favoritesListToUse.includes(heroIdentifier)) {
                        matchesBaseFilter = true;
                    }
                }
            } else if (releaseDateType === 'hero') {
                if (hero.costume_id === 0) matchesBaseFilter = true;
            } else if (releaseDateType === 'skin') {
                if (hero.costume_id !== 0) matchesBaseFilter = true;
            } else { // 'all'
                matchesBaseFilter = true;
            }

            if (!matchesBaseFilter) {
                return false;
            }

            // 步骤2：如果符合基础类别，则继续应用所有其他筛选条件
            if (filters.name) {
                const keywords = filters.name.split(' ').filter(k => k);
                if (keywords.length > 0 && !containsAllKeywords(hero.name, keywords)) return false;
            }
            if (filters.effects) {
                const keywords = filters.effects.split(' ').filter(k => k);
                const heroEffectsCombined = (hero.effects && Array.isArray(hero.effects)) ? hero.effects.join(' ') : '';
                if (keywords.length > 0 && !containsAllKeywords(heroEffectsCombined, keywords)) return false;
            }
            if (filters.passives) {
                const keywords = filters.passives.split(' ').filter(k => k);
                const heroPassivesCombined = (hero.passives && Array.isArray(hero.passives)) ? hero.passives.join(' ') : '';
                if (keywords.length > 0 && !containsAllKeywords(heroPassivesCombined, keywords)) return false;
            }
            if (filters.types) {
                const keywords = filters.types.split(' ').filter(k => k);
                const heroTypesCombined = (hero.types && Array.isArray(hero.types)) ? hero.types.join(' ') : '';
                if (keywords.length > 0 && !containsAllKeywords(heroTypesCombined, keywords)) return false;
            }
            if (filters.star !== noneValue && String(hero.star) !== filters.star) return false;
            if (filters.color !== noneValue && String(hero.color).toLowerCase() !== filters.color) return false;
            if (filters.speed !== noneValue && String(hero.speed).toLowerCase() !== filters.speed) return false;
            if (filters.class !== noneValue && String(hero.class).toLowerCase() !== filters.class) return false;
            if (filters.family !== noneValue && String(hero.family).toLowerCase() !== filters.family) return false;
            if (filters.source !== noneValue && String(hero.source).toLowerCase() !== filters.source) return false;
            if (filters.aetherpower !== noneValue && String(hero.AetherPower).toLowerCase() !== filters.aetherpower) return false;

            const releaseDateDays = Number(filters.releaseDateInput);
            if (releaseDateDays > 0) {
                if (!hero['Release date']) return false;
                const releaseDate = new Date(hero['Release date']);
                if (isNaN(releaseDate.getTime())) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                releaseDate.setHours(0, 0, 0, 0);
                const diffTime = today - releaseDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < releaseDateDays) return false;
            }
            if (Number(filters.power) > 0 && Number(hero.power) < Number(filters.power)) return false;
            if (Number(filters.attack) > 0 && Number(hero.attack) < Number(filters.attack)) return false;
            if (Number(filters.defense) > 0 && Number(hero.defense) < Number(filters.defense)) return false;
            if (Number(filters.health) > 0 && Number(hero.health) < Number(filters.health)) return false;

            // 如果通过了所有筛选，则保留该英雄
            return true;
        });

        // ... 排序逻辑 (未改变) ...
        filteredHeroes.sort((a, b) => {
            const key = currentSort.key;
            const direction = currentSort.direction === 'asc' ? 1 : -1;
            let valA = a[key];
            let valB = b[key];

            let comparison = 0;
            const numericKeys = ['star', 'power', 'attack', 'defense', 'health'];

            if (key === 'speed') {
                const speedOrder = { cn: speedOrder_cn, tc: speedOrder_tc, en: speedOrder_en }[currentLang];
                const indexA = speedOrder.indexOf(String(valA));
                const indexB = speedOrder.indexOf(String(valB));
                const finalIndexA = indexA === -1 ? Infinity : indexA;
                const finalIndexB = indexB === -1 ? Infinity : indexB;
                comparison = finalIndexA - finalIndexB;
            } else if (numericKeys.includes(key)) {
                comparison = (Number(valA) || 0) - (Number(valB) || 0);
            } else {
                valA = String(valA || '');
                valB = String(valB || '');
                const locale = { cn: 'zh-CN', tc: 'zh-TW', en: 'en-US' }[currentLang];
                const options = currentLang === 'tc' ? { collation: 'stroke' } : {};
                comparison = valA.localeCompare(valB, locale, options);
            }

            comparison *= direction;

            if (comparison === 0 && key !== 'power') {
                return (Number(b.power) || 0) - (Number(a.power) || 0);
            }

            return comparison;
        });

        renderTable(filteredHeroes);
    }

    function renderTable(heroes) {
        if (!resultsTable) return;
        if (resultsCountEl) {
            resultsCountEl.textContent = i18n[currentLang].resultsCountText(heroes.length);
        }
        const langDict = i18n[currentLang];
        const headers = {
            fav: langDict.favColumnHeader,
            image: langDict.avatarLabel,
            name: langDict.nameLabel.slice(0, -1),
            color: langDict.colorLabel.slice(0, -1),
            star: langDict.starLabel.slice(0, -1),
            class: langDict.classLabel.slice(0, -1),
            speed: langDict.speedLabel.slice(0, -1),
            power: langDict.minPower.replace('Min ', ''),
            attack: langDict.minAttack.replace('Min ', ''),
            defense: langDict.minDefense.replace('Min ', ''),
            health: langDict.minHealth.replace('Min ', ''),
            types: langDict.skillTypeLabel.slice(0, -1)
        };
        const colKeys = Object.keys(headers);
        const sortableKeys = ['name', 'color', 'star', 'class', 'speed', 'power', 'attack', 'defense', 'health'];

        let thead = resultsTable.querySelector('thead');
        if (!thead) {
            thead = document.createElement('thead');
            resultsTable.appendChild(thead);
        }
        thead.innerHTML = '<tr>' + colKeys.map(key => {
            const isSortable = sortableKeys.includes(key);
            let sortIndicator = '';
            if (isSortable && currentSort.key === key) {
                sortIndicator = currentSort.direction === 'asc' ? '▲' : '▼';
            }
            const headerText = headers[key];
            return `<th class="col-${key} ${isSortable ? 'sortable' : ''}" data-sort-key="${key}">
                        ${headerText}
                        <span class="sort-indicator">${sortIndicator}</span>
                    </th>`;
        }).join('') + '</tr>';

        let tbody = resultsTable.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            resultsTable.appendChild(tbody);
        }

        if (heroes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${colKeys.length}" class="empty-results-message">${langDict.noResults}</td></tr>`;
            return;
        }

        const rowsHTML = heroes.map(hero => {
            const isHeroFavorite = isFavorite(hero);
            const cellsHTML = colKeys.map(key => {
                let content = hero[key] || '';
                if (key === 'fav') {
                    if (!hero.english_name) {
                        return `<td class="col-fav"></td>`; // No star if no english name
                    }
                    return `<td class="col-fav"><span class="favorite-toggle-icon ${isHeroFavorite ? 'favorited' : ''}" data-hero-id="${hero.originalIndex}">${isHeroFavorite ? '★' : '☆'}</span></td>`;
                }
                if (key === 'image') {
                    const heroColorClass = getColorGlowClass(hero.color);
                    return `<td class="col-image"><img src="${getLocalImagePath(hero.image)}" class="hero-image ${heroColorClass}" alt="${hero.name}" loading="lazy"></td>`;
                }
                if (key === 'color') {
                    const colorHex = getColorHex(content);
                    return `<td class="col-color"><span class="color-text-outlined" style="color: ${colorHex}; font-weight: bold;">${content}</span></td>`;
                }
                if (key === 'family' && content) {
                    content = family_values[String(content).toLowerCase()] || content;
                }
                if (Array.isArray(content)) content = content.join(', ');
                return `<td class="col-${key}">${content}</td>`;
            }).join('');
            return `<tr class="table-row" data-hero-id="${hero.originalIndex}">${cellsHTML}</tr>`;
        }).join('');

        tbody.innerHTML = rowsHTML;

        if (resultsWrapper) {
            resultsWrapper.scrollTop = 0;
        }
    }

    function getLocalImagePath(url) {
        if (!url || typeof url !== 'string') return '';
        try {
            const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            return 'imgs/' + filename;
        } catch (e) { return ''; }
    }

    function renderDetailsInModal(hero) {
        const langDict = i18n[currentLang];

        const renderListAsHTML = (itemsArray) => {
            if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return `<li>${langDict.none}</li>`;
            return itemsArray.map(item => {
                let cleanItem = String(item).trim();
                if (cleanItem.includes(' * ')) {
                    const parts = cleanItem.split(' * ');
                    let subHtml = `<li>${parts[0].trim()}</li>`;
                    for (let i = 1; i < parts.length; i++) {
                        subHtml += `<li><i>${parts[i].trim()}</i></li>`;
                    }
                    return subHtml;
                }
                return `<li>${cleanItem}</li>`;
            }).join('');
        };

        let rawHeroName = hero.name || 'Unknown Hero';
        let tempName = rawHeroName;
        let mainHeroName = '';
        let englishName = '';
        let traditionalChineseName = '';
        let heroSkin = '';

        // 步骤 1: 对所有语言，首先统一解析并分离出皮肤信息
        const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
        const skinMatch = tempName.match(skinPattern);
        if (skinMatch && skinMatch[1]) {
            const potentialSkin = skinMatch[1].toLowerCase();
            if (potentialSkin.match(/^c\d+$/) ||
                potentialSkin === 'glass' ||
                potentialSkin === 'toon' ||
                potentialSkin === '玻璃' ||
                potentialSkin.endsWith('卡通') ||
                potentialSkin.endsWith('皮肤') ||
                potentialSkin.endsWith('皮膚')) {
                heroSkin = skinMatch[1]; // 保存原始大小写的皮肤名
                tempName = tempName.substring(0, tempName.length - skinMatch[0].length).trim();
            }
        }

        // 步骤 2: 基于剥离了皮肤信息的名字，进行后续的显示名称解析
        if (currentLang === 'en') {
            mainHeroName = tempName; // 英文环境下，剩余部分即为主名
        } else {
            // 中文环境下，进行更精确的解析
            const pattern = /^(.*?)\s*\(([^)]+)\)/; // 查找 "中文 (英文)" 部分
            const match = tempName.match(pattern);

            // 检查是否成功匹配，并且括号内包含英文字母
            if (match && match[2] && /[a-zA-Z]/.test(match[2])) {
                mainHeroName = match[1].trim();
                englishName = match[2].trim();
                // 此处的逻辑会自然地抛弃括号后的任何后缀（如 Nature）
            } else {
                // 如果上述格式不匹配，则直接将剩余名字作为主名
                mainHeroName = tempName;
            }
        }


        const nameBlockHTML = `
            ${englishName ? `<p class="hero-english-name">${englishName}</p>` : ''}
            <h1 class="hero-main-name">${mainHeroName}</h1>
            ${traditionalChineseName ? `<p class="hero-alt-name">${traditionalChineseName}</p>` : ''}
        `;

        const heroFamily = String(hero.family || '').toLowerCase();
        const familyBonus = (families_bonus.find(f => f.name.toLowerCase() === heroFamily) || {}).bonus || [];
        const translatedFamily = family_values[heroFamily] || hero.family;
        const heroTypesContent = (hero.types && hero.types.length > 0) ? hero.types.join(', ') : langDict.none;
        const localImagePath = getLocalImagePath(hero.image);
        const avatarGlowClass = getColorGlowClass(hero.color);
        const fancyNameHTML = hero.fancy_name ? `<p class="hero-fancy-name">${hero.fancy_name}</p>` : '';

        const detailsHTML = `
            <div class="details-header">
                <h2>${langDict.modalHeroDetails}</h2>
                <div class="details-header-buttons">
                    <button class="favorite-btn" id="favorite-hero-btn" title="${langDict.favoriteButtonTitle}">☆</button>
                    <button class="share-btn" id="share-hero-btn" title="${langDict.shareButtonTitle}">🔗</button>
                    <button class="close-btn" id="hide-details-btn" title="${langDict.closeBtnTitle}">✖</button>
                </div>
            </div>
            
            <div class="hero-title-block">
                ${nameBlockHTML}
                ${fancyNameHTML}
            </div>
            
            <div class="details-body">
                <div class="details-top-left">
                    <img src="${localImagePath}" class="hero-image-modal ${avatarGlowClass}" alt="${hero.name}">
                </div>
                <div class="details-top-right">
                     <div class="details-info-line">
                        ${hero.class ? `<span class="hero-info-block">🎓 ${hero.class}</span>` : ''}
                        ${hero.source ? `<span class="hero-info-block">🌍 ${hero.source}</span>` : ''}
                        ${heroSkin ? `<span class="hero-info-block">👕 ${langDict.modalSkin} ${heroSkin}</span>` : ''}
                        ${hero.AetherPower ? `<span class="hero-info-block">⏫ ${hero.AetherPower}</span>` : ''}
                        ${hero['Release date'] ? `<span class="hero-info-block">📅 ${hero['Release date']}</span>` : ''}
                    </div>
                    
                    <h3>${langDict.modalCoreStats}</h3>
                    <div class="details-stats-grid">
                        <div><p class="metric-value-style">💪 ${hero.power || 0}</p></div>
                        <div><p class="metric-value-style">⚔️ ${hero.attack || 0}</p></div>
                        <div><p class="metric-value-style">🛡️ ${hero.defense || 0}</p></div>
                        <div><p class="metric-value-style">❤️ ${hero.health || 0}</p></div>
                    </div>
                </div>
            </div>
            
            <div class="details-bottom-section">
                <h3>${langDict.modalSkillDetails}</h3>
                
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalSkillName} <span class="skill-value">${hero.skill && hero.skill !== 'nan' ? hero.skill : langDict.none}</span></p>
                    <p class="uniform-style">${langDict.modalSpeed} <span class="skill-value">${hero.speed || langDict.none}</span></p>
                    <p class="uniform-style">${langDict.modalSkillType} <span class="skill-value">${heroTypesContent}</span></p>
                </div>

                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalSpecialSkill}</p>
                    <ul class="skill-list">${renderListAsHTML(hero.effects)}</ul>
                </div>
                
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalPassiveSkill}</p>
                    <ul class="skill-list">${renderListAsHTML(hero.passives)}</ul>
                </div>
                
                ${familyBonus.length > 0 ? `
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalFamilyBonus(translatedFamily || hero.family)}</p>
                    <ul class="skill-list">${renderListAsHTML(familyBonus)}</ul>
                </div>` : ''}
            </div>
            
            <div class="modal-footer">
                <button class="close-bottom-btn" id="hide-details-bottom-btn">${langDict.detailsCloseBtn}</button>
            </div>`;
        modalContent.innerHTML = detailsHTML;

        const favoriteBtn = document.getElementById('favorite-hero-btn');
        const shareBtn = document.getElementById('share-hero-btn');

        if (!hero.english_name) {
            favoriteBtn.style.display = 'none';
            shareBtn.style.display = 'none'; // 如果没有英文名，也隐藏分享按钮
        } else {
            const updateFavoriteButton = () => {
                if (isFavorite(hero)) {
                    favoriteBtn.textContent = '★';
                    favoriteBtn.classList.add('favorited');
                } else {
                    favoriteBtn.textContent = '☆';
                    favoriteBtn.classList.remove('favorited');
                }
            };

            favoriteBtn.addEventListener('click', () => {
                toggleFavorite(hero);
                updateFavoriteButton();
                // Also update the star in the main table
                const tableStar = document.querySelector(`.favorite-toggle-icon[data-hero-id="${hero.originalIndex}"]`);
                if (tableStar) {
                    if (isFavorite(hero)) {
                        tableStar.textContent = '★';
                        tableStar.classList.add('favorited');
                    } else {
                        tableStar.textContent = '☆';
                        tableStar.classList.remove('favorited');
                    }
                }
                if (filterInputs.releaseDateType.value === 'favorites') {
                    applyFiltersAndRender();
                }
            });
            updateFavoriteButton();

            shareBtn.addEventListener('click', () => {
                const identifier = `${hero.english_name}-${hero.costume_id}`;
                const url = `${window.location.origin}${window.location.pathname}?view=${encodeURIComponent(identifier)}&lang=${currentLang}`;
                navigator.clipboard.writeText(url).then(() => {
                    const originalContent = shareBtn.innerHTML;
                    shareBtn.innerText = '✅';
                    shareBtn.disabled = true;
                    setTimeout(() => {
                        shareBtn.innerHTML = originalContent;
                        shareBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy URL: ', err);
                    alert('Failed to copy link.');
                });
            });
        }

        document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
        document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);
    }

    // --- 事件监听器绑定 ---
    // --- 事件监听器绑定 ---
    function addEventListeners() {
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', toggleTheme);
        }

        if (langSelectBtn) {
            langSelectBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                langOptions.classList.toggle('hidden');
            });
        }
        if (langOptions) {
            langOptions.addEventListener('click', (event) => {
                event.preventDefault();
                const target = event.target;
                if (target.classList.contains('lang-option')) {
                    const newLang = target.getAttribute('data-lang');
                    if (newLang && newLang !== currentLang) {
                        changeLanguage(newLang);
                    }
                }
            });
        }
        document.addEventListener('click', () => {
            if (langOptions && !langOptions.classList.contains('hidden')) {
                langOptions.classList.add('hidden');
            }
        });


        for (const key in filterInputs) {
            if (filterInputs[key]) {
                filterInputs[key].addEventListener('input', () => {
                    if (key === 'releaseDateType') {
                        temporaryFavorites = null;
                    }
                    applyFiltersAndRender();
                });
            }
        }
        if (modalOverlay) modalOverlay.addEventListener('click', closeDetailsModal);

        if (resultsTable) {
            const tbody = resultsTable.querySelector('tbody');
            if (tbody) {
                tbody.addEventListener('click', (event) => {
                    const target = event.target;
                    // Handle quick favorite toggle from table
                    if (target.classList.contains('favorite-toggle-icon')) {
                        event.stopPropagation();
                        const heroId = parseInt(target.dataset.heroId, 10);
                        const hero = allHeroes.find(h => h.originalIndex === heroId);
                        if (hero) {
                            const wasFavorited = isFavorite(hero);
                            toggleFavorite(hero);
                            const isNowFavorite = !wasFavorited;

                            target.textContent = isNowFavorite ? '★' : '☆';
                            target.classList.toggle('favorited', isNowFavorite);

                            if (filterInputs.releaseDateType.value === 'favorites') {
                                if (temporaryFavorites !== null && !isNowFavorite) {
                                    const identifier = `${hero.english_name}-${hero.costume_id}`;
                                    const index = temporaryFavorites.indexOf(identifier);
                                    if (index > -1) {
                                        temporaryFavorites.splice(index, 1);
                                    }
                                }
                                applyFiltersAndRender();
                            }
                        }
                    }
                    // Handle opening details modal
                    else {
                        const row = target.closest('.table-row');
                        if (row) {
                            const heroId = parseInt(row.dataset.heroId, 10);
                            const selectedHero = allHeroes.find(h => h.originalIndex === heroId);
                            if (selectedHero) { openDetailsModal(selectedHero); }
                        }
                    }
                });
            }
            const thead = resultsTable.querySelector('thead');
            if (thead) {
                thead.addEventListener('click', (event) => {
                    const header = event.target.closest('th.sortable');
                    if (header) {
                        const sortKey = header.dataset.sortKey;
                        if (currentSort.key === sortKey) {
                            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                        } else {
                            currentSort.key = sortKey;
                            const numericKeys = ['power', 'attack', 'defense', 'health', 'star'];
                            currentSort.direction = numericKeys.includes(sortKey) ? 'desc' : 'asc';
                        }
                        applyFiltersAndRender();
                    }
                });
            }
        }
        if (openFiltersBtn) openFiltersBtn.addEventListener('click', openFiltersModal);
        if (closeFiltersModalBtn) closeFiltersModalBtn.addEventListener('click', closeFiltersModal);
        if (filtersModalOverlay) filtersModalOverlay.addEventListener('click', closeFiltersModal);

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                temporaryFavorites = null;
                for (const key in filterInputs) {
                    const element = filterInputs[key];
                    const noneText = i18n[currentLang].none;
                    if (element.tagName === 'SELECT') {
                        element.value = element.id === 'release-date-type' ? 'all' : noneText;
                    } else { element.value = ''; }
                }
                applyFiltersAndRender();
            });
        }

        if (openFavoritesBtn) {
            openFavoritesBtn.addEventListener('click', () => {
                temporaryFavorites = null;
                filterInputs.releaseDateType.value = 'favorites';
                applyFiltersAndRender();
            });
        }

        if (shareFavoritesBtn) {
            shareFavoritesBtn.addEventListener('click', () => {
                const favorites = getFavorites();
                if (favorites.length === 0) {
                    alert('No favorites to share.');
                    return;
                }
                const favString = favorites.join(',');
                // 使用 lz-string 库进行压缩
                const compressedFavs = LZString.compressToEncodedURIComponent(favString);
                // 使用新的参数名 zfavs (zipped favorites)
                const url = `${window.location.origin}${window.location.pathname}?zfavs=${compressedFavs}&lang=${currentLang}`;

                navigator.clipboard.writeText(url).then(() => {
                    const originalText = shareFavoritesBtn.innerText;
                    shareFavoritesBtn.innerText = i18n[currentLang].shareFavoritesCopied || 'List Copied!';
                    shareFavoritesBtn.disabled = true;
                    setTimeout(() => {
                        shareFavoritesBtn.innerText = originalText;
                        shareFavoritesBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy favorites link: ', err);
                });
            });
        }

        document.querySelectorAll('#filters-modal .filter-header').forEach(header => {
            header.addEventListener('click', function (event) {
                if (event.target.classList.contains('toggle-button')) { return; }
                const toggleButton = this.querySelector('.toggle-button');
                if (toggleButton) { toggleButton.click(); }
            });
        });
        document.querySelectorAll('#filters-modal .toggle-button').forEach(button => {
            button.addEventListener('click', function () {
                const targetId = this.dataset.target;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.classList.toggle('collapsed');
                    this.classList.toggle('expanded');
                    const currentState = targetElement.classList.contains('collapsed') ? 'expanded' : 'collapsed';
                    setCookie(targetId + '_state', currentState, 365);
                }
            });
        });
        window.addEventListener('popstate', function (event) {
            if (modal) modal.classList.add('hidden');
            if (modalOverlay) modalOverlay.classList.add('hidden');
            if (filtersModal) filtersModal.classList.add('hidden');
            if (filtersModalOverlay) filtersModalOverlay.classList.add('hidden');
            document.body.classList.remove('modal-open');
        });

        window.addEventListener('resize', adjustStickyHeaders);
    }
    // --- 应用初始化 ---
    async function initializeApp() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewHeroFromUrl = urlParams.get('view');
        const langFromUrl = urlParams.get('lang');
        const favsFromUrl = urlParams.get('favs');
        const languageCookie = getCookie('language');

        let langToUse = 'cn'; // Default language

        if (languageCookie && i18n[languageCookie]) {
            langToUse = languageCookie;
        } else if (langFromUrl && i18n[langFromUrl]) {
            langToUse = langFromUrl;
        } else {
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.includes('en')) {
                langToUse = 'en';
            } else if (browserLang.includes('zh-tw') || browserLang.includes('zh-hk')) {
                langToUse = 'tc';
            }
        }
        applyLanguage(langToUse);

        const dataLoaded = await loadData(currentLang);
        if (dataLoaded) {
            allHeroes.forEach((hero, index) => {
                hero.originalIndex = index;
                hero.english_name = extractEnglishName(hero);
            });

            populateFilters();

            if (favsFromUrl) {
                try {
                    const favIdentifiers = decodeURIComponent(favsFromUrl).split(',');
                    temporaryFavorites = favIdentifiers; // Store as temporary list
                    filterInputs.releaseDateType.value = 'favorites';
                } catch (e) {
                    console.error("Failed to process favorites from URL", e);
                }
            }

            addEventListeners();
            applyFiltersAndRender();
            loadFilterStates();

            if (viewHeroFromUrl && !favsFromUrl) {
                const targetHero = allHeroes.find(h => {
                    if (!h.english_name) return false;
                    const identifier = `${h.english_name}-${h.costume_id}`;
                    return identifier === viewHeroFromUrl;
                });

                if (targetHero) {
                    openDetailsModal(targetHero);
                }
            }

            setTimeout(adjustStickyHeaders, 100);
        }

        if (pageLoader) {
            pageLoader.classList.add('hidden');
        }
        document.body.classList.remove('js-loading');
    }

    // --- 启动 ---
    initializeApp();
});