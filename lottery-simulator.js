// lottery-simulator.js: 抽奖模拟器的所有逻辑
const lotteryTitles = {
    "cn": {
        "lottery.title.lottery_black_7th_birthday": "生日召唤",
        "lottery.title.allianceeventsummon": "联盟任务召唤",
        "lottery.title.ancientdragonsummon": "远古巨龙召唤",
        "lottery.title.ascensionitemsummon": "进阶召唤",
        "lottery.title.ascensionsummon": "即时力量",
        "lottery.title.astralelvessummon": "星体召唤",
        "lottery.title.lottery_black_default": "黑色星期五召唤",
        "lottery.title.challengeeventsummon": "活动召唤",
        "lottery.title.costumesummon": "服装召唤",
        "lottery.title.covenantsummon": "盟约召唤",
        "lottery.title.dailysummon": "每日召唤",
        "lottery.title.elementaldragonsummon": "元素巨龙召唤",
        "lottery.title.epicdragonsummon": "传奇巨龙召唤",
        "lottery.title.epicherosummon": "史诗英雄召唤",
        "lottery.title.epictroopsummon": "史诗队伍召唤",
        "lottery.title.featuredsummon": "元素人召唤",
        "lottery.title.goblinsummon": "哥布林召唤",
        "lottery.title.harvestsummon": "丰收召唤",
        "lottery.title.itemsummon": "进阶召唤",
        "lottery.title.leaguesummon": "英雄锦标赛召唤",
        "lottery.title.legendarytroopsummon": "传奇队伍召唤",
        "lottery.title.legendssummon": "神话召唤",
        "lottery.title.limitbreakitemsummon": "艾瑟尔召唤",
        "lottery.title.lottery_updated": "召唤已更新",
        "lottery.title.mercenarywarsummon": "三国召唤",
        "lottery.title.monsterislandsummon": "怪兽岛召唤",
        "lottery.title.moths": "联盟任务召唤",
        "lottery.title.pickupsummon": "节选召唤",
        "lottery.title.lottery_season_atlantis": "亚特兰蒂斯召唤",
        "lottery.title.lottery_season_valhalla": "瓦尔哈拉召唤",
        "lottery.title.lottery_season_underwild": "蛮荒地界召唤",
        "lottery.title.lottery_season_season5": "沙丘召唤",
        "lottery.title.seasonal": "季节召唤",
        "lottery.title.shadowsummon": "暗影召唤",
        "lottery.title.silverdragonsummon": "白银召唤",
        "lottery.title.lottery_black_solstice_default": "至日召唤",
        "lottery.title.spring": "春日召唤",
        "lottery.title.summon.view.untoldtales": "秘闻",
        "lottery.title.superelementalsummon": "超级元素人召唤",
        "lottery.title.towereventsummon": "高塔召唤",
        "lottery.title.towertroopsummon": "高塔队伍召唤",
        "lottery.title.lottery_season_untold_tales1": "秘闻召唤",
        "lottery.title.untoldtales1": "深海奥秘",
        "lottery.title.lottery_season_untold_tales2": "烈焰与冰霜宝藏",
        "lottery.title.wildernesssummon": "荒野召唤",
        "lottery.title.lottery_hero_lunar_new_year": "春节召唤",
        "lottery.title.lottery_hero_valentines": "情人节召唤",
        "lottery.title.lottery_hero_easter": "复活节召唤",
        "lottery.title.lottery_hero_beach_party": "海滩派对召唤",
        "lottery.title.lottery_hero_kalevala": "卡勒瓦拉召唤",
        "lottery.title.lottery_hero_halloween": "万圣节召唤",
        "lottery.title.lottery_hero_christmas": "圣诞节召唤",
        "lottery.title.lottery_featured_event_opera": "歌剧召唤",
        "lottery.title.lottery_featured_event_gargoyles2": "石像鬼圣所召唤",
        "lottery.title.lottery_featured_event_beowulf": "贝奥武夫召唤",
        "lottery.title.lottery_featured_event_festival": "挑战节 I 召唤",
        "lottery.title.lottery_featured_event_festival_b": "挑战节 II 召唤",
        "lottery.title.lottery_featured_event_masquerade": "化妆舞会召唤",
        "lottery.title.lottery_featured_alliance_quest_castle": "骑士冲突召唤",
        "lottery.title.lottery_featured_alliance_quest_musketeers": "火枪手召唤",
        "lottery.title.lottery_featured_alliance_quest_moths": "飞蛾之夜召唤",
        "lottery.title.lottery_tower_ninja_default": "忍者塔召唤",
        "lottery.title.lottery_tower_owl_default": "猫头鹰塔召唤",
        "lottery.title.lottery_tower_magic_default": "魔法塔召唤",
        "lottery.title.lottery_tower_styx_default": "冥河塔召唤",
    },
    "tc": {
        "lottery.title.lottery_black_7th_birthday": "生日召喚",
        "lottery.title.allianceeventsummon": "聯盟任務召喚",
        "lottery.title.ancientdragonsummon": "遠古巨龍召喚",
        "lottery.title.ascensionitemsummon": "升等召喚",
        "lottery.title.ascensionsummon": "即刻力量",
        "lottery.title.astralelvessummon": "星界召喚",
        "lottery.title.lottery_black_default": "黑色星期五召喚",
        "lottery.title.challengeeventsummon": "活動召喚",
        "lottery.title.costumesummon": "服裝召喚",
        "lottery.title.covenantsummon": "聖約召喚",
        "lottery.title.dailysummon": "每日召喚",
        "lottery.title.elementaldragonsummon": "元素巨龍召喚",
        "lottery.title.epicdragonsummon": "傳奇巨龍召喚",
        "lottery.title.epicherosummon": "史詩英雄召喚",
        "lottery.title.epictroopsummon": "史詩部隊召喚",
        "lottery.title.featuredsummon": "元素召喚",
        "lottery.title.goblinsummon": "哥布林召喚",
        "lottery.title.harvestsummon": "豐收召喚",
        "lottery.title.itemsummon": "升等召喚",
        "lottery.title.leaguesummon": "英雄聯盟召喚",
        "lottery.title.legendarytroopsummon": "傳奇部隊召喚",
        "lottery.title.legendssummon": "傳奇召喚",
        "lottery.title.limitbreakitemsummon": "乙太召喚",
        "lottery.title.lottery_updated": "已更新召喚",
        "lottery.title.mercenarywarsummon": "三國召喚",
        "lottery.title.monsterislandsummon": "怪獸島召喚",
        "lottery.title.moths": "聯盟任務召喚",
        "lottery.title.pickupsummon": "獲得召喚",
        "lottery.title.lottery_season_atlantis": "亞特蘭蒂斯召喚",
        "lottery.title.lottery_season_valhalla": "瓦爾哈拉召喚",
        "lottery.title.lottery_season_underwild": "地底荒野召喚",
        "lottery.title.lottery_season_season5": "沙丘召喚",
        "lottery.title.seasonal": "賽季召喚",
        "lottery.title.shadowsummon": "暗影召喚",
        "lottery.title.silverdragonsummon": "白銀召喚",
        "lottery.title.lottery_black_solstice_default": "至日召喚",
        "lottery.title.spring": "春日召喚",
        "lottery.title.summon.view.untoldtales": "隱秘傳說",
        "lottery.title.superelementalsummon": "超級元素召喚",
        "lottery.title.towereventsummon": "高塔召喚",
        "lottery.title.towertroopsummon": "高塔部隊召喚",
        "lottery.title.lottery_season_untold_tales1": "隱秘傳說召喚",
        "lottery.title.untoldtales1": "深淵謎團",
        "lottery.title.lottery_season_untold_tales2": "火焰與冰霜的寶藏",
        "lottery.title.wildernesssummon": "野地召喚",
        "lottery.title.lottery_hero_lunar_new_year": "春節召喚",
        "lottery.title.lottery_hero_valentines": "情人節召喚",
        "lottery.title.lottery_hero_easter": "復活節召喚",
        "lottery.title.lottery_hero_beach_party": "海灘派對召喚",
        "lottery.title.lottery_hero_kalevala": "卡勒瓦拉召喚",
        "lottery.title.lottery_hero_halloween": "萬聖節召喚",
        "lottery.title.lottery_hero_christmas": "聖誕節召喚",
        "lottery.title.lottery_featured_event_opera": "歌劇召喚",
        "lottery.title.lottery_featured_event_gargoyles2": "石像鬼聖所召喚",
        "lottery.title.lottery_featured_event_beowulf": "貝奧武夫召唤",
        "lottery.title.lottery_featured_event_festival": "挑戰節 I 召喚",
        "lottery.title.lottery_featured_event_festival_b": "挑戰節 II 召喚",
        "lottery.title.lottery_featured_event_masquerade": "化妆舞会召唤",
        "lottery.title.lottery_featured_alliance_quest_castle": "騎士衝突召喚",
        "lottery.title.lottery_featured_alliance_quest_musketeers": "火枪手召唤",
        "lottery.title.lottery_featured_alliance_quest_moths": "飛蛾之夜召喚",
        "lottery.title.lottery_tower_ninja_default": "忍者塔召喚",
        "lottery.title.lottery_tower_owl_default": "貓頭鷹塔召喚",
        "lottery.title.lottery_tower_magic_default": "魔法塔召喚",
        "lottery.title.lottery_tower_styx_default": "冥河塔召喚",
    },
    "en": {
        "lottery.title.lottery_black_7th_birthday": "Birthday Summon",
        "lottery.title.allianceeventsummon": "Alliance Quest Summon",
        "lottery.title.ancientdragonsummon": "Ancient Dragon Summon",
        "lottery.title.ascensionitemsummon": "Ascension Summon",
        "lottery.title.ascensionsummon": "Instant Power",
        "lottery.title.astralelvessummon": "Astral Summon",
        "lottery.title.lottery_black_default": "Black Friday Summon",
        "lottery.title.challengeeventsummon": "Event Summon",
        "lottery.title.costumesummon": "Costume Summon",
        "lottery.title.covenantsummon": "Covenant Summon",
        "lottery.title.dailysummon": "Daily Summon",
        "lottery.title.elementaldragonsummon": "Elemental Dragon Summon",
        "lottery.title.epicdragonsummon": "Legendary Dragon Summon",
        "lottery.title.epicherosummon": "Epic Hero Summon",
        "lottery.title.epictroopsummon": "Epic Troop Summon",
        "lottery.title.featuredsummon": "Elemental Summon",
        "lottery.title.goblinsummon": "Goblin Summon",
        "lottery.title.harvestsummon": "Harvest Summon",
        "lottery.title.itemsummon": "Ascension Summon",
        "lottery.title.leaguesummon": "Hero League Summon",
        "lottery.title.legendarytroopsummon": "Legendary Troop Summon",
        "lottery.title.legendssummon": "Legends Summon",
        "lottery.title.limitbreakitemsummon": "Aether Summon",
        "lottery.title.lottery_updated": "Summon Updated",
        "lottery.title.mercenarywarsummon": "3 Kingdoms Summon",
        "lottery.title.monsterislandsummon": "Monster Island Summon",
        "lottery.title.moths": "Alliance Quest Summon",
        "lottery.title.pickupsummon": "Pick Up Summon",
        "lottery.title.lottery_season_atlantis": "Atlantis Summon",
        "lottery.title.lottery_season_valhalla": "Valhalla Summon",
        "lottery.title.lottery_season_underwild": "Underwild Summon",
        "lottery.title.lottery_season_season5": "Dunes Summon",
        "lottery.title.seasonal": "Seasonal Summon",
        "lottery.title.shadowsummon": "Shadow Summon",
        "lottery.title.silverdragonsummon": "Silver Summon",
        "lottery.title.lottery_black_solstice_default": "Solstice Summon",
        "lottery.title.spring": "Spring Summon",
        "lottery.title.summon.view.untoldtales": "Untold Tales",
        "lottery.title.superelementalsummon": "Super Elemental Summon",
        "lottery.title.towereventsummon": "Tower Summon",
        "lottery.title.towertroopsummon": "Tower Troop Summon",
        "lottery.title.lottery_season_untold_tales1": "Untold Tales Summon",
        "lottery.title.untoldtales1": "Mysteries of the Deep",
        "lottery.title.lottery_season_untold_tales2": "Treasures of Flame and Frost",
        "lottery.title.wildernesssummon": "Wilderness Summon",
        "lottery.title.lottery_hero_lunar_new_year": "Lunar New Year Summon",
        "lottery.title.lottery_hero_valentines": "Valentine's Summon",
        "lottery.title.lottery_hero_easter": "Easter Summon",
        "lottery.title.lottery_hero_beach_party": "Beach Party Summon",
        "lottery.title.lottery_hero_kalevala": "Kalevala Summon",
        "lottery.title.lottery_hero_halloween": "Halloween Summon",
        "lottery.title.lottery_hero_christmas": "Christmas Summon",
        "lottery.title.lottery_featured_event_opera": "Opera Summon",
        "lottery.title.lottery_featured_event_gargoyles2": "Gargoyles Summon",
        "lottery.title.lottery_featured_event_beowulf_bulk": "Beowulf Summon",
        "lottery.title.lottery_featured_event_festival": "Festival I Summon",
        "lottery.title.lottery_featured_event_festival_b": "Festival II Summon",
        "lottery.title.lottery_featured_event_masquerade": "Masquerade Summon",
        "lottery.title.lottery_featured_alliance_quest_castle": "Knight's Clash Summon",
        "lottery.title.lottery_featured_alliance_quest_musketeers": "Musketeers Summon",
        "lottery.title.lottery_featured_alliance_quest_moths": "Moths Night Summon",
        "lottery.title.lottery_tower_ninja_default": "Ninja Tower Summon",
        "lottery.title.lottery_tower_owl_default": "Owl Tower Summon",
        "lottery.title.lottery_tower_magic_default": "Magic Tower Summon",
        "lottery.title.lottery_tower_styx_default": "Styx Tower Summon",
    }
};

