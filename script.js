document.addEventListener('DOMContentLoaded', function () {
    // --- 全局变量 ---
    const classReverseMap = {
        "Barbarian": "barbarian", "野蛮人": "barbarian", "野人": "barbarian",
        "Cleric": "cleric", "牧师": "cleric", "牧師": "cleric",
        "Druid": "druid", "德鲁伊": "druid", "德魯伊": "druid",
        "Fighter": "fighter", "战士": "fighter", "戰士": "fighter",
        "Monk": "monk", "僧侣": "monk", "僧侶": "monk",
        "Paladin": "paladin", "圣骑士": "paladin", "聖騎士": "paladin",
        "Ranger": "ranger", "游侠": "ranger", "遊俠": "ranger",
        "Rogue": "rogue", "盗贼": "rogue", "盜賊": "rogue",
        "Sorcerer": "sorcerer", "术士": "sorcerer", "術士": "sorcerer",
        "Wizard": "wizard", "巫师": "wizard", "巫師": "wizard"
    };
    const aetherPowerReverseMap = {
        "状态异常防御": "Ailment Defense", "異常防禦": "Ailment Defense",
        "状态异常反弹": "Ailment Reflect", "異常反射": "Ailment Reflect",
        "状态异常免疫": "Ailment Immunity", "異常免疫": "Ailment Immunity",
        "攻击提升": "Attack Up", "攻擊提升": "Attack Up",
        "生命恢复加成": "Boosted Regen", "回復已加成": "Boosted Regen",
        "坚壁": "Bulwark", "壁壘": "Bulwark",
        "净化": "Cleanse", "淨化": "Cleanse",
        "反击": "Counterattack", "反擊": "Counterattack",
        "减伤": "Damage Reduction", "傷害減少": "Damage Reduction",
        "防御提升": "Defense Up", "防禦提升": "Defense Up",
        "闪避": "Dodge", "閃避": "Dodge",
        "恶魔抵抗": "Fiend Resist", "惡魔抵禦": "Fiend Resist",
        "骑士之毅": "Knight's Endurance", "騎士的耐力": "Knight's Endurance",
        "气运": "Gamble", "豪賭": "Gamble",
        "治疗提升": "Heal Increase", "治療增加": "Heal Increase",
        "法力加成": "Mana Boost",
        "法力生成": "Mana Generation", "法力產出": "Mana Generation",
        "木乃伊": "Mummy",
        "伤害反弹": "Pain Return", "疼痛回歸": "Pain Return",
        "怒气": "Rage", "憤怒": "Rage",
        "生命恢复": "Regen", "回復": "Regen",
        "复活": "Revive", "復活": "Revive",
        "特殊护甲": "Special Armor", "特殊盔甲": "Special Armor",
        "特殊技能加成": "Special Boost", "特殊加成": "Special Boost",
        "嘲讽": "Taunt", "嘲諷": "Taunt",
        "吸血": "Vampire", "吸血鬼": "Vampire"
    };
    const sourceReverseMap = {
        // Simplified Chinese
        "挑战节II - 恶棍": "villains", "联盟 - 火枪手": "musketeer", "挑战节II - 超能萌宠": "pets",
        "月活动 - 农历生肖": "lunaryear", "挑战 - 贝奥武夫": "beowulf", "联盟 - 飞蛾": "moth",
        "月活动 - 海滩派对": "beachparty", "月活动 - 卡勒瓦拉": "kalevala", "挑战节I - 阿瓦隆": "avalon",
        "高塔 - 忍者": "ninja", "月活动 - 莫洛维亚": "morlovia", "月活动 - 飞沙帝国": "sand",
        "三国召唤": "kingdom", "挑战节I - 仙境": "wonderland", "超级元素人": "superelemental",
        "高塔 - 魔法": "magic", "高塔 - 冥河": "styx", "月活动 - 冬日": "christmas",
        "月活动 - 春谷": "springvale", "挑战节I - 海盗": "pirates", "挑战节II - 星落": "starfall",
        "挑战 - 石像鬼": "gargoyle", "S1 - 经典": "season1", "S2 - 亚特兰蒂斯": "season2",
        "S5 - 沙丘": "season5", "神秘 - 暗影召唤": "shadow", "盟约召唤": "covenant",
        "高塔 - 猫头鹰": "owltower", "联盟 - 骑士冲击": "knights", "S6 - 深海奥秘": "untoldtales1", "S7 - 烈焰与冰霜宝藏": "untoldtales2",
        "S3 - 瓦尔哈拉": "season3", "S4 - 蛮荒地界": "season4", "挑战 - 重返圣堂": "returntosanctuary",
        "至日召唤": "solstice", "挑战 - 众神狂欢节": "carnivalofgods", "神话召唤 - 月英": "hotm",
        "月活动 - 恋爱季节": "love", "哥布林召唤": "goblinvillage", "额外抽奖 - 秘密召唤": "secretsummon", "神话召唤 - 额外抽奖": "tavernoflegendssecret",
        "挑战节II - 吟游诗人": "festival", "星体召唤": "astral", "挑战节II - 杀手": "slayers",
        "荒野召唤": "wilderness", "挑战节I - 守护者": "teltoc", "挑战节I - 肃煞森林": "fables",
        "神话召唤": "tavernoflegends", "生日召唤": "birthday", "黑色星期五召唤": "blackfriday",
        "丰收召唤": "harvest", "怪兽岛召唤": "monsterisland", "挑战 - 歌剧之谜": "opera", "挑战节 I": "challengefestival1", "挑战节 II": "challengefestival2", "服装间": "costume",
        // Traditional Chinese
        "挑戰節II - 惡棍": "villains", "聯盟 - 火槍手": "musketeer", "挑戰節II - 強大寵物": "pets",
        "月活動 - 農曆新年": "lunaryear", "挑戰 - 貝武夫": "beowulf", "聯盟 - 飛蛾": "moth",
        "月活動 - 海灘派對": "beachparty", "月活動 - 卡勒瓦拉": "kalevala", "挑戰節I - 阿瓦隆": "avalon",
        "高塔 - 忍者": "ninja", "月活動 - 莫洛維亞": "morlovia", "月活動 - 飛沙帝國": "sand",
        "三國召喚": "kingdom", "挑戰節I - 仙境": "wonderland", "超級元素": "superelemental",
        "高塔 - 魔法": "magic", "高塔 - 冥河": "styx", "月活動 - 冬季": "christmas",
        "月活動 - 斯普林維爾": "springvale", "挑戰節I - 海盜": "pirates", "挑戰節II - 星隕": "starfall",
        "挑戰 - 石像鬼": "gargoyle", "S1 - 經典": "season1", "S2 - 亞特蘭蒂斯": "season2",
        "S5 - 沙丘": "season5", "神秘 - 暗影召喚": "shadow", "聖約召喚": "covenant",
        "高塔 - 貓頭鷹": "owltower", "聯盟 - 騎士衝擊": "knights", "S6 - 深淵謎團": "untoldtales1", "S7 - 火焰與冰霜的寶藏": "untoldtales2",
        "S3 - 瓦爾哈拉": "season3", "S4 - 地底荒野": "season4", "挑戰 - 重返聖堂": "returntosanctuary",
        "至日召喚": "solstice", "挑戰 - 眾神狂歡節": "carnivalofgods", "傳奇召喚 - 月英": "hotm",
        "月活動 - 戀愛季節": "love", "哥布林召喚": "goblinvillage", "額外抽獎 - 秘密召喚": "secretsummon", "傳奇召喚 - 額外抽獎": "tavernoflegendssecret",
        "挑戰節II - 吟遊詩人": "festival", "星界召喚": "astral", "挑戰節II - 殺手": "slayers",
        "野地召喚": "wilderness", "挑戰節I - 守護者": "teltoc", "挑戰節I - 肅煞森林": "fables",
        "傳奇召喚": "tavernoflegends", "生日召喚": "birthday", "黑色星期五召喚": "blackfriday",
        "豐收召喚": "harvest", "怪獸島召喚": "monsterisland", "挑戰 - 歌劇秘辛": "opera", "挑戰節 I": "challengefestival1", "挑戰節 II": "challengefestival2", "服裝間": "costume",
        // English
        "Challenge Festival II - Villains": "villains", "Alliance - Musketeers": "musketeer", "Challenge Festival II - Pets": "pets",
        "Monthly Event - Lunar Year": "lunaryear", "Challenge - Beowulf": "beowulf", "Alliance - Moths": "moth",
        "Monthly Event - Beach Party": "beachparty", "Monthly Event - Kalevala": "kalevala", "Challenge Festival I - Avalon": "avalon",
        "Tower - Ninjas": "ninja", "Monthly Event - Morlovia": "morlovia", "Monthly Event - Sand Empire": "sand",
        "Three Kingdoms Summon": "kingdom", "Challenge Festival I - Wonderland": "wonderland", "Super Elementals": "superelemental",
        "Tower - Magic": "magic", "Tower - Styx": "styx", "Monthly Event - Winter": "christmas",
        "Monthly Event - Springvale": "springvale", "Challenge Festival I - Pirates": "pirates", "Challenge Festival II - Starfall": "starfall",
        "Challenge - Gargoyle": "gargoyle", "S1 - Classic": "season1", "S2 - Atlantis": "season2",
        "S5 - Dune": "season5", "Mystery - Shadow Summon": "shadow", "Covenant Summon": "covenant",
        "Tower - Owls": "owltower", "Alliance - Knights Clash": "knights", "S6 - Mysteries of the Deep": "untoldtales1", "S7 - Treasures of Flame and Frost": "untoldtales2",
        "S3 - Valhalla": "season3", "S4 - Wilderness": "season4", "Challenge - Return to Sanctuary": "returntosanctuary",
        "Solstice Summon": "solstice", "Challenge - Carnival of Gods": "carnivalofgods", "Legends Summon - Hero of the Month": "hotm",
        "Monthly Event - Love Season": "love", "Goblin Summon": "goblinvillage", "Extra Draw - Secret Summon": "secretsummon", "Legends Summon - Extra Draw": "tavernoflegendssecret",
        "Challenge Festival II - Bards": "festival", "Astral Summon": "astral", "Challenge Festival II - Slayers": "slayers",
        "Wilderness Summon": "wilderness", "Challenge Festival I - Guardians": "teltoc", "Challenge Festival I - Grim Forest": "fables",
        "Legends Summon": "tavernoflegends", "Birthday Summon": "birthday", "Black Friday Summon": "blackfriday",
        "Harvest Summon": "harvest", "Monster Island Summon": "monsterisland", "Challenge - Secrets of the Opera": "opera", "Challenge Festival I": "challengefestival1", "Challenge Festival II": "challengefestival2", "Costume Quest": "costume"
    };
    const sourceIconMap = {
        "villains": "challenge.png", "musketeer": "alliance_quest.png", "pets": "challenge.png",
        "lunaryear": "s1.png", "beowulf": "challenge.png", "moth": "alliance_quest.png",
        "beachparty": "s1.png", "kalevala": "s1.png", "avalon": "challenge.png",
        "ninja": "tower.png", "morlovia": "s1.png", "sand": "s1.png",
        "kingdom": "mercenary_war.png", "wonderland": "challenge.png", "superelemental": "elemental.png",
        "magic": "tower.png", "styx": "tower.png", "christmas": "s1.png",
        "springvale": "s1.png", "pirates": "challenge.png", "starfall": "challenge.png",
        "gargoyle": "challenge.png", "season1": "s1.png", "season2": "s2.png",
        "season5": "s5.png", "shadow": "shadow.png", "covenant": "covenant.png",
        "owltower": "tower.png", "knights": "alliance_quest.png", "untoldtales1": "untoldtales.png", "untoldtales2": "untoldtales.png",
        "season3": "s3.png", "season4": "s4.png", "returntosanctuary": "challenge.png",
        "solstice": "diamond.png", "carnivalofgods": "challenge.png", "hotm": "hotm.png",
        "love": "s1.png", "goblinvillage": "goblin.png", "secretsummon": "lucky.png",
        "festival": "challenge.png", "astral": "astralelves.png", "slayers": "challenge.png",
        "wilderness": "wilderness.png", "teltoc": "challenge.png", "fables": "challenge.png",
        "tavernoflegends": "hotm.png", "tavernoflegendssecret": "hotm.png", "birthday": "diamond.png", "blackfriday": "diamond.png",
        "harvest": "diamond.png", "monsterisland": "monster_angular.png", "opera": "challenge.png", "challengefestival1": "challenge.png", "challengefestival2": "challenge.png", "costume": "costume_key.png",
    };
    const colorReverseMap = {
        '红': 'Red', '紅': 'Red', 'red': 'Red',
        '蓝': 'Blue', '藍': 'Blue', 'blue': 'Blue',
        '绿': 'Green', '綠': 'Green', 'green': 'Green',
        '黄': 'Yellow', '黃': 'Yellow', 'yellow': 'Yellow',
        '紫': 'Purple', 'purple': 'Purple'
    };
    // 在 colorReverseMap 之后添加
    const iconMaps = {
        color: {
            '红': 'imgs/colors/red.png', '紅': 'imgs/colors/red.png', 'red': 'imgs/colors/red.png',
            '蓝': 'imgs/colors/blue.png', '藍': 'imgs/colors/blue.png', 'blue': 'imgs/colors/blue.png',
            '绿': 'imgs/colors/green.png', '綠': 'imgs/colors/green.png', 'green': 'imgs/colors/green.png',
            '黄': 'imgs/colors/yellow.png', '黃': 'imgs/colors/yellow.png', 'yellow': 'imgs/colors/yellow.png',
            '紫': 'imgs/colors/purple.png', 'purple': 'imgs/colors/purple.png'
        },
        class: { // 利用已有的 classReverseMap 来构建
            ...Object.fromEntries(Object.keys(classReverseMap).map(key => [key, `imgs/classes/${classReverseMap[key]}.png`]))
        },
        source: { // 利用已有的 sourceReverseMap 和 sourceIconMap 来构建
            ...Object.fromEntries(Object.keys(sourceReverseMap).map(key => {
                const sourceKey = sourceReverseMap[key];
                const iconFilename = sourceIconMap[sourceKey];
                return iconFilename ? [key, `imgs/coins/${iconFilename}`] : [key, null];
            }).filter(entry => entry[1]))
        },
        aetherpower: { // <-- 新增 aetherpower 映射
            ...Object.fromEntries(Object.keys(aetherPowerReverseMap).map(key => [key, `imgs/Aether Power/${aetherPowerReverseMap[key]}.png`]))
        }
    };
    let farmGuideScrollHandler = null;
    let scrollPositions = {
        list: { top: 0, left: 0 },
        wanted: { top: 0, left: 0 },
        farming: { top: 0, left: 0 }
    };
    let filteredHeroes = [];
    let multiSelectFilters = {}; // 存储每个筛选器已选中的值，例如 { color: ['Red', 'Blue'], class: [] }
    let availableOptions = {}; // 缓存每个筛选器的所有可用选项
    let allHeroes = [];
    let families_bonus = [];
    let family_values = {};
    let currentLang = 'cn';
    let currentSort = { key: 'power', direction: 'desc' };
    let temporaryFavorites = null; // 用于临时存储分享的收藏列表
    let modalStack = []; // 用于管理模态框堆栈
    let temporaryDateFilter = null; // 用于一键日期筛选

    // 定义硬编码的日期
    const oneClickMaxDate = '2025-09-29';
    const purchaseCostumeDate = '2025-07-28';

    // 根据翻译表，自动生成反向映射表（用于从中文查找英文）
    const reverseSkillTypeMap_cn = Object.fromEntries(Object.entries(skillTypeTranslations_cn).map(([key, value]) => [value, key]));
    const reverseSkillTypeMap_tc = Object.fromEntries(Object.entries(skillTypeTranslations_tc).map(([key, value]) => [value, key]));

    // 通缉任务表数据
    const wantedMissionData = [
        { season: 'S1', daily: '7-4', red: '4-1', green: '7-5', blue: '8-7', purple: '7-4', yellow: '10-6' },
        { season: 'S2', daily: ['4-3', '7-1'], red: '3-8', green: '7-1', blue: '8-10', purple: '21-10', yellow: ['13-1', '9-5'] },
        { season: 'S3', daily: '9-8', red: '6-2', green: ['4-8', '30-6'], blue: '9-8', purple: '17-9', yellow: '8-6' },
        { season: 'S4', daily: '6-10', red: ['12-6', '32-6'], green: '9-2', blue: ['8-2', '30-7'], purple: '14-8', yellow: '4-7' },
        { season: 'S5', daily: ['5-10', '6-10'], red: '2-9', green: ['10-8', '30-8'], blue: '22-2', purple: '5-10', yellow: '16-8' },
        { season: 'S6', daily: '1-26', red: '1-24', green: ['1-11', '1-12'], blue: '3-13', purple: '1-28', yellow: ['2-6', '6-7'] }
    ];

    // 材料出处指南数据
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
    // 天赋升级消耗数据 (3星, 4星, 5星)
    const costData = [{ "slot": 301, "emblem": 14, "emblemacc": 14, "food": "7,063", "foodacc": "7,063", "iron": "2,511", "ironacc": "2,511", "masteremblem": "", "masteremblemacc": "" }, { "slot": 302, "emblem": 7, "emblemacc": 21, "food": "8,591", "foodacc": "15,654", "iron": "3,054", "ironacc": "5,565", "masteremblem": "", "masteremblemacc": "" }, { "slot": 303, "emblem": 7, "emblemacc": 28, "food": "12,129", "foodacc": "27,783", "iron": "4,312", "ironacc": "9,877", "masteremblem": "", "masteremblemacc": "" }, { "slot": 304, "emblem": 14, "emblemacc": 42, "food": "21,895", "foodacc": "49,678", "iron": "7,784", "ironacc": "17,661", "masteremblem": "", "masteremblemacc": "" }, { "slot": 305, "emblem": 7, "emblemacc": 49, "food": "19,205", "foodacc": "68,883", "iron": "6,828", "ironacc": "24,489", "masteremblem": "", "masteremblemacc": "" }, { "slot": 306, "emblem": 7, "emblemacc": 56, "food": "22,743", "foodacc": "91,626", "iron": "8,086", "ironacc": "32,575", "masteremblem": "", "masteremblemacc": "" }, { "slot": 307, "emblem": 14, "emblemacc": 70, "food": "36,727", "foodacc": "128,353", "iron": "13,057", "ironacc": "45,632", "masteremblem": "", "masteremblemacc": "" }, { "slot": 308, "emblem": 17, "emblemacc": 87, "food": "31,352", "foodacc": "159,705", "iron": "11,145", "ironacc": "56,777", "masteremblem": "", "masteremblemacc": "" }, { "slot": 309, "emblem": 7, "emblemacc": 94, "food": "33,356", "foodacc": "193,061", "iron": "11,860", "ironacc": "68,637", "masteremblem": "", "masteremblemacc": "" }, { "slot": 310, "emblem": 17, "emblemacc": 111, "food": "38,792", "foodacc": "231,853", "iron": "13,789", "ironacc": "82,426", "masteremblem": "", "masteremblemacc": "" }, { "slot": 311, "emblem": 7, "emblemacc": 118, "food": "40,432", "foodacc": "272,285", "iron": "14,376", "ironacc": "96,802", "masteremblem": "", "masteremblemacc": "" }, { "slot": 312, "emblem": 14, "emblemacc": 132, "food": "61,448", "foodacc": "333,733", "iron": "21,845", "ironacc": "118,647", "masteremblem": "", "masteremblemacc": "" }, { "slot": 313, "emblem": 7, "emblemacc": 139, "food": "47,507", "foodacc": "381,240", "iron": "16,891", "ironacc": "135,538", "masteremblem": "", "masteremblemacc": "" }, { "slot": 314, "emblem": 7, "emblemacc": 146, "food": "51,045", "foodacc": "432,285", "iron": "18,149", "ironacc": "153,687", "masteremblem": "", "masteremblemacc": "" }, { "slot": 315, "emblem": 14, "emblemacc": 160, "food": "76,280", "foodacc": "508,565", "iron": "27,118", "ironacc": "180,805", "masteremblem": "", "masteremblemacc": "" }, { "slot": 316, "emblem": 7, "emblemacc": 167, "food": "58,121", "foodacc": "566,686", "iron": "20,665", "ironacc": "201,470", "masteremblem": "", "masteremblemacc": "" }, { "slot": 317, "emblem": 7, "emblemacc": 174, "food": "61,658", "foodacc": "628,344", "iron": "21,923", "ironacc": "223,393", "masteremblem": "", "masteremblemacc": "" }, { "slot": 318, "emblem": 7, "emblemacc": 181, "food": "65,196", "foodacc": "693,540", "iron": "23,181", "ironacc": "246,574", "masteremblem": "", "masteremblemacc": "" }, { "slot": 319, "emblem": 17, "emblemacc": 198, "food": "72,270", "foodacc": "765,810", "iron": "25,690", "ironacc": "272,264", "masteremblem": "", "masteremblemacc": "" }, { "slot": 320, "emblem": 35, "emblemacc": 233, "food": "98,226", "foodacc": "864,036", "iron": "34,920", "ironacc": "307,184", "masteremblem": "", "masteremblemacc": "" }, { "slot": 321, "emblem": 30, "emblemacc": 263, "food": "80,000", "foodacc": "944,036", "iron": "80,000", "ironacc": "387,184", "masteremblem": "3", "masteremblemacc": "3" }, { "slot": 322, "emblem": 30, "emblemacc": 293, "food": "80,000", "foodacc": "1,024,036", "iron": "80,000", "ironacc": "467,184", "masteremblem": "3", "masteremblemacc": "6" }, { "slot": 323, "emblem": 30, "emblemacc": 323, "food": "80,000", "foodacc": "1,104,036", "iron": "80,000", "ironacc": "547,184", "masteremblem": "3", "masteremblemacc": "9" }, { "slot": 324, "emblem": 30, "emblemacc": 353, "food": "80,000", "foodacc": "1,184,036", "iron": "80,000", "ironacc": "627,184", "masteremblem": "3", "masteremblemacc": "12" }, { "slot": 325, "emblem": 30, "emblemacc": 383, "food": "80,000", "foodacc": "1,264,036", "iron": "80,000", "ironacc": "707,184", "masteremblem": "3", "masteremblemacc": "15" }, { "slot": 401, "emblem": 30, "emblemacc": 30, "food": "17,658", "foodacc": "17,658", "iron": "6,278", "ironacc": "6,278", "masteremblem": "", "masteremblemacc": "" }, { "slot": 402, "emblem": 15, "emblemacc": 45, "food": "21,481", "foodacc": "39,139", "iron": "7,638", "ironacc": "13,916", "masteremblem": "", "masteremblemacc": "" }, { "slot": 403, "emblem": 15, "emblemacc": 60, "food": "30,326", "foodacc": "69,465", "iron": "10,783", "ironacc": "24,699", "masteremblem": "", "masteremblemacc": "" }, { "slot": 404, "emblem": 30, "emblemacc": 90, "food": "54,739", "foodacc": "124,204", "iron": "19,461", "ironacc": "44,160", "masteremblem": "", "masteremblemacc": "" }, { "slot": 405, "emblem": 15, "emblemacc": 105, "food": "48,016", "foodacc": "172,220", "iron": "17,073", "ironacc": "61,233", "masteremblem": "", "masteremblemacc": "" }, { "slot": 406, "emblem": 15, "emblemacc": 120, "food": "56,862", "foodacc": "229,082", "iron": "20,218", "ironacc": "81,451", "masteremblem": "", "masteremblemacc": "" }, { "slot": 407, "emblem": 30, "emblemacc": 150, "food": "91,821", "foodacc": "320,903", "iron": "32,645", "ironacc": "114,096", "masteremblem": "", "masteremblemacc": "" }, { "slot": 408, "emblem": 40, "emblemacc": 190, "food": "78,375", "foodacc": "399,278", "iron": "27,865", "ironacc": "141,961", "masteremblem": "", "masteremblemacc": "" }, { "slot": 409, "emblem": 15, "emblemacc": 205, "food": "83,397", "foodacc": "482,675", "iron": "29,653", "ironacc": "171,614", "masteremblem": "", "masteremblemacc": "" }, { "slot": 410, "emblem": 40, "emblemacc": 245, "food": "96,973", "foodacc": "579,648", "iron": "34,477", "ironacc": "206,091", "masteremblem": "", "masteremblemacc": "" }, { "slot": 411, "emblem": 15, "emblemacc": 260, "food": "101,000", "foodacc": "680,648", "iron": "35,944", "ironacc": "242,035", "masteremblem": "", "masteremblemacc": "" }, { "slot": 412, "emblem": 30, "emblemacc": 290, "food": "153,000", "foodacc": "833,648", "iron": "54,618", "ironacc": "296,653", "masteremblem": "", "masteremblemacc": "" }, { "slot": 413, "emblem": 15, "emblemacc": 305, "food": "118,000", "foodacc": "951,648", "iron": "42,234", "ironacc": "338,887", "masteremblem": "", "masteremblemacc": "" }, { "slot": 414, "emblem": 15, "emblemacc": 320, "food": "127,000", "foodacc": "1,078,648", "iron": "45,379", "ironacc": "384,266", "masteremblem": "", "masteremblemacc": "" }, { "slot": 415, "emblem": 30, "emblemacc": 350, "food": "190,000", "foodacc": "1,268,648", "iron": "67,802", "ironacc": "452,068", "masteremblem": "", "masteremblemacc": "" }, { "slot": 416, "emblem": 15, "emblemacc": 365, "food": "145,000", "foodacc": "1,413,648", "iron": "51,669", "ironacc": "503,737", "masteremblem": "", "masteremblemacc": "" }, { "slot": 417, "emblem": 15, "emblemacc": 380, "food": "154,000", "foodacc": "1,567,648", "iron": "54,814", "ironacc": "558,551", "masteremblem": "", "masteremblemacc": "" }, { "slot": 418, "emblem": 15, "emblemacc": 395, "food": "163,000", "foodacc": "1,730,648", "iron": "57,959", "ironacc": "616,510", "masteremblem": "", "masteremblemacc": "" }, { "slot": 419, "emblem": 40, "emblemacc": 435, "food": "180,000", "foodacc": "1,910,648", "iron": "64,232", "ironacc": "680,742", "masteremblem": "", "masteremblemacc": "" }, { "slot": 420, "emblem": 70, "emblemacc": 505, "food": "245,000", "foodacc": "2,155,648", "iron": "87,315", "ironacc": "768,057", "masteremblem": "", "masteremblemacc": "" }, { "slot": 421, "emblem": 50, "emblemacc": 555, "food": "200,000", "foodacc": "2,355,648", "iron": "200,000", "ironacc": "968,057", "masteremblem": "5", "masteremblemacc": "5" }, { "slot": 422, "emblem": 50, "emblemacc": 605, "food": "200,000", "foodacc": "2,555,648", "iron": "200,000", "ironacc": "1,168,057", "masteremblem": "5", "masteremblemacc": "10" }, { "slot": 423, "emblem": 50, "emblemacc": 655, "food": "200,000", "foodacc": "2,755,648", "iron": "200,000", "ironacc": "1,368,057", "masteremblem": "5", "masteremblemacc": "15" }, { "slot": 424, "emblem": 50, "emblemacc": 705, "food": "200,000", "foodacc": "2,955,648", "iron": "200,000", "ironacc": "1,568,057", "masteremblem": "5", "masteremblemacc": "20" }, { "slot": 425, "emblem": 50, "emblemacc": 755, "food": "200,000", "foodacc": "3,155,648", "iron": "200,000", "ironacc": "1,768,057", "masteremblem": "5", "masteremblemacc": "25" }, { "slot": 501, "emblem": 65, "emblemacc": 65, "food": "49,050", "foodacc": "49,050", "iron": "17,200", "ironacc": "17,200", "masteremblem": "", "masteremblemacc": "" }, { "slot": 502, "emblem": 50, "emblemacc": 115, "food": "59,670", "foodacc": "108,720", "iron": "21,080", "ironacc": "38,280", "masteremblem": "", "masteremblemacc": "" }, { "slot": 503, "emblem": 50, "emblemacc": 165, "food": "84,240", "foodacc": "192,960", "iron": "29,760", "ironacc": "68,040", "masteremblem": "", "masteremblemacc": "" }, { "slot": 504, "emblem": 65, "emblemacc": 230, "food": "152,000", "foodacc": "344,960", "iron": "53,320", "ironacc": "121,360", "masteremblem": "", "masteremblemacc": "" }, { "slot": 505, "emblem": 50, "emblemacc": 280, "food": "133,000", "foodacc": "477,960", "iron": "47,120", "ironacc": "168,480", "masteremblem": "", "masteremblemacc": "" }, { "slot": 506, "emblem": 50, "emblemacc": 330, "food": "157,000", "foodacc": "634,960", "iron": "55,800", "ironacc": "224,280", "masteremblem": "", "masteremblemacc": "" }, { "slot": 507, "emblem": 65, "emblemacc": 395, "food": "255,000", "foodacc": "889,960", "iron": "89,440", "ironacc": "313,720", "masteremblem": "", "masteremblemacc": "" }, { "slot": 508, "emblem": 80, "emblemacc": 475, "food": "217,000", "foodacc": "1,106,960", "iron": "77,880", "ironacc": "391,600", "masteremblem": "", "masteremblemacc": "" }, { "slot": 509, "emblem": 50, "emblemacc": 525, "food": "231,000", "foodacc": "1,337,960", "iron": "81,840", "ironacc": "473,440", "masteremblem": "", "masteremblemacc": "" }, { "slot": 510, "emblem": 80, "emblemacc": 605, "food": "269,000", "foodacc": "1,606,960", "iron": "96,360", "ironacc": "569,800", "masteremblem": "", "masteremblemacc": "" }, { "slot": 511, "emblem": 50, "emblemacc": 655, "food": "280,000", "foodacc": "1,886,960", "iron": "99,200", "ironacc": "669,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 512, "emblem": 65, "emblemacc": 720, "food": "426,000", "foodacc": "2,312,960", "iron": "149,000", "ironacc": "818,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 513, "emblem": 50, "emblemacc": 770, "food": "329,000", "foodacc": "2,641,960", "iron": "116,000", "ironacc": "934,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 514, "emblem": 50, "emblemacc": 820, "food": "354,000", "foodacc": "2,995,960", "iron": "125,000", "ironacc": "1,059,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 515, "emblem": 65, "emblemacc": 885, "food": "529,000", "foodacc": "3,524,960", "iron": "185,000", "ironacc": "1,244,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 516, "emblem": 50, "emblemacc": 935, "food": "403,000", "foodacc": "3,927,960", "iron": "142,000", "ironacc": "1,386,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 517, "emblem": 50, "emblemacc": 985, "food": "428,000", "foodacc": "4,355,960", "iron": "151,000", "ironacc": "1,537,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 518, "emblem": 50, "emblemacc": 1035, "food": "452,000", "foodacc": "4,807,960", "iron": "159,000", "ironacc": "1,696,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 519, "emblem": 80, "emblemacc": 1115, "food": "501,000", "foodacc": "5,308,960", "iron": "179,000", "ironacc": "1,875,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 520, "emblem": 125, "emblemacc": 1240, "food": "682,000", "foodacc": "5,990,960", "iron": "234,000", "ironacc": "2,109,000", "masteremblem": "", "masteremblemacc": "" }, { "slot": 521, "emblem": 100, "emblemacc": 1340, "food": "400,000", "foodacc": "6,390,960", "iron": "400,000", "ironacc": "2,509,000", "masteremblem": "10", "masteremblemacc": "10" }, { "slot": 522, "emblem": 100, "emblemacc": 1440, "food": "400,000", "foodacc": "6,790,960", "iron": "400,000", "ironacc": "2,909,000", "masteremblem": "10", "masteremblemacc": "20" }, { "slot": 523, "emblem": 100, "emblemacc": 1540, "food": "400,000", "foodacc": "7,190,960", "iron": "400,000", "ironacc": "3,309,000", "masteremblem": "10", "masteremblemacc": "30" }, { "slot": 524, "emblem": 100, "emblemacc": 1640, "food": "400,000", "foodacc": "7,590,960", "iron": "400,000", "ironacc": "3,709,000", "masteremblem": "10", "masteremblemacc": "40" }, { "slot": 525, "emblem": 100, "emblemacc": 1740, "food": "400,000", "foodacc": "7,990,960", "iron": "400,000", "ironacc": "4,109,000", "masteremblem": "10", "masteremblemacc": "50" }];

    // --- DOM 元素 ---
    const themeToggleButton = document.getElementById('theme-toggle-btn');
    const langSelectBtn = document.getElementById('lang-select-btn');
    const langOptions = document.getElementById('lang-options');
    const resultsWrapper = document.getElementById('results-wrapper');
    const resultsHeader = document.querySelector('.results-header');

    const heroTableView = document.getElementById('hero-table-view');
    const wantedMissionView = document.getElementById('wanted-mission-view');
    const farmingGuideView = document.getElementById('farming-guide-view');
    const heroTable = document.getElementById('hero-table');
    const wantedMissionTable = document.getElementById('wanted-mission-table');
    const farmingGuideTable = document.getElementById('farming-guide-table');

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
    const enableSkillQuickSearchCheckbox = document.getElementById('enable-skill-quick-search-checkbox');
    const showWantedMissionBtn = document.getElementById('show-wanted-mission-btn');
    const showFarmingGuideBtn = document.getElementById('show-farming-guide-btn');
    const showTeamSimulatorBtn = document.getElementById('show-team-simulator-btn');
    const teamSimulatorDisplay = document.getElementById('team-simulator-display');
    const teamDisplayGrid = document.getElementById('team-display-grid');
    const headerInfoContainer = document.querySelector('.header-info-container');

    const oneClickMaxDateDisplay = document.getElementById('one-click-max-date-display');
    const purchaseCostumeDateDisplay = document.getElementById('purchase-costume-date-display');
    const filterHero730Btn = document.getElementById('filter-hero-730-btn');
    const filterCostume548Btn = document.getElementById('filter-costume-548-btn');

    // --- 新增: 全局天赋设置控件 ---
    const defaultTalentStrategySelect = document.getElementById('default-talent-strategy-select');
    const defaultManaPriorityCheckbox = document.getElementById('default-mana-priority-checkbox');
    const defaultLimitBreakSelect = document.getElementById('default-limit-break-select');
    const defaultTalentSelect = document.getElementById('default-talent-select');
    const showLbTalentDetailsCheckbox = document.getElementById('show-lb-talent-details-checkbox');


    const filterInputs = {
        name: document.getElementById('name-input'),
        star: document.getElementById('star-select'),
        color: document.getElementById('color-select'),
        speed: document.getElementById('speed-select'),
        class: document.getElementById('class-select'),
        family: document.getElementById('family-select'),
        costume: document.getElementById('costume-type-select'),
        source: document.getElementById('source-select'),
        aetherpower: document.getElementById('aetherpower-select'),
        skillTypeSource: document.getElementById('skill-type-source-select'),
        types: document.getElementById('type-input'),
        effects: document.getElementById('effects-input'),
        passives: document.getElementById('passives-input'),
        power: document.getElementById('power-input'),
        attack: document.getElementById('attack-input'),
        defense: document.getElementById('defense-input'),
        health: document.getElementById('health-input'),
    };

    // --- 聊天模拟器新增变量 ---
    const showChatSimulatorBtn = document.getElementById('show-chat-simulator-btn');
    const chatSimulatorView = document.getElementById('chat-simulator-view');
    const chatSimulatorInput = document.getElementById('chat-simulator-input');
    const chatSimulatorPreview = document.getElementById('chat-simulator-preview');
    const chatSimulatorCopyBtn = document.getElementById('chat-simulator-copy-btn');
    const emojiGrid = document.getElementById('emoji-grid');
    const insertColorBtn = document.getElementById('insert-color-btn');

    // 自定义调色板元素
    const customColorPicker = document.getElementById('custom-color-picker');
    const svBox = document.getElementById('sv-box');
    const svCursor = document.getElementById('sv-cursor');
    const hueSlider = document.getElementById('hue-slider');
    const hueCursor = document.getElementById('hue-cursor');
    const colorPreviewBox = document.getElementById('color-preview-box');
    const colorHexCodeInput = document.getElementById('color-hex-code');

    // --- 新增: 队伍模拟器变量 ---
    let teamSimulatorActive = false;
    let teamSlots = Array(5).fill(null);
    let swapModeActive = false; // 新增：标记是否进入交换模式
    let selectedForSwapIndex = -1; // 新增：记录被选中要交换的英雄索引
    let teamMemberInstanceCounter = 0;
    const teamSimulatorWrapper = document.getElementById('team-simulator-wrapper');
    const saveTeamBtn = document.getElementById('save-team-btn');
    const shareTeamListBtn = document.getElementById('share-team-list-btn');
    const savedTeamsList = document.getElementById('saved-teams-list');
    let isViewingSharedTeams = false;
    let sharedTeamsDataFromUrl = [];
    const myTeamsTabBtn = document.getElementById('tab-my-teams');
    const sharedTeamsTabBtn = document.getElementById('tab-shared-teams');


    // 调色板状态
    let isDraggingHue = false;
    let isDraggingSV = false;
    let hsv = { h: 0, s: 1, v: 1 }; // Hue: 0-1, Saturation: 0-1, Value: 0-1
    const emojiList = ['smile', 'grin', 'lol', 'rofl', 'sad', 'crying', 'blush', 'rolleyes', 'kiss', 'love', 'geek', 'monocle', 'think', 'tongue', 'cool', 'horror', 'angry', 'evil', 'hand', 'thumbsup', 'thumbsdown', 'hankey', 'ham', 'alien', 'ghost', 'richard', 'mage', 'magered', 'staff', 'heart', 'heartblue', 'heartgreen', 'heartyellow', 'heartpurple', 'pizza', 'cake', 'donut', 'coffee', 'sword', 'swords', 'axe', 'axes', 'hammer', 'helmet', 'skull', 'bunny', 'cat', 'catgrey', 'dog', 'butterfly', 'butterflyblue', 'fox', 'flower', 'sunflower', 'palmtree', 'splash', 'teardrop', 'fire', 'lightning', 'star', 'elementfire', 'elementice', 'elementnature', 'elementholy', 'elementdark'];

    

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
        const langDict = i18n[lang] || i18n.cn;
        document.title = langDict.pageTitle;

        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (key === 'headerTitle' && el.tagName === 'H1') {
                const link = el.querySelector('a');
                if (link) link.textContent = langDict[key];
            } else {
                const translation = langDict[key];
                if (typeof translation === 'function') { } else if (translation !== undefined) {
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
            if (langDict[key]) {
                el.placeholder = langDict[key];
            }
        });

        const titles = {
            'theme-toggle-btn': 'toggleThemeTitle',
            'lang-select-btn': 'toggleLanguageTitle',
            'show-wanted-mission-btn': 'showWantedMissionTitle',
            'open-filters-btn': 'openFiltersTitle',
            'calendar-btn': 'calendarTitle',
            'close-filters-modal-btn': 'closeBtnTitle',
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
        const metaDesc = document.getElementById('meta-description');

        if (metaDesc && langDict.metaDescription) {
            metaDesc.setAttribute('content', langDict.metaDescription);
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

    function changeLanguage(lang) {
        setCookie('language', lang, 365);
        window.location.reload();
    }

    function getFavorites() {
        try {
            const favorites = localStorage.getItem('heroFavorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            console.error("从localStorage获取收藏夹失败", e);
            return [];
        }
    }

    function saveFavorites(favoritesArray) {
        try {
            localStorage.setItem('heroFavorites', JSON.stringify(favoritesArray));
        } catch (e) {
            console.error("保存收藏夹到localStorage失败", e);
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
            console.warn("无法收藏没有英文名的英雄:", hero.name);
            return false;
        }
        let favorites = getFavorites();
        const identifier = `${hero.english_name}-${hero.costume_id}`;
        const index = favorites.indexOf(identifier);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(identifier);
        }
        saveFavorites(favorites);
        return index === -1;
    }

    function extractEnglishName(hero) {
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
        const singleAltLangNamePattern = /^(.*?)\s*\(([^)]+)\)/;
        const singleAltLangMatch = tempName.match(singleAltLangNamePattern);
        if (singleAltLangMatch && singleAltLangMatch[2]) {
            const potentialEnglishName = singleAltLangMatch[2].trim();
            if (/[a-zA-Z]/.test(potentialEnglishName) && !/[\u4e00-\u9fa5]/.test(potentialEnglishName)) {
                return potentialEnglishName;
            }
        }
        return null;
    }

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
            if (resultsWrapper) resultsWrapper.innerHTML = `<p style='color: var(--md-sys-color-error); font-weight: bold;'>错误：加载数据失败。请检查控制台获取详细信息。</p>`;
            if (pageLoader) pageLoader.classList.add('hidden');
            return false;
        }
    }

    function adjustStickyHeaders() {
        if (!resultsHeader) return;
        const headerHeight = resultsHeader.offsetHeight;
        const theads = document.querySelectorAll('#results-wrapper thead');
        theads.forEach(thead => {
            if (thead) {
                thead.style.top = `${headerHeight - 1}px`;
            }
        });
    }

    const getColorGlowClass = (colorName) => {
        const colorMap = {
            '红': 'red', '紅': 'red', 'red': 'red', '蓝': 'blue', '藍': 'blue', 'blue': 'blue',
            '绿': 'green', '綠': 'green', 'green': 'green', '黄': 'yellow', '黃': 'yellow', 'yellow': 'yellow',
            '紫': 'purple', '紫': 'purple', 'purple': 'purple', '白': 'white', '白': 'white', 'white': 'white',
            '黑': 'black', '黑': 'black', 'black': 'black',
        };
        const standardColor = colorMap[String(colorName).toLowerCase()];
        return standardColor ? `${standardColor}-glow-border` : '';
    };

    const getColorHex = (colorName) => {
        const colorMap = {
            '红': '#ff7a4c', '紅': '#ff7a4c', 'red': '#ff7a4c', '蓝': '#41d8fe', '藍': '#41d8fe', 'blue': '#41d8fe',
            '绿': '#70e92f', '綠': '#70e92f', 'green': '#70e92f', '黄': '#f2e33a', '黃': '#f2e33a', 'yellow': '#f2e33a',
            '紫': '#e290ff', '紫': '#e290ff', 'purple': '#e290ff',
        };
        return colorMap[String(colorName).toLowerCase()] || 'inherit';
    };

    function getDisplayName(value, type) {
        const showEventNameCheckbox = document.getElementById('show-event-name-checkbox');
        if (!showEventNameCheckbox || showEventNameCheckbox.checked) {
            return family_values[String(value).toLowerCase()] || value;
        }

        let translatedValue = family_values[String(value).toLowerCase()] || value;
        if (type === 'family' || type === 'source') {
            const parts = translatedValue.split(' - ');
            if (parts.length > 1) {
                return parts.slice(1).join(' - ').trim();
            }
        }
        return translatedValue;
    }

    function populateFilters() {
        const filtersToConvert = ['filterScope', 'star', 'color', 'speed', 'class', 'costume', 'family', 'source', 'aetherpower'];
        const langDict = i18n[currentLang];

        filtersToConvert.forEach(key => {
            let values;
            if (key === 'filterScope') {
                values = ['all', 'hero', 'skin', 'favorites'];
            } else if (key === 'costume') {
                values = [...new Set(allHeroes.map(h => getSkinInfo(h).skinIdentifier).filter(Boolean))];
            } else {
                const heroDataKey = key === 'aetherpower' ? 'AetherPower' : key;
                values = [...new Set(allHeroes.map(h => h[heroDataKey]).filter(v => v != null && v !== ''))];
            }

            const locale = { cn: 'zh-CN', tc: 'zh-TW' }[currentLang] || 'en-US';
            const sortOptions = currentLang === 'tc' ? { usage: 'sort', collation: 'stroke' } : { usage: 'sort' };

            if (key === 'speed') {
                const speedOrder = { cn: speedOrder_cn, tc: speedOrder_tc, en: speedOrder_en }[currentLang];
                if (speedOrder) {
                    values.sort((a, b) => speedOrder.indexOf(a) - speedOrder.indexOf(b));
                }
            } else if (key === 'color') {
                const colorOrder = { cn: colorOrder_cn, tc: colorOrder_tc, en: colorOrder_en }[currentLang];
                if (colorOrder) {
                    values.sort((a, b) => colorOrder.indexOf(a) - colorOrder.indexOf(b));
                }
            } else if (key === 'family') {
                values.sort((a, b) => {
                    const translatedA = family_values[String(a).toLowerCase()] || a;
                    const translatedB = family_values[String(b).toLowerCase()] || b;
                    return translatedA.localeCompare(translatedB, locale, sortOptions);
                });
            } else if (key === 'costume') {
                // --- 新增的服装类型自定义排序逻辑 ---

                // 1. 根据不同语言，定义期望的排序顺序
                // 注意：这里的字符串需要与英雄名字中提取出来的完全一致
                const costumeOrder_cn = ['C1', 'C2', '卡通', '玻璃'];
                const costumeOrder_tc = ['C1', 'C2', '卡通', '玻璃'];
                const costumeOrder_en = ['C1', 'C2', 'Toon', 'Glass'];

                // 2. 根据当前语言选择正确的排序数组
                const order = { cn: costumeOrder_cn, tc: costumeOrder_tc, en: costumeOrder_en }[currentLang] || costumeOrder_en;

                // 3. 使用自定义排序规则进行排序
                values.sort((a, b) => {
                    const indexA = order.indexOf(a);
                    const indexB = order.indexOf(b);

                    // 如果两个值都在我们的排序列表里，就按列表的顺序排
                    if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB;
                    }
                    // 如果只有 a 在列表里，a 排在前面
                    if (indexA !== -1) {
                        return -1;
                    }
                    // 如果只有 b 在列表里，b 排在前面
                    if (indexB !== -1) {
                        return 1;
                    }
                    // 如果都不在列表里（例如未来新增的服装类型），则按字母顺序排
                    return a.localeCompare(b);
                });
            } else {
                values.sort((a, b) => String(a).localeCompare(String(b), locale));
            }

            availableOptions[key] = values;
            if (key === 'filterScope') {
                multiSelectFilters[key] = ['all'];
            } else {
                multiSelectFilters[key] = [];
            }
        });

        const container = document.getElementById('standard-filters-container');
        if (!container) return;

        container.innerHTML = '';

        filtersToConvert.forEach(key => {
            const button = document.createElement('button');
            button.id = `btn-filter-${key}`;
            button.className = 'filter-button';

            let title;
            if (key === 'filterScope') {
                title = langDict.filterHeroes;
            } else {
                const labelKey = key === 'aetherpower' ? 'aetherPowerLabel' : (key === 'costume' ? 'costumeTypeLabel' : `${key}Label`);
                title = langDict[labelKey] ? langDict[labelKey].slice(0, -1) : key;
            }
            button.addEventListener('click', () => {
                openMultiSelectModal(key, title);
            });

            container.appendChild(button);
            updateFilterButtonUI(key);
        });
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'filter-button';
        checkboxWrapper.style.padding = '0';
        checkboxWrapper.style.border = 'none';
        checkboxWrapper.style.backgroundColor = 'transparent';

        checkboxWrapper.innerHTML = `
        <div class="checkbox-container" style="width: 100%; height: 100%;">
            <input type="checkbox" id="show-event-name-checkbox">
            <label for="show-event-name-checkbox" class="checkbox-label" data-lang-key="showEventNameLabel">${langDict.showEventNameLabel}</label>
        </div>
        `;
        container.appendChild(checkboxWrapper);

        // --- Corrected Checkbox State Management Logic ---
        // This entire block is self-contained and robust.

        // 1. Get the checkbox element that was just created
        const showEventNameCheckbox = document.getElementById('show-event-name-checkbox');

        // 2. Read the saved state from the cookie
        const cookieValue = getCookie('showEventNameState');

        // 3. Set the initial state:
        //    - Default to checked (true) if the cookie doesn't exist (first visit).
        //    - Otherwise, only uncheck if the cookie explicitly stores "false".
        showEventNameCheckbox.checked = (cookieValue === null) ? true : (cookieValue !== 'false');

        // 4. Add the event listener
        showEventNameCheckbox.addEventListener('change', () => {
            // Explicitly save the boolean state as a string "true" or "false"
            setCookie('showEventNameState', showEventNameCheckbox.checked.toString(), 365);

            // When the state changes, just re-apply filters and render the list.
            // This call does NOT cause loops or disappearing buttons.
            applyFiltersAndRender();
        });
    }

    function updateFilterButtonUI(filterType) {
        const button = document.getElementById(`btn-filter-${filterType}`);
        if (!button) return;

        const selectedCount = multiSelectFilters[filterType].length;
        const langDict = i18n[currentLang];

        let labelKey;
        if (filterType === 'aetherpower') {
            labelKey = 'aetherPowerLabel';
        } else if (filterType === 'costume') {
            labelKey = 'costumeTypeLabel';
        } else if (filterType === 'filterScope') {
            labelKey = 'filterScopeLabel'
        }
        else {
            labelKey = `${filterType}Label`;
        }
        const label = langDict[labelKey] ? langDict[labelKey].slice(0, -1) : filterType;

        if (selectedCount === 0) {
            button.textContent = label;
            button.classList.remove('active');
        } else if (filterType === 'filterScope') {
            const scope_label = langDict[`filterScope_${multiSelectFilters[filterType][0]}`]
            button.textContent = `${label}: ${scope_label}`;
            button.classList.add('active');
        } else {
            button.textContent = `${label} (${selectedCount})`;
            button.classList.add('active');
        }
    }


    function getIconForFilter(filterType, optionValue) {
        if (!optionValue) return null;

        switch (filterType) {
            case 'color':
            case 'class':
                return (iconMaps[filterType] && iconMaps[filterType][optionValue]) || null;
            case 'aetherpower':
                let englishName;
                if (currentLang === 'en') {
                    englishName = optionValue;
                } else {
                    englishName = aetherPowerReverseMap[optionValue];
                }

                if (englishName) {
                    // 关键修正：将获取到的英文名转换为小写来匹配你的文件名
                    const aetherFileName = englishName.trim().toLowerCase();
                    return `imgs/Aether Power/${aetherFileName}.png`;
                }
                return null;
            case 'family':
                return `imgs/family/${String(optionValue).toLowerCase()}.png`;
            case 'source':
                const sourceKey = sourceReverseMap[optionValue];
                const iconFilename = sourceIconMap[sourceKey];
                return iconFilename ? `imgs/coins/${iconFilename}` : null;
            case 'star':
                return null;
            case 'costume':
                const iconName = getCostumeIconName(optionValue);
                return iconName ? `imgs/costume/${iconName}.png` : null;
            default:
                return null;
        }
    }

    function resetAllFilters() {
        if (typeof multiSelectFilters !== 'undefined') {
            Object.keys(multiSelectFilters).forEach(key => {
                if (key === 'filterScope') {
                    multiSelectFilters[key] = ['all'];
                } else {
                    multiSelectFilters[key] = [];
                }
                if (typeof updateFilterButtonUI === 'function') {
                    updateFilterButtonUI(key);
                }
            });
        }

        for (const key in filterInputs) {
            if (multiSelectFilters.hasOwnProperty(key)) continue;
            const element = filterInputs[key];
            if (element) {
                if (element.tagName === 'INPUT') {
                    element.value = '';
                }
            }
        }
        temporaryFavorites = null;
        temporaryDateFilter = null;
    }

    function openMultiSelectModal(filterType, title) {
        const modal = document.getElementById('multi-select-modal');
        const overlay = document.getElementById('multi-select-modal-overlay');
        const modalContent = document.getElementById('multi-select-modal-content');

        const options = availableOptions[filterType];
        const currentSelections = new Set([...multiSelectFilters[filterType]]);

        // 1. 构建模态框内容
        let optionsHTML = options.map(optionValue => {
            const isSelected = currentSelections.has(optionValue);
            const iconSrc = getIconForFilter(filterType, optionValue);
            const iconHTML = iconSrc ? `<img src="${iconSrc}" alt="">` : '';
            let displayText = optionValue;
            if (filterType === 'family' || filterType === 'source') {
                displayText = getDisplayName(optionValue, filterType);
            } else if (filterType === 'filterScope') {
                displayText = i18n[currentLang][`filterScope_${optionValue}`] || optionValue;
            }
            const starSuffix = filterType === 'star' ? '⭐' : '';

            return `
                <div class="multi-select-option ${isSelected ? 'selected' : ''}" data-value="${optionValue}">
                    ${iconHTML}
                    <span>${displayText}${starSuffix}</span>
                </div>
            `;
        }).join('');

        modalContent.innerHTML = `
            <div class="multi-select-header">
                <h3>${title}</h3>
                <button class="close-btn" id="close-multi-select-modal-top">✖</button>
            </div>
            <div class="multi-select-options-grid">${optionsHTML}</div>
            <div class="multi-select-footer">
                <button class="action-button" id="clear-multi-select">${i18n[currentLang].clearSelection}</button>
                <button class="action-button" id="close-multi-select-modal-bottom">${i18n[currentLang].detailsCloseBtn}</button>
            </div>
        `;

        // 2. 显示模态框
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        modalContent.scrollTop = 0;

        // 3. 为弹窗内的所有选项和按钮绑定事件
        modal.querySelectorAll('.multi-select-option').forEach(optionDiv => {
            optionDiv.addEventListener('click', () => {
                const value = optionDiv.dataset.value;
                if (filterType === 'filterScope') {
                    if (multiSelectFilters[filterType][0] === value) return;
                    multiSelectFilters[filterType] = [value];
                    modal.querySelectorAll('.multi-select-option.selected').forEach(div => div.classList.remove('selected'));
                    optionDiv.classList.add('selected');

                } else {
                    const selections = new Set(multiSelectFilters[filterType]);
                    if (selections.has(value)) {
                        selections.delete(value);
                        optionDiv.classList.remove('selected');
                    } else {
                        selections.add(value);
                        optionDiv.classList.add('selected');
                    }
                    multiSelectFilters[filterType] = Array.from(selections);
                }
                applyFiltersAndRender();
                updateFilterButtonUI(filterType);
            });
        });

        const clearButton = document.getElementById('clear-multi-select');
        if (filterType === 'filterScope') {
            clearButton.style.display = 'none';
        } else {
            clearButton.addEventListener('click', () => {
                multiSelectFilters[filterType] = [];
                modal.querySelectorAll('.multi-select-option.selected').forEach(div => div.classList.remove('selected'));
                applyFiltersAndRender();
                updateFilterButtonUI(filterType);
            });
        }

        document.getElementById('close-multi-select-modal-top').addEventListener('click', closeMultiSelectModal);
        document.getElementById('close-multi-select-modal-bottom').addEventListener('click', closeMultiSelectModal);

        // 4. 更新浏览器历史记录
        history.pushState({ modal: 'multiSelect' }, null);
        modalStack.push('multiSelect');
    }

    function calculateHeroStats(hero, settings) {
        const { lb, talent, strategy, manaPriority } = settings;

        let baseStats = {
            power: hero.power || 0,
            attack: hero.attack || 0,
            defense: hero.defense || 0,
            health: hero.health || 0
        };

        if (lb === 'lb1' && hero.lb1) {
            baseStats = { ...hero.lb1 };
        } else if (lb === 'lb2' && hero.lb2) {
            baseStats = { ...hero.lb2 };
        }

        let finalStats = {
            attack: baseStats.attack,
            defense: baseStats.defense,
            health: baseStats.health
        };

        if (talent !== 'none' && hero.class && typeof TalentTree !== 'undefined') {
            const talentBonuses = TalentTree.getBonusesForPath(hero.class, strategy, manaPriority, talent);
            const attackPercentBonus = Math.floor((baseStats.attack || 0) * (talentBonuses.attack_percent / 100));
            finalStats.attack = (baseStats.attack || 0) + talentBonuses.attack_flat + attackPercentBonus;

            const defensePercentBonus = Math.floor((baseStats.defense || 0) * (talentBonuses.defense_percent / 100));
            finalStats.defense = (baseStats.defense || 0) + talentBonuses.defense_flat + defensePercentBonus;

            const healthPercentBonus = Math.floor((baseStats.health || 0) * (talentBonuses.health_percent / 100));
            finalStats.health = (baseStats.health || 0) + talentBonuses.health_flat + healthPercentBonus;
        }

        const STAR_BASE_POWER = { 1: 0, 2: 10, 3: 30, 4: 50, 5: 90 };
        const star_power = STAR_BASE_POWER[hero.star] || 0;

        const stats_raw_power = (baseStats.attack * 0.35) + (baseStats.defense * 0.28) + (baseStats.health * 0.14);
        const stats_final_power = Math.floor(stats_raw_power);

        const skill_power = (8 - 1) * 5;

        let talent_power = 0;
        if (talent === 'talent20') {
            talent_power = 20 * 5;
        } else if (talent === 'talent25') {
            talent_power = 25 * 5;
        }

        finalStats.power = star_power + stats_final_power + skill_power + talent_power;

        return finalStats;
    }


    function updateHeroStatsInModal(hero, modalSettings) {
        const modal = document.getElementById('modal');
        if (!modal || modal.classList.contains('hidden')) return;

        const talentSelect = document.getElementById('modal-talent-select');
        const prioritySelect = document.getElementById('modal-talent-strategy-select');

        if (prioritySelect) {
            prioritySelect.disabled = (talentSelect.value === 'none');
        }

        const finalStats = calculateHeroStats(hero, modalSettings);

        const powerEl = modal.querySelector('.details-stats-grid > div:nth-child(1) p');
        const attackEl = modal.querySelector('.details-stats-grid > div:nth-child(2) p');
        const defenseEl = modal.querySelector('.details-stats-grid > div:nth-child(3) p');
        const healthEl = modal.querySelector('.details-stats-grid > div:nth-child(4) p');

        if (powerEl) powerEl.innerHTML = `💪 ${finalStats.power || 0}`;
        if (attackEl) attackEl.innerHTML = `⚔️ ${finalStats.attack || 0}`;
        if (defenseEl) defenseEl.innerHTML = `🛡️ ${finalStats.defense || 0}`;
        if (healthEl) healthEl.innerHTML = `❤️ ${finalStats.health || 0}`;
    }


    function openDetailsModal(hero, context = {}) {
        renderDetailsInModal(hero, context); // 传递上下文
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
        renderHelpModalContent(helpModal, 'filterHelpTitle', 'filterHelpIntro', ['filterHelpAnd', 'filterHelpOr', 'filterHelpNot', 'filterHelpGroup', 'filterHelpExact', 'filterHelpExample']);
        helpModal.classList.add('stacked-modal');
        helpModalOverlay.classList.add('stacked-modal-overlay');
        helpModal.classList.remove('hidden');
        helpModalOverlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
        history.pushState({ modal: 'help' }, null);
        modalStack.push('help');
    }

    function closeHelpModal() { if (!helpModal.classList.contains('hidden')) { history.back(); } }

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

    function closeSkillTypeHelpModal() { if (!skillTypeHelpModal.classList.contains('hidden')) { history.back(); } }

    function renderHelpModalContent(modalElement, titleKey, introKey, listKeys) {
        const langDict = i18n[currentLang];
        const introHTML = introKey ? `<p>${langDict[introKey]}</p>` : '';
        const listHTML = listKeys.map(key => langDict[key] || '').join('');
        const contentHTML = `
            <h3>${langDict[titleKey]}</h3>
            ${introHTML}
            <ul>${listHTML}</ul>
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
        const filterSections = [{
            contentId: 'standard-filters-content',
            button: document.querySelector('#standard-filters-header .toggle-button')
        }, {
            contentId: 'advanced-filters-content',
            button: document.querySelector('#advanced-filters-header .toggle-button')
        }];
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
        const dataAsArray = Array.isArray(data) ?
            data.map(item => String(item || '').toLowerCase()) :
            [String(data || '').toLowerCase()];

        function evaluate(expr, text) {
            expr = expr.trim();
            if (!expr) return true;
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
            const andTerms = [];
            let currentTerm = '';
            balance = 0;
            for (let i = 0; i <= expr.length; i++) {
                const char = expr[i];
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
                return andTerms.every(term => evaluate(term, text));
            }

            if (expr.startsWith('!')) {
                const term = expr.substring(1).trim();
                if (term.startsWith('[') && term.endsWith(']')) {
                    const exactTerm = term.substring(1, term.length - 1).trim();
                    return text !== exactTerm;
                }
                return !text.includes(term);
            }
            if (expr.startsWith('[') && expr.endsWith(']')) {
                const term = expr.substring(1, expr.length - 1).trim();
                return text === term;
            }
            return text.includes(expr);
        }

        const usePerLineSearch = /[()\[\]]/.test(lowerCaseQuery);
        return usePerLineSearch ?
            dataAsArray.some(line => evaluate(lowerCaseQuery, line)) :
            evaluate(lowerCaseQuery, dataAsArray.join(' '));
    }

    function areFiltersActive() {
        // 1. 检查所有文本输入框和未改造的筛选器
        if ((filterInputs.name && filterInputs.name.value.trim() !== '') ||
            (filterInputs.types && filterInputs.types.value.trim() !== '') ||
            (filterInputs.effects && filterInputs.effects.value.trim() !== '') ||
            (filterInputs.passives && filterInputs.passives.value.trim() !== '') ||
            (filterInputs.power && filterInputs.power.value.trim() !== '') ||
            (filterInputs.attack && filterInputs.attack.value.trim() !== '') ||
            (filterInputs.defense && filterInputs.defense.value.trim() !== '') ||
            (filterInputs.health && filterInputs.health.value.trim() !== '')) {
            return true;
        }

        // 2. 检查所有新的多选筛选器
        for (const key in multiSelectFilters) {
            const selectedValues = multiSelectFilters[key];

            // 对于“筛选范围”，如果它的值不是默认的 'all'，则视为激活状态
            if (key === 'filterScope') {
                if (selectedValues.length > 0 && selectedValues[0] !== 'all') {
                    return true;
                }
            }
            // 对于其他多选筛选器，只要有任何选择，就视为激活状态
            else {
                if (selectedValues.length > 0) {
                    return true;
                }
            }
        }

        // 3. 检查临时的日期或收藏筛选是否激活
        if (temporaryDateFilter !== null || temporaryFavorites !== null) {
            return true;
        }

        // 如果以上所有条件都不满足，则说明没有任何筛选被激活
        return false;
    }

    /**
     * 检查是否仅有指定的筛选范围 (scope) 被激活，而无任何其他筛选条件。
     * @param {string} scopeName - 要检查的筛选范围名称, e.g., 'favorites', 'hero', 'skin'.
     * @returns {boolean}
     */
    function isOnlySpecificScopeFilterActive(scopeName) {
        // 1. 检查筛选范围是否为传入的 scopeName
        if (!multiSelectFilters.filterScope || multiSelectFilters.filterScope[0] !== scopeName) {
            return false;
        }

        // 2. 检查所有文本输入框是否为空 (这部分逻辑是共享的)
        if ((filterInputs.name && filterInputs.name.value.trim() !== '') ||
            (filterInputs.types && filterInputs.types.value.trim() !== '') ||
            (filterInputs.effects && filterInputs.effects.value.trim() !== '') ||
            (filterInputs.passives && filterInputs.passives.value.trim() !== '') ||
            (filterInputs.power && filterInputs.power.value.trim() !== '') ||
            (filterInputs.attack && filterInputs.attack.value.trim() !== '') ||
            (filterInputs.defense && filterInputs.defense.value.trim() !== '') ||
            (filterInputs.health && filterInputs.health.value.trim() !== '')) {
            return false;
        }

        // 3. 检查除 filterScope 之外的其他多选筛选器是否为空 (这部分逻辑是共享的)
        for (const key in multiSelectFilters) {
            if (key === 'filterScope') continue; // 跳过 filterScope 本身
            if (multiSelectFilters[key] && multiSelectFilters[key].length > 0) {
                return false;
            }
        }

        // 4. 检查临时的日期或收藏筛选是否激活 (这部分逻辑是共享的)
        if (temporaryDateFilter !== null || temporaryFavorites !== null) {
            return false;
        }

        // 如果通过所有检查，说明只有指定的 scope 筛选被激活
        return true;
    }

    function updateResultsHeader() {
        const langDict = i18n[currentLang];
        const count = filteredHeroes.length;
        const filtersAreActive = areFiltersActive();

        // --- 核心修改：调用新的通用函数 ---
        const onlyFavoritesIsActive = isOnlySpecificScopeFilterActive('favorites');
        const onlyHeroIsActive = isOnlySpecificScopeFilterActive('hero');
        const onlyCostumeIsActive = isOnlySpecificScopeFilterActive('skin');

        if (resultsCountEl) {
            // 清空现有内容
            resultsCountEl.innerHTML = '';

            let message = '';
            let showResetButton = false;

            // 判断逻辑保持不变
            if (onlyFavoritesIsActive) {
                message = (count > 0) ? langDict.favoritesListCount(count) : langDict.favoritesListEmpty;
                showResetButton = true;
            } else if (onlyHeroIsActive) {
                message = langDict.resultsCountTextHeroOnly(count);
                showResetButton = true;
            } else if (onlyCostumeIsActive) {
                message = langDict.resultsCountTextCostumeOnly(count);
                showResetButton = true;
            } else if (filtersAreActive) {
                message = langDict.resultsCountTextFiltered(count);
                showResetButton = true;
            } else {
                message = langDict.resultsCountTextUnfiltered(count);
                showResetButton = false;
            }

            // 设置主信息
            const messageSpan = document.createElement('span');
            messageSpan.innerHTML = message;
            resultsCountEl.appendChild(messageSpan);

            // 如果需要，添加重置按钮
            if (showResetButton) {
                const resetTag = document.createElement('span');
                resetTag.className = 'reset-tag';
                resetTag.textContent = langDict.resultsReset;
                resetTag.onclick = (e) => {
                    e.preventDefault();
                    if (resetFiltersBtn) resetFiltersBtn.click();
                };
                resultsCountEl.appendChild(resetTag);
            }
        }
    }
    
    function applyFiltersAndRender() {
        const nameFilter = filterInputs.name ? filterInputs.name.value.trim().toLowerCase() : '';
        const effectsFilter = filterInputs.effects ? filterInputs.effects.value.trim() : '';
        const passivesFilter = filterInputs.passives ? filterInputs.passives.value.trim() : '';
        const skillTypeFilter = filterInputs.types ? filterInputs.types.value.trim() : '';
        const skillTypeSource = filterInputs.skillTypeSource ? filterInputs.skillTypeSource.value : 'both';

        const filterScope = (multiSelectFilters.filterScope && multiSelectFilters.filterScope[0]) || 'all';

        const powerFilter = filterInputs.power ? (Number(filterInputs.power.value) || 0) : 0;
        const attackFilter = filterInputs.attack ? (Number(filterInputs.attack.value) || 0) : 0;
        const defenseFilter = filterInputs.defense ? (Number(filterInputs.defense.value) || 0) : 0;
        const healthFilter = filterInputs.health ? (Number(filterInputs.health.value) || 0) : 0;

        const langDict = i18n[currentLang];
        const noneValue = langDict.none.toLowerCase();

        const defaultSettings = {
            lb: defaultLimitBreakSelect.value,
            talent: defaultTalentSelect.value,
            strategy: defaultTalentStrategySelect.value,
            manaPriority: defaultManaPriorityCheckbox.checked
        };

        filteredHeroes = allHeroes.filter(hero => {
            if (filterScope === 'hero' && hero.costume_id !== 0) return false;
            if (filterScope === 'skin' && hero.costume_id === 0) return false;
            if (filterScope === 'favorites') {
                const favoritesList = temporaryFavorites || getFavorites();
                const heroIdentifier = `${hero.english_name}-${hero.costume_id}`;
                if (!favoritesList.includes(heroIdentifier)) return false;
            }

            if (nameFilter && !hero.name.toLowerCase().includes(nameFilter)) return false;
            if (effectsFilter && !matchesComplexQuery(hero.effects, effectsFilter)) return false;
            if (passivesFilter && !matchesComplexQuery(hero.passives, passivesFilter)) return false;
            if (skillTypeFilter) {
                let skillTypesToSearch = [];
                if (skillTypeSource === 'heroplan') {
                    skillTypesToSearch = hero.types || [];
                } else if (skillTypeSource === 'nynaeve') {
                    const originalTypes = hero.skill_types || [];
                    const englishTypes = originalTypes.map(t => reverseSkillTypeMap_cn[t] || reverseSkillTypeMap_tc[t] || t);
                    skillTypesToSearch = [...new Set([...originalTypes, ...englishTypes])];
                } else {
                    const heroplanTypes = hero.types || [];
                    const nynaeveOriginalTypes = hero.skill_types || [];
                    const nynaeveEnglishTypes = nynaeveOriginalTypes.map(t => reverseSkillTypeMap_cn[t] || reverseSkillTypeMap_tc[t] || t);
                    skillTypesToSearch = [...new Set([...heroplanTypes, ...nynaeveOriginalTypes, ...nynaeveEnglishTypes])];
                }
                if (!matchesComplexQuery(skillTypesToSearch.filter(Boolean), skillTypeFilter)) return false;
            }

            for (const key in multiSelectFilters) {
                if (key === 'filterScope') continue;
                const selectedValues = multiSelectFilters[key];
                if (selectedValues.length === 0) continue;

                let heroValue;
                if (key === 'costume') {
                    heroValue = getSkinInfo(hero).skinIdentifier;
                } else {
                    const heroDataKey = key === 'aetherpower' ? 'AetherPower' : key;
                    heroValue = hero[heroDataKey];
                }
                if (!selectedValues.includes(String(heroValue))) {
                    return false;
                }
            }

            const calculatedStats = calculateHeroStats(hero, defaultSettings);
            if (powerFilter > 0 && calculatedStats.power < powerFilter) return false;
            if (attackFilter > 0 && calculatedStats.attack < attackFilter) return false;
            if (defenseFilter > 0 && calculatedStats.defense < defenseFilter) return false;
            if (healthFilter > 0 && calculatedStats.health < healthFilter) return false;

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

            return true;
        });

        filteredHeroes.forEach(hero => {
            hero.displayStats = calculateHeroStats(hero, defaultSettings);
        });

        filteredHeroes.sort((a, b) => {
            const key = currentSort.key;
            const direction = currentSort.direction === 'asc' ? 1 : -1;
            const numericKeys = ['star', 'power', 'attack', 'defense', 'health'];
            let valA, valB;

            if (numericKeys.includes(key) && key !== 'star') {
                valA = a.displayStats[key];
                valB = b.displayStats[key];
            } else {
                valA = a[key];
                valB = b[key];
            }

            let comparison = 0;
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
                return (Number(b.displayStats.power) || 0) - (Number(a.displayStats.power) || 0);
            }
            return comparison;
        });

        renderTable(filteredHeroes);
    }

    function getSkinInfo(hero) {
        const name = hero.name || '';
        if (!name) return { skinIdentifier: null, baseName: name };

        const skinPattern = /\s*(?:\[|\()?(C\d+|\S+?)(?:\]|\))?\s*$/;
        const skinMatch = name.match(skinPattern);

        if (skinMatch && skinMatch[1] && hero.costume_id !== 0) {
            const potentialSkin = skinMatch[1].toLowerCase();
            if (potentialSkin.match(/^c\d+$/) || ['glass', 'toon', '玻璃'].includes(potentialSkin) || potentialSkin.endsWith('卡通') || potentialSkin.endsWith('皮肤') || potentialSkin.endsWith('皮膚')) {
                return {
                    skinIdentifier: skinMatch[1],
                    baseName: name.substring(0, name.length - skinMatch[0].length).trim()
                };
            }
        }
        return { skinIdentifier: null, baseName: name };
    }

    function getCostumeIconName(skinIdentifier) {
        if (!skinIdentifier) return null;
        const lowerSkin = String(skinIdentifier).toLowerCase();

        if (lowerSkin.startsWith('c')) {
            const match = lowerSkin.match(/^c\d+/);
            if (match) return match[0];
        }
        if (lowerSkin.includes('glass') || lowerSkin.includes('玻璃')) return 'glass';
        if (lowerSkin.includes('toon') || lowerSkin.includes('卡通')) return 'toon';

        return null;
    }
    // ========== 新增：获取格式化英雄名称的复用函数 ==========
    function getFormattedHeroNameHTML(hero) {
        if (!hero) return '';

        // 调用已有的函数来分离基本名称和皮肤信息
        const skinInfo = getSkinInfo(hero);
        let content = skinInfo.baseName;

        // 如果有皮肤信息，则查找并添加对应的服装图标
        if (skinInfo.skinIdentifier) {
            const iconName = getCostumeIconName(skinInfo.skinIdentifier);
            if (iconName) {
                // 将服装图标的HTML代码添加到基本名称的前面
                content = `<img src="imgs/costume/${iconName}.png" class="costume-icon" alt="${iconName} costume" title="${skinInfo.skinIdentifier}"/>${content}`;
            }
        }
        return content;
    }
    // 【新增】新的渲染控制器
    function renderActiveTabList() {
        if (!myTeamsTabBtn) return; // 如果元素不存在则中止

        if (sharedTeamsTabBtn.classList.contains('active')) {
            renderSavedTeams(sharedTeamsDataFromUrl, true);
        } else {
            renderSavedTeams(getSavedTeams(), false);
        }
    }

    // 【新增】用于管理折叠状态的Cookie函数
    function getCollapseStates() {
        try {
            const statesJSON = getCookie('collapseStates');
            // 默认状态为都不折叠
            const defaults = { tagsCollapsed: false, listCollapsed: false };
            // 如果Cookie存在，则用Cookie中的值覆盖默认值
            return statesJSON ? { ...defaults, ...JSON.parse(statesJSON) } : defaults;
        } catch (e) {
            console.error("Failed to parse collapse states from cookie", e);
            return { tagsCollapsed: false, listCollapsed: false };
        }
    }

    function saveCollapseStates(states) {
        setCookie('collapseStates', JSON.stringify(states), 365);
    }

    // 【新增】应用Cookie中保存的折叠状态到UI上
    function applyCollapseStates() {
        const states = getCollapseStates();
        const tagsContainer = document.getElementById('team-tags-summary-container');
        const listContainer = document.getElementById('saved-teams-list-container');

        if (tagsContainer) {
            tagsContainer.classList.toggle('collapsed', states.tagsCollapsed);
        }
        if (listContainer) {
            // 队伍列表的折叠只在移动端生效
            if (window.innerWidth <= 900) {
                listContainer.classList.toggle('collapsed', states.listCollapsed);
            }
        }
    }

    // 【重构】updateTeamTags 函数，使其也拥有折叠结构
    function updateTeamTags() {
        const container = document.getElementById('team-tags-summary-container');
        if (!container) return;

        const activeTags = getActiveTags(); // 假设 getActiveTags() 函数已存在
        const langDict = i18n[currentLang];

        let contentHTML = '';
        const tagKeys = Object.keys(activeTags);

        if (tagKeys.length > 0) {
            contentHTML = '<ul class="team-tags-list">';
            // ... (您现有的生成标签列表的逻辑) ...
            tagKeys.forEach(tag => {
                const count = activeTags[tag];
                const tagClass = count > 1 ? `tag-count-${Math.min(count, 5)}` : '';
                contentHTML += `<li><span class="tag-label ${tagClass}">${tag} (${count})</span></li>`;
            });
            contentHTML += '</ul>';
        } else {
            contentHTML = `<p class="no-tags-message">${langDict.noTeamTags}</p>`;
        }

        // 生成包含标题栏和内容区的完整HTML
        container.innerHTML = `
        <div class="summary-tags-header">
            <h5 data-lang-key="summaryTagsTitle">${langDict.summaryTagsTitle}</h5>
            <div class="collapse-arrow"></div>
        </div>
        <div class="summary-tags-content">
            ${contentHTML}
        </div>
    `;
    }
    /**
     * 根据当前历史状态智能地设置主视图的历史记录。
     * 如果当前已在主视图中，则替换状态；否则，添加新状态。
     * @param {string} viewName - 要设置的新视图名称 ('wanted', 'farming', 'chat', 'teamSimulator')。
     */
    function setMainViewHistory(viewName) {
        const mainViews = [ 'wanted', 'farming', 'chat', 'teamSimulator'];
        const currentState = history.state || {};

        if (currentState.view && mainViews.includes(currentState.view)) {
            // 如果当前已在一个主视图中，则替换历史状态
            history.replaceState({ view: viewName }, '');
        } else {
            // 否则（例如首次进入或从弹窗返回），则添加新的历史状态
            history.pushState({ view: viewName }, '');
        }
    }

    /**
     * 控制队伍模拟器的显示和隐藏
     */
    function toggleTeamSimulator() {
        teamSimulatorActive = !teamSimulatorActive;

        if (teamSimulatorActive) {
            // --- 打开模拟器时的逻辑 ---
            headerInfoContainer.classList.add('hidden'); // 隐藏页眉信息
            if (teamSimulatorWrapper) teamSimulatorWrapper.classList.remove('hidden'); // 显示队伍模拟器
            if (showTeamSimulatorBtn) {
                showTeamSimulatorBtn.classList.add('simulator-exit-btn'); // 添加退出提示类
            }

            // 确保其他视图被隐藏，并默认显示英雄列表
            heroTableView.classList.remove('hidden'); // 显示英雄列表
            wantedMissionView.classList.add('hidden'); // 隐藏通缉任务视图
            farmingGuideView.classList.add('hidden'); // 隐藏材料产出视图
            if (chatSimulatorView) chatSimulatorView.classList.add('hidden'); // 隐藏聊天模拟器视图

            multiSelectFilters.filterScope = ['favorites']; // 设置筛选范围为收藏夹
            updateFilterButtonUI('filterScope');
            temporaryFavorites = null; // 清除临时收藏夹
            applyFiltersAndRender(); // 应用筛选并渲染
            // 【新增】在打开模拟器时，应用已保存的折叠状态
            applyCollapseStates(); // 应用折叠状态

            // 【修正】采用更直接的渲染逻辑，确保默认加载正确
            if (isViewingSharedTeams) {
                // 如果是分享视图：激活“分享的队伍”标签，并直接渲染分享列表
                myTeamsTabBtn.classList.remove('active'); // 移除“我的队伍”标签的激活状态
                sharedTeamsTabBtn.classList.add('active'); // 添加“分享的队伍”标签的激活状态
                renderSavedTeams(sharedTeamsDataFromUrl, true); // 渲染分享的队伍
            } else {
                // 如果是普通视图：激活“我的队伍”标签，并直接渲染用户保存在Cookie中的列表
                myTeamsTabBtn.classList.add('active'); // 添加“我的队伍”标签的激活状态
                sharedTeamsTabBtn.classList.remove('active'); // 移除“分享的队伍”标签的激活状态
                renderSavedTeams(getSavedTeams(), false); // 渲染保存的队伍
            }
            // 【核心修改】调用新的历史记录处理函数
            setMainViewHistory('teamSimulator');

        } else {
            // --- 关闭模拟器时的逻辑 ---
            if (showTeamSimulatorBtn) {
                showTeamSimulatorBtn.classList.remove('simulator-exit-btn'); // 移除退出提示类
            }
            headerInfoContainer.classList.remove('hidden'); // 显示页眉信息
            if (teamSimulatorWrapper) teamSimulatorWrapper.classList.add('hidden'); // 隐藏队伍模拟器
            multiSelectFilters.filterScope = ['all']; // 重置筛选范围为全部
            updateFilterButtonUI('filterScope');
            applyFiltersAndRender(); // 应用筛选并渲染 (这将默认显示英雄列表)
        }
    }

    // 【新增】从Cookie获取已存队伍
    function getSavedTeams() {
        try {
            const teamsJSON = getCookie('savedTeams');
            return teamsJSON ? JSON.parse(teamsJSON) : [];
        } catch (e) {
            console.error("从Cookie解析已存队伍失败", e);
            return [];
        }
    }

    // 【新增】将队伍列表保存到Cookie
    function saveTeams(teams) {
        try {
            const teamsJSON = JSON.stringify(teams);
            setCookie('savedTeams', teamsJSON, 365);
        } catch (e) {
            console.error("保存队伍到Cookie失败", e);
        }
    }
    function clearTeamDisplay() {
        teamSlots = [null, null, null, null, null];
        renderTeamDisplay();
    }

    // 【新增】将指定的队伍加载到模拟器中显示
    function displayTeamInSimulator(teamToShow) {
        // 创建一个新的临时队伍槽位数组
        const newTeamSlots = Array(5).fill(null);

        // 获取当前的全局默认设置，用于加载的英雄
        const defaultSettings = {
            lb: defaultLimitBreakSelect.value,
            talent: defaultTalentSelect.value,
            strategy: defaultTalentStrategySelect.value,
            manaPriority: defaultManaPriorityCheckbox.checked
        };

        // 遍历要显示的队伍数据
        teamToShow.heroes.forEach((heroIdentifier, index) => {
            // 确保索引在0-4范围内
            if (heroIdentifier && index < 5) {
                // 根据标识符从所有英雄数据中找到对应的英雄
                const hero = allHeroes.find(h => `${h.english_name}-${h.costume_id}` === heroIdentifier);
                if (hero) {
                    // 如果找到英雄，则直接在【正确的位置 (index)】创建队伍成员对象
                    newTeamSlots[index] = {
                        instanceId: teamMemberInstanceCounter++,
                        hero: hero,
                        settings: { ...defaultSettings } // 为加载的英雄应用默认设置
                    };
                }
            }
        });

        // 用构建好的、位置正确的队伍数据，替换全局的队伍数据
        teamSlots = newTeamSlots;

        // 最后，调用一次渲染函数来更新整个界面
        renderTeamDisplay();

        // 【新增代码】在移动端，如果阵容配置是展开的，则滚动回顶部
        const teamSimulatorWrapper = document.getElementById('team-simulator-wrapper'); // 获取队伍模拟器整个包装器元素
        if (teamSimulatorWrapper) { // 确保元素存在
            // 判断是否为移动端 (假设宽度小于等于 900px 为移动端断点)
            if (window.innerWidth <= 900) {
                // 判断阵容配置是否处于展开状态 (即没有 'collapsed' 类)
                // 默认情况下，在移动端 #team-simulator-wrapper 展开时没有 collapsed 类
                if (!teamSimulatorWrapper.classList.contains('collapsed')) { //
                    // 滚动整个窗口到顶部
                    window.scrollTo(0, 200);
                }
            }
        }
    }


    /**
     * 渲染已存队伍列表到指定的DOM容器中（新布局版）
     * @param {Array<Object>} teams - 要渲染的队伍对象数组。
     * @param {boolean} [isSharedView=false] - 是否为分享视图模式。
     */
    function renderSavedTeams(teams, isSharedView = false) {
        if (!savedTeamsList) return;

        const langDict = i18n[currentLang];
        const myTeams = getSavedTeams(); // 获取用户已保存的队伍
        savedTeamsList.innerHTML = '';

        if (!teams || teams.length === 0) {
            const messageKey = isSharedView ? 'noTeamsToShare' : 'noSavedTeams';
            savedTeamsList.innerHTML = `<p style="text-align: center; color: var(--md-sys-color-outline);">${langDict[messageKey]}</p>`;
            return;
        }

        teams.forEach((team, index) => {
            const row = document.createElement('div');
            row.className = 'saved-team-row is-clickable';

            let avatarsHTML = team.heroes.map(heroIdentifier => {
                if (!heroIdentifier) return `<div class="saved-team-avatar" style="border: 1px dashed var(--md-sys-color-outline);"></div>`;
                const hero = allHeroes.find(h => `${h.english_name}-${h.costume_id}` === heroIdentifier);
                if (hero) return `<img src="${getLocalImagePath(hero.image)}" class="saved-team-avatar ${getColorGlowClass(hero.color)}" alt="${hero.name}" title="${hero.name}">`;
                return `<div class="saved-team-avatar" style="border: 1px dashed var(--md-sys-color-error);">?</div>`;
            }).join('');

            let buttonHTML = '';
            if (isSharedView) {
                // 【核心修改点】判断队伍是否已导入：不仅比较名字，还要比较英雄列表
                const isAlreadyImported = myTeams.some(myTeam =>
                    myTeam.name === team.name &&
                    // 比较英雄列表是否完全一致
                    // 确保长度一致且每个英雄ID都匹配
                    myTeam.heroes.length === team.heroes.length &&
                    myTeam.heroes.every((heroId, i) => heroId === team.heroes[i])
                );

                if (isAlreadyImported) {
                    buttonHTML = `<button class="action-button disabled" data-team-index="${index}">${langDict.importedBtn}</button>`;
                } else {
                    buttonHTML = `<button class="import-team-btn action-button" data-team-index="${index}">${langDict.importTeamBtn}</button>`;
                }
            } else {
                buttonHTML = `<button class="remove-team-btn" data-team-index="${index}" title="${langDict.removeTeamBtnTitle}">✖</button>`;
            }

            row.innerHTML = `
            <div class="team-row-main-content">
                <div class="saved-team-name" title="${team.name}">${team.name}</div>
                <div class="saved-team-avatars">${avatarsHTML}</div>
            </div>
            ${buttonHTML}
            `;

            // ... (其他事件监听器和逻辑保持不变)
            row.addEventListener('click', (e) => {
                // 如果点击的是按钮，则不触发查看阵容的事件
                if (e.target.closest('button')) return;
                displayTeamInSimulator(team);
            });

            savedTeamsList.appendChild(row);
        });

        // 事件监听器
        if (isSharedView) {
            savedTeamsList.querySelectorAll('.import-team-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const teamIndex = parseInt(button.dataset.teamIndex, 10);
                    const teamToImport = JSON.parse(JSON.stringify(sharedTeamsDataFromUrl[teamIndex])); // 深拷贝，避免引用问题
                    if (!teamToImport) return;

                    let currentMyTeams = getSavedTeams(); // 获取用户已保存的队伍

                    currentMyTeams.push(teamToImport); // 直接将新队伍添加到列表中
                    saveTeams(currentMyTeams); // 保存更新后的队伍列表

                    alert(langDict.importSuccess(teamToImport.name)); // 提示导入成功

                    renderSavedTeams(sharedTeamsDataFromUrl, true); // 重新渲染分享的队伍列表，更新按钮状态
                });
            });
        } else {
            savedTeamsList.querySelectorAll('.remove-team-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const teamIndex = parseInt(button.dataset.teamIndex, 10);
                    let teams = getSavedTeams();
                    const teamToRemove = teams[teamIndex];

                    if (teamToRemove && window.confirm(langDict.confirmRemoveTeam(teamToRemove.name))) {
                        teams.splice(teamIndex, 1);
                        saveTeams(teams);
                        renderActiveTabList();
                    }
                });
            });
        }
    }

    function addHeroToTeam(hero) {
        const emptySlotIndex = teamSlots.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            // 获取当前的全局默认设置
            const defaultSettings = {
                lb: defaultLimitBreakSelect.value,
                talent: defaultTalentSelect.value,
                strategy: defaultTalentStrategySelect.value,
                manaPriority: defaultManaPriorityCheckbox.checked
            };

            // 创建包含英雄对象、独立设置和唯一实例ID的“队伍成员”对象
            const teamMember = {
                instanceId: teamMemberInstanceCounter++, // 分配唯一ID并递增计数器
                hero: hero,
                settings: { ...defaultSettings }
            };

            teamSlots[emptySlotIndex] = teamMember;
            renderTeamDisplay();
        }
    }

    /**
     * NEW: 获取英雄技能类别的数组版本
     * @param {object} hero - The hero object.
     * @returns {string[]} An array of skill type strings.
     */
    function getSkillTypesArray(hero) {
        if (!hero) return [];
        const skillTypeSource = filterInputs.skillTypeSource ? filterInputs.skillTypeSource.value : 'both';
        let typesToShow = [];

        if (skillTypeSource === 'heroplan') {
            typesToShow = hero.types || [];
        } else if (skillTypeSource === 'nynaeve') {
            typesToShow = hero.skill_types || [];
        } else {
            // 合并并去重
            typesToShow = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
        }
        return typesToShow.filter(Boolean); // 过滤掉任何空或null值
    }

    // 辅助函数：获取格式化的技能类型文本
    function getSkillTypesText(hero) {
        if (!hero) return '';
        const skillTypeSource = filterInputs.skillTypeSource ? filterInputs.skillTypeSource.value : 'both';
        let typesToShow = [];
        if (skillTypeSource === 'heroplan') {
            typesToShow = hero.types || [];
        } else if (skillTypeSource === 'nynaeve') {
            typesToShow = hero.skill_types || [];
        } else {
            typesToShow = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
        }
        return typesToShow.filter(Boolean).join(', ');
    }
    // ========== 独立的动态高度调整函数 ==========
    function adjustTeamDisplayHeight() {
        const teamSimulatorDisplay = document.getElementById('team-simulator-display');
        // 如果模拟器本身不可见，或其父容器处于折叠状态，则不执行计算
        if (!teamSimulatorDisplay || (teamSimulatorDisplay.closest('#team-simulator-wrapper') && teamSimulatorDisplay.closest('#team-simulator-wrapper').classList.contains('collapsed'))) {
            return;
        }

        // 使用 requestAnimationFrame 确保在浏览器下次重绘前执行，以获得准确的尺寸
        requestAnimationFrame(() => {
            // ========== 获取桌面端标题的高度 ==========
            const desktopHeader = teamSimulatorDisplay.querySelector('.team-display-desktop-header');
            let desktopHeaderHeight = 0;
            // 检查标题是否存在且当前是否为可见状态（仅在桌面端可见）
            if (desktopHeader && window.getComputedStyle(desktopHeader).display !== 'none') {
                const style = window.getComputedStyle(desktopHeader);
                desktopHeaderHeight = desktopHeader.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
            }
            // ===============================================

            const tagsContainer = document.getElementById('team-tags-summary-container');
            let tagsHeight = 0;
            // 判断元素是否存在且可见，否则高度为0
            if (tagsContainer && tagsContainer.style.display !== 'none' && !tagsContainer.classList.contains('collapsed')) {
                const style = window.getComputedStyle(tagsContainer);
                tagsHeight = tagsContainer.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
            }

            let vLayoutHeight = 0;
            const visibleInfoCards = teamSimulatorDisplay.querySelectorAll('.team-info-slot:not([style*="display: none"])');

            if (visibleInfoCards.length > 0) {
                let maxBottomPosition = 0;
                visibleInfoCards.forEach(card => {
                    const bottomPosition = card.offsetTop + card.offsetHeight;
                    if (bottomPosition > maxBottomPosition) {
                        maxBottomPosition = bottomPosition;
                    }
                });
                vLayoutHeight = maxBottomPosition;
            } else {
                const gridContainer = document.getElementById('team-display-grid');
                if (gridContainer) {
                    vLayoutHeight = gridContainer.offsetHeight;
                }
            }

            // ========== 修改：将桌面标题高度计入总高度 ==========
            const calculatedLeftPanelHeight = desktopHeaderHeight + tagsHeight + vLayoutHeight + 20;
            teamSimulatorDisplay.style.minHeight = `${calculatedLeftPanelHeight}px`;

            // 【新增/修改代码】同步调整右侧面板的高度
            const savedTeamsPanel = document.getElementById('saved-teams-panel');
            const minPanelHeight = 450; // 定义最小高度为 450px

            if (savedTeamsPanel) {
                // 仅在桌面端应用此高度同步，因为移动端saved-teams-panel高度为auto
                if (window.innerWidth > 768) { // 假设768px是桌面/移动端断点
                    // 如果左侧计算高度大于最小面板高度，则将右侧高度设置为左侧高度
                    if (calculatedLeftPanelHeight > minPanelHeight) {
                        savedTeamsPanel.style.height = `${calculatedLeftPanelHeight}px`;
                    } else {
                        // 否则，右侧高度保持其CSS定义的最小高度（此处为450px）
                        // 实际上不需要显式设置，因为min-height CSS规则会生效
                        savedTeamsPanel.style.height = ''; // 清除内联样式，让CSS的min-height接管
                    }
                } else {
                    savedTeamsPanel.style.height = 'auto'; // 确保移动端是auto
                }
            }
        });
    }

    let lastTeamDisplayHeight = 0;
    function renderTeamDisplay() {
        // 1. 确保在函数开头声明并获取所有需要使用的DOM元素
        const teamDisplayGrid = document.getElementById('team-display-grid');
        if (!teamDisplayGrid) { // 现在可以安全地检查了
            console.error("Error: teamDisplayGrid element not found.");
            return;
        }

        const teamSimulatorDisplay = document.getElementById('team-simulator-display');
        // 如果 teamSimulatorDisplay 也是函数内部才获取的，也请在这里获取
        if (!teamSimulatorDisplay) {
            console.error("Error: teamSimulatorDisplay element not found.");
            // 根据你的逻辑，如果缺少此元素，可能需要返回或处理
        }

        // 记录渲染前的关键信息
        const currentScrollTop = window.scrollY; // 记录当前页面的滚动位置
        let prevTeamGridHeight = teamDisplayGrid.offsetHeight; // 记录渲染前网格的高度

        // 2. 执行英雄槽位和信息卡片的渲染逻辑
        // 这一部分保持不变
        for (let i = 0; i < 5; i++) {
            const slot = teamSlots[i];
            const hero = slot ? slot.hero : null;
            const pos = i + 1;

            const heroSlot = teamDisplayGrid.querySelector(`.team-hero-slot[data-pos="${pos}"]`);
            const infoSlot = teamDisplayGrid.querySelector(`.team-info-slot[data-info-pos="${pos}"]`);

            if (!heroSlot || !infoSlot) continue;

            heroSlot.innerHTML = '';
            infoSlot.innerHTML = '';
            heroSlot.classList.remove('filled');
            infoSlot.style.display = 'none';
            heroSlot.removeAttribute('data-instance-id');
            infoSlot.removeAttribute('data-instance-id');

            if (hero) {
                heroSlot.classList.add('filled');
                heroSlot.dataset.instanceId = slot.instanceId;
                const avatar = document.createElement('img');
                avatar.src = getLocalImagePath(hero.image);
                avatar.className = `team-hero-avatar ${getColorGlowClass(hero.color)}`;
                avatar.alt = hero.name;
                heroSlot.appendChild(avatar);

                infoSlot.innerHTML = `
                    <div class="team-hero-name">${getFormattedHeroNameHTML(hero)}</div>
                    <div class="team-hero-skills">${getSkillTypesText(hero) || i18n[currentLang].none}</div>
                `;
                infoSlot.dataset.instanceId = slot.instanceId;
                infoSlot.style.display = 'block';

                if (swapModeActive) {
                    const actionIcon = document.createElement('div');
                    actionIcon.className = 'hero-action-icon';
                    if (i === selectedForSwapIndex) {
                        actionIcon.textContent = '✖';
                        actionIcon.classList.add('remove-hero-icon');
                        actionIcon.dataset.action = 'remove';
                    } else {
                        actionIcon.textContent = '🔄';
                        actionIcon.classList.add('swap-hero-icon');
                        actionIcon.dataset.action = 'swap';
                    }
                    actionIcon.dataset.index = i;
                    heroSlot.appendChild(actionIcon);
                }
            }
        }

        // 3. 渲染队伍标签汇总 (此部分保持不变)
        const summaryContainer = document.getElementById('team-tags-summary-container');
        if (!summaryContainer) {
            console.error("Error: team-tags-summary-container element not found.");
            return;
        }

        const tagCounts = {};
        let teamHasHeroes = false;
        teamSlots.forEach(slot => {
            if (slot && slot.hero) {
                teamHasHeroes = true;
                const tags = getSkillTypesArray(slot.hero);
                tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        if (!teamHasHeroes) {
            summaryContainer.innerHTML = '';
            summaryContainer.style.display = 'none';
        } else {
            summaryContainer.style.display = 'flex';
            const sortedTags = Object.keys(tagCounts).sort((a, b) => {
                const getEnglishKey = (tag) => {
                    if (currentLang === 'cn') {
                        return reverseSkillTypeMap_cn[tag] || tag;
                    }
                    if (currentLang === 'tc') {
                        return reverseSkillTypeMap_tc[tag] || tag;
                    }
                    return tag;
                };

                const englishA = getEnglishKey(a);
                const englishB = getEnglishKey(b);

                const indexA = nynaeveSkillTypeOrder.indexOf(englishA);
                const indexB = nynaeveSkillTypeOrder.indexOf(englishB);

                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                if (indexA !== -1) {
                    return -1;
                }
                if (indexB !== -1) {
                    return 1;
                }
                const locale = { cn: 'zh-CN', tc: 'zh-TW', en: 'en-US' }[currentLang];
                const options = currentLang === 'tc' ? { collation: 'stroke' } : {};
                return a.localeCompare(b, locale, options);
            });

            if (sortedTags.length === 0) {
                summaryContainer.innerHTML = `<div class="no-tags-message">${i18n[currentLang].noTeamTags}</div>`;
            } else {
                const summaryHTML = sortedTags.map(tag => {
                    const count = tagCounts[tag];
                    const countHTML = count > 1 ? `<span class="tag-count">x${count}</span>` : '';
                    return `<span class="team-tag-item">${tag}${countHTML}</span>`;
                }).join('');
                summaryContainer.innerHTML = summaryHTML;
            }
        }

        // 4. 计算高度变化并调整滚动位置
        // 使用 requestAnimationFrame 确保在 DOM 更新后立即获取新高度，并在下次绘制前调整滚动
        requestAnimationFrame(() => {
            const newTeamGridHeight = teamDisplayGrid.offsetHeight; // 获取渲染后的新高度
            const heightDifference = newTeamGridHeight - prevTeamGridHeight;

            if (heightDifference > 0) { // 如果高度增加了
                window.scrollTo(window.scrollX, currentScrollTop + heightDifference);
            }

            // 最后调用调整父容器高度的函数，这也会在内部使用requestAnimationFrame
            adjustTeamDisplayHeight();
        });
    }

    function renderTable(heroes) {
        if (!heroTable) return;

        updateResultsHeader();

        const langDict = i18n[currentLang];
        const heroesToProcess = heroes.filter(h => h.english_name);
        const favoritedCount = heroesToProcess.filter(isFavorite).length;
        const shouldPredictFavoriteAll = heroesToProcess.length > 0 && favoritedCount < heroesToProcess.length;

        let favHeaderIcon = shouldPredictFavoriteAll ? '★' : '☆';
        if (teamSimulatorActive) {
            favHeaderIcon = '⬆️';
        }

        const favHeaderClass = shouldPredictFavoriteAll ? 'favorited' : '';
        const headers = {
            fav: favHeaderIcon, image: langDict.avatarLabel, name: langDict.nameLabel.slice(0, -1),
            color: langDict.colorLabel.slice(0, -1), star: langDict.starLabel.slice(0, -1),
            class: langDict.classLabel.slice(0, -1), speed: langDict.speedLabel.slice(0, -1),
            power: langDict.minPower.replace('Min ', ''), attack: langDict.minAttack.replace('Min ', ''),
            defense: langDict.minDefense.replace('Min ', ''), health: langDict.minHealth.replace('Min ', ''),
            types: langDict.skillTypeLabel.slice(0, -1)
        };
        const colKeys = Object.keys(headers);
        const sortableKeys = ['name', 'color', 'star', 'class', 'speed', 'power', 'attack', 'defense', 'health'];
        let thead = heroTable.querySelector('thead');
        if (!thead) {
            thead = document.createElement('thead');
            heroTable.appendChild(thead);
        }
        thead.innerHTML = '<tr>' + colKeys.map(key => {
            const isSortable = sortableKeys.includes(key);
            let sortIndicator = '';
            if (isSortable && currentSort.key === key) {
                sortIndicator = currentSort.direction === 'asc' ? '▲' : '▼';
            }
            const headerText = headers[key];
            if (key === 'fav') {
                // ========== 新增逻辑：判断是否在队伍模拟器模式 ==========
                if (teamSimulatorActive) {
                    // 在模拟器模式下，渲染一个空的表头单元格，从而隐藏按钮
                    return `<th class="col-fav"></th>`;
                } else {
                    // 在普通模式下，保持原有逻辑，显示“一键收藏”按钮
                    const favHeaderClass = shouldPredictFavoriteAll ? 'favorited' : '';
                    const headerText = shouldPredictFavoriteAll ? '★' : '☆';
                    return `<th class="col-fav favorite-all-header ${favHeaderClass}" title="${langDict.favHeaderTitle}">${headerText}</th>`;
                }
                // =======================================================
            }
            return `<th class="col-${key} ${isSortable ? 'sortable' : ''}" data-sort-key="${key}">${headerText}<span class="sort-indicator">${sortIndicator}</span></th>`;
        }).join('') + '</tr>';
        let tbody = heroTable.querySelector('tbody');
        if (!tbody) {
            tbody = document.createElement('tbody');
            heroTable.appendChild(tbody);
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
                    } else {
                        if (source === 'nynaeve') {
                            typesToShow = hero.skill_types ? [...hero.skill_types] : [];
                        } else {
                            typesToShow = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
                        }
                        const reverseMap = currentLang === 'tc' ? reverseSkillTypeMap_tc : reverseSkillTypeMap_cn;
                        typesToShow.sort((a, b) => {
                            const englishA = (currentLang !== 'en' && reverseMap[a]) ? reverseMap[a] : a;
                            const englishB = (currentLang !== 'en' && reverseMap[b]) ? reverseMap[b] : b;
                            const indexA = nynaeveSkillTypeOrder.indexOf(englishA);
                            const indexB = nynaeveSkillTypeOrder.indexOf(englishB);
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                            if (indexA !== -1) return -1;
                            if (indexB !== -1) return 1;
                            return a.localeCompare(b);
                        });
                    }
                    content = typesToShow.join(', ');
                } else if (key === 'power') {
                    content = `💪 ${hero.displayStats[key] || 0}`;
                } else if (key === 'attack') {
                    content = `⚔️ ${hero.displayStats[key] || 0}`;
                } else if (key === 'defense') {
                    content = `🛡️ ${hero.displayStats[key] || 0}`;
                } else if (key === 'health') {
                    content = `❤️ ${hero.displayStats[key] || 0}`;
                } else if (key === 'star') {
                    content = `${hero[key] || ''}⭐`;
                } else {
                    content = hero[key] || '';
                }

                if (key === 'name') {
                    content = getFormattedHeroNameHTML(hero);
                }

                if (key === 'class' && content) {
                    const englishClass = (classReverseMap[content] || content).toLowerCase();
                    content = `<img src="imgs/classes/${englishClass}.png" class="class-icon" alt="${content}"/>${content}`;
                }

                if (key === 'fav') {
                    if (!hero.english_name) return `<td class="col-fav"></td>`;
                    const icon = teamSimulatorActive ? '⬆️' : (isHeroFavorite ? '★' : '☆');
                    const favClass = teamSimulatorActive ? '' : (isHeroFavorite ? 'favorited' : '');
                    return `<td class="col-fav"><span class="favorite-toggle-icon ${favClass}" data-hero-id="${hero.originalIndex}">${icon}</span></td>`;
                }
                if (key === 'image') {
                    const heroColorClass = getColorGlowClass(hero.color);
                    return `<td class="col-image"><img src="${getLocalImagePath(hero.image)}" class="hero-image ${heroColorClass}" alt="${hero.name}" loading="lazy"></td>`;
                }
                if (key === 'color') {
                    const displayedColor = content;
                    if (displayedColor) {
                        const englishColor = (colorReverseMap[String(displayedColor).toLowerCase()] || displayedColor).toLowerCase();
                        const iconHtml = `<img src="imgs/colors/${englishColor}.png" class="color-icon" alt="${displayedColor}" title="${displayedColor}"/>`;
                        return `<td class="col-color">${iconHtml}</td>`;
                    } else {
                        return `<td class="col-color"></td>`;
                    }
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
        adjustStickyHeaders();
    }

    function saveCurrentViewScrollPosition() {
        if (!heroTableView.classList.contains('hidden')) {
            scrollPositions.list.top = resultsWrapper.scrollTop;
            scrollPositions.list.left = resultsWrapper.scrollLeft;
        } else if (!wantedMissionView.classList.contains('hidden')) {
            scrollPositions.wanted.top = resultsWrapper.scrollTop;
            scrollPositions.wanted.left = resultsWrapper.scrollLeft;
        } else if (!farmingGuideView.classList.contains('hidden')) {
            scrollPositions.farming.top = resultsWrapper.scrollTop;
            scrollPositions.farming.left = resultsWrapper.scrollLeft;
        } else if (chatSimulatorView && !chatSimulatorView.classList.contains('hidden')) {
            if (!scrollPositions.chat) scrollPositions.chat = { top: 0, left: 0 };
            scrollPositions.chat.top = resultsWrapper.scrollTop;
            scrollPositions.chat.left = resultsWrapper.scrollLeft;
        }
    }

    function showHeroListViewUI() {
        saveCurrentViewScrollPosition();
        applyFiltersAndRender();
        heroTableView.classList.remove('hidden');
        wantedMissionView.classList.add('hidden');
        farmingGuideView.classList.add('hidden');

        resultsWrapper.scrollTop = scrollPositions.list.top;
        resultsWrapper.scrollLeft = scrollPositions.list.left;

        if (farmGuideScrollHandler) {
            resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            resultsHeader.style.transform = '';
            farmGuideScrollHandler = null;
        }

        updateResultsHeader();
    }

    function renderAndShowHeroList(resetScroll = false) {
        heroTableView.classList.remove('hidden');
        wantedMissionView.classList.add('hidden');
        farmingGuideView.classList.add('hidden');
        if (farmGuideScrollHandler) {
            resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            resultsHeader.style.transform = '';
            farmGuideScrollHandler = null;
        }

        if (resetScroll) {
            resultsWrapper.scrollTop = 0;
        }

        applyFiltersAndRender();
        history.pushState({ view: 'list' }, '');
    }

    function initAndShowWantedMissionView() {
        if (teamSimulatorActive) {
            toggleTeamSimulator();
        }
        if (chatSimulatorView) chatSimulatorView.classList.add('hidden');
        saveCurrentViewScrollPosition();

        if (farmGuideScrollHandler) {
            resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            resultsHeader.style.transform = '';
            farmGuideScrollHandler = null;
        }

        if (wantedMissionTable.innerHTML.trim() === '') {
            const headers = {
                season: '', daily: 'imgs/farm/wanted_normal.png', red: 'imgs/farm/wanted_red.png',
                green: 'imgs/farm/wanted_green.png', blue: 'imgs/farm/wanted_blue.png',
                purple: 'imgs/farm/wanted_purple.png', yellow: 'imgs/farm/wanted_yellow.png'
            };
            let thead = wantedMissionTable.querySelector('thead');
            if (!thead) thead = document.createElement('thead');
            thead.innerHTML = '<tr>' + Object.keys(headers).map(key => {
                if (key === 'season') return `<th></th>`;
                return `<th><img src="${headers[key]}" alt="${key}" style="height: 32px; vertical-align: middle;"></th>`;
            }).join('') + '</tr>';
            wantedMissionTable.appendChild(thead);

            let tbody = wantedMissionTable.querySelector('tbody');
            if (!tbody) tbody = document.createElement('tbody');
            tbody.innerHTML = wantedMissionData.map(row => `<tr>${Object.keys(headers).map(key => {
                const value = row[key];
                const colorMap = { red: 'var(--hero-color-red)', green: 'var(--hero-color-green)', blue: 'var(--hero-color-blue)', purple: 'var(--hero-color-purple)', yellow: 'var(--hero-color-yellow)' };
                const style = colorMap[key] ? `style="color: ${colorMap[key]}; font-weight: bold;"` : '';
                return `<td ${style}>${Array.isArray(value) ? value.join('<br>') : value}</td>`;
            }).join('')}</tr>`).join('');
            wantedMissionTable.appendChild(tbody);
        }

        heroTableView.classList.add('hidden');
        farmingGuideView.classList.add('hidden');
        wantedMissionView.classList.remove('hidden');

        resultsWrapper.scrollTop = scrollPositions.wanted.top;
        resultsWrapper.scrollLeft = scrollPositions.wanted.left;

        const langDict = i18n[currentLang];
        resultsCountEl.innerHTML = `<span>${langDict.wantedMissionTableTitle}</span>`;
        const returnTag = document.createElement('span');
        returnTag.className = 'reset-tag';
        returnTag.textContent = langDict.returnToList;
        returnTag.onclick = () => { history.back(); };
        resultsCountEl.appendChild(returnTag);

        setTimeout(adjustStickyHeaders, 0);
        // 【核心修改】调用新的历史记录处理函数
        setMainViewHistory('wanted');
    }

    function initAndShowFarmingGuideView() {
        if (teamSimulatorActive) {
            toggleTeamSimulator();
        }
        if (chatSimulatorView) chatSimulatorView.classList.add('hidden');
        saveCurrentViewScrollPosition();

        if (farmingGuideTable.innerHTML.trim() === '') {
            const headers = { item: '', s1: 'S1', s2: 'S2', s3: 'S3', s4: 'S4', s5: 'S5', s6: 'S6' };
            const headerKeys = Object.keys(headers);

            let thead = farmingGuideTable.querySelector('thead');
            if (!thead) thead = document.createElement('thead');
            thead.innerHTML = '<tr>' + headerKeys.map((key, index) => `<th data-col-index="${index}">${headers[key]}</th>`).join('') + '</tr>';
            farmingGuideTable.appendChild(thead);

            let tbody = farmingGuideTable.querySelector('tbody');
            if (!tbody) tbody = document.createElement('tbody');
            tbody.innerHTML = farmingGuideData.map((row, rowIndex) => `<tr data-row-index="${rowIndex}">${headerKeys.map((key, colIndex) => {
                let value = row[key] || '';
                if (key === 'item') {
                    return `<td data-col-index="${colIndex}"><img src="imgs/farm/${value}.png" alt="${value}" class="farm-item-image"></td>`;
                }
                return `<td data-col-index="${colIndex}">${String(value).replace(/\n/g, '<br>')}</td>`;
            }).join('')}</tr>`).join('');
            farmingGuideTable.appendChild(tbody);

            const isMobile = window.innerWidth < 769;
            tbody.addEventListener(isMobile ? 'click' : 'mouseover', event => {
                if (farmingGuideView.classList.contains('hidden')) return;
                const cell = event.target.closest('td');
                if (cell) applyHighlight(cell);
            });
            if (!isMobile) {
                tbody.addEventListener('mouseout', clearFarmGuideHighlight);
            }
        }

        heroTableView.classList.add('hidden');
        wantedMissionView.classList.add('hidden');
        farmingGuideView.classList.remove('hidden');

        resultsWrapper.scrollTop = scrollPositions.farming.top;
        resultsWrapper.scrollLeft = scrollPositions.farming.left;

        const langDict = i18n[currentLang];
        resultsCountEl.innerHTML = `<span>${langDict.farmingGuideTableTitle}</span>`;
        const returnTag = document.createElement('span');
        returnTag.className = 'reset-tag';
        returnTag.textContent = langDict.returnToList;
        returnTag.onclick = () => { history.back(); };
        resultsCountEl.appendChild(returnTag);

        if (!farmGuideScrollHandler) {
            farmGuideScrollHandler = () => {
                resultsHeader.style.transform = `translateX(-${resultsWrapper.scrollLeft}px)`;
            };
            resultsWrapper.addEventListener('scroll', farmGuideScrollHandler);
        }

        setTimeout(adjustStickyHeaders, 0);
        // 【核心修改】调用新的历史记录处理函数
        setMainViewHistory('farming');
    }

    function applyHighlight(cell) {
        if (farmingGuideView.classList.contains('hidden') || !cell) return;
        clearFarmGuideHighlight();
        const row = cell.parentElement;
        const table = cell.closest('table');
        const colIndex = cell.dataset.colIndex;
        if (!table || !colIndex) return;

        cell.classList.add('highlight-cell');
        const header = table.querySelector(`thead th[data-col-index="${colIndex}"]`);
        if (header) header.classList.add('highlight-axis');
        const rowLabel = row.querySelector('td:first-child');
        if (rowLabel) rowLabel.classList.add('highlight-axis');
    }

    function clearFarmGuideHighlight() {
        if (farmingGuideView.classList.contains('hidden')) return;
        farmingGuideView.querySelectorAll('.highlight-axis, .highlight-cell').forEach(el => {
            el.classList.remove('highlight-axis', 'highlight-cell');
        });
    }

    function getLocalImagePath(url) {
        if (!url || typeof url !== 'string') return '';
        try {
            const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
            return 'imgs/heroes/' + filename;
        } catch (e) { return ''; }
    }

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

    function renderDetailsInModal(hero, context) {
        const { teamSlotIndex, initialSettings } = context; // 从上下文中解构出队伍位置和初始设置
        const langDict = i18n[currentLang];
        const englishClassKey = (classReverseMap[hero.class] || '').toLowerCase();
        const avatarGlowClass = getColorGlowClass(hero.color);

        const renderListAsHTML = (itemsArray, filterType = null) => {
            if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) return `<li>${langDict.none}</li>`;
            return itemsArray.map(item => {
                let cleanItem = String(item).trim();
                if (filterType) {
                    const mainDesc = cleanItem.split(' * ')[0].trim();
                    const displayHTML = cleanItem.replace(/ \* /g, '<br><i>') + '</i>';
                    return `<li class="skill-type-tag" data-filter-type="${filterType}" data-filter-value="${mainDesc}" title="${langDict.filterBy} ${mainDesc}">${displayHTML}</li>`;
                }
                if (cleanItem.includes(' * ')) {
                    const parts = cleanItem.split(' * ');
                    return `<li>${parts[0].trim()}<br><i>${parts.slice(1).join('</i><br><i>')}</i></li>`;
                }
                return `<li>${cleanItem}</li>`;
            }).join('');
        };

        const skinInfo = getSkinInfo(hero);
        const heroSkin = skinInfo.skinIdentifier;
        let tempName = skinInfo.baseName;
        let mainHeroName = '', englishName = '', traditionalChineseName = '';

        if (currentLang === 'en') {
            mainHeroName = tempName;
        } else {
            const multiLangMatch = tempName.match(/^(.*?)\s+([^\s\(]+)\s+\((.*?)\)$/);
            const singleAltLangMatch = tempName.match(/^(.*?)\s*\(([^)]+)\)/);
            if (multiLangMatch) {
                mainHeroName = multiLangMatch[1].trim();
                traditionalChineseName = multiLangMatch[2].trim();
                englishName = multiLangMatch[3].trim();
            } else if (singleAltLangMatch && /[a-zA-Z]/.test(singleAltLangMatch[2])) {
                mainHeroName = singleAltLangMatch[1].trim();
                englishName = singleAltLangMatch[2].trim();
            } else {
                mainHeroName = tempName;
            }
        }
        const nameBlockHTML = `${englishName ? `<p class="hero-english-name">${englishName}</p>` : ''}<h1 class="hero-main-name skill-type-tag" data-filter-type="name" data-filter-value="${mainHeroName.trim()}" title="${langDict.filterBy} '${mainHeroName.trim()}'">${mainHeroName}</h1>${traditionalChineseName ? `<p class="hero-alt-name">${traditionalChineseName}</p>` : ''}`;
        const translatedFamily = getDisplayName(hero.family, 'family');
        const displayedSourceText = getDisplayName(hero.source, 'source');

        const heroFamilyKey = String(hero.family || '').toLowerCase();
        const familyBonus = (families_bonus.find(f => f.name.toLowerCase() === heroFamilyKey) || {}).bonus || [];

        const source = filterInputs.skillTypeSource.value;
        let skillTypesToDisplay = [];
        if (source === 'heroplan') {
            skillTypesToDisplay = hero.types ? [...hero.types] : [];
            skillTypesToDisplay.sort((a, b) => a.localeCompare(b));
        } else {
            if (source === 'nynaeve') {
                skillTypesToDisplay = hero.skill_types ? [...hero.skill_types] : [];
            } else {
                skillTypesToDisplay = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
            }
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
        }
        const uniqueSkillTypes = skillTypesToDisplay.filter(t => t);
        const heroTypesContent = uniqueSkillTypes.length > 0 ? `<div class="skill-types-container">${uniqueSkillTypes.map(type => `<span class="hero-info-block skill-type-tag" data-filter-type="types" data-filter-value="${type}" title="${langDict.filterBy} ${type}">${type}</span>`).join('')}</div>` : `<span class="skill-value">${langDict.none}</span>`;

        const localImagePath = getLocalImagePath(hero.image);
        const fancyNameHTML = hero.fancy_name ? `<p class="hero-fancy-name">${hero.fancy_name}</p>` : '';

        let familyBlockHTML = '';
        if (hero.family) {
            const familyFileName = String(hero.family).toLowerCase();
            familyBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}" title="${langDict.filterBy} ${translatedFamily || hero.family}"><img src="imgs/family/${familyFileName}.png" class="family-icon" alt="${hero.family} icon"/>${translatedFamily || hero.family}</span>`;
        }
        const displayedClass = hero.class;
        let classBlockHTML = '';
        if (displayedClass) {
            const englishClass = (classReverseMap[displayedClass] || displayedClass).toLowerCase();
            classBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="class" data-filter-value="${displayedClass}" title="${langDict.filterBy} ${displayedClass}"><img src="imgs/classes/${englishClass}.png" class="class-icon" alt="${displayedClass}"/>${displayedClass}</span>`;
        }
        let skinBlockHTML = '';
        if (heroSkin) {
            const iconName = getCostumeIconName(heroSkin);
            const iconHtml = iconName ? `<img src="imgs/costume/${iconName}.png" class="costume-icon" alt="${iconName} costume"/>` : '👕';
            skinBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="costume" data-filter-value="${heroSkin}" title="${langDict.filterBy} ${heroSkin}">${langDict.modalSkin} ${iconHtml}</span>`;
        }
        let aetherPowerBlockHTML = '';
        if (hero.AetherPower) {
            const displayedPower = hero.AetherPower;
            const englishPower = aetherPowerReverseMap[displayedPower] || displayedPower;
            const aetherFileName = englishPower.toLowerCase();
            const iconHtml = `<img src="imgs/Aether Power/${aetherFileName}.png" class="aether-power-icon" alt="${displayedPower}"/>`;
            aetherPowerBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="aetherpower" data-filter-value="${displayedPower}" title="${langDict.filterBy} ${displayedPower}">⏫${iconHtml}${displayedPower}</span>`;
        }
        let sourceBlockHTML = '';
        if (hero.source) {
            const displayedSource = hero.source;
            const sourceKey = sourceReverseMap[displayedSource];
            let iconHtml = '';
            if (sourceKey) {
                const iconFilename = sourceIconMap[sourceKey];
                if (iconFilename) {
                    iconHtml = `<img src="imgs/coins/${iconFilename}" class="source-icon" alt="${displayedSource}"/>`;
                }
            }
            sourceBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="source" data-filter-value="${hero.source}" title="${langDict.filterBy} ${displayedSourceText}">${iconHtml}${displayedSourceText}</span>`;
        }

        const talentBonusCostHTML = `
            <div class="filter-header" id="modal-bonus-cost-header" style="margin-top: 1rem; border-top: 1px solid var(--md-sys-color-outline);">
                <h2 data-lang-key="bonusAndCostTitle">${langDict.bonusAndCostTitle}</h2>
                <button class="toggle-button expanded" data-target="modal-bonus-cost-content" data-cookie="modal_bonus_cost_state">▼</button>
            </div>
            <div id="modal-bonus-cost-content" class="filter-content">
                <div id="modal-talent-bonus-display"></div>
                <hr class="divider">
                <div id="modal-talent-cost-display">
                    <div class="cost-item"><img src="imgs/emblems/${englishClassKey}.png" class="cost-icon" alt="纹章图标">${langDict.emblemCostLabel}<span id="cost-emblem">0</span></div>
                    <div class="cost-item"><img src="imgs/farm/Food.png" class="cost-icon" alt="食物图标">${langDict.foodCostLabel}<span id="cost-food">0</span></div>
                    <div class="cost-item"><img src="imgs/farm/Iron.png" class="cost-icon" alt="铁矿图标">${langDict.ironCostLabel}<span id="cost-iron">0</span></div>
                    <div class="cost-item"><img src="imgs/emblems/master_${englishClassKey}.png" class="cost-icon" alt="大师纹章图标">${langDict.masterEmblemCostLabel}<span id="cost-master-emblem">0</span></div>
                </div>
            </div>
        `;

        const talentSystemHTML = showLbTalentDetailsCheckbox.checked ? `
    <div id="modal-talent-system-wrapper">
        <div class="filter-header" id="modal-talent-settings-header">
            <h2 data-lang-key="modalTalentSettingsTitle">${langDict.modalTalentSettingsTitle}</h2>
            <button class="toggle-button expanded" data-target="modal-talent-settings-content" data-cookie="modal_settings_state">▼</button>
        </div>
        <div id="modal-talent-settings-content" class="filter-content">
            <div class="modal-talent-settings-wrapper">
                <div class="modal-talent-settings-grid">
                    <div class="details-selector-item"><label for="modal-limit-break-select" data-lang-key="limitBreakSetting">${langDict.limitBreakSetting}</label><select id="modal-limit-break-select"><option value="none" data-lang-key="noLimitBreak">${langDict.noLimitBreak}</option><option value="lb1" data-lang-key="lb1">${langDict.lb1}</option><option value="lb2" data-lang-key="lb2">${langDict.lb2}</option></select></div>
                    <div class="details-selector-item"><label for="modal-talent-select" data-lang-key="talentSetting">${langDict.talentSetting}</label><select id="modal-talent-select"><option value="none" data-lang-key="noTalent">${langDict.noTalent}</option><option value="talent20" data-lang-key="talent20">${langDict.talent20}</option><option value="talent25" data-lang-key="talent25">${langDict.talent25}</option></select></div>
                    <div class="details-selector-item"><label for="modal-talent-strategy-select" data-lang-key="prioritySetting">${langDict.prioritySetting}</label><select id="modal-talent-strategy-select"><option value="atk-def-hp" data-lang-key="attackPriority">${langDict.attackPriority}</option><option value="atk-hp-def" data-lang-key="attackPriority2">${langDict.attackPriority2}</option><option value="def-hp-atk" data-lang-key="defensePriority">${langDict.defensePriority}</option><option value="hp-def-atk" data-lang-key="healthPriority">${langDict.healthPriority}</option></select></div>
                    <div class="details-selector-item"><label for="modal-mana-priority-checkbox" data-lang-key="manaPriorityLabel">${langDict.manaPriorityLabel}</label><div class="checkbox-container"><input type="checkbox" id="modal-mana-priority-checkbox"><label for="modal-mana-priority-checkbox" class="checkbox-label" data-lang-key="manaPriorityToggle">${langDict.manaPriorityToggle}</label></div></div>
                </div>
            </div>
            ${talentBonusCostHTML}
            <div class="filter-header" id="modal-talent-tree-header" style="margin-top: 1rem; border-top: 1px solid var(--md-sys-color-outline);"><h2 data-lang-key="talentTreeTitle">${langDict.talentTreeTitle}</h2><button class="toggle-button expanded" data-target="modal-talent-tree-wrapper" data-cookie="modal_tree_state">▼</button></div>
            <div id="modal-talent-tree-wrapper" class="filter-content" style="padding:0;"><div class="loader-spinner" style="margin: 3rem auto;"></div></div>
        </div>
        ` : ''; // Conditional rendering

        const detailsHTML = `<div class="details-header"><h2>${langDict.modalHeroDetails}</h2><div class="details-header-buttons"><button class="favorite-btn" id="favorite-hero-btn" title="${langDict.favoriteButtonTitle}">☆</button><button class="share-btn" id="share-hero-btn" title="${langDict.shareButtonTitle}">🔗</button><button class="close-btn" id="hide-details-btn" title="${langDict.closeBtnTitle}">✖</button></div></div><div class="hero-title-block">${nameBlockHTML}${fancyNameHTML}</div><div class="details-body"><div class="details-top-left"><img src="${localImagePath}" class="hero-image-modal ${avatarGlowClass}" alt="${hero.name}"></div><div class="details-top-right"><div class="details-info-line">${classBlockHTML}${skinBlockHTML}${aetherPowerBlockHTML}${sourceBlockHTML}${hero['Release date'] ? `<span class="hero-info-block">📅 ${hero['Release date']}</span>` : ''}</div><h3>${langDict.modalCoreStats}</h3><div class="details-stats-grid"><div><p class="metric-value-style">💪 ${hero.displayStats.power || 0}</p></div><div><p class="metric-value-style">⚔️ ${hero.displayStats.attack || 0}</p></div><div><p class="metric-value-style">🛡️ ${hero.displayStats.defense || 0}</p></div><div><p class="metric-value-style">❤️ ${hero.displayStats.health || 0}</p></div></div></div></div><div class="details-bottom-section">${talentSystemHTML}<h3>${langDict.modalSkillDetails}</h3><div class="skill-category-block"><p class="uniform-style">${langDict.modalSkillName} <span class="skill-value">${hero.skill && hero.skill !== 'nan' ? hero.skill : langDict.none}</span></p><p class="uniform-style">${langDict.modalSpeed} <span class="skill-value skill-type-tag" data-filter-type="speed" data-filter-value="${hero.speed}" title="${langDict.filterBy} ${hero.speed}">${hero.speed || langDict.none}</span></p><p class="uniform-style">${langDict.modalSkillType}</p>${heroTypesContent}</div><div class="skill-category-block"><p class="uniform-style">${langDict.modalSpecialSkill}</p><ul class="skill-list">${renderListAsHTML(hero.effects, 'effects')}</ul></div><div class="skill-category-block"><p class="uniform-style">${langDict.modalPassiveSkill}</p><ul class="skill-list">${renderListAsHTML(hero.passives, 'passives')}</ul></div>${familyBonus.length > 0 ? `<div class="skill-category-block"><p class="uniform-style">${langDict.modalFamilyBonus(`<span class="skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}" title="${langDict.filterBy} ${translatedFamily || hero.family}"><img src="imgs/family/${String(hero.family).toLowerCase()}.png" class="family-icon" alt="${hero.family} icon"/>${translatedFamily || hero.family}</span>`)}</p><ul class="skill-list">${renderListAsHTML(familyBonus)}</ul></div>` : ''}</div><div class="modal-footer"><button class="close-bottom-btn" id="hide-details-bottom-btn">${langDict.detailsCloseBtn}</button></div>`;

        modalContent.innerHTML = detailsHTML;
        if (showLbTalentDetailsCheckbox.checked) { //
            const modalLbSelect = document.getElementById('modal-limit-break-select');
            const modalTalentSelect = document.getElementById('modal-talent-select');
            const modalStrategySelect = document.getElementById('modal-talent-strategy-select');
            const modalManaCheckbox = document.getElementById('modal-mana-priority-checkbox');

            const settingsToUse = initialSettings || {
                lb: defaultLimitBreakSelect.value,
                talent: defaultTalentSelect.value,
                strategy: defaultTalentStrategySelect.value,
                manaPriority: defaultManaPriorityCheckbox.checked
            };
            modalLbSelect.value = settingsToUse.lb;
            modalTalentSelect.value = settingsToUse.talent;
            modalStrategySelect.value = settingsToUse.strategy;
            modalManaCheckbox.checked = settingsToUse.manaPriority;

            const updateTeamSlotAndRerender = () => {
                if (teamSlotIndex === undefined || teamSlotIndex < 0) return;
                if (!teamSlots[teamSlotIndex]) return;

                const newSettings = {
                    lb: modalLbSelect.value,
                    talent: modalTalentSelect.value,
                    strategy: modalStrategySelect.value,
                    manaPriority: modalManaCheckbox.checked
                };
                teamSlots[teamSlotIndex].settings = newSettings;
                renderTeamDisplay();
            };

            let currentTalentBonuses = {};
            let currentNodeCount = 0;

            function _updateModalStatsWithBonuses(hero, settings, bonuses, nodeCount) {
                let baseStats = {
                    power: hero.power || 0, attack: hero.attack || 0,
                    defense: hero.defense || 0, health: hero.health || 0
                };
                if (settings.lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
                else if (settings.lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };

                let finalStats = { ...baseStats };

                if (settings.talent !== 'none') {
                    const attackPercentBonus = Math.floor((baseStats.attack || 0) * (bonuses.attack_percent / 100));
                    finalStats.attack = (baseStats.attack || 0) + bonuses.attack_flat + attackPercentBonus;
                    const defensePercentBonus = Math.floor((baseStats.defense || 0) * (bonuses.defense_percent / 100));
                    finalStats.defense = (baseStats.defense || 0) + bonuses.defense_flat + defensePercentBonus;
                    const healthPercentBonus = Math.floor((baseStats.health || 0) * (bonuses.health_percent / 100));
                    finalStats.health = (baseStats.health || 0) + bonuses.health_flat + healthPercentBonus;
                }

                const STAR_BASE_POWER = { 1: 0, 2: 10, 3: 30, 4: 50, 5: 90 };
                const star_power = STAR_BASE_POWER[hero.star] || 0;
                const stats_raw_power = (baseStats.attack * 0.35) + (baseStats.defense * 0.28) + (baseStats.health * 0.14);
                const stats_final_power = Math.floor(stats_raw_power);
                const skill_power = (8 - 1) * 5;
                const talent_power = nodeCount * 5;

                finalStats.power = star_power + stats_final_power + skill_power + talent_power;

                const powerEl = modal.querySelector('.details-stats-grid > div:nth-child(1) p');
                const attackEl = modal.querySelector('.details-stats-grid > div:nth-child(2) p');
                const defenseEl = modal.querySelector('.details-stats-grid > div:nth-child(3) p');
                const healthEl = modal.querySelector('.details-stats-grid > div:nth-child(4) p');
                if (powerEl) powerEl.innerHTML = `💪 ${finalStats.power || 0}`;
                if (attackEl) attackEl.innerHTML = `⚔️ ${finalStats.attack || 0}`;
                if (defenseEl) defenseEl.innerHTML = `🛡️ ${finalStats.defense || 0}`;
                if (healthEl) healthEl.innerHTML = `❤️ ${finalStats.health || 0}`;
            }

            function _updateBonusAndCostDisplay(bonuses, nodeCount, baseStats) {
                const bonusDisplay = document.getElementById('modal-talent-bonus-display');
                const calculatedBonuses = {
                    attack: bonuses.attack_flat + Math.floor((baseStats.attack || 0) * (bonuses.attack_percent / 100)),
                    defense: bonuses.defense_flat + Math.floor((baseStats.defense || 0) * (bonuses.defense_percent / 100)),
                    health: bonuses.health_flat + Math.floor((baseStats.health || 0) * (bonuses.health_percent / 100)),
                    mana: bonuses.mana_percent,
                    healing: bonuses.healing_percent,
                    crit: bonuses.crit_percent
                };
                const iconMap = {
                    attack: 'attack.png', defense: 'defense.png', health: 'health.png',
                    mana: 'mana.png', healing: 'healing.png', crit: 'critical.png'
                };
                const bonusMap = {
                    attack: { value: calculatedBonuses.attack, label: langDict.attackBonusLabel, isPercent: false },
                    defense: { value: calculatedBonuses.defense, label: langDict.defenseBonusLabel, isPercent: false },
                    health: { value: calculatedBonuses.health, label: langDict.healthBonusLabel, isPercent: false },
                    mana: { value: calculatedBonuses.mana, label: langDict.manaBonusLabel, isPercent: true },
                    healing: { value: calculatedBonuses.healing, label: langDict.healingBonusLabel, isPercent: true },
                    crit: { value: calculatedBonuses.crit, label: langDict.critBonusLabel, isPercent: true }
                };
                let bonusHTML = '';
                for (const key in bonusMap) {
                    const bonus = bonusMap[key];
                    if (bonus.value > 0) {
                        const sign = bonus.isPercent ? '%' : '';
                        bonusHTML += `<div class="bonus-item"><img src="imgs/talents/${iconMap[key]}" class="bonus-icon" alt="${bonus.label}">${bonus.label}<span>+${bonus.value}${sign}</span></div>`;
                    }
                }
                bonusDisplay.innerHTML = bonusHTML || `<div class="bonus-item">${langDict.noBonusLabel}</div>`;

                const costs = { emblem: 0, food: 0, iron: 0, masterEmblem: 0 };
                const star = parseInt(hero.star);
                const relevantCosts = costData.filter(item => Math.floor(item.slot / 100) === star);
                for (let i = 0; i < nodeCount; i++) {
                    const costEntry = relevantCosts[i];
                    if (costEntry) {
                        costs.emblem += parseInt(costEntry.emblem) || 0;
                        costs.food += parseInt(String(costEntry.food).replace(/,/g, '')) || 0;
                        costs.iron += parseInt(String(costEntry.iron).replace(/,/g, '')) || 0;
                        costs.masterEmblem += parseInt(costEntry.masteremblem) || 0;
                    }
                }
                document.getElementById('cost-emblem').textContent = costs.emblem.toLocaleString();
                document.getElementById('cost-food').textContent = costs.food.toLocaleString();
                document.getElementById('cost-iron').textContent = costs.iron.toLocaleString();
                document.getElementById('cost-master-emblem').textContent = costs.masterEmblem.toLocaleString();
            }

            const talentChangeCallback = (bonuses, nodeCount) => {
                currentTalentBonuses = bonuses;
                currentNodeCount = nodeCount;
                const currentSettingsInModal = {
                    lb: modalLbSelect.value,
                    talent: modalTalentSelect.value
                };
                _updateModalStatsWithBonuses(hero, currentSettingsInModal, bonuses, nodeCount);
                let baseStats = { attack: hero.attack, defense: hero.defense, health: hero.health };
                if (currentSettingsInModal.lb === 'lb1' && hero.lb1) baseStats = { ...hero.lb1 };
                else if (currentSettingsInModal.lb === 'lb2' && hero.lb2) baseStats = { ...hero.lb2 };
                _updateBonusAndCostDisplay(bonuses, nodeCount, baseStats);
                updateTeamSlotAndRerender();
            };

            const talentTreeContainer = document.getElementById('modal-talent-tree-wrapper');
            if (hero.class && typeof TalentTree !== 'undefined') {
                TalentTree.init(talentTreeContainer, hero.class, {
                    strategy: modalStrategySelect.value,
                    manaPriority: modalManaCheckbox.checked
                }, talentChangeCallback, langDict.talentTerms);
            } else {
                talentTreeContainer.innerHTML = `<p style="text-align:center; padding: 2rem 0;">该英雄没有职业天赋。</p>`;
            }

            const handleSettingsChange = () => {
                const newTalentLevel = modalTalentSelect.value;
                const isDisabled = (newTalentLevel === 'none');
                modalStrategySelect.disabled = isDisabled;
                modalManaCheckbox.disabled = isDisabled;

                if (typeof TalentTree !== 'undefined' && hero.class) {
                    if (newTalentLevel === 'none') {
                        TalentTree.clear();
                    } else {
                        TalentTree.setPath(modalStrategySelect.value, modalManaCheckbox.checked, newTalentLevel);
                    }
                }
                updateTeamSlotAndRerender();
            };

            modalLbSelect.addEventListener('change', handleSettingsChange);
            modalTalentSelect.addEventListener('change', handleSettingsChange);
            modalStrategySelect.addEventListener('change', handleSettingsChange);
            modalManaCheckbox.addEventListener('change', handleSettingsChange);

            handleSettingsChange();

            modalContent.querySelectorAll('.filter-header').forEach(header => {
                const button = header.querySelector('.toggle-button');
                if (!button) return;
                const contentId = button.dataset.target;
                const cookieName = button.dataset.cookie;
                const contentElement = document.getElementById(contentId);
                if (contentElement && cookieName) {
                    const savedState = getCookie(cookieName);
                    if (savedState === 'collapsed') {
                        contentElement.classList.add('collapsed');
                        button.classList.remove('expanded');
                    } else {
                        contentElement.classList.remove('collapsed');
                        button.classList.add('expanded');
                    }
                    header.addEventListener('click', () => {
                        contentElement.classList.toggle('collapsed');
                        button.classList.toggle('expanded');
                        const newState = contentElement.classList.contains('collapsed') ? 'collapsed' : 'expanded';
                        setCookie(cookieName, newState, 365);
                    });
                }
            });
        }
        document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
        document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);
        const favoriteBtn = document.getElementById('favorite-hero-btn');
        if (favoriteBtn) {
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
                    tableStar.textContent = isFavorite(hero) ? '★' : '☆';
                    tableStar.classList.toggle('favorited', isFavorite(hero));
                }
                if (filterInputs.filterScope.value === 'favorites') {
                    applyFiltersAndRender();
                }
            });
            updateFavoriteButton();
        }
        const shareBtn = document.getElementById('share-hero-btn');
        if (shareBtn) {
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
                    console.error('复制链接失败：', err);
                    alert(langDict.copyLinkFailed);
                });
            });
        }
    }

    function clearAllFilters() {
        temporaryFavorites = null;
        temporaryDateFilter = null;
        for (const key in filterInputs) {
            if (key === 'skillTypeSource') continue;
            const element = filterInputs[key];
            if (element) {
                if (element.tagName === 'SELECT') {
                    if (element.id === 'release-date-type') {
                        element.value = 'all';
                    } else {
                        element.value = i18n[currentLang].none;
                    }
                } else {
                    element.value = '';
                }
            }
        }
    }

    function hsvToRgb(h, s, v) {
        let r, g, b;
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function updateColorPickerUI() {
        const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const hex = rgbToHex(r, g, b);

        if (svBox) svBox.style.backgroundColor = `hsl(${hsv.h * 360}, 100%, 50%)`;
        if (svCursor) {
            svCursor.style.left = `${hsv.s * 100}%`;
            svCursor.style.top = `${(1 - hsv.v) * 100}%`;
        }
        if (hueCursor) hueCursor.style.top = `${hsv.h * 100}%`;
        if (colorPreviewBox) colorPreviewBox.style.backgroundColor = hex;
        if (colorHexCodeInput) colorHexCodeInput.value = hex;
    }

    function insertTextAtCursor(textarea, textToInsert) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        textarea.value = text.substring(0, start) + textToInsert + text.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function updateChatPreview() {
        if (!chatSimulatorInput || !chatSimulatorPreview) return;
        const rawText = chatSimulatorInput.value;
        let html = '';
        let currentColor = '#FFFFFF';

        const tokens = rawText.split(/(\[#[A-Fa-f0-9]{6}\]|:[a-zA-Z0-9_]+:)/g).filter(Boolean);

        tokens.forEach(token => {
            const colorMatch = token.match(/^\[(#[A-Fa-f0-9]{6})\]$/);
            const emojiMatch = token.match(/^:([a-zA-Z0-9_]+):$/);

            if (colorMatch) {
                currentColor = colorMatch[1];
            } else if (emojiMatch && emojiList.includes(emojiMatch[1])) {
                const emojiName = emojiMatch[1];
                html += `<img src="imgs/emoticons/${emojiName}.png" alt="${token}" style="width: 20px; height: 20px; vertical-align: middle;">`;
            } else {
                const textWithBreaks = token.replace(/\n/g, '<br>');
                html += `<span style="color: ${currentColor};">${textWithBreaks}</span>`;
            }
        });
        chatSimulatorPreview.innerHTML = html;
    }

    function initAndShowChatSimulatorView() {
        if (teamSimulatorActive) {
            toggleTeamSimulator();
        }
        saveCurrentViewScrollPosition();

        heroTableView.classList.add('hidden');
        wantedMissionView.classList.add('hidden');
        farmingGuideView.classList.add('hidden');
        chatSimulatorView.classList.remove('hidden');

        if (scrollPositions.chat) {
            resultsWrapper.scrollTop = scrollPositions.chat.top;
            resultsWrapper.scrollLeft = scrollPositions.chat.left;
        } else {
            scrollPositions.chat = { top: 0, left: 0 };
        }

        const langDict = i18n[currentLang];
        resultsCountEl.innerHTML = `<span>${langDict.chatSimulatorTitle || '聊天模拟器'}</span>`;
        const returnTag = document.createElement('span');
        returnTag.className = 'reset-tag';
        returnTag.textContent = langDict.returnToList;
        returnTag.onclick = () => { history.back(); };
        resultsCountEl.appendChild(returnTag);

        setTimeout(adjustStickyHeaders, 0);
        // 【核心修改】调用新的历史记录处理函数
        setMainViewHistory('chat');
    }

    function addChatSimulatorEventListeners() {
        let isSimulatorInitialized = false;

        if (showChatSimulatorBtn) {
            showChatSimulatorBtn.addEventListener('click', () => {
                initAndShowChatSimulatorView();

                if (isSimulatorInitialized) return;

                const favoriteColorBtn = document.getElementById('favorite-color-btn');
                const favoriteColorsGrid = document.getElementById('favorite-colors-grid');

                let favoriteColors = getCookie('favoriteColors') ? JSON.parse(getCookie('favoriteColors')) : [];

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

                        removeBtn.addEventListener('click', () => {
                            favoriteColors = favoriteColors.filter(c => c !== color);
                            setCookie('favoriteColors', JSON.stringify(favoriteColors), 365);
                            renderFavoriteColors();
                        });

                        item.appendChild(removeBtn);

                        let pressTimer = null;
                        let isLongPress = false;

                        const startPress = (e) => {
                            if (e.type === 'mousedown') return;

                            e.preventDefault();
                            isLongPress = false;

                            pressTimer = setTimeout(() => {
                                isLongPress = true;
                                const colorToRemove = item.dataset.color;
                                favoriteColors = favoriteColors.filter(c => c !== colorToRemove);
                                setCookie('favoriteColors', JSON.stringify(favoriteColors), 365);
                                renderFavoriteColors();
                            }, 500);
                        };

                        const cancelPress = () => {
                            clearTimeout(pressTimer);
                        };

                        const clickAction = (e) => {
                            if (isLongPress || e.target === removeBtn) {
                                isLongPress = false;
                                return;
                            }
                            insertTextAtCursor(chatSimulatorInput, `[${item.dataset.color}]`);
                        };

                        item.addEventListener('click', clickAction);
                        item.addEventListener('touchstart', startPress, { passive: false });
                        item.addEventListener('touchend', cancelPress);
                        item.addEventListener('touchmove', cancelPress);

                        favoriteColorsGrid.appendChild(item);
                    });
                }

                if (favoriteColorBtn) {
                    favoriteColorBtn.addEventListener('click', () => {
                        const currentColor = colorHexCodeInput.value;
                        if (currentColor && !favoriteColors.includes(currentColor)) {
                            favoriteColors.unshift(currentColor);
                            setCookie('favoriteColors', JSON.stringify(favoriteColors), 365);
                            renderFavoriteColors();
                        }
                    });
                }

                if (chatSimulatorInput) { chatSimulatorInput.addEventListener('input', updateChatPreview); }
                if (insertColorBtn) { insertColorBtn.addEventListener('click', () => { const colorCode = `[${colorHexCodeInput.value}]`; insertTextAtCursor(chatSimulatorInput, colorCode); }); }
                if (chatSimulatorCopyBtn) {
                    chatSimulatorCopyBtn.addEventListener('click', () => {
                        if (!chatSimulatorInput.value) return;
                        navigator.clipboard.writeText(chatSimulatorInput.value).then(() => {
                            const originalText = chatSimulatorCopyBtn.innerText;
                            const langDict = i18n[currentLang];
                            chatSimulatorCopyBtn.innerText = langDict.chatCopied || '已复制!';
                            chatSimulatorCopyBtn.disabled = true;
                            setTimeout(() => {
                                chatSimulatorCopyBtn.innerText = originalText;
                                chatSimulatorCopyBtn.disabled = false;
                            }, 2000);
                        }).catch(err => { console.error('复制失败:', err); alert('复制失败，请手动复制。'); });
                    });
                }
                if (emojiGrid && emojiGrid.children.length === 0) {

                    emojiList.forEach(emojiName => {
                        const img = document.createElement('img');
                        img.src = `imgs/emoticons/${emojiName}.png`;
                        img.alt = `:${emojiName}:`;
                        img.title = `:${emojiName}:`;
                        img.addEventListener('click', () => { insertTextAtCursor(chatSimulatorInput, `:${emojiName}:`); });
                        emojiGrid.appendChild(img);
                    });
                }

                function handleHueMove(event) { event.preventDefault(); const rect = hueSlider.getBoundingClientRect(); const y = (event.clientY || event.touches[0].clientY) - rect.top; hsv.h = Math.max(0, Math.min(1, y / rect.height)); updateColorPickerUI(); }
                function handleSVMove(event) { event.preventDefault(); const rect = svBox.getBoundingClientRect(); const x = (event.clientX || event.touches[0].clientX) - rect.left; const y = (event.clientY || event.touches[0].clientY) - rect.top; hsv.s = Math.max(0, Math.min(1, x / rect.width)); hsv.v = 1 - Math.max(0, Math.min(1, y / rect.height)); updateColorPickerUI(); }
                function stopDragging() { isDraggingHue = false; isDraggingSV = false; }
                hueSlider.addEventListener('mousedown', (e) => { isDraggingHue = true; handleHueMove(e); });
                svBox.addEventListener('mousedown', (e) => { isDraggingSV = true; handleSVMove(e); });
                window.addEventListener('mousemove', (e) => { if (isDraggingHue) handleHueMove(e); if (isDraggingSV) handleSVMove(e); });
                window.addEventListener('mouseup', stopDragging);
                hueSlider.addEventListener('touchstart', (e) => { isDraggingHue = true; handleHueMove(e); }, { passive: false });
                svBox.addEventListener('touchstart', (e) => { isDraggingSV = true; handleSVMove(e); }, { passive: false });
                window.addEventListener('touchmove', (e) => { if (isDraggingHue) handleHueMove(e); if (isDraggingSV) handleSVMove(e); }, { passive: false });
                window.addEventListener('touchend', stopDragging);

                const splitter = document.getElementById('io-splitter');
                const previewWrapper = document.getElementById('chat-simulator-preview-wrapper');
                const savedHeight = getCookie('chatPreviewHeight');
                if (savedHeight && previewWrapper) { previewWrapper.style.flexBasis = savedHeight; previewWrapper.style.flexGrow = '0'; previewWrapper.style.flexShrink = '0'; }
                if (splitter && previewWrapper && chatSimulatorInput) {
                    let isDraggingSplitter = false;
                    function onDragStart(e) { e.preventDefault(); isDraggingSplitter = true; window.addEventListener('mousemove', onDragMove); window.addEventListener('mouseup', onDragEnd); window.addEventListener('touchmove', onDragMove, { passive: false }); window.addEventListener('touchend', onDragEnd); }
                    function onDragMove(e) { if (!isDraggingSplitter) return; e.preventDefault(); const clientY = e.touches ? e.touches[0].clientY : e.clientY; const panel = splitter.parentElement; const panelRect = panel.getBoundingClientRect(); const newPreviewHeight = clientY - panelRect.top - (splitter.offsetHeight / 2); const minHeight = 50; const panelContentHeight = panel.offsetHeight - chatSimulatorCopyBtn.offsetHeight - 20; if (newPreviewHeight >= minHeight && (panelContentHeight - newPreviewHeight - splitter.offsetHeight) >= minHeight) { previewWrapper.style.flexBasis = `${newPreviewHeight}px`; previewWrapper.style.flexGrow = '0'; previewWrapper.style.flexShrink = '0'; } }
                    function onDragEnd() { if (!isDraggingSplitter) return; isDraggingSplitter = false; if (previewWrapper.style.flexBasis) { setCookie('chatPreviewHeight', previewWrapper.style.flexBasis, 365); } window.removeEventListener('mousemove', onDragMove); window.removeEventListener('mouseup', onDragEnd); window.removeEventListener('touchmove', onDragMove); window.removeEventListener('touchend', onDragEnd); }
                    splitter.addEventListener('mousedown', onDragStart);
                    splitter.addEventListener('touchstart', onDragStart, { passive: false });
                }

                document.querySelectorAll('.chat-simulator-panel > h3').forEach(header => {
                    header.addEventListener('click', () => {
                        if (window.innerWidth > 900) return;
                        const panel = header.closest('.chat-simulator-panel');
                        if (panel && (panel.classList.contains('chat-panel-colors') || panel.classList.contains('chat-panel-emojis'))) {
                            panel.classList.toggle('collapsed');
                            const toggleBtn = header.querySelector('.panel-toggle-btn');
                            if (toggleBtn) { toggleBtn.classList.toggle('expanded', !panel.classList.contains('collapsed')); }
                        }
                    });
                });

                updateColorPickerUI();
                renderFavoriteColors();
                isSimulatorInitialized = true;
            });
        }
    }

    function createCustomSelect(selectElement, type) {
        if (!selectElement) return;

        const oldContainer = selectElement.previousElementSibling;
        if (oldContainer && oldContainer.classList.contains('custom-select-container')) {
            oldContainer.remove();
        }

        const container = document.createElement('div');
        container.className = 'custom-select-container';
        selectElement.parentNode.insertBefore(container, selectElement);

        const selectedDiv = document.createElement('div');
        selectedDiv.className = 'select-selected';
        container.appendChild(selectedDiv);

        const noneText = i18n[currentLang].none;
        const iconMap = iconMaps[type] || {};

        const updateSelectedDisplay = (text, value) => {
            const iconSrc = iconMap[value] || (type === 'source' ? iconMap[text] : null);
            let iconHTML = '';
            if (iconSrc) {
                iconHTML = `<img src="${iconSrc}" class="option-icon" alt="${text}">`;
            }
            selectedDiv.innerHTML = `${iconHTML}<span class="selected-text">${text}</span>`;
            selectedDiv.title = text;
            container.dataset.value = value;
            selectElement.value = value;
            const event = new Event('input', { bubbles: true });
            selectElement.dispatchEvent(event);
        };

        const initialOption = selectElement.options[selectElement.selectedIndex];
        if (initialOption) {
            updateSelectedDisplay(initialOption.text, initialOption.value);
        }

        selectedDiv.addEventListener('click', function (e) {
            e.stopPropagation();
            const existingItemsDiv = document.querySelector('.select-items[data-owner-id="' + selectElement.id + '"]');
            if (existingItemsDiv) {
                existingItemsDiv.remove();
                selectedDiv.classList.remove('select-arrow-active');
                return;
            }

            document.querySelectorAll('.select-items').forEach(div => div.remove());
            document.querySelectorAll('.select-arrow-active').forEach(div => div.classList.remove('select-arrow-active'));

            selectedDiv.classList.add('select-arrow-active');

            const itemsDiv = document.createElement('div');
            itemsDiv.className = 'select-items';
            itemsDiv.dataset.ownerId = selectElement.id;
            document.body.appendChild(itemsDiv);

            Array.from(selectElement.options).forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'select-option';
                if (option.value === container.dataset.value) optionDiv.classList.add('same-as-selected');
                const iconSrc = iconMap[option.value] || (type === 'source' ? iconMap[option.text] : null);
                let iconHTML = '';
                if (iconSrc) iconHTML = `<img src="${iconSrc}" class="option-icon" alt="${option.text}">`;
                optionDiv.innerHTML = `${iconHTML}${option.text}`;
                optionDiv.addEventListener('click', function () {
                    updateSelectedDisplay(option.text, option.value);
                    itemsDiv.remove();
                    selectedDiv.classList.remove('select-arrow-active');
                });
                itemsDiv.appendChild(optionDiv);
            });

            const scrollHijack = (e) => {
                if (itemsDiv.scrollHeight <= itemsDiv.clientHeight) return;

                const isAtBottom = Math.ceil(itemsDiv.scrollTop) + itemsDiv.clientHeight >= itemsDiv.scrollHeight;
                const isAtTop = itemsDiv.scrollTop === 0;

                if (e.deltaY < 0 && isAtTop) {
                    e.preventDefault();
                    e.stopPropagation();
                } else if (e.deltaY > 0 && isAtBottom) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            };

            itemsDiv.addEventListener('wheel', scrollHijack, { passive: false });

            const rect = selectedDiv.getBoundingClientRect();
            itemsDiv.style.position = 'absolute';
            itemsDiv.style.left = rect.left + 'px';
            itemsDiv.style.top = rect.bottom + window.scrollY + 4 + 'px';
            itemsDiv.style.minWidth = rect.width + 'px';
            itemsDiv.style.width = 'auto';
            itemsDiv.style.whiteSpace = 'nowrap';
        });

        selectElement.classList.add('custom-select-hidden');
    }

    document.addEventListener('click', function () {
        document.querySelectorAll('.select-items').forEach(div => div.remove());
        document.querySelectorAll('.select-arrow-active').forEach(div => div.classList.remove('select-arrow-active'));
    });
    function closeMultiSelectModal() {
        const modal = document.getElementById('multi-select-modal');
        // 只有在弹窗可见时才执行，避免不必要的操作
        if (modal && !modal.classList.contains('hidden')) {
            // 直接调用 history.back()，使其行为和手机返回键完全一致
            history.back();
        }
    }

    let _tempImportedSettings = null; // 临时存储解析后的数据
    // ==========================================================================
    // 新增：导出模态框事件监听器（一次性初始化）
    // ==========================================================================
    function initializeExportModalListeners() {
        const exportModal = document.getElementById('export-settings-modal');
        const exportModalOverlay = document.getElementById('export-settings-modal-overlay');
        const exportModalContent = document.getElementById('export-settings-modal-content');

        if (!exportModal || !exportModalOverlay || !exportModalContent) return;

        // 统一的关闭函数
        const closeModal = () => {
            if (!exportModal.classList.contains('hidden')) {
                history.back();
            }
        };

        // 为遮罩层只绑定一次点击事件
        exportModalOverlay.addEventListener('click', (event) => {
            event.stopPropagation();
            closeModal();
        });

        // 为模态框内容区只绑定一次点击事件，以阻止事件穿透
        exportModalContent.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        // 使用事件委托来处理动态生成的内容
        exportModalContent.addEventListener('click', (event) => {
            const target = event.target;
            const langDict = i18n[currentLang];
            const otherSettingKeys = ['theme', 'language', 'defaultLB', 'defaultTalent', 'defaultTalentStrategy', 'defaultManaPriority', 'showLbTalentDetails', 'enableSkillQuickSearch', 'skillTypeSource', 'showEventNameState', 'chatPreviewHeight', 'teamDisplayCollapsed', 'collapseStates'];
            const dataSources = {
                heroFavorites: { name: langDict.setting_heroFavorites, storage: 'localStorage' },
                savedTeams: { name: langDict.setting_savedTeams, storage: 'cookie' },
                favoriteColors: { name: langDict.setting_favoriteColors, storage: 'cookie' },
                otherSettings: { name: langDict.setting_otherSettings, storage: 'cookie' }
            };

            if (target.id === 'close-export-modal-btn') {
                closeModal();
            }
            else if (target.id === 'generate-export-code-btn') {
                const settingsToExport = {};
                document.querySelectorAll('.export-item-checkbox:checked').forEach(cb => {
                    const key = cb.dataset.key;
                    if (key === 'otherSettings') {
                        otherSettingKeys.forEach(settingKey => {
                            const value = getCookie(settingKey);
                            if (value !== null) settingsToExport[settingKey] = value;
                        });
                    } else {
                        const source = dataSources[key];
                        const value = source.storage === 'localStorage' ? localStorage.getItem(key) : getCookie(key);
                        if (value) settingsToExport[key] = value;
                    }
                });

                const jsonString = JSON.stringify(settingsToExport);
                const compressedString = LZString.compressToEncodedURIComponent(jsonString);

                document.getElementById('export-code-textarea').value = compressedString;
                document.getElementById('export-result-container').classList.remove('hidden');
                document.getElementById('save-to-file-btn').classList.remove('hidden');
            }
            else if (target.id === 'save-to-file-btn') {
                const textToSave = document.getElementById('export-code-textarea').value;
                if (!textToSave) {
                    alert('没有可保存的内容。');
                    return;
                }

                const blob = new Blob([textToSave], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                const today = new Date();
                const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                a.download = `heroplan_settings_${dateString}.txt`;

                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            else if (target.id === 'export-select-all') {
                exportModalContent.querySelectorAll('.export-item-checkbox').forEach(cb => cb.checked = target.checked);
            }
        });

        exportModalContent.addEventListener('change', (event) => {
            if (event.target.classList.contains('export-item-checkbox')) {
                const selectAllCheckbox = document.getElementById('export-select-all');
                selectAllCheckbox.checked = Array.from(exportModalContent.querySelectorAll('.export-item-checkbox')).every(c => c.checked);
            }
        });
    }

    // ==========================================================================
    // 最终修正版：导入模态框事件监听器（一次性初始化 + 事件委托）
    // ==========================================================================
    function initializeImportModalListeners() {
        const importModal = document.getElementById('import-settings-modal');
        const importModalOverlay = document.getElementById('import-settings-modal-overlay');
        const importModalContent = document.getElementById('import-settings-modal-content');
        if (!importModal || !importModalOverlay || !importModalContent) return;

        // 统一的关闭函数
        const closeModal = () => {
            if (!importModal.classList.contains('hidden')) {
                history.back();
            }
        };

        // 1. 为静态的遮罩层和内容区绑定基础事件（只执行一次）
        importModalOverlay.addEventListener('click', (event) => {
            event.stopPropagation();
            closeModal();
        });

        importModalContent.addEventListener('click', (event) => {
            event.stopPropagation(); // 阻止穿透
        });

        // 2. 使用事件委托处理所有内部的【点击】事件
        importModalContent.addEventListener('click', (event) => {
            const target = event.target;

            if (target.id === 'close-import-modal-btn') {
                closeModal();
            }
            else if (target.id === 'import-from-file-btn') {
                // 在点击时，才去获取动态生成的 file-importer-input
                const fileInput = document.getElementById('file-importer-input');
                if (fileInput) {
                    fileInput.click();
                }
            }
            else if (target.id === 'analyze-import-code-btn') {
                const compressedString = document.getElementById('import-settings-textarea').value.trim();
                if (!compressedString) return;

                const langDict = i18n[currentLang];
                try {
                    const jsonString = LZString.decompressFromEncodedURIComponent(compressedString);
                    _tempImportedSettings = JSON.parse(jsonString);
                    if (typeof _tempImportedSettings !== 'object' || _tempImportedSettings === null) throw new Error("Invalid data format");
                } catch (e) {
                    alert(langDict.noDataInCode);
                    _tempImportedSettings = null;
                    return;
                }

                const otherSettingKeys = ['theme', 'language', 'defaultLB', 'defaultTalent', 'defaultTalentStrategy', 'defaultManaPriority', 'showLbTalentDetails', 'enableSkillQuickSearch', 'skillTypeSource', 'showEventNameState', 'chatPreviewHeight', 'teamDisplayCollapsed', 'collapseStates'];
                const dataSources = {
                    heroFavorites: { name: langDict.setting_heroFavorites, count: (_tempImportedSettings.heroFavorites ? JSON.parse(_tempImportedSettings.heroFavorites) : []).length },
                    savedTeams: { name: langDict.setting_savedTeams, count: (_tempImportedSettings.savedTeams ? JSON.parse(_tempImportedSettings.savedTeams) : []).length },
                    favoriteColors: { name: langDict.setting_favoriteColors, count: (_tempImportedSettings.favoriteColors ? JSON.parse(_tempImportedSettings.favoriteColors) : []).length },
                    otherSettings: { name: langDict.setting_otherSettings, count: otherSettingKeys.filter(key => _tempImportedSettings[key] !== undefined).length }
                };

                const hasDataToImport = Object.values(dataSources).some(item => item.count > 0);
                if (!hasDataToImport) {
                    alert(langDict.noDataInCode); return;
                }

                let checkboxesHTML = Object.entries(dataSources).map(([key, { name, count }]) => {
                    if (count > 0) return `<div style="margin-bottom: 0.5rem;"><label style="cursor:pointer;"><input type="checkbox" class="import-item-checkbox" data-key="${key}" checked> ${name} <span style="color: var(--md-sys-color-outline);">(${count})</span></label></div>`;
                    return '';
                }).join('');

                const optionsContainer = document.getElementById('import-options-container');
                optionsContainer.innerHTML = `
                <p><strong>${langDict.importItems}</strong></p>
                <div><label style="cursor:pointer; font-weight: bold;"><input type="checkbox" id="import-select-all" checked> ${langDict.selectAll}</label></div>
                <hr class="divider" style="margin: 0.75rem 0;">
                ${checkboxesHTML}
                <div style="margin-top: 1.5rem;"><label style="display: flex; align-items: flex-start; cursor: pointer;"><input type="radio" name="import-mode" value="append" checked style="margin-top: 4px; margin-right: 8px;"><div><strong>${langDict.importModeAppend.split(/：|:/)[0]}</strong><span style="display: block; font-size: 0.9em; color: var(--md-sys-color-on-surface-variant);">${langDict.importModeAppend.split(/：|:/)[1]}</span></div></label></div>
                <div style="margin-top: 0.5rem;"><label style="display: flex; align-items: flex-start; cursor: pointer;"><input type="radio" name="import-mode" value="overwrite" style="margin-top: 4px; margin-right: 8px;"><div><strong>${langDict.importModeOverwrite.split(/：|:/)[0]}</strong><span style="display: block; font-size: 0.9em; color: var(--md-sys-color-on-surface-variant);">${langDict.importModeOverwrite.split(/：|:/)[1]}</span></div></label></div>
                <div class="multi-select-footer" style="justify-content:center;"><button class="action-button" id="confirm-import-btn">${langDict.importSelected}</button></div>
            `;
                optionsContainer.classList.remove('hidden');
            }
            else if (target.id === 'confirm-import-btn') {
                handleImportConfirm();
            }
        });

        // 3. 使用事件委托处理所有内部的【change】事件
        importModalContent.addEventListener('change', (event) => {
            const target = event.target;

            if (target.id === 'file-importer-input') {
                const file = target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('import-settings-textarea').value = e.target.result;
                    document.getElementById('analyze-import-code-btn').click();
                };
                reader.onerror = () => alert('读取文件时发生错误。');
                reader.readAsText(file);
                target.value = null; // 重置以便可以再次选择同名文件
            }
            else if (target.id === 'import-select-all') {
                document.querySelectorAll('.import-item-checkbox').forEach(cb => cb.checked = target.checked);
            }
            else if (target.classList.contains('import-item-checkbox')) {
                document.getElementById('import-select-all').checked = Array.from(document.querySelectorAll('.import-item-checkbox')).every(c => c.checked);
            }
        });
    }
    function openExportModal() {
        const exportModal = document.getElementById('export-settings-modal');
        const exportModalOverlay = document.getElementById('export-settings-modal-overlay');
        const exportModalContent = document.getElementById('export-settings-modal-content');
        if (!exportModal || !exportModalOverlay || !exportModalContent) return;

        const langDict = i18n[currentLang];
        const otherSettingKeys = ['theme', 'language', 'defaultLB', 'defaultTalent', 'defaultTalentStrategy', 'defaultManaPriority', 'showLbTalentDetails', 'enableSkillQuickSearch', 'skillTypeSource', 'showEventNameState', 'chatPreviewHeight', 'teamDisplayCollapsed', 'collapseStates'];

        const dataSources = {
            heroFavorites: { name: langDict.setting_heroFavorites, count: (localStorage.getItem('heroFavorites') ? JSON.parse(localStorage.getItem('heroFavorites')) : []).length, storage: 'localStorage' },
            savedTeams: { name: langDict.setting_savedTeams, count: (getCookie('savedTeams') ? JSON.parse(getCookie('savedTeams')) : []).length, storage: 'cookie' },
            favoriteColors: { name: langDict.setting_favoriteColors, count: (getCookie('favoriteColors') ? JSON.parse(getCookie('favoriteColors')) : []).length, storage: 'cookie' },
            otherSettings: { name: langDict.setting_otherSettings, count: otherSettingKeys.filter(key => getCookie(key) !== null).length, storage: 'cookie' }
        };

        if (!Object.values(dataSources).some(item => item.count > 0)) {
            alert(langDict.noDataToExport);
            return;
        }

        let checkboxesHTML = Object.entries(dataSources).map(([key, { name, count }]) => {
            if (count > 0) {
                return `<div style="margin-bottom: 0.5rem;"><label style="cursor:pointer;"><input type="checkbox" class="export-item-checkbox" data-key="${key}" checked> ${name} <span style="color: var(--md-sys-color-outline);">(${count})</span></label></div>`;
            }
            return '';
        }).join('');

        exportModalContent.innerHTML = `
        <div class="multi-select-header"><h3>${langDict.exportModalTitle}</h3><button class="close-btn" id="close-export-modal-btn">✖</button></div>
        <p>${langDict.exportItems}</p>
        <div style="margin: 1rem 0;">
            <div><label style="cursor:pointer; font-weight: bold;"><input type="checkbox" id="export-select-all" checked> ${langDict.selectAll}</label></div>
            <hr class="divider" style="margin: 0.75rem 0;">
            ${checkboxesHTML}
        </div>
        <div id="export-result-container" class="hidden" style="margin-top:1.5rem;">
            <p><strong>${langDict.exportResultTitle}</strong></p>
            <textarea id="export-code-textarea" readonly style="width: 100%; height: 100px; resize: vertical;"></textarea>
        </div>
        <div class="multi-select-footer">
            <button class="action-button" id="generate-export-code-btn">${langDict.exportSelected}</button>
            <button class="action-button hidden" id="save-to-file-btn">${langDict.saveToFile}</button>
        </div>
    `;

        exportModal.classList.remove('hidden');
        exportModalOverlay.classList.remove('hidden');

        history.pushState({ modal: 'exportSettings' }, null);
        modalStack.push('exportSettings');
    }

    function openImportModal() {
        const importModal = document.getElementById('import-settings-modal');
        const importModalOverlay = document.getElementById('import-settings-modal-overlay');
        const importModalContent = document.getElementById('import-settings-modal-content');
        if (!importModal) return;

        _tempImportedSettings = null;
        const langDict = i18n[currentLang];

        importModalContent.innerHTML = `
        <div class="multi-select-header"><h3>${langDict.importModalTitle}</h3><button class="close-btn" id="close-import-modal-btn">✖</button></div>
        <p>${langDict.importInstructions}</p>
        <textarea id="import-settings-textarea" style="width: 100%; height: 120px; resize: vertical;"></textarea>
        
        <input type="file" id="file-importer-input" class="hidden" accept=".txt,text/plain">

        <div class="multi-select-footer" style="justify-content: center; gap: 1rem;">
            <button class="action-button" id="import-from-file-btn">${langDict.importFromFile}</button>
            <button class="action-button" id="analyze-import-code-btn">${langDict.analyzeCode}</button>
        </div>
        <div id="import-options-container" class="hidden" style="margin-top:1rem;"></div>
    `;

        importModal.classList.remove('hidden');
        importModalOverlay.classList.remove('hidden');

        history.pushState({ modal: 'importSettings' }, null);
        modalStack.push('importSettings');
    }

    function handleImportConfirm() {
        const langDict = i18n[currentLang];
        if (!_tempImportedSettings) {
            alert(langDict.importError);
            return;
        }

        const mode = document.querySelector('input[name="import-mode"]:checked').value;
        const counters = { favorites: 0, teams: 0, colors: 0 };
        const otherSettingKeys = ['theme', 'language', 'defaultLB', 'defaultTalent', 'defaultTalentStrategy', 'defaultManaPriority', 'showLbTalentDetails', 'enableSkillQuickSearch', 'skillTypeSource', 'showEventNameState', 'chatPreviewHeight', 'teamDisplayCollapsed', 'collapseStates'];

        const selectedKeys = new Set();
        document.querySelectorAll('.import-item-checkbox:checked').forEach(cb => selectedKeys.add(cb.dataset.key));

        // 如果勾选了“其他设置”，则将所有相关键名加入
        if (selectedKeys.has('otherSettings')) {
            otherSettingKeys.forEach(key => selectedKeys.add(key));
        }

        for (const key of selectedKeys) {
            if (!_tempImportedSettings.hasOwnProperty(key)) continue;

            const importedValueStr = _tempImportedSettings[key];

            switch (key) {
                case 'heroFavorites':
                    if (mode === 'append') {
                        const existingArray = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
                        const importedArray = JSON.parse(importedValueStr);
                        const originalSize = new Set(existingArray).size;
                        const mergedSet = new Set([...existingArray, ...importedArray]);
                        counters.favorites = mergedSet.size - originalSize;
                        localStorage.setItem(key, JSON.stringify(Array.from(mergedSet)));
                    } else {
                        localStorage.setItem(key, importedValueStr);
                    }
                    break;
                case 'savedTeams':
                case 'favoriteColors':
                    if (mode === 'append') {
                        const existingCookie = getCookie(key);
                        const existingArray = existingCookie ? JSON.parse(existingCookie) : [];
                        const importedArray = JSON.parse(importedValueStr);
                        if (key === 'savedTeams') {
                            const existingNames = new Set(existingArray.map(t => t.name));
                            importedArray.forEach(team => { if (team.name && !existingNames.has(team.name)) { existingArray.push(team); counters.teams++; } });
                            setCookie(key, JSON.stringify(existingArray), 365);
                        } else {
                            const originalSize = new Set(existingArray).size;
                            const mergedSet = new Set([...existingArray, ...importedArray]);
                            counters.colors = mergedSet.size - originalSize;
                            setCookie(key, JSON.stringify(Array.from(mergedSet)), 365);
                        }
                    } else {
                        setCookie(key, importedValueStr, 365);
                    }
                    break;
                default:
                    if (otherSettingKeys.includes(key)) {
                        setCookie(key, importedValueStr, 365);
                    }
                    break;
            }
        }
        _tempImportedSettings = null; // 清理临时数据
        document.getElementById('import-settings-modal').classList.add('hidden');
        document.getElementById('import-settings-modal-overlay').classList.add('hidden');
        alert(langDict.importSettingsSuccess(mode, counters));
        window.location.reload();
    }

    function addEventListeners() {

        // --- 为导出/导入按钮添加监听器 ---
        const exportSettingsBtn = document.getElementById('export-settings-btn');
        if (exportSettingsBtn) {
            exportSettingsBtn.addEventListener('click', openExportModal);
        } else {
            console.error("严重错误 - 未找到 “导出设置” 按钮 (#export-settings-btn)!");
        }

        const importSettingsBtn = document.getElementById('import-settings-btn');
        if (importSettingsBtn) {
            importSettingsBtn.addEventListener('click', openImportModal);
        } else {
            console.error("严重错误 - 未找到 “导入设置” 按钮 (#import-settings-btn)!");
        }
        const lbTalentHelpBtn = document.getElementById('lb-talent-help-btn');
        const lbTalentHelpModal = document.getElementById('lb-talent-help-modal');
        const lbTalentHelpModalOverlay = document.getElementById('lb-talent-help-modal-overlay');

        function openLbTalentHelpModal() {
            const langDict = i18n[currentLang];
            const contentHTML = `
                <h3>${langDict.lbTalentHelpTitle}</h3>
                <p>${langDict.lbTalentHelpLine1}</p>
                <p>${langDict.lbTalentHelpLine2}</p>
                <div class="modal-footer">
                    <button class="close-bottom-btn" id="close-lb-talent-help-btn">${langDict.detailsCloseBtn}</button>
                </div>
            `;
            lbTalentHelpModal.innerHTML = contentHTML;

            lbTalentHelpModal.classList.add('stacked-modal');
            lbTalentHelpModalOverlay.classList.add('stacked-modal-overlay');
            lbTalentHelpModal.classList.remove('hidden');
            lbTalentHelpModalOverlay.classList.remove('hidden');
            document.body.classList.add('modal-open');
            history.pushState({ modal: 'lbTalentHelp' }, null);
            modalStack.push('lbTalentHelp');
            document.getElementById('close-lb-talent-help-btn').addEventListener('click', closeLbTalentHelpModal);
        }
        if (showLbTalentDetailsCheckbox) {
            showLbTalentDetailsCheckbox.addEventListener('change', () => {
                setCookie('showLbTalentDetails', showLbTalentDetailsCheckbox.checked.toString(), 365);
                // No need to re-render the main table, only affects modal
            });
        }

        function closeLbTalentHelpModal() {
            if (!lbTalentHelpModal.classList.contains('hidden')) {
                history.back();
            }
        }

        if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
        if (langSelectBtn) {
            langSelectBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                langOptions.classList.toggle('hidden');
            });
        }
        // ========== 更新：全局折叠功能的事件监听 ==========
        const teamDisplayHeader = document.getElementById('team-display-header');
        // 【修改】获取父容器 wrapper
        const teamSimulatorWrapper = document.getElementById('team-simulator-wrapper');

        if (teamDisplayHeader && teamSimulatorWrapper) {
            teamDisplayHeader.addEventListener('click', () => {
                // 【修改】在 wrapper 上切换 .collapsed 类
                const isCollapsed = teamSimulatorWrapper.classList.toggle('collapsed');
                setCookie('teamDisplayCollapsed', isCollapsed, 365);
                // ========== 新增：如果是展开操作，则调用高度调整函数 ==========
                if (!isCollapsed) {
                    // 使用 setTimeout 给予 DOM 极短的反应时间，以确保 display:none 已移除
                    setTimeout(adjustTeamDisplayHeight, 50);
                }
            });
        }

        // --- 队伍列表的折叠事件（更新版） ---
        const savedTeamsHeader = document.querySelector('.saved-teams-header');
        if (savedTeamsHeader) {
            savedTeamsHeader.addEventListener('click', (e) => {
                if (window.innerWidth > 900) return;
                if (e.target.closest('.tab-button')) return;

                const listContainer = document.getElementById('saved-teams-list-container');
                if (listContainer) {
                    const wasCollapsed = listContainer.classList.contains('collapsed');
                    listContainer.classList.toggle('collapsed');

                    // 保存新的状态到Cookie
                    const currentStates = getCollapseStates();
                    currentStates.listCollapsed = !wasCollapsed;
                    saveCollapseStates(currentStates);
                }
            });
        }
        // 【新增】为“清空阵容”按钮添加事件
        const clearTeamBtn = document.getElementById('clear-team-btn');
        if (clearTeamBtn) {
            clearTeamBtn.addEventListener('click', () => {
                const langDict = i18n[currentLang];
                // 确保当前队伍中有英雄时才提示，避免空点
                if (teamSlots.some(s => s !== null) && window.confirm(langDict.confirmClearTeam)) {
                    clearTeamDisplay(); // 调用清空函数
                } else if (!teamSlots.some(s => s !== null)) {
                    // 如果队伍本来就是空的，直接清空也无妨
                    clearTeamDisplay();
                }
            });
        }


        // 【新增】保存队伍按钮事件
        if (saveTeamBtn) {
            saveTeamBtn.addEventListener('click', () => {
                const langDict = i18n[currentLang];
                const heroesInTeam = teamSlots.filter(s => s !== null);

                if (heroesInTeam.length === 0) {
                    alert(langDict.noHeroesInTeam);
                    return;
                }

                const teamName = prompt(langDict.promptTeamName);
                if (teamName === null) return;
                if (!teamName.trim()) {
                    alert(langDict.teamNameRequired);
                    return;
                }

                const newTeam = {
                    name: teamName.trim(),
                    heroes: teamSlots.map(slot => slot ? `${slot.hero.english_name}-${slot.hero.costume_id}` : null)
                };

                const teams = getSavedTeams();
                teams.push(newTeam);
                saveTeams(teams);

                // 【修正】调用 renderActiveTabList() 来正确刷新当前激活的标签页列表
                // 这会读取刚刚保存到Cookie中的新数据并正确显示
                renderActiveTabList();
            });
        }

        // 【新增】分享列表按钮事件
        if (shareTeamListBtn) {
            shareTeamListBtn.addEventListener('click', () => {
                const teams = getSavedTeams();
                const langDict = i18n[currentLang];
                if (teams.length === 0) {
                    alert(langDict.noTeamsToShare);
                    return;
                }

                const shareableData = teams.map(team => ({ n: team.name, h: team.heroes }));
                const jsonString = JSON.stringify(shareableData);
                const compressedData = LZString.compressToEncodedURIComponent(jsonString);
                const url = `${window.location.origin}${window.location.pathname}?sharedTeams=${compressedData}&lang=${currentLang}`;

                copyTextToClipboard(url).then(() => {
                    const originalText = shareTeamListBtn.innerText;
                    shareTeamListBtn.innerText = langDict.shareTeamListCopied;
                    shareTeamListBtn.disabled = true;
                    setTimeout(() => {
                        shareTeamListBtn.innerText = originalText;
                        shareTeamListBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('复制分享链接失败:', err);
                    alert(langDict.copyLinkFailed);
                });
            });
        }



        if (langOptions) {
            langOptions.addEventListener('click', (event) => {
                event.preventDefault();
                const target = event.target;
                if (target.classList.contains('lang-option')) {
                    const newLang = target.getAttribute('data-lang');
                    if (newLang && newLang !== currentLang) changeLanguage(newLang);
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
                    temporaryDateFilter = null;
                    if (key === 'filterScope') temporaryFavorites = null;
                    if (key === 'skillTypeSource') setCookie('skillTypeSource', filterInputs.skillTypeSource.value, 365);
                    applyFiltersAndRender();
                });
            }
        }
        if (modalContent) {
            modalContent.addEventListener('click', (event) => {
                const target = event.target.closest('.skill-type-tag');
                if (!target) return;

                const filterType = target.dataset.filterType;
                let filterValue = target.dataset.filterValue;

                if (!filterType || filterValue === undefined) return;

                // 获取一键搜索技能词条设置的状态
                const isQuickSearchEnabled = enableSkillQuickSearchCheckbox.checked;

                // 定义受“一键搜索技能词条”设置影响的筛选类型
                const skillRelatedFilterTypes = ['effects', 'passives']; //

                // 如果点击的是技能或被动相关的词条，并且一键搜索功能未启用，则不执行搜索逻辑
                if (skillRelatedFilterTypes.includes(filterType) && !isQuickSearchEnabled) { //
                    //console.log(`一键搜索技能词条未启用，跳过对 ${filterType} 的搜索。`);
                    return; // 不执行搜索逻辑
                }

                // 对于所有其他类型的点击，或者如果点击的是技能/被动相关但一键搜索已启用，则执行以下搜索逻辑
                resetAllFilters();

                if (multiSelectFilters.hasOwnProperty(filterType)) {
                    multiSelectFilters[filterType] = [filterValue];
                    updateFilterButtonUI(filterType);

                } else if (filterInputs[filterType]) {
                    const inputElement = filterInputs[filterType];
                    inputElement.value = filterValue;
                }

                closeDetailsModal();
                applyFiltersAndRender();
            });
        }
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                resetAllFilters();
                applyFiltersAndRender();
            });
        }
        if (filterHero730Btn) {
            filterHero730Btn.addEventListener('click', () => {
                resetAllFilters();
                multiSelectFilters.filterScope = ['hero'];
                updateFilterButtonUI('filterScope');
                temporaryDateFilter = { base: oneClickMaxDate, days: 730 };
                applyFiltersAndRender();
            });
        }

        if (filterCostume548Btn) {
            filterCostume548Btn.addEventListener('click', () => {
                resetAllFilters();
                multiSelectFilters.filterScope = ['skin'];
                updateFilterButtonUI('filterScope');
                temporaryDateFilter = { base: purchaseCostumeDate, days: 548 };
                applyFiltersAndRender();
            });
        }

        function handleDefaultSettingsChange() {
            const selectedTalentLevel = defaultTalentSelect.value;
            const isDisabled = selectedTalentLevel === 'none';
            defaultTalentStrategySelect.disabled = isDisabled;
            defaultManaPriorityCheckbox.disabled = isDisabled;
            setCookie('defaultLB', defaultLimitBreakSelect.value, 365);
            setCookie('defaultTalent', selectedTalentLevel, 365);
            setCookie('defaultTalentStrategy', defaultTalentStrategySelect.value, 365);
            setCookie('defaultManaPriority', defaultManaPriorityCheckbox.checked, 365);
            applyFiltersAndRender();
        }
        if (enableSkillQuickSearchCheckbox) {
            enableSkillQuickSearchCheckbox.addEventListener('change', () => {
                setCookie('enableSkillQuickSearch', enableSkillQuickSearchCheckbox.checked.toString(), 365);
            });
        }

        if (defaultLimitBreakSelect) defaultLimitBreakSelect.addEventListener('change', handleDefaultSettingsChange);
        if (defaultTalentSelect) defaultTalentSelect.addEventListener('change', handleDefaultSettingsChange);
        if (defaultTalentStrategySelect) defaultTalentStrategySelect.addEventListener('change', handleDefaultSettingsChange);
        if (defaultManaPriorityCheckbox) defaultManaPriorityCheckbox.addEventListener('change', handleDefaultSettingsChange);

        if (openFavoritesBtn) {
            openFavoritesBtn.addEventListener('click', () => {
                temporaryFavorites = null;
                multiSelectFilters.filterScope = ['favorites'];
                updateFilterButtonUI('filterScope');
                applyFiltersAndRender();
            });
        }
        if (showTeamSimulatorBtn) {
            showTeamSimulatorBtn.addEventListener('click', toggleTeamSimulator);
        }

        if (heroTable) {
            const tbody = heroTable.querySelector('tbody');
            if (tbody) {
                tbody.addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.classList.contains('favorite-toggle-icon')) {
                        event.stopPropagation();
                        const heroId = parseInt(target.dataset.heroId, 10);
                        const hero = allHeroes.find(h => h.originalIndex === heroId);
                        if (hero) {
                            if (teamSimulatorActive) {
                                addHeroToTeam(hero);
                            } else {
                                toggleFavorite(hero);
                                target.textContent = isFavorite(hero) ? '★' : '☆';
                                target.classList.toggle('favorited', isFavorite(hero));
                                // 使用新的 multiSelectFilters 变量来判断当前的筛选范围
                                if (multiSelectFilters.filterScope && multiSelectFilters.filterScope[0] === 'favorites') {
                                    applyFiltersAndRender();
                                }
                            }
                        }
                    } else {
                        const row = target.closest('.table-row');
                        if (row) {
                            const heroId = parseInt(row.dataset.heroId, 10);
                            const selectedHero = allHeroes.find(h => h.originalIndex === heroId);
                            if (selectedHero) openDetailsModal(selectedHero);
                        }
                    }
                });
            }
            const thead = heroTable.querySelector('thead');
            if (thead) {
                thead.addEventListener('click', (event) => {
                    const header = event.target.closest('th');
                    if (!header) return;
                    if (header.classList.contains('sortable')) {
                        const sortKey = header.dataset.sortKey;
                        if (currentSort.key === sortKey) {
                            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
                        } else {
                            currentSort.key = sortKey;
                            currentSort.direction = ['power', 'attack', 'defense', 'health', 'star'].includes(sortKey) ? 'desc' : 'asc';
                        }
                        applyFiltersAndRender();
                    } else if (header.classList.contains('favorite-all-header')) {
                        if (filteredHeroes.length === 0) return;
                        const langDict = i18n[currentLang];
                        const heroesToProcess = filteredHeroes.filter(h => h.english_name);
                        if (heroesToProcess.length === 0) return;
                        const shouldFavoriteAll = heroesToProcess.filter(isFavorite).length < heroesToProcess.length;
                        const message = shouldFavoriteAll ? langDict.confirmFavoriteAll : langDict.confirmUnfavoriteAll;
                        if (window.confirm(message)) {
                            let currentFavoritesSet = new Set(getFavorites());
                            if (shouldFavoriteAll) {
                                heroesToProcess.forEach(hero => currentFavoritesSet.add(`${hero.english_name}-${hero.costume_id}`));
                            } else {
                                heroesToProcess.forEach(hero => currentFavoritesSet.delete(`${hero.english_name}-${hero.costume_id}`));
                            }
                            saveFavorites(Array.from(currentFavoritesSet));
                            applyFiltersAndRender();
                        }
                    }
                });
            }
        }

        function handleTeamGridClick(event) {
            event.stopPropagation(); // 阻止事件冒泡到全局点击
            const targetIcon = event.target.closest('.hero-action-icon');
            // 修改选择器以使用新的 data-instance-id
            const targetSlotElement = event.target.closest('.team-hero-slot[data-instance-id]');
            const targetInfoCard = event.target.closest('.team-info-slot[data-instance-id]');

            if (swapModeActive) {
                if (targetIcon) {
                    const action = targetIcon.dataset.action;
                    const targetIndex = parseInt(targetIcon.dataset.index, 10);

                    if (action === 'remove') {
                        teamSlots[targetIndex] = null;
                    } else if (action === 'swap') {
                        [teamSlots[selectedForSwapIndex], teamSlots[targetIndex]] = [teamSlots[targetIndex], teamSlots[selectedForSwapIndex]];
                    }
                    exitSwapMode();
                    return;
                }
            }

            if (targetInfoCard) {
                // 通过唯一的 instanceId 查找正确的英雄
                const instanceId = parseInt(targetInfoCard.dataset.instanceId, 10);

                const slotIndex = teamSlots.findIndex(slot => slot && slot.instanceId === instanceId);

                if (slotIndex > -1) {
                    const slot = teamSlots[slotIndex];
                    const context = {
                        teamSlotIndex: slotIndex, // 传递正确的索引
                        initialSettings: { ...slot.settings }
                    };
                    openDetailsModal(slot.hero, context);
                }
            } else if (targetSlotElement && !targetIcon) {
                const instanceId = parseInt(targetSlotElement.dataset.instanceId, 10);
                const slotIndex = teamSlots.findIndex(slot => slot && slot.instanceId === instanceId);
                if (slotIndex > -1) {
                    enterSwapMode(slotIndex);
                }
            }
        }

        function handleGlobalClickForSwapCancel(event) {
            if (swapModeActive) {
                // 如果点击的不是队伍区域，则退出交换模式
                if (!event.target.closest('#team-display-grid')) {
                    exitSwapMode();
                }
            }
        }

        function enterSwapMode(index) {
            swapModeActive = true;
            selectedForSwapIndex = index;
            renderTeamDisplay(); // 重新渲染以显示图标
        }

        function exitSwapMode() {
            swapModeActive = false;
            selectedForSwapIndex = -1;
            renderTeamDisplay(); // 重新渲染以移除图标
        }

        if (teamDisplayGrid) {
            teamDisplayGrid.addEventListener('click', handleTeamGridClick);
        }
        // 【新增】我的队伍标签页点击事件
        if (myTeamsTabBtn) {
            myTeamsTabBtn.addEventListener('click', () => {
                if (myTeamsTabBtn.classList.contains('active')) return;
                sharedTeamsTabBtn.classList.remove('active');
                myTeamsTabBtn.classList.add('active');
                renderActiveTabList();
            });
        }

        // 【新增】分享的队伍标签页点击事件
        if (sharedTeamsTabBtn) {
            sharedTeamsTabBtn.addEventListener('click', () => {
                if (sharedTeamsTabBtn.classList.contains('active')) return;
                myTeamsTabBtn.classList.remove('active');
                sharedTeamsTabBtn.classList.add('active');
                renderActiveTabList();
            });
        }
        // 新增：全局点击事件，用于取消交换模式
        document.addEventListener('click', handleGlobalClickForSwapCancel);
        if (openFiltersBtn) openFiltersBtn.addEventListener('click', openFiltersModal);
        if (closeFiltersModalBtn) closeFiltersModalBtn.addEventListener('click', closeFiltersModal);
        if (filtersModalOverlay) filtersModalOverlay.addEventListener('click', closeFiltersModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeDetailsModal);
        if (advancedFilterHelpBtn) advancedFilterHelpBtn.addEventListener('click', openHelpModal);
        if (helpModalOverlay) helpModalOverlay.addEventListener('click', closeHelpModal);
        if (skillTypeHelpBtn) skillTypeHelpBtn.addEventListener('click', openSkillTypeHelpModal);
        if (skillTypeHelpModalOverlay) skillTypeHelpModalOverlay.addEventListener('click', closeSkillTypeHelpModal);
        if (showWantedMissionBtn) showWantedMissionBtn.addEventListener('click', () => initAndShowWantedMissionView());
        if (showFarmingGuideBtn) showFarmingGuideBtn.addEventListener('click', () => initAndShowFarmingGuideView());

        if (lbTalentHelpBtn) {
            lbTalentHelpBtn.addEventListener('click', openLbTalentHelpModal);
            const langDict = i18n[currentLang];
            if (langDict.lbTalentHelpTitle) {
                lbTalentHelpBtn.title = langDict.lbTalentHelpTitle;
            }
        }
        if (lbTalentHelpModalOverlay) lbTalentHelpModalOverlay.addEventListener('click', closeLbTalentHelpModal);

        if (shareFavoritesBtn) {
            shareFavoritesBtn.addEventListener('click', () => {
                const favorites = getFavorites();
                if (favorites.length === 0) {
                    alert(i18n[currentLang].noFavoritesToShare);
                    return;
                }
                const favString = favorites.join(',');
                const compressedFavs = LZString.compressToEncodedURIComponent(favString);
                const url = `${window.location.origin}${window.location.pathname}?zfavs=${compressedFavs}&lang=${currentLang}`;
                copyTextToClipboard(url).then(() => {
                    const originalText = shareFavoritesBtn.innerText;
                    shareFavoritesBtn.innerText = i18n[currentLang].shareFavoritesCopied;
                    shareFavoritesBtn.disabled = true;
                    setTimeout(() => {
                        shareFavoritesBtn.innerText = originalText;
                        shareFavoritesBtn.disabled = false;
                    }, 2000);
                }).catch(err => {
                    console.error('复制链接失败：', err);
                    alert(i18n[currentLang].copyLinkFailed);
                });
            });
        }
        document.querySelectorAll('#filters-modal .filter-header').forEach(header => {
            header.addEventListener('click', function (event) {
                if (event.target.closest('.toggle-button, .help-btn')) return;
                this.querySelector('.toggle-button')?.click();
            });
        });
        document.querySelectorAll('#filters-modal .toggle-button').forEach(button => {
            button.addEventListener('click', function () {
                const targetElement = document.getElementById(this.dataset.target);
                if (targetElement) {
                    targetElement.classList.toggle('collapsed');
                    this.classList.toggle('expanded');
                    const currentState = targetElement.classList.contains('collapsed') ? 'collapsed' : 'expanded';
                    setCookie(this.dataset.target + '_state', currentState, 365);
                }
            });
        });

        const multiSelectModalOverlay = document.getElementById('multi-select-modal-overlay');
        if (multiSelectModalOverlay) {
            multiSelectModalOverlay.addEventListener('click', closeMultiSelectModal);
        }

        window.addEventListener('popstate', function (event) {
            if (modalStack.length > 0) {
                const lastOpenModalId = modalStack.pop();
                if (lastOpenModalId === 'multiSelect') {
                    const modal = document.getElementById('multi-select-modal');
                    const overlay = document.getElementById('multi-select-modal-overlay');
                    if (modal) modal.classList.add('hidden');
                    if (overlay) overlay.classList.add('hidden');
                } else if (lastOpenModalId === 'details') {
                    if (modal) modal.classList.add('hidden');
                    if (modalOverlay) modalOverlay.classList.add('hidden');
                } else if (lastOpenModalId === 'filters') {
                    if (filtersModal) filtersModal.classList.add('hidden');
                    if (filtersModalOverlay) filtersModalOverlay.classList.add('hidden');
                } else if (lastOpenModalId === 'help') {
                    if (helpModal) { helpModal.classList.add('hidden'); helpModal.classList.remove('stacked-modal'); }
                    if (helpModalOverlay) { helpModalOverlay.classList.add('hidden'); helpModalOverlay.classList.remove('stacked-modal-overlay'); }
                } else if (lastOpenModalId === 'skillTypeHelp') {
                    if (skillTypeHelpModal) { skillTypeHelpModal.classList.add('hidden'); skillTypeHelpModal.classList.remove('stacked-modal'); }
                    if (skillTypeHelpModalOverlay) { skillTypeHelpModalOverlay.classList.add('hidden'); skillTypeHelpModalOverlay.classList.remove('stacked-modal-overlay'); }
                } else if (lastOpenModalId === 'lbTalentHelp') {
                    if (lbTalentHelpModal) { lbTalentHelpModal.classList.add('hidden'); lbTalentHelpModal.classList.remove('stacked-modal'); }
                    if (lbTalentHelpModalOverlay) { lbTalentHelpModalOverlay.classList.add('hidden'); lbTalentHelpModalOverlay.classList.remove('stacked-modal-overlay'); }
                } else if (lastOpenModalId === 'exportSettings') {
                    const modal = document.getElementById('export-settings-modal');
                    const overlay = document.getElementById('export-settings-modal-overlay');
                    if (modal) modal.classList.add('hidden');
                    if (overlay) overlay.classList.add('hidden');
                } else if (lastOpenModalId === 'importSettings') {
                    const modal = document.getElementById('import-settings-modal');
                    const overlay = document.getElementById('import-settings-modal-overlay');
                    if (modal) modal.classList.add('hidden');
                    if (overlay) overlay.classList.add('hidden');
                }
                if (modalStack.length === 0) document.body.classList.remove('modal-open');
                return;
            }
            if (teamSimulatorActive) {
                toggleTeamSimulator();
                return;
            }
            if (chatSimulatorView && !chatSimulatorView.classList.contains('hidden')) {
                chatSimulatorView.classList.add('hidden');
                showHeroListViewUI();
                return;
            }
            const isHeroListVisible = !heroTableView.classList.contains('hidden');
            if (!isHeroListVisible) {
                showHeroListViewUI();
            }
        });
        window.addEventListener('resize', adjustStickyHeaders);
        addChatSimulatorEventListeners();
        initializeExportModalListeners();
        initializeImportModalListeners();
    }

    async function initializeApp() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewHeroFromUrl = urlParams.get('view');
        const langFromUrl = urlParams.get('lang');
        const zfavsFromUrl = urlParams.get('zfavs');
        const favsFromUrl = urlParams.get('favs');
        const sharedTeamsFromUrl = urlParams.get('sharedTeams');
        const languageCookie = getCookie('language');
        let langToUse = 'cn';
        if (languageCookie && i18n[languageCookie]) {
            langToUse = languageCookie;
        } else if (langFromUrl && i18n[langFromUrl]) {
            langToUse = langFromUrl;
        } else {
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.includes('en')) langToUse = 'en';
            else if (browserLang.includes('zh-tw') || browserLang.includes('zh-hk')) langToUse = 'tc';
        }
        applyLanguage(langToUse);
        const dataLoaded = await loadData(currentLang);
        if (dataLoaded) {
            allHeroes.forEach((hero, index) => {
                hero.originalIndex = index;
                hero.english_name = extractEnglishName(hero);
            });
            populateFilters();

            defaultLimitBreakSelect.value = getCookie('defaultLB') || 'none';
            defaultTalentSelect.value = getCookie('defaultTalent') || 'none';
            defaultTalentStrategySelect.value = getCookie('defaultTalentStrategy') || 'atk-def-hp';
            defaultManaPriorityCheckbox.checked = getCookie('defaultManaPriority') === 'true';
            showLbTalentDetailsCheckbox.checked = getCookie('showLbTalentDetails') !== 'false';
            if (enableSkillQuickSearchCheckbox) {
                enableSkillQuickSearchCheckbox.checked = getCookie('enableSkillQuickSearch') !== 'false';
            }

            const initialTalentDisabled = defaultTalentSelect.value === 'none';
            defaultTalentStrategySelect.disabled = initialTalentDisabled;
            defaultManaPriorityCheckbox.disabled = initialTalentDisabled;

            history.replaceState({ view: 'list' }, '');
            if (oneClickMaxDateDisplay) oneClickMaxDateDisplay.textContent = oneClickMaxDate;
            if (purchaseCostumeDateDisplay) purchaseCostumeDateDisplay.textContent = purchaseCostumeDate;
            const savedSkillSource = getCookie('skillTypeSource');
            if (savedSkillSource && filterInputs.skillTypeSource && [...filterInputs.skillTypeSource.options].some(o => o.value === savedSkillSource)) {
                filterInputs.skillTypeSource.value = savedSkillSource;
            }
            if (zfavsFromUrl) {
                try {
                    const favString = LZString.decompressFromEncodedURIComponent(zfavsFromUrl);
                    if (favString) {
                        temporaryFavorites = favString.split(',');
                        multiSelectFilters.filterScope = ['favorites'];
                        updateFilterButtonUI('filterScope');
                    }
                } catch (e) {
                    console.error("从URL解压收藏夹失败", e);
                }
            } else if (favsFromUrl) {
                try {
                    temporaryFavorites = decodeURIComponent(favsFromUrl).split(',');
                    multiSelectFilters.filterScope = ['favorites'];
                    updateFilterButtonUI('filterScope');
                } catch (e) {
                    console.error("处理URL中的收藏夹失败", e);
                }
            }
            // 【新增】处理分享链接的逻辑
            if (sharedTeamsFromUrl) {
                try {
                    const decompressedJSON = LZString.decompressFromEncodedURIComponent(sharedTeamsFromUrl);
                    const sharedData = JSON.parse(decompressedJSON);

                    if (Array.isArray(sharedData)) {
                        sharedTeamsDataFromUrl = sharedData.map(team => ({ name: team.n, heroes: team.h }));
                        isViewingSharedTeams = true;

                        // 【修改】显示分享标签页按钮
                        if (sharedTeamsTabBtn) sharedTeamsTabBtn.style.display = 'inline-flex';

                        // 自动打开队伍模拟器
                        toggleTeamSimulator();
                    }
                } catch (e) {
                    console.error("从URL处理分享的队伍失败", e);
                    isViewingSharedTeams = false;
                }
            }

            // 如果不是分享视图，则正常渲染
            if (!isViewingSharedTeams) {
                applyFiltersAndRender();
            }
            // ========== 更新：应用已保存的全局折叠状态 ==========
            // 【修改】获取父容器 wrapper
            const teamSimulatorWrapper = document.getElementById('team-simulator-wrapper');
            const savedTeamDisplayState = getCookie('teamDisplayCollapsed');

            if (savedTeamDisplayState === 'true' && teamSimulatorWrapper) {
                if (window.innerWidth <= 900) {
                    // 【修改】在 wrapper 上添加 .collapsed 类
                    teamSimulatorWrapper.classList.add('collapsed');
                }
            }
            addEventListeners();
            loadFilterStates();

            const hasVisited = getCookie('visited');
            if (!hasVisited) {
                openFiltersModal();
                setCookie('visited', 'true', 365);
            }
            if (viewHeroFromUrl && !zfavsFromUrl && !favsFromUrl) {
                const targetHero = allHeroes.find(h => h.english_name && `${h.english_name}-${h.costume_id}` === viewHeroFromUrl);
                if (targetHero) openDetailsModal(targetHero);
            }
            setTimeout(adjustStickyHeaders, 100);
        }
        if (pageLoader) pageLoader.classList.add('hidden');
        document.body.classList.remove('js-loading');
    }

    initializeApp();
});