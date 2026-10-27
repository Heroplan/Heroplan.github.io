/**
 * ==========================================================================
 * 天赋树系统模块 (Talent Tree System Module)
 * V2 - 修正了路径切换逻辑，完全复刻参考文件的交互行为
 * ==========================================================================
 */
const TalentTree = (() => {
    // 【新增】模块级变量，用于存储当前职业的key，解决图标路径问题
    let currentClassKey = 'ranger'; 

    // --- 模块私有变量 ---

    
    const masterTalentData = { '21_1': { text: '攻击 +50', type: 'choice' }, '21_2': { text: '防御 +60', type: 'choice' }, '22_1': { text: '攻击 +50', type: 'choice' }, '22_2': { text: '防御 +60', type: 'choice' }, '23_1': { text: '生命 +50', type: 'mandatory' }, '24_1': { text: '攻击 +50', type: 'choice' }, '24_2': { text: '防御 +60', type: 'choice' }, '25_1': { text: '生命 +50', type: 'mandatory' }, };
    const classData = {
        'ranger': { name: '游侠', key: 'ranger', data: { '1_1': { text: '游侠天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '游侠天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '游侠天赋', type: 'mandatory' }, '8_1': { text: '防御 +3%', type: 'choice' }, '8_2': { text: '法力 +2%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '攻击 +3%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '游侠天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '游侠天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '生命 +3%', type: 'choice' }, '19_2': { text: '治疗 +2%', type: 'choice' }, '20_1': { text: '暴击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '游侠终极天赋', type: 'mandatory' } } },
        'fighter': { name: '战士', key: 'fighter', data: { '1_1': { text: '战士天赋', type: 'mandatory' }, '2_1': { text: '防御 +18', type: 'choice' }, '2_2': { text: '攻击 +15', type: 'choice' }, '3_1': { text: '攻击 +15', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '战士天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '防御 +18', type: 'choice' }, '6_1': { text: '攻击 +15', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '战士天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '治疗 +2%', type: 'choice' }, '9_1': { text: '防御 +18', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '防御 +3%', type: 'mandatory' }, '11_1': { text: '攻击 +15', type: 'choice' }, '11_2': { text: '防御 +18', type: 'choice' }, '12_1': { text: '战士天赋', type: 'mandatory' }, '13_1': { text: '防御 +18', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '攻击 +15', type: 'choice' }, '15_1': { text: '战士天赋', type: 'mandatory' }, '16_1': { text: '攻击 +15', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '防御 +18', type: 'choice' }, '17_2': { text: '攻击 +15', type: 'choice' }, '18_1': { text: '防御 +18', type: 'mandatory' }, '19_1': { text: '法力 +2%', type: 'choice' }, '19_2': { text: '暴击 +2%', type: 'choice' }, '20_1': { text: '攻击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '战士终极天赋', type: 'mandatory' } } },
        'paladin': { name: '圣骑士', key: 'paladin', data: { '1_1': { text: '圣骑天赋', type: 'mandatory' }, '2_1': { text: '防御 +18', type: 'choice' }, '2_2': { text: '攻击 +15', type: 'choice' }, '3_1': { text: '攻击 +15', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '圣骑天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '防御 +18', type: 'choice' }, '6_1': { text: '攻击 +15', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '圣骑天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '治疗 +2%', type: 'choice' }, '9_1': { text: '防御 +18', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '攻击 +3%', type: 'mandatory' }, '11_1': { text: '攻击 +15', type: 'choice' }, '11_2': { text: '防御 +18', type: 'choice' }, '12_1': { text: '圣骑天赋', type: 'mandatory' }, '13_1': { text: '防御 +18', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '攻击 +15', type: 'choice' }, '15_1': { text: '圣骑天赋', type: 'mandatory' }, '16_1': { text: '攻击 +15', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '防御 +18', type: 'choice' }, '17_2': { text: '攻击 +15', type: 'choice' }, '18_1': { text: '防御 +18', type: 'mandatory' }, '19_1': { text: '法力 +2%', type: 'choice' }, '19_2': { text: '暴击 +2%', type: 'choice' }, '20_1': { text: '防御 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '圣骑士终极天赋', type: 'mandatory' } } },
        'barbarian': { name: '野蛮人', key: 'barbarian', data: { '1_1': { text: '野蛮人天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '生命 +36', type: 'choice' }, '3_1': { text: '生命 +36', type: 'choice' }, '3_2': { text: '防御 +18', type: 'choice' }, '4_1': { text: '野蛮人天赋', type: 'mandatory' }, '5_1': { text: '防御 +18', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '生命 +36', type: 'choice' }, '6_2': { text: '防御 +18', type: 'choice' }, '7_1': { text: '野蛮人天赋', type: 'mandatory' }, '8_1': { text: '治疗 +2%', type: 'choice' }, '8_2': { text: '攻击 +3%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '防御 +18', type: 'choice' }, '10_1': { text: '暴击 +2%', type: 'mandatory' }, '11_1': { text: '生命 +36', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '野蛮人天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '防御 +18', type: 'choice' }, '14_1': { text: '防御 +18', type: 'choice' }, '14_2': { text: '生命 +36', type: 'choice' }, '15_1': { text: '野蛮人天赋', type: 'mandatory' }, '16_1': { text: '生命 +36', type: 'choice' }, '16_2': { text: '防御 +18', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '生命 +36', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '法力 +2%', type: 'choice' }, '19_2': { text: '防御 +3%', type: 'choice' }, '20_1': { text: '生命 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '野蛮人终极天赋', type: 'mandatory' } } },
        'cleric': { name: '牧师', key: 'cleric', data: { '1_1': { text: '牧师天赋', type: 'mandatory' }, '2_1': { text: '生命 +36', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '攻击 +15', type: 'choice' }, '4_1': { text: '牧师天赋', type: 'mandatory' }, '5_1': { text: '攻击 +15', type: 'choice' }, '5_2': { text: '生命 +36', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '攻击 +15', type: 'choice' }, '7_1': { text: '牧师天赋', type: 'mandatory' }, '8_1': { text: '攻击 +3%', type: 'choice' }, '8_2': { text: '防御 +3%', type: 'choice' }, '9_1': { text: '生命 +36', type: 'choice' }, '9_2': { text: '攻击 +15', type: 'choice' }, '10_1': { text: '生命 +3%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '生命 +36', type: 'choice' }, '12_1': { text: '牧师天赋', type: 'mandatory' }, '13_1': { text: '生命 +36', type: 'choice' }, '13_2': { text: '攻击 +15', type: 'choice' }, '14_1': { text: '攻击 +15', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '牧师天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '攻击 +15', type: '' }, '17_1': { text: '生命 +36', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '生命 +36', type: 'mandatory' }, '19_1': { text: '暴击 +2%', type: 'choice' }, '19_2': { text: '法力 +2%', type: 'choice' }, '20_1': { text: '治疗 +2%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '牧师终极天赋', type: 'mandatory' } } },
        'druid': { name: '德鲁伊', key: 'druid', data: { '1_1': { text: '德鲁伊天赋', type: 'mandatory' }, '2_1': { text: '生命 +36', type: 'choice' }, '2_2': { text: '攻击 +15', type: 'choice' }, '3_1': { text: '攻击 +15', type: 'choice' }, '3_2': { text: '防御 +18', type: 'choice' }, '4_1': { text: '德鲁伊天赋', type: 'mandatory' }, '5_1': { text: '防御 +18', type: 'choice' }, '5_2': { text: '生命 +36', type: 'choice' }, '6_1': { text: '攻击 +15', type: 'choice' }, '6_2': { text: '防御 +18', type: 'choice' }, '7_1': { text: '德鲁伊天赋', type: 'mandatory' }, '8_1': { text: '治疗 +2%', type: 'choice' }, '8_2': { text: '攻击 +3%', type: 'choice' }, '9_1': { text: '生命 +36', type: 'choice' }, '9_2': { text: '防御 +18', type: 'choice' }, '10_1': { text: '生命 +3%', type: 'mandatory' }, '11_1': { text: '攻击 +15', type: 'choice' }, '11_2': { text: '生命 +36', type: 'choice' }, '12_1': { text: '德鲁伊天赋', type: 'mandatory' }, '13_1': { text: '生命 +36', type: 'choice' }, '13_2': { text: '防御 +18', type: 'choice' }, '14_1': { text: '防御 +18', type: 'choice' }, '14_2': { text: '攻击 +15', type: 'choice' }, '15_1': { text: '德鲁伊天赋', type: 'mandatory' }, '16_1': { text: '攻击 +15', type: 'choice' }, '16_2': { text: '防御 +18', type: 'choice' }, '17_1': { text: '生命 +36', type: 'choice' }, '17_2': { text: '攻击 +15', type: 'choice' }, '18_1': { text: '生命 +36', type: 'mandatory' }, '19_1': { text: '暴击 +2%', type: 'choice' }, '19_2': { text: '防御 +3%', type: 'choice' }, '20_1': { text: '法力 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '德鲁伊终极天赋', type: 'mandatory' } } },
        'monk': { name: '僧侣', key: 'monk', data: { '1_1': { text: '僧侣天赋', type: 'mandatory' }, '2_1': { text: '生命 +36', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '攻击 +15', type: 'choice' }, '4_1': { text: '僧侣天赋', type: 'mandatory' }, '5_1': { text: '攻击 +15', type: 'choice' }, '5_2': { text: '生命 +36', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '攻击 +15', type: 'choice' }, '7_1': { text: '僧侣天赋', type: 'mandatory' }, '8_1': { text: '防御 +3%', type: 'choice' }, '8_2': { text: '生命 +3%', type: 'choice' }, '9_1': { text: '生命 +36', type: 'choice' }, '9_2': { text: '攻击 +15', type: 'choice' }, '10_1': { text: '暴击 +2%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '生命 +36', type: 'choice' }, '12_1': { text: '僧侣天赋', type: 'mandatory' }, '13_1': { text: '生命 +36', type: 'choice' }, '13_2': { text: '攻击 +15', type: 'choice' }, '14_1': { text: '攻击 +15', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '僧侣天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '攻击 +15', type: 'choice' }, '17_1': { text: '生命 +36', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '生命 +36', type: 'mandatory' }, '19_1': { text: '治疗 +2%', type: 'choice' }, '19_2': { text: '攻击 +3%', type: 'choice' }, '20_1': { text: '法力 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '僧侣终极天赋', type: 'mandatory' } } },
        'rogue': { name: '盗贼', key: 'rogue', data: { '1_1': { text: '盗贼天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '生命 +36', type: 'choice' }, '3_1': { text: '生命 +36', type: 'choice' }, '3_2': { text: '防御 +18', type: 'choice' }, '4_1': { text: '盗贼天赋', type: 'mandatory' }, '5_1': { text: '防御 +18', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '生命 +36', type: 'choice' }, '6_2': { text: '防御 +18', type: 'choice' }, '7_1': { text: '盗贼天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '法力 +2%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '防御 +18', type: 'choice' }, '10_1': { text: '攻击 +3%', type: 'mandatory' }, '11_1': { text: '生命 +36', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '盗贼天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '防御 +18', type: 'choice' }, '14_1': { text: '防御 +18', type: 'choice' }, '14_2': { text: '生命 +36', type: 'choice' }, '15_1': { text: '盗贼天赋', type: 'mandatory' }, '16_1': { text: '生命 +36', type: 'choice' }, '16_2': { text: '防御 +18', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '生命 +36', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '防御 +3%', type: 'choice' }, '19_2': { text: '治疗 +2%', type: 'choice' }, '20_1': { text: '暴击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '盗贼终极天赋', type: 'mandatory' } } },
        'sorcerer': { name: '术士', key: 'sorcerer', data: { '1_1': { text: '术士天赋', type: 'mandatory' }, '2_1': { text: '防御 +18', type: 'choice' }, '2_2': { text: '生命 +36', type: 'choice' }, '3_1': { text: '生命 +36', type: 'choice' }, '3_2': { text: '攻击 +15', type: 'choice' }, '4_1': { text: '术士天赋', type: 'mandatory' }, '5_1': { text: '攻击 +15', type: 'choice' }, '5_2': { text: '防御 +18', type: 'choice' }, '6_1': { text: '生命 +36', type: 'choice' }, '6_2': { text: '攻击 +15', type: 'choice' }, '7_1': { text: '术士天赋', type: 'mandatory' }, '8_1': { text: '治疗 +2%', type: 'choice' }, '8_2': { text: '暴击 +2%', type: 'choice' }, '9_1': { text: '防御 +18', type: 'choice' }, '9_2': { text: '攻击 +15', type: 'choice' }, '10_1': { text: '生命 +3%', type: 'mandatory' }, '11_1': { text: '生命 +36', type: 'choice' }, '11_2': { text: '防御 +18', type: 'choice' }, '12_1': { text: '术士天赋', type: 'mandatory' }, '13_1': { text: '防御 +18', type: 'choice' }, '13_2': { text: '攻击 +15', type: 'choice' }, '14_1': { text: '攻击 +15', type: 'choice' }, '14_2': { text: '生命 +36', type: 'choice' }, '15_1': { text: '术士天赋', type: 'mandatory' }, '16_1': { text: '生命 +36', type: 'choice' }, '16_2': { text: '攻击 +15', type: 'choice' }, '17_1': { text: '防御 +18', type: 'choice' }, '17_2': { text: '生命 +36', type: 'choice' }, '18_1': { text: '防御 +18', type: 'mandatory' }, '19_1': { text: '攻击 +3%', type: 'choice' }, '19_2': { text: '防御 +3%', type: 'choice' }, '20_1': { text: '法力 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '术士终极天赋', type: 'mandatory' } } },
        'wizard': { name: '巫师', key: 'wizard', data: { '1_1': { text: '巫师天赋', type: 'mandatory' }, '2_1': { text: '攻击 +15', type: 'choice' }, '2_2': { text: '防御 +18', type: 'choice' }, '3_1': { text: '防御 +18', type: 'choice' }, '3_2': { text: '生命 +36', type: 'choice' }, '4_1': { text: '巫师天赋', type: 'mandatory' }, '5_1': { text: '生命 +36', type: 'choice' }, '5_2': { text: '攻击 +15', type: 'choice' }, '6_1': { text: '防御 +18', type: 'choice' }, '6_2': { text: '生命 +36', type: 'choice' }, '7_1': { text: '巫师天赋', type: 'mandatory' }, '8_1': { text: '生命 +3%', type: 'choice' }, '8_2': { text: '防御 +3%', type: 'choice' }, '9_1': { text: '攻击 +15', type: 'choice' }, '9_2': { text: '生命 +36', type: 'choice' }, '10_1': { text: '暴击 +2%', type: 'mandatory' }, '11_1': { text: '防御 +18', type: 'choice' }, '11_2': { text: '攻击 +15', type: 'choice' }, '12_1': { text: '巫师天赋', type: 'mandatory' }, '13_1': { text: '攻击 +15', type: 'choice' }, '13_2': { text: '生命 +36', type: 'choice' }, '14_1': { text: '生命 +36', type: 'choice' }, '14_2': { text: '防御 +18', type: 'choice' }, '15_1': { text: '巫师天赋', type: 'mandatory' }, '16_1': { text: '防御 +18', type: 'choice' }, '16_2': { text: '生命 +36', type: 'choice' }, '17_1': { text: '攻击 +15', type: 'choice' }, '17_2': { text: '防御 +18', type: 'choice' }, '18_1': { text: '攻击 +15', type: 'mandatory' }, '19_1': { text: '治疗 +2%', type: 'choice' }, '19_2': { text: '法力 +2%', type: 'choice' }, '20_1': { text: '攻击 +4%', type: 'mandatory' }, ...masterTalentData, '26_1': { text: '巫师终极天赋', type: 'mandatory' } } }
    };
    let talentData = {};
    let selectedNodes = new Set();
    let currentContainer = null;
    let onStatsChangeCallback = () => { };
    let talentTermsDict = {}; // 【新增】用于存储当前语言的天赋术语字典
    // 给"三围属性点"定价的尺子，只用来把 `+15` 与 `+3%` 放到同一量纲上比大小
    // ⚠ 不是战力口径：游戏里天赋每点的战力是**固定加成**（见 filters.js::calculateHeroStats 的
    //   `talent_power = 点数 × 5`，且战力只吃天赋前的三围）⇒ 这里的系数与选路无关的战力互不影响。
    const VALUE_WEIGHT = { '攻击': 0.35, '防御': 0.28, '生命': 0.14 };
    const UTIL_VALUE_PER_PCT = 0.5;   // 法力/治疗/暴击不进三围 ⇒ 每 1% 记这个名义值
    let currentTierStats = null;   // 当前档位（破限+服装、天赋前）的三围，供节点估值与提示用


    // --- 内部辅助函数 ---

    function _setupTalentData(classKey) {
        // 【修正】当设置天赋数据时，同时在模块变量中保存当前职业的key
        currentClassKey = classKey;
        if (!classData[classKey]) {
            console.error(`未找到职业 '${classKey}' 的天赋数据`);
            talentData = {};
            return;
        }
        talentData = JSON.parse(JSON.stringify(classData[classKey].data));
        const baseUnlocks = { '1_1': ['2_1', '2_2'], '2_1': ['3_1'], '2_2': ['3_2'], '3_1': ['4_1'], '3_2': ['4_1'], '4_1': ['5_1', '5_2'], '5_1': ['6_1'], '5_2': ['6_2'], '6_1': ['7_1'], '6_2': ['7_1'], '7_1': ['8_1', '8_2'], '8_1': ['9_1'], '8_2': ['9_2'], '9_1': ['10_1'], '9_2': ['10_1'], '10_1': ['11_1', '11_2'], '11_1': ['12_1'], '11_2': ['12_1'], '12_1': ['13_1', '13_2'], '13_1': ['14_1'], '13_2': ['14_2'], '14_1': ['15_1'], '14_2': ['15_1'], '15_1': ['16_1', '16_2'], '16_1': ['17_1'], '16_2': ['17_2'], '17_1': ['18_1'], '17_2': ['18_1'], '18_1': ['19_1', '19_2'], '19_1': ['20_1'], '19_2': ['20_1'], '20_1': ['21_1', '21_2'], '21_1': ['22_1'], '21_2': ['22_2'], '22_1': ['23_1'], '22_2': ['23_1'], '23_1': ['24_1', '24_2'], '24_1': ['25_1'], '24_2': ['25_1'], '25_1': ['26_1'], '26_1': [] };
        const basePrereqs = { '1_1': null, '2_1': ['1_1'], '2_2': ['1_1'], '3_1': ['2_1'], '3_2': ['2_2'], '4_1': ['3_1', '3_2'], '5_1': ['4_1'], '5_2': ['4_1'], '6_1': ['5_1'], '6_2': ['5_2'], '7_1': ['6_1', '6_2'], '8_1': ['7_1'], '8_2': ['7_1'], '9_1': ['8_1'], '9_2': ['8_2'], '10_1': ['9_1', '9_2'], '11_1': ['10_1'], '11_2': ['10_1'], '12_1': ['11_1', '11_2'], '13_1': ['12_1'], '13_2': ['12_1'], '14_1': ['13_1'], '14_2': ['13_2'], '15_1': ['14_1', '14_2'], '16_1': ['15_1'], '16_2': ['15_1'], '17_1': ['16_1'], '17_2': ['16_2'], '18_1': ['17_1', '17_2'], '19_1': ['18_1'], '19_2': ['18_1'], '20_1': ['19_1', '19_2'], '21_1': ['20_1'], '21_2': ['20_1'], '22_1': ['21_1'], '22_2': ['21_2'], '23_1': ['22_1', '22_2'], '24_1': ['23_1'], '24_2': ['23_1'], '25_1': ['24_1', '24_2'], '26_1': ['25_1'] };
        const basePositions = { '1_1': { level: 1, index: 0 }, '2_1': { level: 2, index: 0 }, '2_2': { level: 2, index: 1 }, '3_1': { level: 3, index: 0 }, '3_2': { level: 3, index: 1 }, '4_1': { level: 4, index: 0 }, '5_1': { level: 5, index: 0 }, '5_2': { level: 5, index: 1 }, '6_1': { level: 6, index: 0 }, '6_2': { level: 6, index: 1 }, '7_1': { level: 7, index: 0 }, '8_1': { level: 8, index: 0 }, '8_2': { level: 8, index: 1 }, '9_1': { level: 9, index: 0 }, '9_2': { level: 9, index: 1 }, '10_1': { level: 10, index: 0 }, '11_1': { level: 11, index: 0 }, '11_2': { level: 11, index: 1 }, '12_1': { level: 12, index: 0 }, '13_1': { level: 13, index: 0 }, '13_2': { level: 13, index: 1 }, '14_1': { level: 14, index: 0 }, '14_2': { level: 14, index: 1 }, '15_1': { level: 15, index: 0 }, '16_1': { level: 16, index: 0 }, '16_2': { level: 16, index: 1 }, '17_1': { level: 17, index: 0 }, '17_2': { level: 17, index: 1 }, '18_1': { level: 18, index: 0 }, '19_1': { level: 19, index: 0 }, '19_2': { level: 19, index: 1 }, '20_1': { level: 20, index: 0 }, '21_1': { level: 21, index: 0 }, '21_2': { level: 21, index: 1 }, '22_1': { level: 22, index: 0 }, '22_2': { level: 22, index: 1 }, '23_1': { level: 23, index: 0 }, '24_1': { level: 24, index: 0 }, '24_2': { level: 24, index: 1 }, '25_1': { level: 25, index: 0 }, '26_1': { level: 26, index: 0 } };
        Object.keys(talentData).forEach(nodeId => {
            talentData[nodeId].id = nodeId;
            talentData[nodeId].unlocks = baseUnlocks[nodeId];
            talentData[nodeId].prereq = basePrereqs[nodeId];
            talentData[nodeId].position = basePositions[nodeId];
        });
    }

    function _calculateBonuses() {
        const bonuses = {
            attack_flat: 0, defense_flat: 0, health_flat: 0,
            attack_percent: 0, defense_percent: 0, health_percent: 0,
            mana_percent: 0, healing_percent: 0, crit_percent: 0
        };
        selectedNodes.forEach(nodeId => {
            const nodeText = talentData[nodeId]?.text || '';
            const parts = nodeText.split(' ');
            if (parts.length < 2) return;
            const statName = parts[0];
            const valueStr = parts[1];
            const value = parseInt(valueStr.replace(/[+%]/g, ''));
            if (isNaN(value)) return;
            if (nodeText.includes('%')) {
                if (statName === '攻击') bonuses.attack_percent += value;
                else if (statName === '防御') bonuses.defense_percent += value;
                else if (statName === '生命') bonuses.health_percent += value;
                else if (statName === '法力') bonuses.mana_percent += value;
                else if (statName === '治疗') bonuses.healing_percent += value;
                else if (statName === '暴击') bonuses.crit_percent += value;
            } else {
                if (statName === '攻击') bonuses.attack_flat += value;
                else if (statName === '防御') bonuses.defense_flat += value;
                else if (statName === '生命') bonuses.health_flat += value;
            }
        });
        return bonuses;
    }

    function _updateUI() {
        if (selectedNodes.has('25_1')) {
            selectedNodes.add('26_1');
        }
        Object.keys(talentData).forEach(nodeId => {
            const nodeElement = currentContainer.querySelector(`#node-${nodeId}`);
            if (!nodeElement) return;
            const isSelected = selectedNodes.has(nodeId);
            nodeElement.classList.toggle('selected', isSelected);
            // 百分比节点的提示里补「这一档 ≈ +多少点」⇒ 与固定值节点可直接比较
            const p = _parseText(talentData[nodeId].text);
            const abs = (p && p.isPercent && VALUE_WEIGHT[p.stat]) ? _absGainOf(talentData[nodeId].text, currentTierStats) : 0;
            nodeElement.title = _getTranslatedNodeText(talentData[nodeId])
                + (abs >= 1 ? ' ≈ +' + Math.round(abs) : '');
        });
        currentContainer.querySelectorAll('.connector').forEach(conn => {
            const [startId, endId] = conn.dataset.connects.split('-');
            const isConnActive = selectedNodes.has(startId) && selectedNodes.has(endId) && talentData[endId].prereq.includes(startId);
            conn.classList.toggle('active', isConnActive);
        });

        // 【修正】回调时，同时传递属性加成对象和已选择的节点数量
        let spendablePoints = selectedNodes.size;
        if (selectedNodes.has('26_1')) {
            spendablePoints--; // 最终天赋节点不计入消耗
        }
        onStatsChangeCallback(_calculateBonuses(), spendablePoints);
    }

    // ---【逻辑复刻】从参考文件完整移植的交互逻辑函数 ---

    const _findForkNode = (startNodeId) => {
        let q = [startNodeId];
        let visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            const node = talentData[currentId];
            if (!node.prereq) return talentData['1_1'];
            for (const parentId of node.prereq) {
                if (talentData[parentId].type === 'mandatory') return talentData[parentId];
                if (!visited.has(parentId)) { visited.add(parentId); q.push(parentId); }
            }
        }
        return talentData['1_1'];
    };

    const _findMergeNode = (startNodeId) => {
        let q = [startNodeId];
        let visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            const node = talentData[currentId];
            if (!node.unlocks || node.unlocks.length === 0) return null;
            for (const childId of node.unlocks) {
                if (talentData[childId].type === 'mandatory') return talentData[childId];
                if (!visited.has(childId)) { visited.add(childId); q.push(childId); }
            }
        }
        return null;
    };

    const _getSmartPath = (targetNodeId) => {
        // 【核心修正】使用递归算法，智能寻找连接到已选节点的最短路径

        // 内部递归辅助函数
        function findShortestPath(nodeId) {
            // 基本情况1: 如果当前节点已经是亮的，我们找到了连接点，返回路径
            if (selectedNodes.has(nodeId)) {
                return [nodeId];
            }

            const nodeInfo = talentData[nodeId];
            // 基本情况2: 如果到达了根节点（没有父节点），返回路径
            if (!nodeInfo || !nodeInfo.prereq) {
                return [nodeId];
            }

            let bestPath = null;

            // 探索所有父路径
            for (const parentId of nodeInfo.prereq) {
                const subPath = findShortestPath(parentId);
                if (subPath) {
                    // 如果找到了第一条路径，或者找到了更短的路径，则更新最佳路径
                    if (bestPath === null || subPath.length < bestPath.length) {
                        bestPath = subPath;
                    }
                }
            }

            // 将当前节点添加到最佳路径的前面并返回
            if (bestPath) {
                return [nodeId, ...bestPath];
            }
            return null; // 理论上不应发生，因为总能回到根节点
        }

        const foundPath = findShortestPath(targetNodeId);
        return new Set(foundPath || []);
    };

    const _findGuidedSegment = (forkNode, mergeNode, viaNodeId) => {
        const segment = new Set();
        let q = [viaNodeId];
        let visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            if (currentId === forkNode.id) break;
            segment.add(currentId);
            if (talentData[currentId].prereq) {
                talentData[currentId].prereq.forEach(p => {
                    if (!visited.has(p)) { visited.add(p); q.push(p); }
                });
            }
        }
        q = [viaNodeId];
        visited = new Set(q);
        while (q.length > 0) {
            const currentId = q.shift();
            if (currentId === mergeNode.id) break;
            segment.add(currentId);
            if (talentData[currentId].unlocks) {
                talentData[currentId].unlocks.forEach(c => {
                    if (!visited.has(c)) { visited.add(c); q.push(c); }
                });
            }
        }
        return segment;
    }

    function _handleNodeClick(clickedNodeId) {
        if (clickedNodeId === '26_1') return;

        if (selectedNodes.has(clickedNodeId)) {
            const nodesToDeselect = new Set();
            const queue = [clickedNodeId];
            const visited = new Set(queue);
            while (queue.length > 0) {
                const currentId = queue.shift();
                nodesToDeselect.add(currentId);
                talentData[currentId].unlocks.forEach(childId => {
                    if (selectedNodes.has(childId) && !visited.has(childId)) {
                        visited.add(childId);
                        queue.push(childId);
                    }
                });
            }
            nodesToDeselect.forEach(id => selectedNodes.delete(id));
            _updateUI();
            return;
        }

        const clickedNode = talentData[clickedNodeId];
        let isSwitchOperation = false;
        if (clickedNode.type === 'choice') {
            const forkNode = _findForkNode(clickedNodeId);
            const mergeNode = _findMergeNode(clickedNodeId);
            if (forkNode && mergeNode) {
                const q = [...forkNode.unlocks];
                const visited = new Set(q);
                while (q.length > 0) {
                    const currentId = q.shift();
                    if (currentId === mergeNode.id) continue;
                    if (selectedNodes.has(currentId)) { isSwitchOperation = true; break; }
                    if (talentData[currentId] && talentData[currentId].unlocks) {
                        talentData[currentId].unlocks.forEach(childId => {
                            if (!visited.has(childId)) { visited.add(childId); q.push(childId); }
                        });
                    }
                }
            }
        }
        if (isSwitchOperation) {
            const forkNode = _findForkNode(clickedNodeId);
            const mergeNode = _findMergeNode(clickedNodeId);
            const nodesToClear = new Set();
            const q = [...forkNode.unlocks];
            const visited = new Set(q);
            while (q.length > 0) {
                const currentId = q.shift();
                if (currentId === mergeNode.id) continue;
                nodesToClear.add(currentId);
                if (talentData[currentId] && talentData[currentId].unlocks) {
                    talentData[currentId].unlocks.forEach(childId => {
                        if (!visited.has(childId)) { visited.add(childId); q.push(childId); }
                    });
                }
            }
            nodesToClear.forEach(id => selectedNodes.delete(id));
            if (mergeNode && selectedNodes.has(mergeNode.id)) {
                const newSegment = _findGuidedSegment(forkNode, mergeNode, clickedNodeId);
                newSegment.forEach(id => selectedNodes.add(id));
            } else {
                const pathToClickedNode = _getSmartPath(clickedNodeId);
                pathToClickedNode.forEach(id => selectedNodes.add(id));
            }
        } else {
            const fullPath = _getSmartPath(clickedNodeId);
            fullPath.forEach(id => selectedNodes.add(id));
        }

        _updateUI();
    }


    /**
     * 【已修正】根据策略自动选择天赋路径，并根据天赋等级进行裁剪
     * @param {string} strategy - 策略字符串, e.g., 'atk-def-hp'
     * @param {boolean} manaPriority - 是否优先选择法力
     * @param {string} talentLevel - 天赋等级 ('none', 'talent20', 'talent25')
     */
    /** 节点文本 → `{stat, value, isPercent}`；文本形如 `攻击 +15` / `防御 +3%`。 */
    function _parseText(text) {
        const m = String(text || '').match(/^(攻击|防御|生命|法力|治疗|暴击)\s*\+?(\d+)\s*(%)?$/);
        return m ? { stat: m[1], value: parseInt(m[2], 10), isPercent: m[3] === '%' } : null;
    }

    /** 百分比折算成**属性点数**（固定值节点即其本身；法力/治疗/暴击 ⇒ 0）。缺档位三围时按 0 计。 */
    function _absGainOf(text, tierStats) {
        const p = _parseText(text);
        if (!p || !VALUE_WEIGHT[p.stat]) return 0;
        if (!p.isPercent) return p.value;
        if (!tierStats) return 0;
        const cur = p.stat === '攻击' ? tierStats.attack : p.stat === '防御' ? tierStats.defense : tierStats.health;
        return (cur || 0) * p.value / 100;
    }

    /**
     * 单条文本在**当前档位属性**下的估值（自动路径打分与节点提示都用它）。
     * 量纲 = 属性点（三围按 `VALUE_WEIGHT` 定价，与战力公式系数同值但只作比较尺子用）：
     * 固定值节点 = 值 × 系数；百分比节点 = 档位属性 × %/100 × 系数
     * （5★LB2 攻击 1704 的 +3% ⇒ 51.1×0.35 = 17.9，远高于「攻击 +15」的 5.25 ⇒ 高攻英雄该选百分比）。
     * 法力/治疗/暴击不进战力公式 ⇒ 每 1% 记 `UTIL_VALUE_PER_PCT`。
     * @param {string} text 节点文本
     * @param {{attack?:number,defense?:number,health?:number}|null} tierStats 破限/服装之后、天赋之前的三围
     */
    function _powerGainOf(text, tierStats) {
        const p = _parseText(text);
        if (!p) return 0;
        if (VALUE_WEIGHT[p.stat]) return _absGainOf(text, tierStats) * VALUE_WEIGHT[p.stat];
        return p.isPercent ? p.value * UTIL_VALUE_PER_PCT : 0;
    }

    /** 取某职业下某节点的文本（不改动当前职业状态 ⇒ 供 `nodeGain` 这种旁路查询用）。 */
    function _nodeTextOf(classKey, nodeId) {
        return ((classData[classKey] || {}).data || {})[nodeId]?.text || '';
    }

    /**
     * 恢复「用户手动点出来」的路径（切平衡数据等**原地重渲染**要保住它，否则手动状态被自动路径顶掉）。
     * **完全保留**：不按天赋档位裁剪 ⇒ 树里有什么就是什么（档位下拉与树不一致时以树为准）。
     * @param {string[]} nodeIds
     * @returns {boolean} 是否恢复成功（一个都不认 ⇒ 调用方退回自动路径）
     */
    function _restoreNodes(nodeIds) {
        const ids = (nodeIds || []).filter(id => talentData[id]);
        if (!ids.length) return false;
        selectedNodes = new Set(ids);
        return true;
    }

    /**
     * 自动路径（**纯函数**，不碰树的状态；调用方需要"和当前树比一比"时也能用）。
     * 每个分叉选「策略优先级 × 该档位的属性估值」更大的一边。
     * ⚠ 只按属性种类打分（旧实现）会让 `攻击 +3%` 与 `攻击 +15` 同分 ⇒ 恒选左边；
     *   5★ 的 3% 远高于 15，而 1~3★ 反之 ⇒ 必须带当前档位属性来比。
     * 选路只改动三围加成，**不动战力**（战力 = 天赋前三围 + 每点固定 5，见 filters.js）。
     * @param {string} strategy 形如 'atk-hp-def'
     * @param {boolean} manaPriority
     * @param {string} talentLevel 'none' | 'talent20' | 'talent25'
     * @param {{attack:number,defense:number,health:number}|null} tierStats 缺省时退回旧的"按种类打分"口径
     * @returns {Set<string>}
     */
    function _computeAutoPath(strategy, manaPriority, talentLevel, tierStats) {
        const picked = new Set();
        // 如果是“无天赋”，则直接返回一个空路径
        if (talentLevel === 'none') {
            return picked;
        }

        const weights = { '攻击': 0, '防御': 0, '生命': 0, '法力': 0.5, '治疗': 0, '暴击': 0 };
        const parts = strategy.split('-');
        const statMap = { atk: '攻击', def: '防御', hp: '生命' };
        weights[statMap[parts[0]]] = 4;
        weights[statMap[parts[1]]] = 2;
        weights[statMap[parts[2]]] = 1;
        if (manaPriority) {
            weights['法力'] = 8;
        }

        const getNodeScore = (nodeId) => {
            const match = String(talentData[nodeId]?.text || '').match(/^(攻击|防御|生命|法力|治疗|暴击)/);
            if (!match) return 0;
            const w = weights[match[1]] || 0;
            if (!w) return 0;
            if (!tierStats) return w;
            return w * _powerGainOf(talentData[nodeId]?.text, tierStats);
        };

        // 总是先计算出完整的25天赋路径
        const mandatoryNodes = Object.keys(talentData).filter(id => talentData[id].type === 'mandatory');
        mandatoryNodes.forEach(id => picked.add(id));

        const segments = [
            { path1: ['2_1', '3_1'], path2: ['2_2', '3_2'] }, { path1: ['5_1', '6_1'], path2: ['5_2', '6_2'] },
            { path1: ['8_1', '9_1'], path2: ['8_2', '9_2'] }, { path1: ['11_1'], path2: ['11_2'] },
            { path1: ['13_1', '14_1'], path2: ['13_2', '14_2'] }, { path1: ['16_1', '17_1'], path2: ['16_2', '17_2'] },
            { path1: ['19_1'], path2: ['19_2'] }, { path1: ['21_1', '22_1'], path2: ['21_2', '22_2'] },
            { path1: ['24_1'], path2: ['24_2'] },
        ];

        segments.forEach(seg => {
            const score1 = seg.path1.reduce((acc, id) => acc + getNodeScore(id), 0);
            const score2 = seg.path2.reduce((acc, id) => acc + getNodeScore(id), 0);
            const winningPath = (score1 >= score2) ? seg.path1 : seg.path2;
            winningPath.forEach(id => picked.add(id));
        });

        // 【新增逻辑】如果选择的是20天赋，则移除所有20级以后的节点
        if (talentLevel === 'talent20') {
            const nodesToRemove = [];
            for (const nodeId of picked) {
                const level = parseInt(nodeId.split('_')[0]);
                if (level > 20) {
                    nodesToRemove.push(nodeId);
                }
            }
            nodesToRemove.forEach(id => picked.delete(id));
        }
        return picked;
    }

    function _applyAutoPath(strategy, manaPriority, talentLevel, tierStats) {
        selectedNodes = _computeAutoPath(strategy, manaPriority, talentLevel, tierStats);
    }

    function _createTreeHTML() {
        if (!currentContainer) return;
        const treeDiv = document.createElement('div');
        treeDiv.className = 'talent-tree';
        const levels = {};
        let maxLevel = 0;
        Object.values(talentData).forEach(node => {
            const level = node.position.level;
            if (!levels[level]) levels[level] = [];
            levels[level].push(node);
            if (level > maxLevel) maxLevel = level;
        });
        for (let i = 1; i <= maxLevel; i++) {
            const levelNodes = levels[i] || [];
            const levelDiv = document.createElement('div');
            levelDiv.className = 'talent-tree-level';
            const leftNode = levelNodes.find(n => n.position.index === 0);
            const rightNode = levelNodes.find(n => n.position.index === 1);
            const leftWrapper = document.createElement('div');
            leftWrapper.className = 'node-wrapper';
            if (leftNode) leftWrapper.appendChild(_createNodeDiv(leftNode.id));
            const rightWrapper = document.createElement('div');
            rightWrapper.className = 'node-wrapper';
            if (rightNode) rightWrapper.appendChild(_createNodeDiv(rightNode.id));
            if (levelNodes.length === 1 && levelNodes[0].position.index === 0) {
                levelDiv.style.justifyContent = 'center';
                levelDiv.appendChild(leftWrapper);
            } else {
                levelDiv.appendChild(leftWrapper);
                levelDiv.appendChild(rightWrapper);
            }
            treeDiv.appendChild(levelDiv);
        }
        Object.keys(talentData).forEach(nodeId => {
            const nodeInfo = talentData[nodeId];
            if (nodeInfo.unlocks) {
                nodeInfo.unlocks.forEach(targetId => {
                    const targetNodeInfo = talentData[targetId];
                    if (targetNodeInfo && targetNodeInfo.prereq && targetNodeInfo.prereq.includes(nodeId)) {
                        const conn = document.createElement('div');
                        conn.className = 'connector';
                        conn.dataset.connects = `${nodeId}-${targetId}`;
                        treeDiv.appendChild(conn);
                    }
                });
            }
        });
        currentContainer.innerHTML = '';
        currentContainer.appendChild(treeDiv);
        _positionConnectors();
    }

    function _createNodeDiv(nodeId) {
        const nodeInfo = talentData[nodeId];
        const nodeDiv = document.createElement('div');
        nodeDiv.id = `node-${nodeId}`;
        nodeDiv.className = `talent-node ${nodeInfo.type}`;

        // 【修正】调用翻译函数来生成节点的title提示文本
        nodeDiv.title = _getTranslatedNodeText(nodeInfo);

        const imageLayers = _getNodeImageLayers(nodeId, nodeInfo);
        imageLayers.forEach(layer => {
            const img = document.createElement('img');
            img.className = layer.class;
            img.src = layer.src;
            img.alt = '';
            nodeDiv.appendChild(img);
        });
        const valueText = _getNodeDisplayValue(nodeInfo);
        if (valueText) {
            const valueSpan = document.createElement('span');
            valueSpan.className = 'node-value';
            valueSpan.textContent = valueText;
            nodeDiv.appendChild(valueSpan);
        }
        nodeDiv.onclick = () => _handleNodeClick(nodeId);
        return nodeDiv;
    }

    /**
     * 【已修正】获取节点图标的图层信息
     * @param {string} nodeId 
     * @param {object} nodeInfo 
     * @returns {Array<object>}
     */
    function _getNodeImageLayers(nodeId, nodeInfo) {
        const images = [];
        const level = parseInt(nodeId.split('_')[0]);
        const text = nodeInfo.text;

        // 【核心修正】将判断条件从 <= 25 扩展为 >= 21，以包含26级的终极天赋节点
        images.push({ src: `imgs/talents/${(level >= 21) ? 'node_master' : 'node'}.webp`, class: 'node-img-base' });

        const statKeywordMap = { '攻击': 'attack.webp', '防御': 'defense.webp', '生命': 'health.webp', '法力': 'mana.webp', '治疗': 'healing.webp', '暴击': 'critical.webp' };
        let iconSrc = null;

        if (text.includes('天赋')) {
            // 使用已正确设置的 currentClassKey，确保图标路径正确
            iconSrc = `imgs/classes/${currentClassKey}.webp`;
        } else {
            for (const keyword in statKeywordMap) {
                if (text.includes(keyword)) {
                    iconSrc = `imgs/talents/${statKeywordMap[keyword]}`;
                    break;
                }
            }
        }

        if (iconSrc) {
            images.push({ src: iconSrc, class: 'node-img-overlay' });
        }
        if (text.includes('%') && !text.includes('法力') && !text.includes('暴击') && !text.includes('治疗')) {
            images.push({ src: 'imgs/talents/plus.webp', class: 'node-img-plus' });
        }
        if (nodeId === '20_1' || nodeId === '26_1') {
            images.push({ src: 'imgs/talents/final.webp', class: 'node-img-final-border' });
        }
        return images;
    }
    
    /**
     * 【新增】根据字典翻译节点描述文本
     * @param {object} nodeInfo 
     * @returns {string} 翻译后的完整节点文本
     */
    function _getTranslatedNodeText(nodeInfo) {
        if (!talentTermsDict) return nodeInfo.text; // 如果字典不存在，返回原文

        const originalText = nodeInfo.text;
        const parts = originalText.split(' ');

        if (parts.length > 1) {
            // 处理 "攻击 +15" 这样的文本
            const termKey = parts[0];
            const value = parts.slice(1).join(' ');
            const translatedTerm = talentTermsDict[termKey] || termKey;
            return `${translatedTerm} ${value}`;
        } else {
            // 处理 "游侠天赋" 这样的完整文本
            return talentTermsDict[originalText] || originalText;
        }
    }

    function _getNodeDisplayValue(nodeInfo) {
        const text = nodeInfo.text;
        if (text.includes('天赋')) return '';
        const match = text.match(/\+\s*(\d+)(%?)/);
        if (!match) return '';
        return `+${match[1]}${match[2]}`;
    }

    function _positionConnectors() {
        if (!currentContainer) return;
        setTimeout(() => {
            currentContainer.querySelectorAll('.connector').forEach(conn => {
                const [startId, endId] = conn.dataset.connects.split('-');
                const startNode = currentContainer.querySelector(`#node-${startId}`);
                const endNode = currentContainer.querySelector(`#node-${endId}`);
                if (!startNode || !endNode) { conn.style.display = 'none'; return; };
                const containerRect = currentContainer.getBoundingClientRect();
                const startRect = startNode.getBoundingClientRect();
                const endRect = endNode.getBoundingClientRect();
                const startX = startRect.left + startRect.width / 2 - containerRect.left + currentContainer.scrollLeft;
                const startY = startRect.top + startRect.height / 2 - containerRect.top + currentContainer.scrollTop;
                const endX = endRect.left + endRect.width / 2 - containerRect.left + currentContainer.scrollLeft;
                const endY = endRect.top + endRect.height / 2 - containerRect.top + currentContainer.scrollTop;
                const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                conn.style.width = `${length}px`;
                conn.style.height = '4px';
                conn.style.top = `${startY - 2}px`;
                conn.style.left = `${startX}px`;
                conn.style.transformOrigin = 'left center';
                conn.style.transform = `rotate(${angle}deg)`;
            });
        }, 100);
    }


    // --- 模块公共API ---
    return {
        init: function (container, heroClassName, settings, callback, termsDict) {
            currentContainer = container;
            onStatsChangeCallback = callback || (() => { });

            // 【修正】保存传入的翻译字典
            talentTermsDict = termsDict || {};

            const classKey = heroClassName || 'ranger';
            _setupTalentData(classKey);
            _createTreeHTML();
            // 天赋档位也要带上：只传策略/法力优先会让初始路径恒按 25 点算
            // `pinnedNodes` = 原地重渲染时要原样恢复的手动路径（见 `setPath`）
            this.setPath(settings.strategy, settings.manaPriority, settings.talent,
                settings.tierStats, settings.pinnedNodes);
            const resizeObserver = new ResizeObserver(_positionConnectors);
            resizeObserver.observe(currentContainer);
        },
        /**
         * 按策略设置天赋路径并更新UI
         * @param {string} strategy
         * @param {boolean} manaPriority
         * @param {string} talentLevel 控制路径节点数量（'none'/'talent20'/'talent25'）
         * @param {{attack:number,defense:number,health:number}|null} tierStats
         *        当前档位（破限+服装、天赋前）三围 ⇒ 百分比节点按它折算后再比大小
         * @param {string[]|null} pinnedNodes 手动点出来的路径：给了就原样恢复、**不跑自动路径**
         */
        setPath: function (strategy, manaPriority, talentLevel, tierStats, pinnedNodes) {
            currentTierStats = tierStats || null;   // 只由"树"这条路径记，列表的 getBonusesForPath 不覆盖它
            const restored = pinnedNodes && pinnedNodes.length && _restoreNodes(pinnedNodes);
            if (!restored) _applyAutoPath(strategy, manaPriority, talentLevel, tierStats);
            _updateUI();
        },
        /** 当前已选节点（含手动点出来的）——原地重渲染前用它把状态带走。 */
        getPath: function () {
            return Array.from(selectedNodes);
        },
        /**
         * 预设的自动路径（纯查询，**不动树**）——用来判断"当前树是不是被手动改过"。
         * 按树里当前那个职业的表算 ⇒ 只在弹窗开着（`init` 已跑过）时调用。
         */
        getAutoPath: function (strategy, manaPriority, talentLevel, tierStats) {
            return Array.from(_computeAutoPath(strategy, manaPriority, talentLevel, tierStats));
        },

        // 清空天赋树选择的公共方法
        clear: function () {
            selectedNodes.clear();
            _updateUI();
        },
        getBonusesForPath: function (heroClassName, strategy, manaPriority, talentLevel, tierStats) {
            const classKey = heroClassName || 'ranger';
            // 列表口径的纯函数调用 ⇒ 用完必须还原树自己的状态：`selectedNodes` 里可能有用户手点的天赋路径，
            //   `talentData/currentClassKey` 是弹窗那棵树正在用的职业表；被这里换掉后 `_updateUI`/`getPath`
            //   会读到别的职业、或把手动路径当成"没点过"。
            const keepNodes = Array.from(selectedNodes), keepData = talentData, keepClass = currentClassKey;
            _setupTalentData(classKey);
            // talentLevel/tierStats 必须一起往下传：漏掉 talentLevel 会让"20 天赋"按 25 点出加成
            _applyAutoPath(strategy, manaPriority, talentLevel, tierStats);
            const bonuses = _calculateBonuses();
            talentData = keepData; currentClassKey = keepClass; selectedNodes = new Set(keepNodes);
            return bonuses;
        },
        /**
         * 某个节点的估值（`≈ +N` 与测试/提示复用）。职业要先给，`talentData` 是按职业装的。
         * @param {string} heroClassName 如 'cleric'
         * @param {string} nodeId 如 '8_1'
         * @param {{attack:number,defense:number,health:number}|null} tierStats
         */
        nodeGain: function (heroClassName, nodeId, tierStats) {
            _setupTalentData(heroClassName || 'ranger');
            const text = _nodeTextOf(heroClassName || 'ranger', nodeId);
            return { abs: _absGainOf(text, tierStats), power: _powerGainOf(text, tierStats) };
        }
    };

})();