// 将需要从外部文件（如 main.js）调用的函数组织起来，避免污染全局作用域
const LotterySimulator = {
    initialize: initializeLotterySimulator,
    toggle: toggleLotterySimulator,
    handleActivityClick: handleActivityClick,
    renderFeaturedHeroes: renderFeaturedHeroes,
    updateSummonButtons: updateSummonButtons,
    addHeroToFeaturedSlot: addHeroToFeaturedSlot,
    // ... 其他需要暴露的函数 ...
};


// --- 状态与配置 (State & Config) ---
let lotteryPoolsData = null; // 用于存储处理过的奖池数据
let lotteryTitleDict = {}; // 用于存储当前语言的标题字典

/**
 * 初始化抽奖模拟器
 * @param {Array} allPoolsConfig - 来自“全抽奖配置.json”的数据
 * @param {object} summonTypesConfig - 来自“奖池种类.json”的数据
 */
function initializeLotterySimulator(allPoolsConfig, summonTypesConfig) { // <-- 修改参数
    // 1. 根据当前语言，从全局变量中设置正确的标题字典
    lotteryTitleDict = lotteryTitles[state.currentLang] || lotteryTitles.cn;

    // 2. 处理和整合奖池数据 (保持不变)
    processSummonData(allPoolsConfig, summonTypesConfig);

    // 3. 渲染左侧的活动列表
    renderActivityList();

    // 4. 加载本地存储的抽奖历史
    loadHistoryFromLocalStorage();
    renderSummonHistory();

    // 5. 为通用按钮绑定事件
    document.getElementById('clear-history-btn')?.addEventListener('click', () => {
        if (confirm(i18n[state.currentLang].confirmClearHistory || '您确定要清空所有召唤历史记录吗？')) {
            state.summonHistory = [];
            saveHistoryToLocalStorage();
            renderSummonHistory();
        }
    });
}

