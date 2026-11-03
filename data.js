// data.js: 存放所有静态数据和常量映射表。

// --- 硬编码日期 (用于特殊筛选) ---
const oneClickMaxDate = '2026-09-15';
const purchaseCostumeDate = '2026-10-08';
const soulExchange = {
  "Date": "2026-08-29",
  "five": [
    "elemental_griffex_costume_camera",
    "moth_satinpimenter",
    "shadow_rosanna",
    "fox_whitefang",
    "garrison_kolya"
  ],
  "fifteen": [
    "slime_slaymire",
    "magic_carpet_zazha",
    "outlaw_lu_zhishen",
    "astral_dwarf_orcur",
    "slime_verdigoo"
  ],
  "thirty": [
    "beowulf_hygd",
    "outlaw_ruan_xiaoqi",
    "institute_wilcox",
    "magic_carpet_kesha",
    "valentines_vernon"
  ],
  "show": false
};

const redeemcodes = [
];
/*
{
    "code": "FRIENDLYFIRE ",
        "rewards": [
            {
                "img": "imgs/reedcode_reward/energy_friendly_matches.webp",
                "num": 3
            },
            {
                "img": "imgs/coins/s1.webp",
                "num": 1
            },
            {
                "img": "imgs/coins/elite_troop.webp",
                "num": 3
            },
            {
                "img": "imgs/reedcode_reward/refill_iron_250k.webp",
                "num": 1
            },
            {
                "img": "imgs/reedcode_reward/refill_food_250k.webp",
                "num": 1
            },
        ]
},
*/
// --- 捐赠名单 ---
const donationList = ["西那个瓜", "e2x8w7c2", "l8o0v2e3", "keke", "不吃芒果", "KC", "风扬云散", "蘑菇", "北鸣潇潇", "kimyu", "vabe"];
// 语言到捐赠者的映射
const langDonorsMap = {
    // 简体
    'cn': [],
    // 繁体
    'tc': [],
    // 英语
    'en': ["vabe"],
    // 日语
    'ja': [],
    // 韩语
    'ko': [],
    // 俄语
    'ru': [],
    // 阿拉伯语
    'ar': [],
    // 丹麦语
    'da': [],
    // 荷兰语
    'nl': [],
    // 芬兰语
    'fi': [],
    // 法语
    'fr': [],
    // 德语
    'de': [],
    // 印尼语
    'id': [],
    // 意大利语
    'it': [],
    // 挪威语
    'no': [],
    // 波兰语
    'pl': [],
    // 葡萄牙语
    'pt': [],
    // 西班牙语
    'es': [],
    // 瑞典语
    'sv': [],
    // 土耳其语
    'tr': []
};

var originToFamiliesMap = {};

// source 规范 ID → 起源图标文件名（键集 = data/source_info.json 的 source）
const sourceIconMap = {
    "musketeer": "alliance_quest.webp",
    "lunaryear": "s1.webp", "beowulf": "challenge.webp", "moth": "alliance_quest.webp",
    "beachparty": "s1.webp", "kalevala": "s1.webp",
    "ninja": "tower.webp", "morlovia": "s1.webp", "halloween2025": "halloween_resource.webp",
    "kingdom": "mercenary_war.webp", "superelemental": "elemental.webp",
    "magic": "tower.webp", "styx": "tower.webp", "christmas": "s1.webp",
    "springvale": "s1.webp",
    "gargoyle": "challenge.webp", "season1": "s1.webp", "season2": "s2.webp",
    "season5": "s5.webp", "shadow": "shadow.webp", "covenant": "covenant.webp",
    "owltower": "tower.webp", "knights": "alliance_quest.webp", "untoldtales1": "untoldtales.webp", "untoldtales2": "untoldtales.webp",
    "season3": "s3.webp", "season4": "s4.webp",
    "solstice": "diamond.webp", "carnivalofgods": "challenge.webp", "hotm": "hotm.webp",
    "love": "s1.webp", "goblinvillage": "goblin.webp", "secretsummon": "lucky.webp",
    "astral": "astralelves.webp",
    "wilderness": "wilderness.webp",
    "tavernoflegends": "hotm.webp", "tavernoflegendssecret": "hotm.webp", "birthday": "diamond.webp", "blackfriday": "diamond.webp",
    "harvest": "diamond.webp", "monsterisland": "monster_angular.webp", "opera": "challenge.webp", "challengefestival1": "challenge.webp", "challengefestival2": "challenge.webp", "costume": "costume_key.webp", "mimic": "bazaar.webp", "temple": "temple.webp", "titanhunter": "diamond.webp", "farmland": "challenge.webp", "lunarnewyear2026": "fortune_spirit_resource.webp", "beachparty2026": "beachparty_resource.webp",
};

// --- 游戏内数据 ---

