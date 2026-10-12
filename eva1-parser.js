// eva1-parser.js: 在浏览器端解析 E&P 玩家存档（.eva1）里的"游戏英雄列表"。
//
// 用途：用户点「打开游戏英雄列表」，选一个 .eva1 存档，本站解析出该玩家
//       已拥有的英雄（含服装），据此筛选并展示英雄列表。
//
// 容器结构（实测"玩家存档 profile"帧，与 配置数据更新/eva1_pts_decode.py 一致）：
//   [int8 1]            帧标志
//   [str8 版本]          客户端版本，如 "v381.26"
//   [keyed 对象]         baseVersion / baseHash / operations
//   [uint32 payloadLen]  载荷字节数
//   [keyed 对象]         载荷（含 heroesState 等顶层键）
//
// 两个关键点（别按通用 eva1 规则改）：
//   1. 根对象 / 载荷对象**不带 0x0B 前导**，直接以第一个键的裸长度开头。
//   2. 本帧内 T_STR32(0x09) 的**长度字段是 uint16**，不是 uint32。
//
// 英雄数据位置：
//   payload.heroesState.ownedHeroesCollection.heroIdToOwnedData
//   键 = 英雄规范 ID（与本站 characters.json / heroes_skills_*.json 的 id 一致）
//   值.advancedOwnedHeroes[].costumes[].costumeIdSuffix = 服装后缀
//   ⇒ 服装 ID = 英雄ID + "_costume_" + 后缀（与 characters.json 的服装 id 一致）