/**
 * 获取奖池的本地化标题
 * @param {object} poolConfig - 奖池配置对象
 * @returns {string} - 显示的标题
 */
function getPoolDisplayName(poolConfig) {
    if (!poolConfig) return '';

    // 定义需要使用ID进行翻译的特殊productType列表
    const specialProductTypes = ['BlackSummon', 'EpicHeroSummon', 'ChallengeEventSummon', 'MapSeasonSummon', 'AllianceEventSummon','TowerEventSummon'];
    let titleKey = '';

    // 检查当前奖池的productType是否在特殊列表中
    if (poolConfig.productType && specialProductTypes.includes(poolConfig.productType)) {
        // 如果是，则使用id构建翻译键
        titleKey = `lottery.title.${poolConfig.id.toLowerCase()}`;
    } else if (poolConfig.productType) {
        // 否则，使用通用的productType构建翻译键
        titleKey = `lottery.title.${poolConfig.productType.toLowerCase()}`;
    }

    // 使用构建好的键在字典中查找翻译
    if (titleKey && lotteryTitleDict[titleKey]) {
        return lotteryTitleDict[titleKey];
    }

    // 如果没有找到任何翻译，返回一个处理过的ID作为最终的备用方案
    return poolConfig.id.replace('lottery_', '').replace(/_/g, ' ');
}

