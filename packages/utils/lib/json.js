import deepExtend from './deepextend';
import {err} from './console';
import is from './type';

const PREFIX = '[[FORM-CREATE-PREFIX-';
const SUFFIX = '-FORM-CREATE-SUFFIX]]';

const $T = '$FN:';
const FUNCTION = 'function';

export function toJson(obj, space) {
    return JSON.stringify(deepExtend([], obj, true), function (key, val) {
        if (val && val._isVue === true)
            return undefined;

        if (typeof val !== FUNCTION) {
            return val;
        }
        if (val.__json) {
            return val.__json;
        }
        if (val.__origin)
            val = val.__origin;

        if (val.__emit)
            return undefined;
        return PREFIX + val + SUFFIX;
    }, space);
}

function makeFn(fn) {
    return eval('(' + FUNCTION + '(){return ' + fn + ' })()')
}

export function parseFn(fn, mode) {
    if (fn && is.String(fn)) {
        let v = fn.trim();
        let flag = false;
        if (v.indexOf(SUFFIX) > 0 && v.indexOf(PREFIX) === 0) {
            v = v.replace(SUFFIX, '').replace(PREFIX, '');
            flag = true;
        } else if (v.indexOf($T) === 0) {
            v = v.replace($T, '');
            flag = true;
        } else if (!mode && v.indexOf(FUNCTION) === 0 && v !== FUNCTION) {
            flag = true;
        }
        if (!flag) return fn;
        try {
            const val = makeFn(v.indexOf(FUNCTION) === -1 && v.indexOf('(') !== 0 ? (FUNCTION + ' ' + v) : v);
            val.__json = fn;
            return val;
        } catch (e) {
            err(`解析失败:${v}`);
            return undefined;
        }
    }
    return fn;
}

export function parseJson(json, mode) {
    return JSON.parse(json, function (k, v) {
        if (is.Undef(v) || !v.indexOf) return v;
        return parseFn(v, mode);
    });
}