(function (global) {
    'use strict';

    // 类型码（与 eva1.py 相同）
    var END = 0xFF;
    var T_NULL = 0x00, T_FALSE = 0x01, T_TRUE = 0x02;
    var T_INT8 = 0x03, T_INT16 = 0x04, T_INT32 = 0x05, T_INT64 = 0x06;
    var T_FLOAT = 0x07;
    var T_STR8 = 0x08, T_STR32 = 0x09;
    var T_ARRAY = 0x0A, T_OBJECT = 0x0B;

    // T_STR32 长度字段字节数。玩家存档帧为 2（uint16）；
    // 老配置分片为 4 —— 解析失败时会自动换 4 再试一次。
    var STR32_LEN_BYTES = 2;

    function Eva1Error(msg) {
        this.name = 'Eva1Error';
        this.message = msg;
    }
    Eva1Error.prototype = Object.create(Error.prototype);

    // 游标读取器
    function Reader(bytes) {
        this.b = bytes;
        this.p = 0;
    }
    Reader.prototype.rbyte = function () {
        if (this.p >= this.b.length) throw new Eva1Error('unexpected eof at ' + this.p);
        return this.b[this.p++];
    };
    Reader.prototype.rd = function (n) {
        if (this.p + n > this.b.length) throw new Eva1Error('unexpected eof at ' + this.p);
        var v = this.b.subarray(this.p, this.p + n);
        this.p += n;
        return v;
    };

    // 小端整数读取（用 DataView 保证符号正确）
    var _dv = new DataView(new ArrayBuffer(8));
    function readInt(bytes, offset, size, signed) {
        // bytes 是 Uint8Array 的 subarray；逐字节填进 DataView 再取
        for (var i = 0; i < size; i++) _dv.setUint8(i, bytes[offset + i]);
        if (size === 1) return signed ? _dv.getInt8(0) : _dv.getUint8(0);
        if (size === 2) return signed ? _dv.getInt16(0, true) : _dv.getUint16(0, true);
        if (size === 4) return signed ? _dv.getInt32(0, true) : _dv.getUint32(0, true);
        // 8 字节：JS 无 int64，用两个 uint32 拼；本用途只需近似值
        var lo = _dv.getUint32(0, true), hi = _dv.getUint32(4, true);
        return hi * 4294967296 + lo;
    }

    // 读取一个"带类型字节"的值
    function readValue(r, t) {
        switch (t) {
            case T_NULL: return null;
            case T_FALSE: return false;
            case T_TRUE: return true;
            case T_INT8: return readInt(r.rd(1), 0, 1, true);
            case T_INT16: return readInt(r.rd(2), 0, 2, true);
            case T_INT32: return readInt(r.rd(4), 0, 4, true);
            case T_INT64: return readInt(r.rd(8), 0, 8, true);
            case T_FLOAT: {
                var f = r.rd(8);
                for (var i = 0; i < 8; i++) _dv.setUint8(i, f[i]);
                return _dv.getFloat64(0, true);
            }
            case T_STR8: {
                var n8 = r.rbyte();
                return utf8Decode(r.rd(n8));
            }
            case T_STR32: {
                var nb = r.rd(STR32_LEN_BYTES);
                var n = (STR32_LEN_BYTES === 2)
                    ? readInt(nb, 0, 2, false)
                    : readInt(nb, 0, 4, false);
                return utf8Decode(r.rd(n));
            }
            case T_ARRAY: {
                var items = [];
                while (true) {
                    var nt = r.rbyte();
                    if (nt === END) return items;
                    items.push(readValue(r, nt));
                }
            }
            case T_OBJECT: {
                var obj = {};
                while (true) {
                    var kb = r.rbyte();
                    if (kb === END) return obj;
                    if (kb & 0x80) throw new Eva1Error('bad key marker 0x' + kb.toString(16) + ' at ' + (r.p - 1));
                    var key = utf8Decode(r.rd(kb));
                    obj[key] = readValue(r, r.rbyte());
                }
            }
        }
        throw new Eva1Error('unknown type 0x' + t.toString(16) + ' at ' + (r.p - 1));
    }

    // 读取"无 0x0B 前导"的 keyed 根对象
    function readKeyed(r) {
        var obj = {};
        while (true) {
            var kb = r.rbyte();
            if (kb === END) return obj;
            if (kb & 0x80) throw new Eva1Error('bad root key marker 0x' + kb.toString(16) + ' at ' + (r.p - 1));
            var key = utf8Decode(r.rd(kb));
            obj[key] = readValue(r, r.rbyte());
        }
    }

    // UTF-8 解码（优先用浏览器原生 TextDecoder）
    var _dec = (typeof TextDecoder !== 'undefined') ? new TextDecoder('utf-8') : null;
    function utf8Decode(bytes) {
        if (_dec) return _dec.decode(bytes);
        // 兜底：手写 UTF-8 解码
        var s = '', i = 0;
        while (i < bytes.length) {
            var c = bytes[i++];
            if (c < 0x80) { s += String.fromCharCode(c); }
            else if (c < 0xE0) { s += String.fromCharCode(((c & 0x1F) << 6) | (bytes[i++] & 0x3F)); }
            else if (c < 0xF0) {
                s += String.fromCharCode(((c & 0x0F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F));
            } else {
                var cp = ((c & 0x07) << 18) | ((bytes[i++] & 0x3F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F);
                cp -= 0x10000;
                s += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 0x3FF));
            }
        }
        return s;
    }

    /**
     * 解码 eva1 容器。
     * @param {Uint8Array} buf
     * @returns {{flag:number, version:string, header:object, payload:object}}
     */
    function decodeContainer(buf) {
        var r = new Reader(buf);
        var flag = readValue(r, r.rbyte());
        var version = readValue(r, r.rbyte());
        var header = readKeyed(r);
        var plen = readInt(r.rd(4), 0, 4, false);
        if (r.p + plen !== buf.length) {
            throw new Eva1Error('payload 长度 ' + plen + ' 与剩余 ' + (buf.length - r.p) + ' 不一致');
        }
        var payload = readKeyed(r);
        if (r.p !== buf.length) {
            throw new Eva1Error('解析后残留 ' + (buf.length - r.p) + ' 字节');
        }
        return { flag: flag, version: version, header: header, payload: payload };
    }

    /**
     * 从已解码的 payload 提取"已拥有英雄 / 服装"ID。
     * 键名兼容两套：本站原始存档键（简写）+ 还原后的完整键名。
     * @param {object} payload
     * @returns {{heroIds:string[], costumeIds:string[], ownedIds:string[]}}
     */
    function extractOwnedIds(payload) {
        var heroIds = [];
        var costumeIds = [];
        var owned = payload
            && payload.heroesState
            && payload.heroesState.ownedHeroesCollection
            && payload.heroesState.ownedHeroesCollection.heroIdToOwnedData;
        if (!owned || typeof owned !== 'object') {
            return { heroIds: heroIds, costumeIds: costumeIds, ownedIds: [] };
        }

        var seenCostume = {};
        Object.keys(owned).forEach(function (heroId) {
            heroIds.push(heroId);
            var hero = owned[heroId];
            if (!hero || typeof hero !== 'object') return;
            // 兼容 advancedOwnedHeroes / a
            var advanced = hero.advancedOwnedHeroes || hero.a;
            if (!Array.isArray(advanced)) return;
            advanced.forEach(function (inst) {
                if (!inst || typeof inst !== 'object') return;
                var costumes = inst.costumes || inst.c;
                if (!Array.isArray(costumes)) return;
                costumes.forEach(function (cos) {
                    if (!cos || typeof cos !== 'object') return;
                    var suffix = cos.costumeIdSuffix || cos.id;
                    if (typeof suffix !== 'string' || !suffix) return;
                    var cid = heroId + '_costume_' + suffix;
                    if (seenCostume[cid]) return;
                    seenCostume[cid] = true;
                    costumeIds.push(cid);
                });
            });
        });

        return { heroIds: heroIds, costumeIds: costumeIds, ownedIds: heroIds.concat(costumeIds) };
    }

    /**
     * 解析 .eva1 的 ArrayBuffer，返回已拥有 ID 列表。
     * 自动在 STR32 长度字段为 2 / 4 两种口径间回退重试。
     * @param {ArrayBuffer} arrayBuffer
     * @returns {{heroIds:string[], costumeIds:string[], ownedIds:string[], version:string}}
     */
    function parseEva1(arrayBuffer) {
        var bytes = new Uint8Array(arrayBuffer);
        var lastErr = null;
        var lengths = [2, 4];
        for (var i = 0; i < lengths.length; i++) {
            STR32_LEN_BYTES = lengths[i];
            try {
                var out = decodeContainer(bytes);
                var ids = extractOwnedIds(out.payload);
                if (ids.heroIds.length === 0) {
                    throw new Eva1Error('存档里没有英雄数据（heroIdToOwnedData 为空）');
                }
                return {
                    heroIds: ids.heroIds,
                    costumeIds: ids.costumeIds,
                    ownedIds: ids.ownedIds,
                    version: out.version
                };
            } catch (e) {
                lastErr = e;
            }
        }
        STR32_LEN_BYTES = 2;
        throw lastErr || new Eva1Error('解析失败');
    }

    global.Eva1Parser = {
        parseEva1: parseEva1,
        decodeContainer: decodeContainer,
        extractOwnedIds: extractOwnedIds,
        Eva1Error: Eva1Error
    };
})(typeof window !== 'undefined' ? window : this);