/**
 * 将两个JSON文件的数据整合为一个更易于使用的结构
 */
function processSummonData(allPoolsConfig, summonTypesConfig) {
    lotteryPoolsData = {};
    const summonPoolDetails = summonTypesConfig.SummonPool;

    allPoolsConfig.forEach(pool => {
        // 只处理基础召唤配置 (amount: 1)
        if (pool.amount === 1) {
            const details = summonPoolDetails[pool.id] || {};
            const productType = summonTypesConfig.SummonConfig[pool.productType] || {};

            // 查找对应的10连和30连配置
            const bulk10 = allPoolsConfig.find(p => p.sourceProductId === pool.id && p.amount === 10);
            const bulk30 = allPoolsConfig.find(p => p.sourceProductId === pool.id && p.amount === 30);

            lotteryPoolsData[pool.id] = {
                ...pool,
                ...details,
                ...productType,
                bulk10: bulk10 || null,
                bulk30: bulk30 || null,
            };
        }
    });

    // 将处理好的数据存入全局状态，方便访问
    state.allSummonPools = lotteryPoolsData;
}


// --- 核心UI渲染 (UI Rendering) ---

/**
 * 渲染左侧的活动列表
 */
function renderActivityList() {
    const listContainer = document.getElementById('lottery-activity-list');
    if (!listContainer || !state.allSummonPools) return;

    listContainer.innerHTML = '';

    const Pools = Object.values(state.allSummonPools);

    Pools.forEach(pool => {
        const listItem = document.createElement('li');
        listItem.dataset.poolId = pool.id;

        // 调用统一的标题函数来获取显示名称
        const displayName = getPoolDisplayName(pool);

        // 使用 banner 字段设置背景图片
        if (pool.banner) {
            listItem.style.backgroundImage = `url('imgs/lottery/banner/${pool.banner}.webp')`;
            listItem.style.backgroundSize = 'cover';
            listItem.style.backgroundRepeat = 'no-repeat';
            listItem.style.color = '#fff';
            listItem.style.textShadow = '1px 1px 2px black';
            listItem.textContent = displayName; // 设置列表项的标题
        } else {
            // 如果没有banner，显示标题并附带提示
            listItem.textContent = displayName + ' (No Banner)';
        }

        listItem.addEventListener('click', () => handleActivityClick(pool.id));
        listContainer.appendChild(listItem);
    });

    if (Pools.length > 0) {
        handleActivityClick(Pools.find(p => p.uiPriority > 0)?.id || Pools?.[0]?.id);
    }
}

