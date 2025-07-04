document.addEventListener('DOMContentLoaded', function () {
    // --- 全局变量 ---
    const classReverseMap = {
        "Barbarian": "Barbarian", "野蛮人": "Barbarian", "野人": "Barbarian",
        "Cleric": "Cleric", "牧师": "Cleric", "牧師": "Cleric",
        "Druid": "Druid", "德鲁伊": "Druid", "德魯伊": "Druid",
        "Fighter": "Fighter", "战士": "Fighter", "戰士": "Fighter",
        "Monk": "Monk", "僧侣": "Monk", "僧侶": "Monk",
        "Paladin": "Paladin", "圣骑士": "Paladin", "聖騎士": "Paladin",
        "Ranger": "Ranger", "游侠": "Ranger", "遊俠": "Ranger",
        "Rogue": "Rogue", "盗贼": "Rogue", "盜賊": "Rogue",
        "Sorcerer": "Sorcerer", "术士": "Sorcerer", "術士": "Sorcerer",
        "Wizard": "Wizard", "巫师": "Wizard", "巫師": "Wizard"
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
        "挑战节-恶棍": "villains", "联盟-火枪手": "musketeer", "挑战节-超能萌宠": "pets",
        "月活动-农历生肖": "lunaryear", "挑战-贝奥武夫": "beowulf", "联盟-飞蛾": "moth",
        "月活动-海滩派对": "beachparty", "月活动-卡勒瓦拉": "kalevala", "挑战节-阿瓦隆": "avalon",
        "高塔-忍者": "ninja", "月活动-莫洛维亚": "morlovia", "月活动-飞沙帝国": "sand",
        "三国召唤": "kingdom", "挑战节-仙境": "wonderland", "超级元素人": "superelemental",
        "高塔-魔法": "magic", "高塔-冥河": "styx", "月活动-冬日": "christmas",
        "月活动-春谷": "springvale", "挑战节-海盗": "pirates", "挑战节-星落": "starfall",
        "挑战-石像鬼": "gargoyle", "S1-经典": "season1", "S2-亚特兰蒂斯": "season2",
        "S5-沙丘": "season5", "神秘-暗影": "shadow", "盟约召唤": "covenant",
        "高塔-猫头鹰": "owltower", "联盟-骑士冲击": "knights", "S6-S7-秘闻": "untoldtales",
        "S3-瓦尔哈拉": "season3", "S4-蛮荒地界": "season4", "挑战-重返圣堂": "returntosanctuary",
        "至日召唤": "solstice", "挑战-众神狂欢节": "carnivalofgods", "月英": "hotm",
        "月活动-恋爱季节": "love", "哥布林召唤": "goblinvillage", "额外抽奖-秘密召唤": "secretsummon",
        "挑战节-吟游诗人": "festival", "星体召唤": "astral", "挑战节-杀手": "slayers",
        "荒野召唤": "wilderness", "挑战节-守护者": "teltoc", "挑战节-肃煞森林": "fables",
        "神话召唤": "tavernoflegends", "生日召唤": "birthday", "黑色星期五召唤": "blackfriday",
        "丰收召唤": "harvest", "怪兽岛召唤": "monsterisland", "挑战-歌剧之谜": "opera",
        // Traditional Chinese
        "挑戰節-惡棍": "villains", "聯盟-火槍手": "musketeer", "挑戰節-強大寵物": "pets",
        "月活動-農曆新年": "lunaryear", "挑戰-貝武夫": "beowulf", "聯盟-飛蛾": "moth",
        "月活動-海灘派對": "beachparty", "月活動-卡勒瓦拉": "kalevala", "挑戰節-阿瓦隆": "avalon",
        "高塔-忍者": "ninja", "月活動-莫洛維亞": "morlovia", "月活動-飛沙帝國": "sand",
        "三國召喚": "kingdom", "挑戰節-仙境": "wonderland", "超級元素": "superelemental",
        "高塔-魔法": "magic", "高塔-冥河": "styx", "月活動-冬季": "christmas",
        "月活動-斯普林維爾": "springvale", "挑戰節-海盜": "pirates", "挑戰節-星隕": "starfall",
        "挑戰-石像鬼": "gargoyle", "S1-經典": "season1", "S2-亞特蘭蒂斯": "season2",
        "S5-沙丘": "season5", "神秘-暗影": "shadow", "聖約召喚": "covenant",
        "高塔-貓頭鷹": "owltower", "聯盟-騎士衝擊": "knights", "S6-S7-隱秘傳說": "untoldtales",
        "S3-瓦爾哈拉": "season3", "S4-地底荒野": "season4", "挑戰-重返聖堂": "returntosanctuary",
        "至日召喚": "solstice", "挑戰-眾神狂歡節": "carnivalofgods", "月英": "hotm",
        "月活動-戀愛季節": "love", "哥布林召喚": "goblinvillage", "額外抽獎-秘密召喚": "secretsummon",
        "挑戰節-吟遊詩人": "festival", "星界召喚": "astral", "挑戰節-殺手": "slayers",
        "野地召喚": "wilderness", "挑戰節-守護者": "teltoc", "挑戰節-肅煞森林": "fables",
        "傳奇召喚": "tavernoflegends", "生日召喚": "birthday", "黑色星期五召喚": "blackfriday",
        "豐收召喚": "harvest", "怪獸島召喚": "monsterisland", "挑戰-歌劇秘辛": "opera",
        // English
        "Challenge Festival-Villains": "villains", "Alliance-Musketeers": "musketeer", "Challenge Festival-Pets": "pets",
        "Monthly Event-Lunar Year": "lunaryear", "Challenge-Beowulf": "beowulf", "Alliance-Moths": "moth",
        "Monthly Event-Beach Party": "beachparty", "Monthly Event-Kalevala": "kalevala", "Challenge Festival-Avalon": "avalon",
        "Tower-Ninjas": "ninja", "Monthly Event-Morlovia": "morlovia", "Monthly Event-Sand Empire": "sand",
        "Three Kingdoms Summon": "kingdom", "Challenge Festival-Wonderland": "wonderland", "Super Elementals": "superelemental",
        "Tower-Magic": "magic", "Tower-Styx": "styx", "Monthly Event-Winter": "christmas",
        "Monthly Event-Springvale": "springvale", "Challenge Festival-Pirates": "pirates", "Challenge Festival-Starfall": "starfall",
        "Challenge-Gargoyle": "gargoyle", "S1-Classic": "season1", "S2-Atlantis": "season2",
        "S5-Dune": "season5", "Mystery-Shadow": "shadow", "Covenant Summon": "covenant",
        "Tower-Owls": "owltower", "Alliance-Knights Clash": "knights", "S6-S7-Untold Tales": "untoldtales",
        "S3-Valhalla": "season3", "S4-Wilderness": "season4", "Challenge-Return to Sanctuary": "returntosanctuary",
        "Solstice Summon": "solstice", "Challenge-Carnival of Gods": "carnivalofgods", "Hero of the Month": "hotm",
        "Monthly Event-Love Season": "love", "Goblin Summon": "goblinvillage", "Extra Draw-Secret Summon": "secretsummon",
        "Challenge Festival-Bards": "festival", "Astral Summon": "astral", "Challenge Festival-Slayers": "slayers",
        "Wilderness Summon": "wilderness", "Challenge Festival-Guardians": "teltoc", "Challenge Festival-Grim Forest": "fables",
        "Myth Summon": "tavernoflegends", "Birthday Summon": "birthday", "Black Friday Summon": "blackfriday",
        "Harvest Summon": "harvest", "Monster Island Summon": "monsterisland", "Challenge-Secrets of the Opera": "opera"
    };
    const sourceIconMap = {
        "villains": "challenge.png", "musketeer": "alliance_quest.png", "pets": "challenge.png",
        "lunaryear": "S1.png", "beowulf": "challenge.png", "moth": "challenge.png",
        "beachparty": "S1.png", "kalevala": "S1.png", "avalon": "challenge.png",
        "ninja": "tower.png", "morlovia": "S1.png", "sand": "S1.png",
        "kingdom": "mercenary_war.png", "wonderland": "challenge.png", "superelemental": "elemental.png",
        "magic": "tower.png", "styx": "tower.png", "christmas": "S1.png",
        "springvale": "S1.png", "pirates": "challenge.png", "starfall": "challenge.png",
        "gargoyle": "challenge.png", "season1": "S1.png", "season2": "S2.png",
        "season5": "S5.png", "shadow": "shadow.png", "covenant": "covenant.png",
        "owltower": "tower.png", "knights": "alliance_quest.png", "untoldtales": "S6.png",
        "season3": "S3.png", "season4": "S4.png", "returntosanctuary": "challenge.png",
        "solstice": "diamond.png", "carnivalofgods": "challenge.png", "hotm": "hotm.png",
        "love": "S1.png", "goblinvillage": "goblin.png", "secretsummon": "lucky.png",
        "festival": "challenge.png", "astral": "astralelves.png", "slayers": "challenge.png",
        "wilderness": "wilderness.png", "teltoc": "challenge.png", "fables": "challenge.png",
        "tavernoflegends": "hotm.png", "birthday": "diamond.png", "blackfriday": "diamond.png",
        "harvest": "diamond.png", "monsterisland": "monster_angular.png", "opera": "challenge.png"
    };
    const colorReverseMap = {
        '红色': 'Red', '紅色': 'Red', 'red': 'Red',
        '蓝色': 'Blue', '藍色': 'Blue', 'blue': 'Blue',
        '绿色': 'Green', '綠色': 'Green', 'green': 'Green',
        '黄色': 'Yellow', '黃色': 'Yellow', 'yellow': 'Yellow',
        '紫色': 'Purple', 'purple': 'Purple'
    };
    let farmGuideScrollHandler = null;
    let scrollPositions = {
        list: { top: 0, left: 0 },
        wanted: { top: 0, left: 0 },
        farming: { top: 0, left: 0 }
    };
    let filteredHeroes = [];
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
    const showWantedMissionBtn = document.getElementById('show-wanted-mission-btn');
    const showFarmingGuideBtn = document.getElementById('show-farming-guide-btn');

    const oneClickMaxDateDisplay = document.getElementById('one-click-max-date-display');
    const purchaseCostumeDateDisplay = document.getElementById('purchase-costume-date-display');
    const filterHero730Btn = document.getElementById('filter-hero-730-btn');
    const filterCostume548Btn = document.getElementById('filter-costume-548-btn');
    const defaultLimitBreakSelect = document.getElementById('default-limit-break-select');
    const defaultTalentSelect = document.getElementById('default-talent-select');
    const defaultPrioritySelect = document.getElementById('default-priority-select');


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

    // 调色板状态
    let isDraggingHue = false;
    let isDraggingSV = false;
    let hsv = { h: 0, s: 1, v: 1 }; // Hue: 0-1, Saturation: 0-1, Value: 0-1
    const emojiList = ['smile', 'grin', 'lol', 'rofl', 'sad', 'crying', 'blush', 'rolleyes', 'kiss', 'love', 'geek', 'monocle', 'think', 'tongue', 'cool', 'horror', 'angry', 'evil', 'hand', 'thumbsup', 'thumbsdown', 'hankey', 'ham', 'alien', 'ghost', 'richard', 'mage', 'magered', 'staff', 'heart', 'heartblue', 'heartgreen', 'heartyellow', 'heartpurple', 'pizza', 'cake', 'donut', 'coffee', 'sword', 'swords', 'axe', 'axes', 'hammer', 'helmet', 'skull', 'bunny', 'cat', 'catgrey', 'dog', 'butterfly', 'butterflyblue', 'fox', 'flower', 'sunflower', 'palmtree', 'splash', 'teardrop', 'fire', 'lightning', 'star', 'elementfire', 'elementice', 'elementnature', 'elementholy', 'elementdark'];

    function areFiltersActive() {
        const noneText = i18n[currentLang].none;
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
        if (filterInputs.star.value !== noneText ||
            filterInputs.color.value !== noneText ||
            filterInputs.speed.value !== noneText ||
            filterInputs.class.value !== noneText ||
            filterInputs.family.value !== noneText ||
            filterInputs.source.value !== noneText ||
            filterInputs.aetherpower.value !== noneText) {
            return true;
        }
        if (filterInputs.releaseDateType.value !== 'all') {
            return true;
        }
        if (temporaryFavorites !== null) {
            return true;
        }
        if (temporaryDateFilter !== null) {
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
            '红色': 'red', '紅色': 'red', 'red': 'red', '蓝色': 'blue', '藍色': 'blue', 'blue': 'blue',
            '绿色': 'green', '綠色': 'green', 'green': 'green', '黄色': 'yellow', '黃色': 'yellow', 'yellow': 'yellow',
            '紫色': 'purple', '紫色': 'purple', 'purple': 'purple', '白色': 'white', '白色': 'white', 'white': 'white',
            '黑色': 'black', '黑色': 'black', 'black': 'black',
        };
        const standardColor = colorMap[String(colorName).toLowerCase()];
        return standardColor ? `${standardColor}-glow-border` : '';
    };

    const getColorHex = (colorName) => {
        const colorMap = {
            '红色': '#ff7a4c', '紅色': '#ff7a4c', 'red': '#ff7a4c', '蓝色': '#41d8fe', '藍色': '#41d8fe', 'blue': '#41d8fe',
            '绿色': '#70e92f', '綠色': '#70e92f', 'green': '#70e92f', '黄色': '#f2e33a', '黃色': '#f2e33a', 'yellow': '#f2e33a',
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

    function calculateHeroStats(hero, settings) {
        const { lb, talent, priority } = settings;
        let finalStats = {};

        // 1. 根据天赋选择，确定用于计算的基础对象
        let baseObjectForLB;
        if (talent === 'none') {
            baseObjectForLB = hero;
        } else { // 'talent20' 或 'talent25'
            if (priority === 'attack' && hero.attack_priority_stats) {
                baseObjectForLB = hero.attack_priority_stats;
            } else if (priority === 'defense' && hero.defense_priority_stats) {
                baseObjectForLB = hero.defense_priority_stats;
            } else {
                baseObjectForLB = hero; // 备用
            }
        }

        // 2. 根据突破等级选择属性
        if (lb === 'lb1' && baseObjectForLB.lb1) {
            finalStats = { ...baseObjectForLB.lb1 };
        } else if (lb === 'lb2' && baseObjectForLB.lb2) {
            finalStats = { ...baseObjectForLB.lb2 };
        } else if (talent !== 'none' && baseObjectForLB.base) {
            finalStats = { ...baseObjectForLB.base }; // 天赋路径下的 "无突破" 状态
        } else {
            // 英雄的绝对基础属性 (无天赋, 无突破)
            finalStats = {
                power: hero.power || 0,
                attack: hero.attack || 0,
                defense: hero.defense || 0,
                health: hero.health || 0
            };
        }

        // 3. 如果选择了25天赋，应用额外加成
        if (talent === 'talent25') {
            finalStats.power = (finalStats.power || 0) + 25;
            if (priority === 'attack') {
                finalStats.attack = (finalStats.attack || 0) + 150;
                finalStats.health = (finalStats.health || 0) + 100;
            } else { // 'defense' 优先级
                finalStats.defense = (finalStats.defense || 0) + 180;
                finalStats.health = (finalStats.health || 0) + 100;
            }
        }
        return finalStats;
    }

    // --- 重构后的 updateHeroStats 函数 ---
    function updateHeroStats(hero) {
        const modal = document.getElementById('modal');
        if (!modal || modal.classList.contains('hidden')) return;

        // 从模态框内的选择器获取当前设置
        const lbSelect = document.getElementById('limit-break-select');
        const talentSelect = document.getElementById('talent-select');
        const prioritySelect = document.getElementById('talent-priority-select');

        const modalSettings = {
            lb: lbSelect ? lbSelect.value : 'none',
            talent: talentSelect ? talentSelect.value : 'none',
            priority: prioritySelect ? prioritySelect.value : 'attack'
        };

        // 根据天赋选择禁用/启用优先级下拉框
        if (prioritySelect) {
            prioritySelect.disabled = (modalSettings.talent === 'none');
        }

        // 使用重用的计算函数获取最终属性
        const finalStats = calculateHeroStats(hero, modalSettings);

        // 更新模态框中的DOM元素
        const powerEl = modal.querySelector('.details-stats-grid > div:nth-child(1) p');
        const attackEl = modal.querySelector('.details-stats-grid > div:nth-child(2) p');
        const defenseEl = modal.querySelector('.details-stats-grid > div:nth-child(3) p');
        const healthEl = modal.querySelector('.details-stats-grid > div:nth-child(4) p');

        if (powerEl) powerEl.innerHTML = `💪 ${finalStats.power || 0}`;
        if (attackEl) attackEl.innerHTML = `⚔️ ${finalStats.attack || 0}`;
        if (defenseEl) defenseEl.innerHTML = `🛡️ ${finalStats.defense || 0}`;
        if (healthEl) healthEl.innerHTML = `❤️ ${finalStats.health || 0}`;
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


    function updateResultsHeader() {
        const langDict = i18n[currentLang];
        const count = filteredHeroes.length;
        const filtersAreActive = areFiltersActive();

        if (resultsCountEl) {
            if (filtersAreActive) {
                resultsCountEl.innerHTML = `<span>${langDict.resultsCountTextFiltered(count)}</span>`;
                const resetTag = document.createElement('span');
                resetTag.className = 'reset-tag';
                resetTag.textContent = langDict.resultsReset;
                resetTag.onclick = (e) => {
                    e.preventDefault();
                    if (resetFiltersBtn) resetFiltersBtn.click();
                };
                resultsCountEl.appendChild(resetTag);
            } else {
                resultsCountEl.innerHTML = `<span>${langDict.resultsCountTextUnfiltered(count)}</span>`;
            }
        }
    }

    function applyFiltersAndRender() {
        const filters = Object.fromEntries(Object.entries(filterInputs).map(([key, el]) => [key, el.value.trim()]));
        const noneValue = i18n[currentLang].none.toLowerCase();
        const favoritesListToUse = temporaryFavorites !== null ? temporaryFavorites : getFavorites();
        // +++ 新增: 获取全局默认属性设置 +++
        const defaultSettings = {
            lb: defaultLimitBreakSelect.value,
            talent: defaultTalentSelect.value,
            priority: defaultPrioritySelect.value
        };
        // 根据全局天赋设置，禁用/启用优先级选择器
        defaultPrioritySelect.disabled = (defaultSettings.talent === 'none');

        filteredHeroes = allHeroes.filter(hero => {
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
            } else {
                matchesBaseFilter = true;
            }
            if (!matchesBaseFilter) return false;

            const lowerCaseName = hero.name.toLowerCase();
            if (filters.name && !lowerCaseName.includes(filters.name.toLowerCase())) return false;
            if (filters.effects) {
                const sanitizedEffects = Array.isArray(hero.effects) ?
                    hero.effects.map(p => String(p || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim()) :
                    [String(hero.effects || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim()];
                if (!matchesComplexQuery(sanitizedEffects, filters.effects)) return false;
            }
            if (filters.passives) {
                const sanitizedPassives = Array.isArray(hero.passives) ?
                    hero.passives.map(p => String(p || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim()) :
                    [String(hero.passives || '').replace(/[\p{P}\p{S}0-9]/gu, '').trim()];
                if (!matchesComplexQuery(sanitizedPassives, filters.passives)) return false;
            }
            if (filters.types) {
                let skillTypesToSearch = [];
                const source = filters.skillTypeSource;
                if (source === 'heroplan') {
                    skillTypesToSearch = hero.types || [];
                } else if (source === 'nynaeve') {
                    skillTypesToSearch = hero.skill_types || [];
                } else {
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
            return true;
        });
        // +++ 新增: 为每个筛选后的英雄计算用于显示的属性 +++
        filteredHeroes.forEach(hero => {
            hero.displayStats = calculateHeroStats(hero, defaultSettings);
        });

        filteredHeroes.sort((a, b) => {
            const key = currentSort.key;
            const direction = currentSort.direction === 'asc' ? 1 : -1;

            // +++ 修改: 排序时使用 displayStats +++
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

            // 次要排序也使用 displayStats.power
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
            if (match) return match[0]; // returns 'c1', 'c2'
        }
        if (lowerSkin.includes('glass') || lowerSkin.includes('玻璃')) return 'glass';
        if (lowerSkin.includes('toon') || lowerSkin.includes('卡通')) return 'toon';

        return null;
    }

    function renderTable(heroes) {
        if (!heroTable) return;

        updateResultsHeader();

        const langDict = i18n[currentLang];
        const heroesToProcess = heroes.filter(h => h.english_name);
        const favoritedCount = heroesToProcess.filter(isFavorite).length;
        const shouldPredictFavoriteAll = heroesToProcess.length > 0 && favoritedCount < heroesToProcess.length;
        const favHeaderIcon = shouldPredictFavoriteAll ? '★' : '☆';
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
                return `<th class="col-fav favorite-all-header ${favHeaderClass}" title="${langDict.favHeaderTitle}">${headerText}</th>`;
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
                    } else if (source === 'nynaeve') {
                        typesToShow = hero.skill_types ? [...hero.skill_types] : [];
                    } else {
                        typesToShow = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
                    }
                    typesToShow.sort((a, b) => a.localeCompare(b));
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

                if (key === 'name' && hero.costume_id !== 0) {
                    const skinInfo = getSkinInfo(hero);
                    if (skinInfo.skinIdentifier) {
                        const iconName = getCostumeIconName(skinInfo.skinIdentifier);
                        if (iconName) {
                            content = `<img src="imgs/costume/${iconName}.png" class="costume-icon" alt="${iconName} costume" title="${skinInfo.skinIdentifier}"/>${content}`;
                        }
                    }
                }

                if (key === 'class' && content) {
                    const englishClass = (classReverseMap[content] || content).toLowerCase();
                    content = `<img src="imgs/classes/${englishClass}.png" class="class-icon" alt="${content}"/>${content}`;
                }

                if (key === 'fav') {
                    if (!hero.english_name) return `<td class="col-fav"></td>`;
                    return `<td class="col-fav"><span class="favorite-toggle-icon ${isHeroFavorite ? 'favorited' : ''}" data-hero-id="${hero.originalIndex}">${isHeroFavorite ? '★' : '☆'}</span></td>`;
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

    // 用于保存当前可见视图滚动位置的辅助函数。
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

    // 此函数现在只处理返回英雄列表的UI更新。历史记录由popstate处理。
    function showHeroListViewUI() {
        // 保存我们正在离开的视图的滚动位置。
        saveCurrentViewScrollPosition();

        // 切换UI以显示英雄列表。
        heroTableView.classList.remove('hidden');
        wantedMissionView.classList.add('hidden');
        farmingGuideView.classList.add('hidden');

        // 恢复英雄列表的滚动位置。
        resultsWrapper.scrollTop = scrollPositions.list.top;
        resultsWrapper.scrollLeft = scrollPositions.list.left;

        // 清理其他视图的特定处理器。
        if (farmGuideScrollHandler) {
            resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            resultsHeader.style.transform = '';
            farmGuideScrollHandler = null;
        }

        // 更新标题文本，而无需重新渲染整个表格。
        updateResultsHeader();
    }

    // --- 视图管理函数 ---
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
        if (chatSimulatorView) chatSimulatorView.classList.add('hidden');
        // 保存当前视图的滚动位置。
        saveCurrentViewScrollPosition();

        // 清理材料指南的滚动处理器。
        if (farmGuideScrollHandler) {
            resultsWrapper.removeEventListener('scroll', farmGuideScrollHandler);
            resultsHeader.style.transform = '';
            farmGuideScrollHandler = null;
        }

        // 如果通缉任务表为空，则初始化它。
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

        // 切换视图可见性。
        heroTableView.classList.add('hidden');
        farmingGuideView.classList.add('hidden');
        wantedMissionView.classList.remove('hidden');

        // 恢复此视图的滚动位置。
        resultsWrapper.scrollTop = scrollPositions.wanted.top;
        resultsWrapper.scrollLeft = scrollPositions.wanted.left;

        // 更新标题。
        const langDict = i18n[currentLang];
        resultsCountEl.innerHTML = `<span>${langDict.wantedMissionTableTitle}</span>`;
        const returnTag = document.createElement('span');
        returnTag.className = 'reset-tag';
        returnTag.textContent = langDict.returnToList;
        returnTag.onclick = () => { history.back(); };
        resultsCountEl.appendChild(returnTag);

        setTimeout(adjustStickyHeaders, 0);
        history.pushState({ view: 'wanted' }, '');
    }

    function initAndShowFarmingGuideView() {
        if (chatSimulatorView) chatSimulatorView.classList.add('hidden');
        // 保存当前视图的滚动位置。
        saveCurrentViewScrollPosition();

        // 如果材料指南表为空，则初始化它。
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

        // 切换视图可见性。
        heroTableView.classList.add('hidden');
        wantedMissionView.classList.add('hidden');
        farmingGuideView.classList.remove('hidden');

        // 恢复此视图的滚动位置。
        resultsWrapper.scrollTop = scrollPositions.farming.top;
        resultsWrapper.scrollLeft = scrollPositions.farming.left;

        // 更新标题。
        const langDict = i18n[currentLang];
        resultsCountEl.innerHTML = `<span>${langDict.farmingGuideTableTitle}</span>`;
        const returnTag = document.createElement('span');
        returnTag.className = 'reset-tag';
        returnTag.textContent = langDict.returnToList;
        returnTag.onclick = () => { history.back(); };
        resultsCountEl.appendChild(returnTag);

        // 为此视图添加特殊的滚动处理器。
        if (!farmGuideScrollHandler) {
            farmGuideScrollHandler = () => {
                resultsHeader.style.transform = `translateX(-${resultsWrapper.scrollLeft}px)`;
            };
            resultsWrapper.addEventListener('scroll', farmGuideScrollHandler);
        }

        setTimeout(adjustStickyHeaders, 0);
        history.pushState({ view: 'farming' }, '');
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

    function renderDetailsInModal(hero) {
        const langDict = i18n[currentLang];

        // 内部辅助函数，用于将技能数组渲染为HTML列表
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

        // --- 英雄名称和皮肤解析逻辑 ---
        const skinInfo = getSkinInfo(hero);
        const heroSkin = skinInfo.skinIdentifier;
        let tempName = skinInfo.baseName;
        let mainHeroName = '';
        let englishName = '';
        let traditionalChineseName = '';

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


        // --- 家族加成和技能类型逻辑 ---
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
        } else {
            skillTypesToDisplay = [...new Set([...(hero.types || []), ...(hero.skill_types || [])])];
            skillTypesToDisplay.sort((a, b) => a.localeCompare(b));
        }
        const uniqueSkillTypes = skillTypesToDisplay.filter(t => t);
        const heroTypesContent = uniqueSkillTypes.length > 0 ? `<div class="skill-types-container">${uniqueSkillTypes.map(type => `<span class="hero-info-block skill-type-tag" data-filter-type="types" data-filter-value="${type}" title="${langDict.filterBy} ${type}">${type}</span>`).join('')}</div>` : `<span class="skill-value">${langDict.none}</span>`;

        // --- 头像和额外信息 ---
        const localImagePath = getLocalImagePath(hero.image);
        const avatarGlowClass = getColorGlowClass(hero.color);
        const fancyNameHTML = hero.fancy_name ? `<p class="hero-fancy-name">${hero.fancy_name}</p>` : '';

        // --- 职业图标逻辑 ---
        const displayedClass = hero.class;
        let classBlockHTML = '';
        if (displayedClass) {
            const englishClass = (classReverseMap[displayedClass] || displayedClass).toLowerCase();
            classBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="class" data-filter-value="${displayedClass}" title="${langDict.filterBy} ${displayedClass}"><img src="imgs/classes/${englishClass}.png" class="class-icon" alt="${displayedClass}"/>${displayedClass}</span>`;
        }

        // --- 皮肤信息块逻辑 ---
        let skinBlockHTML = '';
        if (heroSkin) {
            const iconName = getCostumeIconName(heroSkin);
            const iconHtml = iconName ? `<img src="imgs/costume/${iconName}.png" class="costume-icon" alt="${iconName} costume"/>` : '👕';
            skinBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="name" data-filter-value="${heroSkin}" title="${langDict.filterBy} ${heroSkin}">${iconHtml}${langDict.modalSkin} ${heroSkin}</span>`;
        }

        // --- 以太力量信息块逻辑 ---
        let aetherPowerBlockHTML = '';
        if (hero.AetherPower) {
            const displayedPower = hero.AetherPower;
            let englishPower = aetherPowerReverseMap[displayedPower] || displayedPower;
            const iconHtml = `<img src="imgs/Aether Power/${englishPower.toLowerCase()}.png" class="aether-power-icon" alt="${displayedPower}"/>`;
            aetherPowerBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="aetherpower" data-filter-value="${displayedPower}" title="${langDict.filterBy} ${displayedPower}">⏫${iconHtml}${displayedPower}</span>`;
        }

        // --- 起源信息块逻辑 ---
        let sourceBlockHTML = '';
        if (hero.source) {
            const displayedSource = hero.source;
            const sourceKey = sourceReverseMap[displayedSource];
            let iconHtml = '';

            if (sourceKey === 'season1' && hero.costume_id !== 0) {
                iconHtml = `<img src="imgs/coins/costume_key.png" class="source-icon" alt="Costume Key"/>`;
            } else {
                if (sourceKey) {
                    const iconFilename = sourceIconMap[sourceKey];
                    if (iconFilename) {
                        iconHtml = `<img src="imgs/coins/${iconFilename}" class="source-icon" alt="${displayedSource}"/>`;
                    }
                }
            }

            sourceBlockHTML = `<span class="hero-info-block skill-type-tag" data-filter-type="source" data-filter-value="${hero.source}" title="${langDict.filterBy} ${displayedSource}">🌍${iconHtml}${displayedSource}</span>`;
        }


        // --- 选择器HTML ---
        const selectorsHTML = `
<div class="details-core-settings-header">
    <h4>${langDict.defaultStatSettingsTitle}</h4>
    <button class="toggle-button" data-target="details-selectors-content" title="${langDict.toggleCollapse}">▼</button>
</div>
<div id="details-selectors-content" class="filter-content">
    <div class="details-selectors">
        <div class="details-selector-item">
            <label for="limit-break-select">${langDict.limitBreakSetting}</label>
            <select id="limit-break-select">
                <option value="none">${langDict.noLimitBreak}</option>
                <option value="lb1">${langDict.lb1}</option>
                <option value="lb2">${langDict.lb2}</option>
            </select>
        </div>
        <div class="details-selector-item">
            <label for="talent-select">${langDict.talentSetting}</label>
            <select id="talent-select">
                <option value="none">${langDict.noTalent}</option>
                <option value="talent20">${langDict.talent20}</option>
                <option value="talent25">${langDict.talent25}</option>
            </select>
        </div>
        <div class="details-selector-item">
            <label for="talent-priority-select">${langDict.prioritySetting}</label>
            <select id="talent-priority-select">
                <option value="attack">${langDict.attackPriority}</option>
                <option value="defense">${langDict.defensePriority}</option>
            </select>
        </div>
    </div>
</div>
`;

        // --- 完整的模态框HTML结构 ---
        const detailsHTML = `<div class="details-header"><h2>${langDict.modalHeroDetails}</h2><div class="details-header-buttons"><button class="favorite-btn" id="favorite-hero-btn" title="${langDict.favoriteButtonTitle}">☆</button><button class="share-btn" id="share-hero-btn" title="${langDict.shareButtonTitle}">🔗</button><button class="close-btn" id="hide-details-btn" title="${langDict.closeBtnTitle}">✖</button></div></div><div class="hero-title-block">${nameBlockHTML}${fancyNameHTML}</div><div class="details-body"><div class="details-top-left"><img src="${localImagePath}" class="hero-image-modal ${avatarGlowClass}" alt="${hero.name}"></div><div class="details-top-right"><div class="details-info-line">${hero.family ? `<span class="hero-info-block skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}" title="${langDict.filterBy} ${translatedFamily || hero.family}"><img src="imgs/family/${String(hero.family).toLowerCase()}.png" class="family-icon" alt="${hero.family} icon"/>${translatedFamily || hero.family}</span>` : ''}${classBlockHTML}${skinBlockHTML}${sourceBlockHTML}${aetherPowerBlockHTML}${hero['Release date'] ? `<span class="hero-info-block">📅 ${hero['Release date']}</span>` : ''}</div><h3>${langDict.modalCoreStats}</h3><div class="details-stats-grid"><div><p class="metric-value-style">💪 ${hero.power || 0}</p></div><div><p class="metric-value-style">⚔️ ${hero.attack || 0}</p></div><div><p class="metric-value-style">🛡️ ${hero.defense || 0}</p></div><div><p class="metric-value-style">❤️ ${hero.health || 0}</p></div></div><div class="details-core-settings-group">${selectorsHTML}</div></div></div><div class="details-bottom-section"><h3>${langDict.modalSkillDetails}</h3><div class="skill-category-block"><p class="uniform-style">${langDict.modalSkillName} <span class="skill-value">${hero.skill && hero.skill !== 'nan' ? hero.skill : langDict.none}</span></p><p class="uniform-style">${langDict.modalSpeed} <span class="skill-value skill-type-tag" data-filter-type="speed" data-filter-value="${hero.speed}" title="${langDict.filterBy} ${hero.speed}">${hero.speed || langDict.none}</span></p><p class="uniform-style">${langDict.modalSkillType}</p>${heroTypesContent}</div><div class="skill-category-block"><p class="uniform-style">${langDict.modalSpecialSkill}</p><ul class="skill-list">${renderListAsHTML(hero.effects, 'effects')}</ul></div><div class="skill-category-block"><p class="uniform-style">${langDict.modalPassiveSkill}</p><ul class="skill-list">${renderListAsHTML(hero.passives, 'passives')}</ul></div>${familyBonus.length > 0 ? `<div class="skill-category-block"><p class="uniform-style">${langDict.modalFamilyBonus(`<span class="skill-type-tag" data-filter-type="family" data-filter-value="${hero.family}" title="${langDict.filterBy} ${translatedFamily || hero.family}"><img src="imgs/family/${String(hero.family).toLowerCase()}.png" class="family-icon" alt="${hero.family} icon"/>${translatedFamily || hero.family}</span>`)}</p><ul class="skill-list">${renderListAsHTML(familyBonus)}</ul></div>` : ''}</div><div class="modal-footer"><button class="close-bottom-btn" id="hide-details-bottom-btn">${langDict.detailsCloseBtn}</button></div>`;
        modalContent.innerHTML = detailsHTML;

        // --- 核心修正逻辑 ---

        // 1. 获取模态框内的选择器元素
        const lbSelect = document.getElementById('limit-break-select');
        const talentSelect = document.getElementById('talent-select');
        const prioritySelect = document.getElementById('talent-priority-select');

        // 2. 将模态框内的选择器设置为全局默认值
        lbSelect.value = defaultLimitBreakSelect.value;
        talentSelect.value = defaultTalentSelect.value;
        prioritySelect.value = defaultPrioritySelect.value;

        // 3. 直接使用已知的全局默认设置来执行第一次属性计算和渲染
        const globalDefaultSettings = {
            lb: defaultLimitBreakSelect.value,
            talent: defaultTalentSelect.value,
            priority: defaultPrioritySelect.value
        };
        const initialStats = calculateHeroStats(hero, globalDefaultSettings);

        // 手动更新DOM
        const powerEl = modal.querySelector('.details-stats-grid > div:nth-child(1) p');
        const attackEl = modal.querySelector('.details-stats-grid > div:nth-child(2) p');
        const defenseEl = modal.querySelector('.details-stats-grid > div:nth-child(3) p');
        const healthEl = modal.querySelector('.details-stats-grid > div:nth-child(4) p');

        if (powerEl) powerEl.innerHTML = `💪 ${initialStats.power || 0}`;
        if (attackEl) attackEl.innerHTML = `⚔️ ${initialStats.attack || 0}`;
        if (defenseEl) defenseEl.innerHTML = `🛡️ ${initialStats.defense || 0}`;
        if (healthEl) healthEl.innerHTML = `❤️ ${initialStats.health || 0}`;

        // 同时，在打开时正确设置优先级选择框的禁用状态
        prioritySelect.disabled = (globalDefaultSettings.talent === 'none');

        // 4. 为后续的用户手动操作绑定事件监听器
        function setupStatListeners() {
            if (lbSelect) lbSelect.addEventListener('change', () => updateHeroStats(hero));
            if (talentSelect) talentSelect.addEventListener('change', () => updateHeroStats(hero));
            if (prioritySelect) prioritySelect.addEventListener('change', () => updateHeroStats(hero));
        }
        setupStatListeners();
        function setupCollapseBehavior() {
            // 步骤1：将选择器从按钮改为整个标题栏
            const header = document.querySelector('#modal .details-core-settings-header');
            const contentToCollapse = document.getElementById('details-selectors-content');
            // 依然需要获取按钮本身，用于旋转动画
            const collapseBtn = header ? header.querySelector('.toggle-button') : null;

            if (!header || !contentToCollapse || !collapseBtn) return;

            // 读取Cookie并设置初始状态
            const savedState = getCookie('details_settings_state');
            if (savedState === 'collapsed') {
                contentToCollapse.classList.add('collapsed');
                collapseBtn.classList.remove('expanded');
            } else {
                contentToCollapse.classList.remove('collapsed');
                collapseBtn.classList.add('expanded');
            }

            // 步骤2：将点击事件绑定到整个 header 上
            header.addEventListener('click', function () {
                // 折叠/展开内容的逻辑不变
                contentToCollapse.classList.toggle('collapsed');

                // 明确地为按钮切换 'expanded' 类，以触发旋转动画
                collapseBtn.classList.toggle('expanded');

                // 保存状态到Cookie的逻辑不变
                const newState = contentToCollapse.classList.contains('collapsed') ? 'collapsed' : 'expanded';
                setCookie('details_settings_state', newState, 365);
            });
        }
        setupCollapseBehavior();

        // --- 收藏与分享按钮的事件监听 ---
        const favoriteBtn = document.getElementById('favorite-hero-btn');
        const shareBtn = document.getElementById('share-hero-btn');
        if (!hero.english_name) {
            favoriteBtn.style.display = 'none';
            shareBtn.style.display = 'none';
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
                    tableStar.textContent = isFavorite(hero) ? '★' : '☆';
                    tableStar.classList.toggle('favorited', isFavorite(hero));
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
                    console.error('复制链接失败：', err);
                    alert('复制链接失败，请尝试手动复制。');
                });
            });
        }

        // --- 关闭按钮的事件监听 ---
        document.getElementById('hide-details-btn').addEventListener('click', closeDetailsModal);
        document.getElementById('hide-details-bottom-btn').addEventListener('click', closeDetailsModal);
    }

    function clearAllFilters() {
        temporaryFavorites = null;
        temporaryDateFilter = null;
        for (const key in filterInputs) {
            if (key === 'skillTypeSource') continue;
            const element = filterInputs[key];
            if (element) {
                if (element.tagName === 'SELECT') {
                    element.value = (element.id === 'release-date-type') ? 'all' : i18n[currentLang].none;
                } else {
                    element.value = '';
                }
            }
        }
    }
    // ==========================================================================
    // --- 聊天模拟器 (Chat Simulator) v3 ---
    // ==========================================================================

    // --- 颜色转换辅助函数 ---

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

    // --- 调色板更新逻辑 ---

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


    // --- 核心功能函数 ---

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
        history.pushState({ view: 'chat' }, '');
    }

    // --- 事件监听器初始化 ---
    function addChatSimulatorEventListeners() {
        let isSimulatorInitialized = false;

        if (showChatSimulatorBtn) {
            showChatSimulatorBtn.addEventListener('click', () => {
                initAndShowChatSimulatorView();

                if (isSimulatorInitialized) return;

                const favoriteColorBtn = document.getElementById('favorite-color-btn');
                const favoriteColorsGrid = document.getElementById('favorite-colors-grid');

                // --- 收藏颜色核心逻辑 ---
                let favoriteColors = getCookie('favoriteColors') ? JSON.parse(getCookie('favoriteColors')) : [];

                function renderFavoriteColors() {
                    if (!favoriteColorsGrid) return;
                    favoriteColorsGrid.innerHTML = '';
                    favoriteColors.forEach(color => {
                        const item = document.createElement('div');
                        item.className = 'favorite-color-item';
                        item.style.backgroundColor = color;
                        item.dataset.color = color; // 将颜色存在data属性中

                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-favorite-btn';
                        removeBtn.innerHTML = '&times;';
                        removeBtn.title = '移除此颜色';

                        // 桌面端：点击 "x" 按钮移除
                        removeBtn.addEventListener('click', () => {
                            favoriteColors = favoriteColors.filter(c => c !== color);
                            setCookie('favoriteColors', JSON.stringify(favoriteColors), 365);
                            renderFavoriteColors();
                        });

                        item.appendChild(removeBtn);

                        // **** 新的长按与单击逻辑 ****
                        let pressTimer = null;
                        let isLongPress = false;

                        const startPress = (e) => {
                            // 只对触摸事件启用长按逻辑
                            if (e.type === 'mousedown') return;

                            e.preventDefault();
                            isLongPress = false;

                            pressTimer = setTimeout(() => {
                                isLongPress = true;
                                // **长按操作：直接移除颜色**
                                const colorToRemove = item.dataset.color;
                                favoriteColors = favoriteColors.filter(c => c !== colorToRemove);
                                setCookie('favoriteColors', JSON.stringify(favoriteColors), 365);
                                renderFavoriteColors();
                            }, 500); // 500毫秒定义为长按
                        };

                        const cancelPress = () => {
                            clearTimeout(pressTimer);
                        };

                        const clickAction = (e) => {
                            // 如果是长按触发的，或者点击的是 "x" 按钮，则不执行插入操作
                            if (isLongPress || e.target === removeBtn) {
                                isLongPress = false; // 重置状态
                                return;
                            }
                            // **单击/短按操作：插入颜色**
                            insertTextAtCursor(chatSimulatorInput, `[${item.dataset.color}]`);
                        };

                        // 为桌面端和移动端短按绑定 'click' 事件
                        item.addEventListener('click', clickAction);

                        // 为移动端长按绑定触摸事件
                        item.addEventListener('touchstart', startPress, { passive: false });
                        item.addEventListener('touchend', cancelPress);
                        item.addEventListener('touchmove', cancelPress); // 如果手指移动，则取消长按计时

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

                // --- 核心交互事件 ---
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

                // --- 调色板事件 ---
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

                // --- 拖拽分割条逻辑 ---
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

                // --- 折叠功能事件监听 ---
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

                // 初始化
                updateColorPickerUI();
                renderFavoriteColors();
                isSimulatorInitialized = true;
            });
        }
    }
    
    function addEventListeners() {
        if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
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
                    if (key === 'releaseDateType') temporaryFavorites = null;
                    if (key === 'skillTypeSource') setCookie('skillTypeSource', filterInputs.skillTypeSource.value, 365);
                    renderAndShowHeroList(true);
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

                filterValue = filterValue.replace(/\s*[\(（][^\)）]*[\)）]/g, '').trim();

                const inputElement = filterInputs[filterType];
                if (inputElement) {
                    clearAllFilters();

                    if (filterType === 'passives' || filterType === 'effects') {
                        const cleanedValue = filterValue.replace(/[\p{P}\p{S}0-9]/gu, ' ').replace(/\s+/g, ' ').trim();
                        filterValue = `(${cleanedValue})`;
                    } else if (filterType === 'types') {
                        filterValue = `[${filterValue}]`;
                    }

                    closeDetailsModal();
                    inputElement.value = filterValue;
                    renderAndShowHeroList(true);
                }
            });
        }
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                clearAllFilters();
                renderAndShowHeroList(true);
            });
        }
        if (filterHero730Btn) {
            filterHero730Btn.addEventListener('click', () => {
                clearAllFilters();
                filterInputs.releaseDateType.value = 'hero';
                temporaryDateFilter = { base: oneClickMaxDate, days: 730 };
                renderAndShowHeroList(true);
            });
        }
        if (filterCostume548Btn) {
            filterCostume548Btn.addEventListener('click', () => {
                clearAllFilters();
                filterInputs.releaseDateType.value = 'skin';
                temporaryDateFilter = { base: purchaseCostumeDate, days: 548 };
                renderAndShowHeroList(true);
            });
        }
        // +++ 新增: 为全局默认属性选择器添加事件监听 +++
        function handleDefaultStatChange() {
            // 当设置改变时，保存到Cookie并重新渲染列表
            setCookie('defaultLB', defaultLimitBreakSelect.value, 365);
            setCookie('defaultTalent', defaultTalentSelect.value, 365);
            setCookie('defaultPriority', defaultPrioritySelect.value, 365);
            applyFiltersAndRender();
        }

        if (defaultLimitBreakSelect) defaultLimitBreakSelect.addEventListener('change', handleDefaultStatChange);
        if (defaultTalentSelect) defaultTalentSelect.addEventListener('change', handleDefaultStatChange);
        if (defaultPrioritySelect) defaultPrioritySelect.addEventListener('change', handleDefaultStatChange);

        if (openFavoritesBtn) {
            openFavoritesBtn.addEventListener('click', () => {
                temporaryFavorites = null;
                filterInputs.releaseDateType.value = 'favorites';
                renderAndShowHeroList(true);
            });
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
                            toggleFavorite(hero);
                            target.textContent = isFavorite(hero) ? '★' : '☆';
                            target.classList.toggle('favorited', isFavorite(hero));
                            if (filterInputs.releaseDateType.value === 'favorites' && temporaryFavorites === null) {
                                applyFiltersAndRender();
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
                    console.error('复制收藏夹链接失败：', err);
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

        window.addEventListener('popstate', function (event) {
            // 首先，优先处理关闭任何打开的模态框。
            if (modalStack.length > 0) {
                const lastOpenModalId = modalStack.pop();
                if (lastOpenModalId === 'details') {
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
                }
                if (modalStack.length === 0) document.body.classList.remove('modal-open');
                // 关闭模态框后停止进一步处理。
                return;
            }
            // 新增：处理聊天模拟器视图的返回
            if (chatSimulatorView && !chatSimulatorView.classList.contains('hidden')) {
                chatSimulatorView.classList.add('hidden');
                showHeroListViewUI(); // 调用返回列表的函数
                return; // 处理完毕，直接返回
            }

            // 如果没有模态框打开，任何“返回”导航都应返回到英雄列表视图。
            // 我们检查英雄列表是否已显示，以避免不必要的重复更新。
            const isHeroListVisible = !heroTableView.classList.contains('hidden');
            if (!isHeroListVisible) {
                showHeroListViewUI();
            }
        });
        window.addEventListener('resize', adjustStickyHeaders);
        // 添加新的聊天模拟器事件监听
        addChatSimulatorEventListeners();
    }

    async function initializeApp() {
        const urlParams = new URLSearchParams(window.location.search);
        const viewHeroFromUrl = urlParams.get('view');
        const langFromUrl = urlParams.get('lang');
        const zfavsFromUrl = urlParams.get('zfavs');
        const favsFromUrl = urlParams.get('favs');
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
            // +++ 新增: 从Cookie加载并应用默认属性设置 +++
            defaultLimitBreakSelect.value = getCookie('defaultLB') || 'none';
            defaultTalentSelect.value = getCookie('defaultTalent') || 'none';
            defaultPrioritySelect.value = getCookie('defaultPriority') || 'attack';
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
                        filterInputs.releaseDateType.value = 'favorites';
                    }
                } catch (e) {
                    console.error("从URL解压收藏夹失败", e);
                }
            } else if (favsFromUrl) {
                try {
                    temporaryFavorites = decodeURIComponent(favsFromUrl).split(',');
                    filterInputs.releaseDateType.value = 'favorites';
                } catch (e) {
                    console.error("处理URL中的收藏夹失败", e);
                }
            }
            addEventListeners();
            applyFiltersAndRender(); // 首次渲染将使用加载的或默认的设置
            loadFilterStates();
            // --- 新增：为新用户默认打开筛选框 ---
            const hasVisited = getCookie('visited');
            if (!hasVisited) {
                // 如果 'visited' cookie 不存在，说明是新用户
                openFiltersModal(); // 调用已有的函数打开筛选框
                setCookie('visited', 'true', 365); // 设置cookie，有效期一年，下次不再打开
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