// 通缉任务表数据
const wantedMissionData = [
    { season: 'S1', daily: '7-4', red: '4-1', green: ['7-5', '6-3'], blue: '8-7', purple: '7-4', yellow: ['10-6', '9-4'] },
    { season: 'S2', daily: ['4-3', '7-1'], red: ['3-8', '3-4'], green: '7-1', blue: ['8-10', '8-2'], purple: '21-10', yellow: ['13-1', '9-5'] },
    { season: 'S3', daily: '9-8', red: '6-2', green: ['4-8', '30-6'], blue: ['9-8', '9-2'], purple: '17-9', yellow: '8-6' },
    { season: 'S4', daily: '6-10', red: ['32-2', '32-6'], green: '9-2', blue: ['8-2', '30-7'], purple: '14-8', yellow: '4-7' },
    { season: 'S5', daily: ['5-10', '6-10'], red: ['2-9', '2-1'], green: ['3-4', '10-8', '30-8'], blue: '22-2', purple: '5-10', yellow: ['16-8', '17-6'] },
    { season: 'UT1', daily: '1-26', red: '1-24', green: ['1-11', '4-22'], blue: '3-13', purple: '1-28', yellow: ['2-6', '6-7'] },
    { season: 'UT2', daily: '1-28', red: ['1-27', '1-28'], green: ['1-12', '2-15'], blue: '2-20', purple: '1-3', yellow: ['1-21', '1-15'] }
];