/**
 * 当用户点击左侧活动列表时，更新整个召唤主界面
 * @param {string} poolId - 被选中的奖池ID
 */
function handleActivityClick(poolId) {
    if (state.isEditingFeaturedHero) {
        LotterySimulator.exitFeaturedHeroEditMode();
    }

    document.querySelectorAll('#lottery-activity-list li').forEach(li => {
        li.classList.toggle('active', li.dataset.poolId === poolId);
    });

    const poolConfig = state.allSummonPools?.[poolId];
    if (!poolConfig) return;

    state.currentSummonData = poolConfig;
    state.customFeaturedHeroes = Array(poolConfig.featuredHeroNum || 0).fill(null);

    const titleEl = document.getElementById('lottery-pool-title');
    const backgroundEl = document.getElementById('lottery-background-image');
    // 获取标题
    titleEl.textContent = getPoolDisplayName(poolConfig);

    if (poolConfig.lotterybg) {
        backgroundEl.style.backgroundImage = `url('imgs/lottery/lotterybg/${poolConfig.lotterybg}.webp')`;
    } else {
        backgroundEl.style.backgroundImage = 'none'; // 没有 lotterybg 则移除背景
        backgroundEl.style.backgroundColor = '#222'; // 可以设置一个默认背景色
    }
    backgroundEl.style.backgroundSize = '100% 100%';
    backgroundEl.style.backgroundPosition = 'center';

    LotterySimulator.renderFeaturedHeroes();
    LotterySimulator.updateSummonButtons();
}

