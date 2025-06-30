document.addEventListener('DOMContentLoaded', function () {
    // --- 全局變量 ---
    let farmGuideScrollHandler = null;
    let filteredHeroes = [];
    let allHeroes = [];
    let families_bonus = [];
    let family_values = {};
    let currentLang = 'cn';
    let currentSort = { key: 'power', direction: 'desc' };
    let temporaryFavorites = null; // 用于临时存储分享的收藏列表
    let modalStack = []; // 新增：用于管理模态框堆栈
    let temporaryDateFilter = null; // 新增: 用于一键日期筛选
    let isWantedMissionView = false; // 新增: 用于跟踪是否显示通缉任务表
    let isFarmingGuideView = false; // 新增: 用于跟踪是否显示材料指南
    

    // 新增: 定义硬编码的日期
    const oneClickMaxDate = '2025-06-29';
    const purchaseCostumeDate = '2025-07-28';


    // 新增：根据翻译表，自动生成反向映射表（用于从中文查找英文）
    const reverseSkillTypeMap_cn = Object.fromEntries(Object.entries(skillTypeTranslations_cn).map(([key, value]) => [value, key]));
    const reverseSkillTypeMap_tc = Object.fromEntries(Object.entries(skillTypeTranslations_tc).map(([key, value]) => [value, key]));

    // 新增: 通缉任务表数据
    const wantedMissionData = [
        { season: 'S1', daily: '7-4', red: '4-1', green: '7-5', blue: '8-7', purple: '7-4', yellow: '10-6' },
        { season: 'S2', daily: ['4-3', '7-1'], red: '3-8', green: '7-1', blue: '8-10', purple: '21-10', yellow: ['13-1', '9-5'] },
        { season: 'S3', daily: '9-8', red: '6-2', green: ['4-8', '30-6'], blue: '9-8', purple: '17-9', yellow: '8-6' },
        { season: 'S4', daily: '6-10', red: ['12-6', '32-6'], green: '9-2', blue: ['8-2', '30-7'], purple: '14-8', yellow: '4-7' },
        { season: 'S5', daily: ['5-10', '6-10'], red: '2-9', green: ['10-8', '30-8'], blue: '22-2', purple: '5-10', yellow: '16-8' },
        { season: 'S6', daily: '1-26', red: '1-24', green: ['1-11', '1-12'], blue: '3-13', purple: '1-28', yellow: ['2-6', '6-7'] }
    ];

    // 新增: 材料出处指南数据
    const farmingGuideData = [
        { item: "Experience", s1: "23-11", s2: "24-10N\n9-10N E", s3: "22-6N\n21-10H", s4: "10-8N\n23-5H", s5: "10-8N\n10-9H", s6: "2-10N\n6-27H" },
        { item: "Food", s1: "17-1", s2: "27-9H\n27-9H E", s3: "22-6N\n36-1H", s4: "20-10N\n27-1H", s5: "10-8N\n8-10H", s6: "2-10N\n5-17H" },
        { item: "Iron", s1: "17-1", s2: "27-9H\n9-4N E", s3: "22-6N\n27-1H", s4: "22-2N\n15-6H", s5: "10-8N\n10-10H", s6: "2-18N\n6-23H" },
        { item: "Recruits", s1: "8-7", s2: "15-9N\n15-9N E", s3: "16-5N\n27-8H", s4: "23-6N\n2-1H", s5: "18-1N\n9-4H", s6: "1-26N\n3-4H" },
        { item: "Heroes", s1: "8-7", s2: "21-10N\n3-4N E", s3: "16-10N\n17-2H", s4: "15-3N\n2-5H", s5: "1-10N\n2-8H", s6: "2-7N\n2-9H" },
        { item: "Troops", s1: "8-7", s2: "9-10N\n3-4N E", s3: "16-3N\n26-4H", s4: "15-3N\n1-5H", s5: "3-4N\n1-1H", s6: "2-11N\n2-1H" },
        { item: "Adventurer's Kit", s1: "5-8", s2: "1-8H\n1-2N E", s3: "16-4N\n26-4H", s4: "15-3N\n30-3H", s5: "5-6N\n25-8H", s6: "1-14N\n4-7H" },
        { item: "Practice Sword", s1: "4-6", s2: "6-10H\n6-9N E", s3: "16-8N\n16-7H", s4: "20-4N\n2-10H", s5: "29-7N\n29-1H", s6: "2-10N\n5-14H" },
        { item: "Rugged Clothes", s1: "7-7", s2: "4-3H\n4-9N E", s3: "19-5N\n27-1H", s4: "19-4N\n1-2H", s5: "22-1N\n15-8H", s6: "1-17N\n2-18H" },
        { item: "Strong Rope", s1: "6-8", s2: "11-10H\n11-10H E", s3: "23-1N\n29-5H", s4: "20-4N\n2-5H", s5: "11-2N\n35-4H", s6: "1-9N\n1-3H" },
        { item: "Training Manual", s1: "14-9", s2: "14-1H\n14-7N E", s3: "20-5N\n29-6H", s4: "31-1N\n14-1H", s5: "36-6N\n19-2H", s6: "2-18N\n2-15H" },
        { item: "Arcane Scripts", s1: "12-9", s2: "12-6H\n12-6H E", s3: "19-6N\n27-5H", s4: "27-9N\n25-7H", s5: "6-2N\n4-4H", s6: "4-25N\n5-25H" },
        { item: "Dagger", s1: "11-9", s2: "10-10H\n10-4H E", s3: "16-3N\n27-6H", s4: "20-4N\n2-8H", s5: "6-1N\n34-2H", s6: "3-4N\n3-10H" },
        { item: "Leather Armor", s1: "6-8", s2: "8-10H\n8-10N E", s3: "16-4N\n26-6H", s4: "20-4N\n1-3H", s5: "3-7N\n4-3H", s6: "1-3N\n4-8H" },
        { item: "Sharpening Stone", s1: "10-9", s2: "5-10H\n5-3N E", s3: "16-7N\n33-4H", s4: "20-4N\n26-1H", s5: "12-4N\n15-10H", s6: "2-14N\n2-21H" },
        { item: "Wooden Shield", s1: "6-8", s2: "20-10H\n2-7N E", s3: "16-3N\n30-2H", s4: "33-7N\n23-3H", s5: "26-3N\n29-2H", s6: "2-9N\n2-12H" },
        { item: "Battle Manual", s1: "19-9", s2: "15-8H\n7-4N E", s3: "16-7N\n17-2H", s4: "20-4N\n2-3H", s5: "11-6N\n1-3H", s6: "5-17N\n5-15H" },
        { item: "Chainmail Shirt", s1: "23-11", s2: "13-7H\n9-4N E", s3: "16-6N\n26-10H", s4: "21-4N\n13-2H", s5: "5-3N\n7-1H", s6: "3-17N\n5-10H" },
        { item: "Scabbard", s1: "21-9", s2: "24-7H\n3-4N E", s3: "16-4N\n26-8H", s4: "19-5N\n1-4H", s5: "17-8N\n13-8H", s6: "1-15N\n5-28H" },
        { item: "Tall Boots", s1: "18-9", s2: "16-6H\n16-6H E", s3: "16-4N\n16-7H", s4: "20-2N\n24-1H", s5: "31-10N\n6-3H", s6: "5-4N\n2-3H" },
        { item: "Clean Cloth", s1: "5-8", s2: "1-10H\n1-2N E", s3: "16-6N\n26-4H", s4: "31-8N\n26-6H", s5: "3-1N\n20-3H", s6: "2-13N\n3-14H" },
        { item: "Common Herbs", s1: "8-7", s2: "9-10N\n9-4N E", s3: "17-8N\n34-6H", s4: "7-4N\n1-7H", s5: "26-10N\n2-6H", s6: "2-9N\n3-3H" },
        { item: "Crude Iron", s1: "6-8", s2: "12-10H\n12-10N E", s3: "16-7N\n26-9H", s4: "20-4N\n7-9H", s5: "9-2N\n1-3H", s6: "6-10N\n6-20H" },
        { item: "Large Bone", s1: "9-1", s2: "6-10H\n6-9N E", s3: "16-5N\n28-2H", s4: "25-7N\n25-1H", s5: "1-6N\n1-3H", s6: "2-11N\n4-19H" },
        { item: "Leather Strips", s1: "10-9", s2: "3-10H\n3-4N E", s3: "16-6N\n26-4H", s4: "19-8N\n1-8H", s5: "36-7N\n20-10H", s6: "4-3N\n6-9H" },
        { item: "Oil", s1: "10-9", s2: "5-10H\n5-3N E", s3: "16-5N\n27-2H", s4: "26-5N\n23-3H", s5: "11-8N\n9-7H", s6: "1-28N\n2-15H" },
        { item: "String", s1: "7-7", s2: "10-10H\n6-9N E", s3: "20-5N\n33-4H", s4: "31-4N\n22-10H", s5: "27-10N\n32-4H", s6: "5-3N\n5-5H" },
        { item: "Crypt Mushroom", s1: "23-11", s2: "23-6H\n23-6H E", s3: "18-8N\n27-1H", s4: "23-8N\n19-10H", s5: "3-7N\n28-8H", s6: "1-9N\n4-12H" },
        { item: "Crystal Shard", s1: "23-11", s2: "18-6H\n2-10H E", s3: "30-4N\n28-1H", s4: "28-1N\n26-1H", s5: "24-3N\n19-1H", s6: "2-3N\n3-24H" },
        { item: "Firestone", s1: "23-11", s2: "22-4H\n22-4H E", s3: "16-8N\n26-6H", s4: "33-3N\n1-1H", s5: "1-8N\n33-4H", s6: "3-10N\n3-5H" },
        { item: "Metal Ores", s1: "15-9", s2: "11-10H\n3-1H E", s3: "18-6N\n16-2H", s4: "20-3N\n21-1H", s5: "12-6N\n22-6H", s6: "2-12N\n2-15H" },
        { item: "Potent Leaves", s1: "16-9", s2: "19-1H\n19-1H E", s3: "16-7N\n26-4H", s4: "20-4N\n23-5H", s5: "2-2N\n29-7H", s6: "3-13N\n3-16H" },
        { item: "Sunspire Feathers", s1: "18-9", s2: "20-2H\n20-2H E", s3: "16-9N\n28-1H", s4: "27-8N\n2-5H", s5: "18-8N\n1-3H", s6: "2-10N\n2-17H" },
        { item: "Fine Steel", s1: "19-8", s2: "4-3H\n4-9N E", s3: "18-4N\n34-8H", s4: "23-1N\n23-2H", s5: "2-3N\n12-6H", s6: "3-5N\n3-11H" },
        { item: "Grimoire Dust", s1: "20-4", s2: "10-4H\n10-4H E", s3: "16-5N\n27-6H", s4: "20-4N\n14-1H", s5: "2-2N\n23-3H", s6: "2-7N\n6-13H" },
        { item: "Hardwood Lumber", s1: "21-9", s2: "19-1H\n19-1N E", s3: "16-5N\n26-2H", s4: "26-10N\n25-6H", s5: "5-10N\n9-8H", s6: "2-27N\n3-5H" },
        { item: "Midnight Roots", s1: "22-9", s2: "12-6H\n12-6H E", s3: "18-8N\n28-4H", s4: "19-1N\n2-1H", s5: "12-8N\n8-3H", s6: "2-4N\n3-19H" },
        { item: "Dragon Bone", s1: "6-8", s2: "24-7H\n9-4N E", s3: "16-4N\n30-6H", s4: "25-6N\n1-9H", s5: "26-6N\n5-4H", s6: "6-18N\n6-21H" },
        { item: "Meteor Fragments", s1: "9-1", s2: "11-10H\n22-6N E", s3: "16-7N\n16-1H", s4: "21-1N\n1-6H", s5: "1-8N\n30-4H", s6: "2-8N\n2-21H" },
        { item: "Orichalcum Nugget", s1: "5-8", s2: "18-10H\n14-7N E", s3: "16-5N\n26-6H", s4: "20-4N\n1-2H", s5: "9-4N\n6-7H", s6: "2-25N\n2-8H" },
    ];

    // --- DOM 元素 ---
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const langSelectBtn = document.getElementById('lang-select-btn');
    const langOptions = document.getElementById('lang-options');
    const resultsWrapper = document.getElementById('results-wrapper');
    const resultsHeader = document.querySelector('.results-header');
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
    const advancedFilterHelpBtn = document.getElementById('advanced-filter-help-btn');
    const helpModal = document.getElementById('help-modal');
    const helpModalOverlay = document.getElementById('help-modal-overlay');
    const skillTypeHelpBtn = document.getElementById('skill-type-help-btn');
    const skillTypeHelpModal = document.getElementById('skill-type-help-modal');
    const skillTypeHelpModalOverlay = document.getElementById('skill-type-help-modal-overlay');
    const showWantedMissionBtn = document.getElementById('show-wanted-mission-btn');
    const showFarmingGuideBtn = document.getElementById('show-farming-guide-btn');

    // 新增: 获取新日期筛选的DOM元素
    const oneClickMaxDateDisplay = document.getElementById('one-click-max-date-display');
    const purchaseCostumeDateDisplay = document.getElementById('purchase-costume-date-display');
    const filterHero730Btn = document.getElementById('filter-hero-730-btn');
    const filterCostume548Btn = document.getElementById('filter-costume-548-btn');

    const filterInputs = {
        name: document.getElementById('name-input'), star: document.getElementById('star-select'),
        color: document.getElementById('color-select'), speed: document.getElementById('speed-select'),
        class: document.getElementById('class-select'), family: document.getElementById('family-select'),
        source: document.getElementById('source-select'),
        aetherpower: document.getElementById('aetherpower-select'),
        skillTypeSource: document.getElementById('skill-type-source-select'),
        types: document.getElementById('type-input'),
        effects: document.getElementById('effects-input'), passives: document.getElementById('passives-input'),
        power: document.getElementById('power-input'), attack: document.getElementById('attack-input'),
        defense: document.getElementById('defense-input'), health: document.getElementById('health-input'),
        releaseDateType: document.getElementById('release-date-type'),
    };

    // --- 語言和文本管理 ---
    function areFiltersActive() {
        const noneText = i18n[currentLang].none;
        // Check text inputs for any value
        if (filterInputs.name.value.trim() !== '' ||
            filterInputs.types.value.trim() !== '' ||
            filterInputs.effects.value.trim() !== '' ||
            filterInputs.passives.value.trim() !== '' ||
            filterInputs.power.value.trim() !== '' ||
            filterInputs.attack.value.trim() !== '' ||
            filterInputs.defense.value.trim() !== '' ||
            filterInputs.health.value.trim() !== '') {
            return true;
        }

        // Check select inputs against their default "none" value
        if (filterInputs.star.value !== noneText ||
            filterInputs.color.value !== noneText ||
            filterInputs.speed.value !== noneText ||
            filterInputs.class.value !== noneText ||
            filterInputs.family.value !== noneText ||
            filterInputs.source.value !== noneText ||
            filterInputs.aetherpower.value !== noneText) {
            return true;
        }

        // Check the special 'releaseDateType' select against its default 'all' value
        if (filterInputs.releaseDateType.value !== 'all') {
            return true;
        }

        // Check if a shared favorites list is being displayed temporarily
        if (temporaryFavorites !== null) {
            return true;
        }

        // 新增: 检查一键日期筛选是否激活
        if (temporaryDateFilter !== null) {
            return true;
        }

        if (isWantedMissionView || isFarmingGuideView) {
            return true;
        }

        return false;
    }

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
                    if (el.tagName === 'OPTION') {
                        el.textContent = translation;
                    } else {
                        el.innerHTML = translation;
                    }
                }
            }
        });
        document.querySelectorAll('[data-lang-key-placeholder]').forEach(el => {
            const key = el.getAttribute('data-lang-key-placeholder');
            if (langDict[key]) { el.placeholder = langDict[key]; }
        });

        // Set dynamic titles for tooltips
        const titles = {
            'theme-toggle-btn': 'toggleThemeTitle',
            'lang-select-btn': 'toggleLanguageTitle',
            'show-wanted-mission-btn': 'showWantedMissionTitle',
            'open-filters-btn': 'openFiltersTitle',
            'calendar-btn': 'calendarTitle',
            'close-filters-modal-btn': 'closeBtnTitle', // Reusing key
            'advanced-filter-help-btn': 'filterSyntaxTitle',
            'skill-type-help-btn': 'skillTypeSourceHelpTitle',
        };

        for (const id in titles) {
            const element = document.getElementById(id);
            const key = titles[id];
            if (element && langDict[key]) {
                element.title = langDict[key];
            }
        }
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

        // 仅针对“经验拟态兽”的特殊处理，确保不影响其他英雄
        if (heroName.includes('Experience Mimic') || heroName.includes('经验拟态兽') || heroName.includes('經驗模仿怪')) {
            const pattern = /\(([^)]+)\)/; // 找到第一个括号内的内容
            const match = heroName.match(pattern);

            if (match && match[1] && match[1].includes('Experience Mimic')) {
                const baseName = match[1]; // "Experience Mimic"
                const afterParenthesesIndex = heroName.lastIndexOf(')') + 1;
                const suffix = heroName.substring(afterParenthesesIndex).trim();
                const allowedSuffixes = ['ice', 'nature', 'dark', 'holy', 'fire', 'holy'];

                if (suffix && allowedSuffixes.includes(suffix.toLowerCase())) {
                    return `${baseName} ${suffix}`; // 返回 "Experience Mimic Nature" 等
                }
                return baseName; // 如果没有颜色后缀，只返回 "Experience Mimic"
            }
        }

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
            // 恢复为对所有视图都生效的单一逻辑
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
        modalStack.push('details');
    }
    function closeDetailsModal() { if (!modal.classList.contains('hidden')) { history.back(); } }

    function openFiltersModal() {
        filtersModal.classList.remove('hidden');
        filtersModalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'filters' }, null);
        modalStack.push('filters');
    }
    function closeFiltersModal() { if (!filtersModal.classList.contains('hidden')) { history.back(); } }

    function openHelpModal() {
        renderHelpModalContent(helpModal, 'filterHelpTitle', 'filterHelpIntro', ['filterHelpAnd', 'filterHelpOr', 'filterHelpNot', 'filterHelpGroup', 'filterHelpExample']);
        helpModal.classList.add('stacked-modal');
        helpModalOverlay.classList.add('stacked-modal-overlay');
        helpModal.classList.remove('hidden');
        helpModalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'help' }, null);
        modalStack.push('help');
    }

    function closeHelpModal() {
        if (!helpModal.classList.contains('hidden')) {
            history.back();
        }
    }

    function openSkillTypeHelpModal() {
        renderHelpModalContent(skillTypeHelpModal, 'skillTypeHelpTitle', null, ['skillTypeHelpContent']);
        skillTypeHelpModal.classList.add('stacked-modal');
        skillTypeHelpModalOverlay.classList.add('stacked-modal-overlay');
        skillTypeHelpModal.classList.remove('hidden');
        skillTypeHelpModalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'skillTypeHelp' }, null);
        modalStack.push('skillTypeHelp');
    }

    function closeSkillTypeHelpModal() {
        if (!skillTypeHelpModal.classList.contains('hidden')) {
            history.back();
        }
    }

    function renderHelpModalContent(modalElement, titleKey, introKey, listKeys) {
        const langDict = i18n[currentLang];
        const introHTML = introKey ? `<p>${langDict[introKey]}</p>` : '';
        const listHTML = listKeys.map(key => langDict[key] || '').join('');

        const contentHTML = `
            <h3>${langDict[titleKey]}</h3>
            ${introHTML}
            <ul>
                ${listHTML}
            </ul>
            <div class="modal-footer">
                <button class="close-bottom-btn" id="close-${modalElement.id}-btn">${langDict.detailsCloseBtn}</button>
            </div>
        `;
        modalElement.innerHTML = contentHTML;
        document.getElementById(`close-${modalElement.id}-btn`).addEventListener('click', () => {
            if (modalElement === helpModal) closeHelpModal();
            if (modalElement === skillTypeHelpModal) closeSkillTypeHelpModal();
        });
    }

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

    function matchesComplexQuery(data, query) {
        if (!query) return true;
        if (!data || (Array.isArray(data) && data.length === 0)) return false;

        const lowerCaseQuery = query.toLowerCase();
        const dataAsArray = Array.isArray(data)
            ? data.map(item => String(item || '').toLowerCase())
            : [String(data || '').toLowerCase()];

        // 核心解析函数（完全重构）
        function evaluate(expr, text) {
            expr = expr.trim();
            if (!expr) return true;

            // 1. 处理最外层括号（强制单句整体匹配）
            if (expr.startsWith('(') && expr.endsWith(')')) {
                let balance = 0;
                let validOuter = true;
                for (let i = 1; i < expr.length - 1; i++) {
                    if (expr[i] === '(') balance++;
                    if (expr[i] === ')') balance--;
                    if (balance < 0) {
                        validOuter = false;
                        break;
                    }
                }
                if (validOuter && balance === 0) {
                    return evaluate(expr.substring(1, expr.length - 1), text);
                }
            }

            // 2. 处理OR运算符（|）优先级最低
            let balance = 0;
            for (let i = 0; i < expr.length; i++) {
                const char = expr[i];
                if (char === '(') balance++;
                if (char === ')') balance--;
                if (char === '|' && balance === 0) {
                    const left = expr.substring(0, i);
                    const right = expr.substring(i + 1);
                    return evaluate(left, text) || evaluate(right, text);
                }
            }

            // 3. 处理AND运算符（空格）优先级高于OR
            const andTerms = [];
            let currentTerm = '';
            balance = 0;
            for (let i = 0; i <= expr.length; i++) {
                const char = expr[i];
                // 在括号平衡且遇到空格时拆分AND项
                if (i === expr.length || (/\s/.test(char) && balance === 0)) {
                    if (currentTerm) {
                        andTerms.push(currentTerm);
                        currentTerm = '';
                    }
                } else {
                    if (char === '(') balance++;
                    if (char === ')') balance--;
                    currentTerm += char;
                }
            }
            if (currentTerm) andTerms.push(currentTerm);

            if (andTerms.length > 1) {
                // 所有AND项必须同时满足
                return andTerms.every(term => evaluate(term, text));
            }

            // 4. 处理NOT运算符（!）优先级最高
            if (expr.startsWith('!')) {
                const term = expr.substring(1).trim();
                return !text.includes(term);
            }

            // 基础匹配：纯文本直接检查包含关系
            return text.includes(expr);
        }

        // 启用分行匹配的条件：查询包含括号（强制单句匹配）
        const usePerLineSearch = /[()]/.test(lowerCaseQuery);
        return usePerLineSearch
            ? dataAsArray.some(line => evaluate(lowerCaseQuery, line))
            : evaluate(lowerCaseQuery, dataAsArray.join(' '));
    }

    

    function applyFiltersAndRender() {
        if (isWantedMissionView) {
            if (resultsTable) {
                resultsTable.classList.add('wanted-mission-table');
                resultsTable.classList.remove('farming-guide-table');
            }
            renderWantedMissionTable();
            return;
        }

        if (isFarmingGuideView) {
            if (resultsTable) {
                resultsTable.classList.remove('wanted-mission-table');
                resultsTable.classList.add('farming-guide-table');
            }
            renderFarmingGuideTable();
            return;
        }

        if (resultsTable) {
            resultsTable.classList.remove('wanted-mission-table', 'farming-guide-table');
        }

        const filters = Object.fromEntries(Object.entries(filterInputs).map(([key, el]) => [key, el.value.trim()]));
        const noneValue = i18n[currentLang].none.toLowerCase();

        const favoritesListToUse = temporaryFavorites !== null ? temporaryFavorites : getFavorites();

        filteredHeroes = allHeroes.filter(hero => {
            // Step 1: Determine if the hero matches the base filter type (Favorites, Hero, Costume, or All)
            let matchesBaseFilter = false;
            const releaseDateType = filters.releaseDateType.toLowerCase();

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

            // Step 2: Apply all other filters if the base type matches
            const lowerCaseName = hero.name.toLowerCase();
            if (filters.name && !lowerCaseName.includes(filters.name.toLowerCase())) return false;

            // MODIFIED: Sanitize effects text before matching
            if (filters.effects) {
                const sanitizedEffects = Array.isArray(hero.effects)
                    ? hero.effects.map(p => String(p || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim())
                    : [String(hero.effects || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim()];
                if (!matchesComplexQuery(sanitizedEffects, filters.effects)) return false;
            }

            if (filters.passives) {
                // MODIFIED: When filtering, also ignore all punctuation and symbols from the hero's data
                const sanitizedPassives = Array.isArray(hero.passives)
                    ? hero.passives.map(p => String(p || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim())
                    : [String(hero.passives || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim()];
                if (!matchesComplexQuery(sanitizedPassives, filters.passives)) return false;
            }

            if (filters.types) {
                let skillTypesToSearch = [];
                const source = filters.skillTypeSource;
                if (source === 'heroplan') {
                    skillTypesToSearch = hero.types || [];
                } else if (source === 'nynaeve') {
                    skillTypesToSearch = hero.skill_types || [];
                } else { // 'both'
                    skillTypesToSearch = [...(hero.types || []), ...(hero.skill_types || [])];
                }
                if (!matchesComplexQuery(skillTypesToSearch, filters.types)) return false;
            }

            if (filters.star.toLowerCase() !== noneValue && String(hero.star) !== filters.star) return false;
            if (filters.color.toLowerCase() !== noneValue && String(hero.color).toLowerCase() !== filters.color.toLowerCase()) return false;
            if (filters.speed.toLowerCase() !== noneValue && String(hero.speed).toLowerCase() !== filters.speed.toLowerCase()) return false;
            if (filters.class.toLowerCase() !== noneValue && String(hero.class).toLowerCase() !== filters.class.toLowerCase()) return false;
            if (filters.family.toLowerCase() !== noneValue && String(hero.family).toLowerCase() !== filters.family.toLowerCase()) return false;
            if (filters.source.toLowerCase() !== noneValue && String(hero.source).toLowerCase() !== filters.source.toLowerCase()) return false;
            if (filters.aetherpower.toLowerCase() !== noneValue && String(hero.AetherPower).toLowerCase() !== filters.aetherpower.toLowerCase()) return false;

            // MODIFIED: 新增一键日期筛选逻辑
            if (temporaryDateFilter) {
                if (!hero['Release date']) return false;
                const releaseDate = new Date(hero['Release date']);
                if (isNaN(releaseDate.getTime())) return false;
                const baseDate = new Date(temporaryDateFilter.base);
                baseDate.setHours(0, 0, 0, 0);
                releaseDate.setHours(0, 0, 0, 0);
                const diffTime = baseDate - releaseDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < temporaryDateFilter.days) return false;
            }

            if (Number(filters.power) > 0 && Number(hero.power) < Number(filters.power)) return false;
            if (Number(filters.attack) > 0 && Number(hero.attack) < Number(filters.attack)) return false;
            if (Number(filters.defense) > 0 && Number(hero.defense) < Number(filters.defense)) return false;
            if (Number(filters.health) > 0 && Number(hero.health) < Number(filters.health)) return false;

            // If it passes all filters, keep the hero
            return true;
        });


        // Sorting logic remains the same
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

        const langDict = i18n[currentLang];

        // START: 新增逻辑，用于判断表头星星的显示状态
        const heroesToProcess = heroes.filter(h => h.english_name);
        const favoritedCount = heroesToProcess.filter(isFavorite).length;

        // 如果可收藏的英雄数量大于0，并且已收藏的数量小于总数，则代表下一次操作是“全部收藏”
        const shouldPredictFavoriteAll = heroesToProcess.length > 0 && favoritedCount < heroesToProcess.length;

        const favHeaderIcon = shouldPredictFavoriteAll ? '★' : '☆';
        const favHeaderClass = shouldPredictFavoriteAll ? 'favorited' : '';
        // END: 新增逻辑

        if (resultsCountEl) {
            const filtersAreActive = areFiltersActive();
            if (filtersAreActive) {
                resultsCountEl.innerHTML = `<span>${langDict.resultsCountTextFiltered(heroes.length)}</span>`;
                const resetTag = document.createElement('span');
                resetTag.className = 'reset-tag';
                resetTag.textContent = langDict.resultsReset;
                resetTag.onclick = (e) => {
                    e.preventDefault();
                    if (resetFiltersBtn) resetFiltersBtn.click();
                };
                resultsCountEl.appendChild(resetTag);
            } else {
                resultsCountEl.innerHTML = `<span>${langDict.resultsCountTextUnfiltered(heroes.length)}</span>`;
            }
        }

        const headers = {
            fav: favHeaderIcon, // 使用动态计算出的图标
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

            if (key === 'fav') {
                // 为收藏列的表头应用动态的class和图标
                return `<th class="col-fav favorite-all-header ${favHeaderClass}" title="${langDict.favHeaderTitle}">${headerText}</th>`;
            }
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
                let content = '';
                if (key === 'types') {
                    const source = filterInputs.skillTypeSource.value;
                    let typesToShow = [];
                    if (source === 'heroplan') {
                        typesToShow = hero.types ? [...hero.types] : [];
                        typesToShow.sort((a, b) => a.localeCompare(b));
                    } else if (source === 'nynaeve') {
                        typesToShow = hero.skill_types ? [...hero.skill_types] : [];

                        // ** MODIFIED: Nynaeve 技能排序逻辑修改 **
                        const reverseMap = currentLang === 'tc' ? reverseSkillTypeMap_tc : reverseSkillTypeMap_cn;
                        typesToShow.sort((a, b) => {
                            // 如果是中文环境，先通过反向映射表找到对应的英文原文
                            const englishA = (currentLang !== 'en' && reverseMap[a]) ? reverseMap[a] : a;
                            const englishB = (currentLang !== 'en' && reverseMap[b]) ? reverseMap[b] : b;

                            // 使用英文原文在标准排序数组中查找位置
                            const indexA = nynaeveSkillTypeOrder.indexOf(englishA);
                            const indexB = nynaeveSkillTypeOrder.indexOf(englishB);

                            // 如果两个都能在标准排序中找到，按标准排序
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                            // 如果只有 A 找到，A排前面
                            if (indexA !== -1) return -1;
                            // 如果只有 B 找到，B排前面
                            if (indexB !== -1) return 1;
                            // 如果都找不到，按本地化语言默认排序
                            return a.localeCompare(b);
                        });

                    } else { // 'both'
                        const allTypes = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
                        typesToShow = allTypes;
                        typesToShow.sort((a, b) => a.localeCompare(b));
                    }
                    content = typesToShow.join(', ');
                } else {
                    content = hero[key] || '';
                }


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
                if (Array.isArray(content) && key !== 'types') content = content.join(', ');
                return `<td class="col-${key}">${content}</td>`;
            }).join('');
            return `<tr class="table-row" data-hero-id="${hero.originalIndex}">${cellsHTML}</tr>`;
        }).join('');

        tbody.innerHTML = rowsHTML;

        if (resultsWrapper) {
            resultsWrapper.scrollTop = 0;
        }
        adjustStickyHeaders();
        if (resultsWrapper && resultsHeader && farmGuideScrollHandler) {
            resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            farmGuideScrollHandler = null;
            // 重置整个标题栏的 transform
            resultsHeader.style.transform = '';
        }
    }

    function renderWantedMissionTable() {
        if (!resultsTable) return;
        const langDict = i18n[currentLang];

        if (resultsCountEl) {
            resultsCountEl.innerHTML = `<span>${langDict.wantedMissionTableTitle}</span>`;
            const resetTag = document.createElement('span');
            resetTag.className = 'reset-tag';
            // MODIFIED: 将按钮文本从“重置”改为“返回列表”
            resetTag.textContent = langDict.returnToList;
            resetTag.onclick = (e) => {
                e.preventDefault();
                resetToHeroListView();
            };
            resultsCountEl.appendChild(resetTag);
        }

        const headers = {
            season: '',
            daily: 'imgs/farm/wanted_normal.png',
            red: 'imgs/farm/wanted_red.png',
            green: 'imgs/farm/wanted_green.png',
            blue: 'imgs/farm/wanted_blue.png',
            purple: 'imgs/farm/wanted_purple.png',
            yellow: 'imgs/farm/wanted_yellow.png'
        };

        let thead = resultsTable.querySelector('thead');
        if (!thead) {
            thead = document.createElement('thead');
            resultsTable.appendChild(thead);
        }
        thead.innerHTML = '<tr>' + Object.keys(headers).map(key => {
            const headerValue = headers[key];
            if (key === 'season') {
                return `<th></th>`;
            }
            return `<th><img src="${headerValue}" alt="${key}" style="height: 32px; vertical-align: middle;"></th>`;
        }).join('') + '</tr>';

        let tbody = resultsTable.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            resultsTable.appendChild(tbody);
        }

        const rowsHTML = wantedMissionData.map(row => {
            const cellsHTML = Object.keys(headers).map(key => {
                const value = row[key];
                const colorMap = { red: 'var(--hero-color-red)', green: 'var(--hero-color-green)', blue: 'var(--hero-color-blue)', purple: 'var(--hero-color-purple)', yellow: 'var(--hero-color-yellow)' };
                const style = colorMap[key] ? `style="color: ${colorMap[key]}; font-weight: bold;"` : '';

                if (Array.isArray(value)) {
                    return `<td ${style}>${value.join('<br>')}</td>`;
                }
                return `<td ${style}>${value}</td>`;
            }).join('');
            return `<tr>${cellsHTML}</tr>`;
        }).join('');

        tbody.innerHTML = rowsHTML;

        if (resultsWrapper) {
            resultsWrapper.scrollTop = 0;
        }
        adjustStickyHeaders();
        if (resultsWrapper && resultsHeader && farmGuideScrollHandler) {
            resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            farmGuideScrollHandler = null;
            resultsHeader.style.transform = '';
        }
    }

    // 新增：通用的高亮主函数
    function applyHighlight(cell) {
        if (!isFarmingGuideView || !cell) return;

        // 在应用新的高亮前，总是先清除旧的
        clearFarmGuideHighlight();

        const row = cell.parentElement;
        const table = row.closest('table');
        const colIndex = cell.dataset.colIndex;

        // 1. 高亮当前单元格
        cell.classList.add('highlight-cell');

        // 2. 高亮对应的表头
        const header = table.querySelector(`thead th[data-col-index="${colIndex}"]`);
        if (header) {
            header.classList.add('highlight-axis');
        }

        // 3. 高亮对应的行头
        const rowLabel = row.querySelector('td:first-child');
        if (rowLabel) {
            rowLabel.classList.add('highlight-axis');
        }
    }

    function handleFarmGuideHover(event) {
        if (!isFarmingGuideView) return;
        // 调用新的主高亮函数
        applyHighlight(event.target.closest('td'));
    }

    function clearFarmGuideHighlight() {
        if (!resultsTable) return;
        // 同时清除两种高亮类
        document.querySelectorAll('.highlight-axis, .highlight-cell').forEach(el => {
            el.classList.remove('highlight-axis', 'highlight-cell');
        });
    }

    function renderFarmingGuideTable() {
        if (!resultsTable) return;

        const langDict = i18n[currentLang];

        if (resultsCountEl) {
            resultsCountEl.innerHTML = `<span>${langDict.farmingGuideTableTitle}</span>`;
            const resetTag = document.createElement('span');
            resetTag.className = 'reset-tag';
            // MODIFIED: 将按钮文本从“重置”改为“返回列表”
            resetTag.textContent = langDict.returnToList;
            resetTag.onclick = (e) => {
                e.preventDefault();
                resetToHeroListView();
            };
            resultsCountEl.appendChild(resetTag);
        }

        const headers = {
            item: '', s1: 'S1', s2: 'S2', s3: 'S3', s4: 'S4', s5: 'S5', s6: 'S6'
        };
        const headerKeys = Object.keys(headers);

        let thead = resultsTable.querySelector('thead');
        if (!thead) {
            thead = document.createElement('thead');
            resultsTable.appendChild(thead);
        }
        thead.innerHTML = '<tr>' + headerKeys.map((key, index) => `<th data-col-index="${index}">${headers[key]}</th>`).join('') + '</tr>';

        let tbody = resultsTable.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            resultsTable.appendChild(tbody);
        }

        tbody.innerHTML = farmingGuideData.map((row, rowIndex) => {
            const cellsHTML = headerKeys.map((key, colIndex) => {
                let value = row[key] || '';
                if (key === 'item') {
                    const imagePath = `imgs/farm/${value}.png`;
                    return `<td data-col-index="${colIndex}"><img src="${imagePath}" alt="${value}" class="farm-item-image"></td>`;
                }
                if (typeof value === 'string') {
                    value = value.replace(/\n/g, '<br>');
                }
                return `<td data-col-index="${colIndex}">${value}</td>`;
            }).join('');
            return `<tr data-row-index="${rowIndex}">${cellsHTML}</tr>`;
        }).join('');

        if (resultsTable.querySelector('tbody')) {
            if (window.innerWidth < 769) {
                resultsTable.querySelector('tbody').addEventListener('click', event => {
                    if (!isFarmingGuideView) return;
                    const cell = event.target.closest('td');
                    if (!cell || !cell.dataset.colIndex) {
                        clearFarmGuideHighlight();
                        return;
                    }
                    applyHighlight(cell);
                });
            } else {
                resultsTable.querySelector('tbody').addEventListener('mouseover', handleFarmGuideHover);
                resultsTable.querySelector('tbody').addEventListener('mouseout', clearFarmGuideHighlight);
            }
        }

        if (resultsWrapper) {
            resultsWrapper.scrollTop = 0;
            const stickyLeftCells = document.querySelectorAll('.manual-table.farming-guide-table td.sticky-left, .manual-table.farming-guide-table th.sticky-left');
            resultsWrapper.addEventListener('scroll', () => {
                if (resultsWrapper.scrollLeft > 0) {
                    stickyLeftCells.forEach(cell => cell.classList.add('right-border-visible'));
                } else {
                    stickyLeftCells.forEach(cell => cell.classList.remove('right-border-visible'));
                }
            });
        }
        adjustStickyHeaders();
        if (resultsWrapper && resultsHeader) {
            if (farmGuideScrollHandler) {
                resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            }
            farmGuideScrollHandler = () => {
                resultsHeader.style.transform = `translateX(${resultsWrapper.scrollLeft}px)`;
            };
            resultsWrapper.addEventListener('scroll', farmGuideScrollHandler);
        }
    }

    function getLocalImagePath(url) {
        if (!url || typeof url !== 'string') return '';
        try {
            const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            return 'imgs/heroes/' + filename;
        } catch (e) { return ''; }
    }
    /**
         * 兼容性后备方案：使用 document.execCommand 复制文本
         * @param {string} text 要复制的文本
         * @returns {boolean} 是否复制成功
         */
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // 避免在页面上可见或引起滚动
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
     * 统一的、兼容性强的文本复制函数
     * @param {string} text 要复制的文本
     * @returns {Promise<void>} 成功时 resolve，失败时 reject
     */
    function copyTextToClipboard(text) {
        return new Promise((resolve, reject) => {
            // 优先使用现代的、安全的 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(() => {
                    // 如果现代 API 失败（例如在某些 WebView 中），尝试后备方案
                    if (fallbackCopyTextToClipboard(text)) {
                        resolve();
                    } else {
                        reject(new Error('Fallback copy command failed.'));
                    }
                });
            } else {
                // 如果现代 API 不可用，直接使用后备方案
                if (fallbackCopyTextToClipboard(text)) {
                    resolve();
                } else {
                    reject(new Error('Clipboard API not available and fallback failed.'));
                }
            }
        });
    }

    function renderDetailsInModal(hero) {
        const langDict = i18n[currentLang];

        // MODIFIED: This function now handles 'effects', 'passives', or null filter types
        const renderListAsHTML = (itemsArray, filterType = null) => {
            if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return `<li>${langDict.none}</li>`;

            return itemsArray.map(item => {
                let cleanItem = String(item).trim();

                // If a filterType is provided ('effects' or 'passives'), make the item clickable
                if (filterType) {
                    const mainDesc = cleanItem.split(' * ')[0].trim();
                    const displayHTML = cleanItem.replace(/ \* /g, '<br><i>') + '</i>'; // Ensure italic tag is closed
                    return `<li class="skill-type-tag" data-filter-type="${filterType}" data-filter-value="${mainDesc}" title="${langDict.filterBy} ${mainDesc}">${displayHTML}</li>`;
                }

                // Default rendering for non-filterable lists (e.g., family bonus)
                if (cleanItem.includes(' * ')) {
                    const parts = cleanItem.split(' * ');
                    let subHtml = `<li>${parts[0].trim()}`;
                    for (let i = 1; i < parts.length; i++) {
                        subHtml += `<br><i>${parts[i].trim()}</i>`;
                    }
                    subHtml += `</li>`;
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
            // 中文环境下，进行更精确的显示解析
            const multiLangNamePattern = /^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/;
            const multiLangMatch = tempName.match(multiLangNamePattern);

            const singleAltLangNamePattern = /^(.*?)\s*\(([^)]+)\)/;
            const singleAltLangMatch = tempName.match(singleAltLangNamePattern);

            if (multiLangMatch) { // 优先处理 "简 繁 (英)" 格式
                mainHeroName = multiLangMatch[1].trim();
                traditionalChineseName = multiLangMatch[2].trim();
                englishName = multiLangMatch[3].trim();
            } else if (singleAltLangMatch && /[a-zA-Z]/.test(singleAltLangMatch[2])) { // 处理 "中 (英) ..." 格式
                mainHeroName = singleAltLangMatch[1].trim();
                englishName = singleAltLangMatch[2].trim();
                // 任何后缀在此处被自然忽略，以满足显示要求
            } else {
                // 如果没有找到括号内的英文，则全部作为主名
                mainHeroName = tempName;
            }
        }


        const nameBlockHTML = `
            ${englishName ? `<p class="hero-english-name">${englishName}</p>` : ''}
            <h1 class="hero-main-name skill-type-tag" data-filter-type="name" data-filter-value="${mainHeroName.trim()}" title="${langDict.filterBy} '${mainHeroName.trim()}'">${mainHeroName}</h1>
            ${traditionalChineseName ? `<p class="hero-alt-name">${traditionalChineseName}</p>` : ''}
        `;

        const heroFamily = String(hero.family || '').toLowerCase();
        const familyBonus = (families_bonus.find(f => f.name.toLowerCase() === heroFamily) || {}).bonus || [];
        const translatedFamily = family_values[heroFamily] || hero.family;

        const source = filterInputs.skillTypeSource.value;
        let skillTypesToDisplay = [];
        if (source === 'heroplan') {
            skillTypesToDisplay = hero.types ? [...hero.types] : [];
            skillTypesToDisplay.sort((a, b) => a.localeCompare(b));
        } else if (source === 'nynaeve') {
            skillTypesToDisplay = hero.skill_types ? [...hero.skill_types] : [];

            const reverseMap = currentLang === 'tc' ? reverseSkillTypeMap_tc : reverseSkillTypeMap_cn;
            skillTypesToDisplay.sort((a, b) => {
                const englishA = (currentLang !== 'en' && reverseMap[a]) ? reverseMap[a] : a;
                const englishB = (currentLang !== 'en' && reverseMap[b]) ? reverseMap[b] : b;
                const indexA = nynaeveSkillTypeOrder.indexOf(englishA);
                const indexB = nynaeveSkillTypeOrder.indexOf(englishB);
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                return a.localeCompare(b);
            });

        } else { // 'both'
            const allSkillTypes = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
            skillTypesToDisplay = allSkillTypes;
            skillTypesToDisplay.sort((a, b) => a.localeCompare(b));
        }
        const uniqueSkillTypes = skillTypesToDisplay.filter(t => t);

        const heroTypesContent = uniqueSkillTypes.length > 0
            ? `<div class="skill-types-container">${uniqueSkillTypes.map(type => `<span class="hero-info-block skill-type-tag" data-filter-type="types" data-filter-value="${type}" title="${langDict.filterBy} ${type}">${type}</span>`).join('')}</div>`
            : `<span class="skill-value">${langDict.none}</span>`;

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
                        ${hero.class ? `<span class="hero-info-block skill-type-tag" data-filter-type="class" data-filter-value="${hero.class}" title="${langDict.filterBy} ${hero.class}">🎓 ${hero.class}</span>` : ''}
                        ${hero.source ? `<span class="hero-info-block skill-type-tag" data-filter-type="source" data-filter-value="${hero.source}" title="${langDict.filterBy} ${hero.source}">🌍 ${hero.source}</span>` : ''}
                        ${heroSkin ? `<span class="hero-info-block skill-type-tag" data-filter-type="name" data-filter-value="${heroSkin}" title="${langDict.filterBy} ${heroSkin}">👕 ${langDict.modalSkin} ${heroSkin}</span>` : ''}
                        ${hero.AetherPower ? `<span class="hero-info-block skill-type-tag" data-filter-type="aetherpower" data-filter-value="${hero.AetherPower}" title="${langDict.filterBy} ${hero.AetherPower}">⏫ ${hero.AetherPower}</span>` : ''}
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
                    <p class="uniform-style">${langDict.modalSpeed} <span class="skill-value skill-type-tag" data-filter-type="speed" data-filter-value="${hero.speed}" title="${langDict.filterBy} ${hero.speed}">${hero.speed || langDict.none}</span></p>
                    <p class="uniform-style">${langDict.modalSkillType}</p>
                    ${heroTypesContent}
                </div>
    
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalSpecialSkill}</p>
                    <ul class="skill-list">${renderListAsHTML(hero.effects, 'effects')}</ul>
                </div>
                
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalPassiveSkill}</p>
                    <ul class="skill-list">${renderListAsHTML(hero.passives, 'passives')}</ul>
                </div>
                
                ${familyBonus.length > 0 ? `
                <div class="skill-category-block">
                    <p class="uniform-style">${langDict.modalFamilyBonus(`<span class="skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}" title="${langDict.filterBy} ${translatedFamily || hero.family}">${translatedFamily || hero.family}</span>`)}</p>
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

                copyTextToClipboard(url).then(() => {
                    const originalContent = shareBtn.innerHTML;
                    shareBtn.innerText = '✔️';
                    shareBtn.disabled = true;
                    setTimeout(() => {
                        shareBtn.innerHTML = originalContent;
                        shareBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy URL: ', err);
                    alert('复制链接失败，请尝试手动复制。');
                });
            });
        }

        document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
        document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);
    }

    // --- NEW: Function to clear all filter inputs ---
    function clearAllFilters() {
        if (resultsTable) resultsTable.classList.remove('wanted-mission-table', 'farming-guide-table');
        isWantedMissionView = false;
        isFarmingGuideView = false;
        temporaryFavorites = null; // Also clear any temporary favorite lists
        temporaryDateFilter = null; // Also clear any temporary date filters
        for (const key in filterInputs) {
            if (key === 'skillTypeSource') {
                continue;
            }

            const element = filterInputs[key];
            if (element) {
                if (element.tagName === 'SELECT') {
                    if (element.id === 'release-date-type') {
                        element.value = 'all';
                    } else {
                        const noneText = i18n[currentLang].none;
                        element.value = noneText;
                    }
                } else {
                    element.value = '';
                }
            }
        }
    }
    function resetToHeroListView() {
        isWantedMissionView = false;
        isFarmingGuideView = false;
        clearAllFilters();
        applyFiltersAndRender();
    }

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
                    isWantedMissionView = false;
                    isFarmingGuideView = false;
                    temporaryDateFilter = null;
                    if (key === 'releaseDateType') {
                        temporaryFavorites = null;
                    }
                    if (key === 'skillTypeSource') {
                        setCookie('skillTypeSource', filterInputs.skillTypeSource.value, 365);
                    }
                    applyFiltersAndRender();
                });
            }
        }
        if (modalOverlay) modalOverlay.addEventListener('click', closeDetailsModal);

        if (modalContent) {
            modalContent.addEventListener('click', (event) => {
                const target = event.target.closest('.skill-type-tag');
                if (!target) return;

                const filterType = target.dataset.filterType;
                let filterValue = target.dataset.filterValue;

                if (!filterType || filterValue === undefined) return;

                const inputElement = filterInputs[filterType];

                if (inputElement) {
                    clearAllFilters();

                    if (filterType === 'passives' || filterType === 'effects') {
                        filterValue = filterValue.replace(/[\p{P}\p{S}0-9]/gu, '').trim();
                        if (filterValue) {
                            filterValue = `(${filterValue})`;
                        }
                    }

                    closeDetailsModal();
                    inputElement.value = filterValue;
                    applyFiltersAndRender();
                }
            });
        }

        if (resultsTable) {
            const tbody = resultsTable.querySelector('tbody');
            if (tbody) {
                tbody.addEventListener('click', (event) => {
                    if (isWantedMissionView || isFarmingGuideView) return;
                    const target = event.target;
                    if (target.classList.contains('favorite-toggle-icon')) {
                        event.stopPropagation();
                        const heroId = parseInt(target.dataset.heroId, 10);
                        const hero = allHeroes.find(h => h.originalIndex === heroId);
                        if (hero) {
                            toggleFavorite(hero);
                            const isNowFavorite = isFavorite(hero);
                            target.textContent = isNowFavorite ? '★' : '☆';
                            target.classList.toggle('favorited', isNowFavorite);

                            if (filterInputs.releaseDateType.value === 'favorites' && temporaryFavorites === null) {
                                applyFiltersAndRender();
                            }
                        }
                    }
                    else {
                        const row = target.closest('.table-row');
                        if (row) {
                            const heroId = parseInt(row.dataset.heroId, 10);
                            const selectedHero = allHeroes.find(h => h.originalIndex === heroId);
                            if (selectedHero) { openDetailsModal(selectedHero); }
                        }
                    }
                });
                // 移动端点击高亮和桌面端悬浮高亮逻辑
                let lastClickedCell = null;
                if (window.innerWidth < 769) {
                    tbody.addEventListener('click', event => {
                        if (!isFarmingGuideView) return;
                        const cell = event.target.closest('td');
                        if (!cell || !cell.dataset.colIndex) {
                            clearFarmGuideHighlight();
                            lastClickedCell = null;
                            return;
                        }
                        if (cell === lastClickedCell) {
                            clearFarmGuideHighlight();
                            lastClickedCell = null;
                        } else {
                            applyHighlight(cell);
                            lastClickedCell = cell;
                        }
                    });
                } else {
                    tbody.addEventListener('mouseover', handleFarmGuideHover);
                    tbody.addEventListener('mouseout', clearFarmGuideHighlight);
                }
            }
            const thead = resultsTable.querySelector('thead');
            if (thead) {
                thead.addEventListener('click', (event) => {
                    if (isWantedMissionView || isFarmingGuideView) return;
                    const header = event.target.closest('th');
                    if (!header) return;

                    if (header.classList.contains('sortable')) {
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
                    else if (header.classList.contains('favorite-all-header')) {
                        if (filteredHeroes.length === 0) return;

                        const langDict = i18n[currentLang];
                        const heroesToProcess = filteredHeroes.filter(h => h.english_name);
                        if (heroesToProcess.length === 0) return;

                        const favoritedCount = heroesToProcess.filter(isFavorite).length;
                        const shouldFavoriteAll = favoritedCount < heroesToProcess.length;

                        const message = shouldFavoriteAll ? langDict.confirmFavoriteAll : langDict.confirmUnfavoriteAll;

                        if (window.confirm(message)) {
                            let currentFavoritesSet = new Set(getFavorites());

                            if (shouldFavoriteAll) {
                                heroesToProcess.forEach(hero => {
                                    currentFavoritesSet.add(`${hero.english_name}-${hero.costume_id}`);
                                });
                            } else {
                                heroesToProcess.forEach(hero => {
                                    currentFavoritesSet.delete(`${hero.english_name}-${hero.costume_id}`);
                                });
                            }

                            saveFavorites(Array.from(currentFavoritesSet));
                            applyFiltersAndRender();
                        }
                    }
                });
            }
        }
        if (openFiltersBtn) openFiltersBtn.addEventListener('click', openFiltersModal);
        if (closeFiltersModalBtn) closeFiltersModalBtn.addEventListener('click', closeFiltersModal);
        if (filtersModalOverlay) filtersModalOverlay.addEventListener('click', closeFiltersModal);

        if (advancedFilterHelpBtn) advancedFilterHelpBtn.addEventListener('click', openHelpModal);
        if (helpModalOverlay) helpModalOverlay.addEventListener('click', closeHelpModal);

        if (skillTypeHelpBtn) skillTypeHelpBtn.addEventListener('click', openSkillTypeHelpModal);
        if (skillTypeHelpModalOverlay) skillTypeHelpModalOverlay.addEventListener('click', closeSkillTypeHelpModal);


        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                clearAllFilters();
                applyFiltersAndRender();
            });
        }

        if (showWantedMissionBtn) {
            showWantedMissionBtn.addEventListener('click', () => {
                // MODIFIED: 添加历史状态
                history.pushState({ view: 'wanted' }, '');
                isWantedMissionView = true;
                isFarmingGuideView = false;
                applyFiltersAndRender();
            });
        }

        if (showFarmingGuideBtn) {
            showFarmingGuideBtn.addEventListener('click', () => {
                // MODIFIED: 添加历史状态
                history.pushState({ view: 'farming' }, '');
                isFarmingGuideView = true;
                isWantedMissionView = false;
                applyFiltersAndRender();
            });
        }

        if (filterHero730Btn) {
            filterHero730Btn.addEventListener('click', () => {
                clearAllFilters();
                filterInputs.releaseDateType.value = 'hero';
                temporaryDateFilter = { base: oneClickMaxDate, days: 730 };
                applyFiltersAndRender();
            });
        }

        if (filterCostume548Btn) {
            filterCostume548Btn.addEventListener('click', () => {
                clearAllFilters();
                filterInputs.releaseDateType.value = 'skin';
                temporaryDateFilter = { base: purchaseCostumeDate, days: 548 };
                applyFiltersAndRender();
            });
        }


        if (openFavoritesBtn) {
            openFavoritesBtn.addEventListener('click', () => {
                isWantedMissionView = false;
                isFarmingGuideView = false;
                temporaryFavorites = null;
                filterInputs.releaseDateType.value = 'favorites';
                applyFiltersAndRender();
            });
        }

        if (shareFavoritesBtn) {
            shareFavoritesBtn.addEventListener('click', () => {
                const favorites = getFavorites();
                if (favorites.length === 0) {
                    alert(i18n[currentLang].noFavoritesToShare || 'No favorites to share.');
                    return;
                }
                const favString = favorites.join(',');
                const compressedFavs = LZString.compressToEncodedURIComponent(favString);
                const url = `${window.location.origin}${window.location.pathname}?zfavs=${compressedFavs}&lang=${currentLang}`;

                copyTextToClipboard(url).then(() => {
                    const originalText = shareFavoritesBtn.innerText;
                    shareFavoritesBtn.innerText = i18n[currentLang].shareFavoritesCopied || 'List Copied!';
                    shareFavoritesBtn.disabled = true;
                    setTimeout(() => {
                        shareFavoritesBtn.innerText = originalText;
                        shareFavoritesBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy favorites link: ', err);
                    alert(i18n[currentLang].copyLinkFailed || '复制链接失败，请尝试手动复制。');
                });
            });
        }

        document.querySelectorAll('#filters-modal .filter-header').forEach(header => {
            header.addEventListener('click', function (event) {
                if (event.target.classList.contains('toggle-button') || event.target.classList.contains('help-btn') || event.target.closest('.help-btn')) { return; }
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
                    const currentState = targetElement.classList.contains('collapsed') ? 'collapsed' : 'expanded';
                    setCookie(targetId + '_state', currentState, 365);
                }
            });
        });

        // MODIFIED: 增强 popstate 监听器以处理返回事件
        window.addEventListener('popstate', function (event) {
            // 优先处理特殊视图的返回
            if (isWantedMissionView || isFarmingGuideView) {
                resetToHeroListView();
                return; // 处理完毕，不再执行后续模态框逻辑
            }

            // 如果没有特殊视图，再处理模态框的返回逻辑
            if (modalStack.length > 0) {
                const lastOpenModalId = modalStack.pop();
                if (lastOpenModalId === 'details') {
                    if (modal) modal.classList.add('hidden');
                    if (modalOverlay) modalOverlay.classList.add('hidden');
                } else if (lastOpenModalId === 'filters') {
                    if (filtersModal) filtersModal.classList.add('hidden');
                    if (filtersModalOverlay) filtersModalOverlay.classList.add('hidden');
                } else if (lastOpenModalId === 'help') {
                    if (helpModal) {
                        helpModal.classList.add('hidden');
                        helpModal.classList.remove('stacked-modal');
                    }
                    if (helpModalOverlay) {
                        helpModalOverlay.classList.add('hidden');
                        helpModalOverlay.classList.remove('stacked-modal-overlay');
                    }
                } else if (lastOpenModalId === 'skillTypeHelp') {
                    if (skillTypeHelpModal) {
                        skillTypeHelpModal.classList.add('hidden');
                        skillTypeHelpModal.classList.remove('stacked-modal');
                    }
                    if (skillTypeHelpModalOverlay) {
                        skillTypeHelpModalOverlay.classList.add('hidden');
                        skillTypeHelpModalOverlay.classList.remove('stacked-modal-overlay');
                    }
                }

                if (modalStack.length === 0) {
                    document.body.classList.remove('modal-open');
                }
            }
        });

        window.addEventListener('resize', adjustStickyHeaders);
    }

    // --- 应用初始化 ---
    async function initializeApp() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewHeroFromUrl = urlParams.get('view');
        const langFromUrl = urlParams.get('lang');
        const zfavsFromUrl = urlParams.get('zfavs');
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

            // 新增: 初始化日期显示
            if (oneClickMaxDateDisplay) oneClickMaxDateDisplay.textContent = oneClickMaxDate;
            if (purchaseCostumeDateDisplay) purchaseCostumeDateDisplay.textContent = purchaseCostumeDate;


            const savedSkillSource = getCookie('skillTypeSource');
            if (savedSkillSource && filterInputs.skillTypeSource) {
                const isValidOption = [...filterInputs.skillTypeSource.options].some(option => option.value === savedSkillSource);
                if (isValidOption) {
                    filterInputs.skillTypeSource.value = savedSkillSource;
                }
            }

            if (zfavsFromUrl) {
                try {
                    const favString = LZString.decompressFromEncodedURIComponent(zfavsFromUrl);
                    if (favString) {
                        temporaryFavorites = favString.split(',');
                        filterInputs.releaseDateType.value = 'favorites';
                    }
                } catch (e) {
                    console.error("Failed to decompress favorites from URL", e);
                }
            } else if (favsFromUrl) {
                try {
                    const favIdentifiers = decodeURIComponent(favsFromUrl).split(',');
                    temporaryFavorites = favIdentifiers;
                    filterInputs.releaseDateType.value = 'favorites';
                } catch (e) {
                    console.error("Failed to process favorites from URL", e);
                }
            }

            addEventListeners();
            applyFiltersAndRender();
            loadFilterStates();

            if (viewHeroFromUrl && !zfavsFromUrl && !favsFromUrl) {
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