// 材料出处指南数据
const farmingGuideData = [
    { item: "Profile_avatar", s1: "S2", s2: "S3", s3: "S4", s4: "S5", s5: "UT1", s6: "UT2" },
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
const costData = [{ slot: 301, emblem: 14, food: "7,063", iron: "2,511", masteremblem: "" }, { slot: 302, emblem: 7, food: "7581", iron: "2695", masteremblem: "" }, { slot: 303, emblem: 7, food: "10108", iron: "3594", masteremblem: "" }, { slot: 304, emblem: 14, food: "17657", iron: "6277", masteremblem: "" }, { slot: 305, emblem: 7, food: "15162", iron: "5391", masteremblem: "" }, { slot: 306, emblem: 7, food: "17689", iron: "6289", masteremblem: "" }, { slot: 307, emblem: 14, food: "28252", iron: "10044", masteremblem: "" }, { slot: 308, emblem: 17, food: "23913", iron: "8500", masteremblem: "" }, { slot: 309, emblem: 7, food: "25270", iron: "8985", masteremblem: "" }, { slot: 310, emblem: 17, food: "29227", iron: "10389", masteremblem: "" }, { slot: 311, emblem: 7, food: "30324", iron: "10782", masteremblem: "" }, { slot: 312, emblem: 14, food: "45909", iron: "16321", masteremblem: "" }, { slot: 313, emblem: 7, food: "35378", iron: "12579", masteremblem: "" }, { slot: 314, emblem: 7, food: "37905", iron: "13477", masteremblem: "" }, { slot: 315, emblem: 14, food: "56504", iron: "20088", masteremblem: "" }, { slot: 316, emblem: 7, food: "42959", iron: "15274", masteremblem: "" }, { slot: 317, emblem: 7, food: "45486", iron: "16173", masteremblem: "" }, { slot: 318, emblem: 7, food: "48013", iron: "17071", masteremblem: "" }, { slot: 319, emblem: 17, food: "53140", iron: "18890", masteremblem: "" }, { slot: 320, emblem: 35, food: "72124", iron: "25641", masteremblem: "" }, { slot: 321, emblem: 30, food: "80,000", iron: "80,000", masteremblem: "3" }, { slot: 322, emblem: 30, food: "80,000", iron: "80,000", masteremblem: "3" }, { slot: 323, emblem: 30, food: "80,000", iron: "80,000", masteremblem: "3" }, { slot: 324, emblem: 30, food: "80,000", iron: "80,000", masteremblem: "3" }, { slot: 325, emblem: 30, food: "80,000", iron: "80,000", masteremblem: "3" }, { slot: 401, emblem: 30, food: "17,658", iron: "6,278", masteremblem: "" }, { slot: 402, emblem: 15, food: "18954", iron: "6739", masteremblem: "" }, { slot: 403, emblem: 15, food: "25272", iron: "8986", masteremblem: "" }, { slot: 404, emblem: 30, food: "44145", iron: "15695", masteremblem: "" }, { slot: 405, emblem: 15, food: "37098", iron: "13479", masteremblem: "" }, { slot: 406, emblem: 15, food: "44226", iron: "15725", masteremblem: "" }, { slot: 407, emblem: 30, food: "70632", iron: "25112", masteremblem: "" }, { slot: 408, emblem: 40, food: "59778", iron: "21253", masteremblem: "" }, { slot: 409, emblem: 15, food: "63180", iron: "22465", masteremblem: "" }, { slot: 410, emblem: 40, food: "73062", iron: "25976", masteremblem: "" }, { slot: 411, emblem: 15, food: "75816", iron: "26958", masteremblem: "" }, { slot: 412, emblem: 30, food: "114000", iron: "40807", masteremblem: "" }, { slot: 413, emblem: 15, food: "88452", iron: "31451", masteremblem: "" }, { slot: 414, emblem: 15, food: "94770", iron: "33697", masteremblem: "" }, { slot: 415, emblem: 30, food: "141000", iron: "50224", masteremblem: "" }, { slot: 416, emblem: 15, food: "107000", iron: "38190", masteremblem: "" }, { slot: 417, emblem: 15, food: "113000", iron: "40437", masteremblem: "" }, { slot: 418, emblem: 15, food: "120000", iron: "42683", masteremblem: "" }, { slot: 419, emblem: 40, food: "132000", iron: "47230", masteremblem: "" }, { slot: 420, emblem: 70, food: "180000", iron: "64113", masteremblem: "" }, { slot: 421, emblem: 50, food: "200000", iron: "200000", masteremblem: "5" }, { slot: 422, emblem: 50, food: "200000", iron: "200000", masteremblem: "5" }, { slot: 423, emblem: 50, food: "200000", iron: "200000", masteremblem: "5" }, { slot: 424, emblem: 50, food: "200000", iron: "200000", masteremblem: "5" }, { slot: 425, emblem: 50, food: "200000", iron: "200000", masteremblem: "5" }, { slot: 501, emblem: 65, food: "47050", iron: "47050", masteremblem: "" }, { slot: 502, emblem: 50, food: "44250", iron: "44250", masteremblem: "" }, { slot: 503, emblem: 50, food: "59000", iron: "59000", masteremblem: "" }, { slot: 504, emblem: 65, food: "117000", iron: "117000", masteremblem: "" }, { slot: 505, emblem: 50, food: "88500", iron: "88500", masteremblem: "" }, { slot: 506, emblem: 50, food: "103000", iron: "103000", masteremblem: "" }, { slot: 507, emblem: 65, food: "188000", iron: "188000", masteremblem: "" }, { slot: 508, emblem: 80, food: "146000", iron: "146000", masteremblem: "" }, { slot: 509, emblem: 50, food: "147000", iron: "147000", masteremblem: "" }, { slot: 510, emblem: 80, food: "178000", iron: "178000", masteremblem: "" }, { slot: 511, emblem: 50, food: "177000", iron: "177000", masteremblem: "" }, { slot: 512, emblem: 65, food: "305000", iron: "305000", masteremblem: "" }, { slot: 513, emblem: 50, food: "206000", iron: "206000", masteremblem: "" }, { slot: 514, emblem: 50, food: "221000", iron: "221000", masteremblem: "" }, { slot: 515, emblem: 65, food: "376000", iron: "376000", masteremblem: "" }, { slot: 516, emblem: 50, food: "250000", iron: "250000", masteremblem: "" }, { slot: 517, emblem: 50, food: "265000", iron: "265000", masteremblem: "" }, { slot: 518, emblem: 50, food: "280000", iron: "280000", masteremblem: "" }, { slot: 519, emblem: 80, food: "325000", iron: "325000", masteremblem: "" }, { slot: 520, emblem: 125, food: "519000", iron: "519000", masteremblem: "" }, { slot: 521, emblem: 100, food: "400000", iron: "400000", masteremblem: "10" }, { slot: 522, emblem: 100, food: "400000", iron: "400000", masteremblem: "10" }, { slot: 523, emblem: 100, food: "400000", iron: "400000", masteremblem: "10" }, { slot: 524, emblem: 100, food: "400000", iron: "400000", masteremblem: "10" }, { slot: 525, emblem: 100, food: "400000", iron: "400000", masteremblem: "10" }];

// 聊天模拟器表情列表
const emojiList = ['smile', 'grin', 'lol', 'rofl', 'sad', 'crying', 'blush', 'rolleyes', 'kiss', 'love', 'geek', 'monocle', 'think', 'tongue', 'cool', 'horror', 'angry', 'evil', 'hand', 'thumbsup', 'thumbsdown', 'hankey', 'ham', 'alien', 'ghost', 'richard', 'mage', 'magered', 'staff', 'heart', 'heartblue', 'heartgreen', 'heartyellow', 'heartpurple', 'pizza', 'cake', 'donut', 'coffee', 'sword', 'swords', 'axe', 'axes', 'hammer', 'helmet', 'skull', 'bunny', 'cat', 'catgrey', 'dog', 'butterfly', 'butterflyblue', 'fox', 'flower', 'sunflower', 'palmtree', 'splash', 'teardrop', 'fire', 'lightning', 'star', 'elementfire', 'elementice', 'elementnature', 'elementholy', 'elementdark'];