/**
 * 渲染精选英雄卡槽，并绑定长按移除事件
 */
function renderFeaturedHeroes() {
    const leftColumn = document.getElementById('featured-heroes-left');
    const rightColumn = document.getElementById('featured-heroes-right');
    if (!leftColumn || !rightColumn || !state.currentSummonData) return;

    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    const numFeatured = state.currentSummonData.featuredHeroNum || 0;

    // 确保自定义英雄数组的长度与卡槽数一致
    if (state.customFeaturedHeroes.length !== numFeatured) {
        state.customFeaturedHeroes = Array(numFeatured).fill(null);
    }

    for (let i = 0; i < numFeatured; i++) {
        const slot = document.createElement('div');
        slot.className = 'featured-hero-slot';
        slot.dataset.slotIndex = i;

        const hero = state.customFeaturedHeroes[i] || null;

        if (hero) {
            // 复用英雄头像组件来显示英雄
            const avatarContainer = document.createElement('div');
            avatarContainer.className = `hero-avatar-container ${getColorGlowClass(hero.color)}`;
            avatarContainer.style.width = '100%';
            avatarContainer.style.height = '100%';

            const avatarBg = document.createElement('div');
            avatarBg.className = 'hero-avatar-background';
            avatarBg.style.background = getHeroColorLightGradient(hero.color);

            const avatarImg = document.createElement('img');
            avatarImg.src = hero.heroId ? `imgs/hero_icon/${hero.heroId}.webp` : getLocalImagePath(hero.image);
            avatarImg.className = 'hero-avatar-image';
            avatarImg.alt = hero.name;

            avatarContainer.append(avatarBg, avatarImg);
            slot.appendChild(avatarContainer);
        }

        // 长按移除逻辑
        let pressTimer = null;

        const startPress = (e) => {
            // 只对已填充的卡槽生效
            if (!state.customFeaturedHeroes[i]) return;

            e.preventDefault();
            pressTimer = setTimeout(() => {
                removeHeroFromFeaturedSlot(i);
            }, 750); // 长按750毫秒后触发移除
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
        };

        // 绑定桌面端和移动端事件
        slot.addEventListener('mousedown', startPress);
        slot.addEventListener('mouseup', cancelPress);
        slot.addEventListener('mouseleave', cancelPress);

        slot.addEventListener('touchstart', startPress, { passive: true });
        slot.addEventListener('touchend', cancelPress);
        slot.addEventListener('touchmove', cancelPress);
        // ▲▲▲▲▲【修改结束】▲▲▲▲▲

        if (i % 2 === 0) {
            leftColumn.appendChild(slot);
        } else {
            rightColumn.appendChild(slot);
        }
    }
}

/**
 * 更新召唤按钮的可见性和价格
 */
function updateSummonButtons() {
    const pool = state.currentSummonData;
    const singleBtn = document.getElementById('single-summon-btn');
    const tenBtn = document.getElementById('ten-summon-btn');
    const thirtyBtn = document.getElementById('thirty-summon-btn');

    // 单抽按钮
    singleBtn.querySelector('.gem-price').textContent = pool.gemPrice;

    // 10连抽
    if (pool.bulk10) {
        tenBtn.classList.remove('hidden');
        tenBtn.querySelector('.gem-price').textContent = pool.bulk10.gemPrice;
    } else {
        tenBtn.classList.add('hidden');
    }

    // 30连抽
    if (pool.bulk30) {
        thirtyBtn.classList.remove('hidden');
        thirtyBtn.querySelector('.gem-price').textContent = pool.bulk30.gemPrice;
    } else {
        thirtyBtn.classList.add('hidden');
    }
}

/**
 * 将一个英雄添加到下一个可用的精选卡槽中
 * @param {object} selectedHero - 从主列表选择的英雄
 */
function addHeroToFeaturedSlot(selectedHero) {
    if (selectedHero.star !== 5) {
        alert(i18n[state.currentLang].mustSelect5StarHero || '请选择一位5星英雄。');
        return;
    }

    // 查找第一个空的卡槽索引
    const emptyIndex = state.customFeaturedHeroes.findIndex(h => h === null || h === undefined);

    if (emptyIndex !== -1) {
        state.customFeaturedHeroes[emptyIndex] = selectedHero;
        renderFeaturedHeroes(); // 重新渲染以显示新英雄
    } else {
        alert(i18n[state.currentLang].featuredSlotsFull || '所有精选英雄卡槽已满。');
    }
}

/**
 * 从精选卡槽中移除英雄（由长按触发）
 * @param {number} slotIndex - 要移除英雄的卡槽索引
 */
function removeHeroFromFeaturedSlot(slotIndex) {
    if (state.customFeaturedHeroes[slotIndex]) {
        state.customFeaturedHeroes[slotIndex] = null;
        renderFeaturedHeroes(); // 重新渲染以更新显示
    }
}

// --- 抽奖核心与历史记录 (Summoning & History) ---

/**
 * 执行抽奖
 * @param {number} count - 抽奖次数
 */
async function performSummon(count) {
    // ... 在这里实现您的抽奖算法 ...
    // 1. 根据权重选择 bucket
    // 2. 根据 bucket 从 state.allHeroes 筛选出英雄池
    // 3. 随机抽取一个英雄

    const summonedHeroes = [];
    for (let i = 0; i < count; i++) {
        // 伪代码：
        // const hero = doSummonLogic(); 
        // summonedHeroes.push(hero);
    }

    // 播放动画
    for (let i = 0; i < summonedHeroes.length; i++) {
        await showSummonAnimation(summonedHeroes[i], i * 200); // 错开显示
    }

    // 更新历史记录
    if (summonedHeroes.length > 0) {
        state.summonHistory.unshift(summonedHeroes); // 在最前面插入新记录
        if (state.summonHistory.length > 100) {
            state.summonHistory.pop(); // 保持最多100条
        }
        saveHistoryToLocalStorage();
        renderSummonHistory();
    }
}

/**
 * 显示单个英雄的抽奖动画
 * @param {object} hero - 抽到的英雄
 * @param {number} delay - 动画延迟时间 (ms)
 * @returns {Promise} - 动画完成时解析
 */
function showSummonAnimation(hero, delay = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            const portalArea = document.getElementById('lottery-hero-display-area');
            const resultItem = document.createElement('div');
            resultItem.className = 'summon-result-item';

            // ... 使用与 renderFeaturedHeroes 类似的逻辑创建英雄头像 ...
            // resultItem.appendChild(avatarContainer);

            portalArea.appendChild(resultItem);

            // 触发CSS动画
            resultItem.classList.add('summon-result-show');

            // 动画结束后移除元素并解决Promise
            resultItem.addEventListener('animationend', () => {
                resultItem.remove();
                resolve();
            }, { once: true });

        }, delay);
    });
}

/**
 * 渲染抽奖历史记录
function renderSummonHistory() {
    const historyContainer = document.getElementById('summon-history-list');
    if (!historyContainer) return;
    historyContainer.innerHTML = '';

    state.summonHistory.forEach(summonGroup => {
        const groupContainer = document.createElement('div');
        groupContainer.className = 'summon-history-group';

        summonGroup.forEach(hero => {
            // ... 创建英雄头像并添加到 groupContainer ...
        });

        historyContainer.appendChild(groupContainer);
    });
}
 */

/**
 * 渲染抽奖历史记录 (当前显示为“功能尚未完成”)
 */
function renderSummonHistory() {
    const historyContainer = document.getElementById('summon-history-list');
    if (!historyContainer) return;

    // 清空容器
    historyContainer.innerHTML = '';

    // 创建并插入提示信息元素
    const messageElement = document.createElement('div');
    messageElement.className = 'feature-incomplete-message'; // 使用一个新类名来应用样式
    messageElement.textContent = '正在施工(Wait for it)...';

    historyContainer.appendChild(messageElement);
}

/**
 * 将历史记录保存到本地存储
 */
function saveHistoryToLocalStorage() {
    try {
        const historyJSON = JSON.stringify(state.summonHistory);
        localStorage.setItem('summonHistory', historyJSON);
    } catch (e) {
        console.error("无法保存抽奖历史:", e);
    }
}

/**
 * 从本地存储加载历史记录
 */
function loadHistoryFromLocalStorage() {
    try {
        const historyJSON = localStorage.getItem('summonHistory');
        state.summonHistory = historyJSON ? JSON.parse(historyJSON) : [];
    } catch (e) {
        console.error("无法加载抽奖历史:", e);
        state.summonHistory = [];
    }
}


/**
 * 切换抽奖模拟器视图的显示和隐藏 (最终互斥版)
 */
function toggleLotterySimulator() {
    // 1. 先切换状态
    state.lotterySimulatorActive = !state.lotterySimulatorActive;
    const isActive = state.lotterySimulatorActive; // 使用一个变量来判断当前是开启还是关闭

    const wrapper = document.getElementById('lottery-simulator-wrapper');
    const button = document.getElementById('show-lottery-simulator-btn');
    const langDict = i18n[state.currentLang];

    // --- 确保所有其他视图都被正确处理 ---
    if (isActive) {
        // 【核心修正】如果要激活抽奖模拟器，则检查并关闭队伍模拟器
        if (state.teamSimulatorActive) {
            toggleTeamSimulator();
        }

        // 隐藏所有其他特殊视图
        uiElements.wantedMissionView.classList.add('hidden');
        uiElements.farmingGuideView.classList.add('hidden');
        if (uiElements.chatSimulatorView) uiElements.chatSimulatorView.classList.add('hidden');

        // 确保主英雄列表是可见的，因为我们需要它进行交互
        uiElements.heroTableView.classList.remove('hidden');
    }

    // --- 控制抽奖模拟器自身的UI ---
    wrapper.classList.toggle('hidden', !isActive);
    uiElements.headerInfoContainer.classList.toggle('hidden', isActive); // 隐藏顶部的赞助信息

    if (isActive) {
        // --- 激活模拟器时的操作 ---
        button.classList.add('simulator-exit-btn');
        button.title = langDict.returnToList;

        // 如果是首次激活，加载默认奖池
        if (state.allSummonPools && !state.currentSummonData) {
            const firstPool = Object.values(state.allSummonPools).sort((a, b) => (b.uiPriority || 0) - (a.uiPriority || 0))[0];
            if (firstPool) {
                LotterySimulator.handleActivityClick(firstPool.id);
            }
        }
        setMainViewHistory('lotterySimulator'); // 浏览器历史记录管理
    } else {
        // --- 关闭模拟器时的操作 ---
        button.classList.remove('simulator-exit-btn');
        button.title = langDict.lotterySimulatorTitle;
        if (state.isEditingFeaturedHero) {
            exitFeaturedHeroEditMode();
        }
    }

    applyFiltersAndRender(); // 刷新主列表，确保图标等状态正确
}