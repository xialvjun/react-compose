"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_1 = require("react");
var Result = /** @class */ (function (_super) {
    __extends(Result, _super);
    function Result() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Result.prototype.render = function () {
        return this.props.children();
    };
    return Result;
}(react_1.Component));
/**
 * todo: children 的 arg 参数的 any 类型应该是取决于 T 的
 * mapper 可以是数组，也可以是扁对象
 * mapper 内部的元素可以是:
 * 1. 类: 可以是 继承了 Component 的类，或者是 StatelessFunctionComponent. SFC 可以把 不以 children 作为 render_props 的组件临时转换为以 children 作为 render_props
 * 2. 类的实例: 相当于对函数做了 curry 操作，提前提供了一些参数，最后只剩下 children 参数
 */
var Compose = /** @class */ (function (_super) {
    __extends(Compose, _super);
    function Compose() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.force_update = false;
        return _this;
    }
    Compose.prototype.componentWillUpdate = function () {
        this.force_update = false;
    };
    Compose.prototype.render = function () {
        var _this = this;
        var _a = this.props, mapper = _a.mapper, children = _a.children, strict = _a.strict;
        var mapper_is_array = Object.prototype.toString.call(mapper) === "[object Array]";
        var arg = mapper_is_array ? [] : {};
        return (React.createElement(React.Fragment, null,
            Object.keys(mapper).map(function (key) {
                var value = mapper[key];
                var with_key = mapper_is_array ? null : { key: key };
                var children = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    arg[key] = args;
                    if (!strict && args.length === 1) {
                        arg[key] = args[0];
                    }
                    if (_this.force_update) {
                        _this.forceUpdate();
                    }
                    return null;
                };
                if (typeof value === "function") {
                    if (value.__proto__ === React.Component) {
                        return React.createElement(value, with_key, children);
                    }
                    // ! 把 value 当函数适用于 SFC。真实用例: mapper={[({ children }) => <OldRenderProps render={children} some_other_props />] 。如果仍然用 createElement，则每次都会重建 DOM
                    return value(__assign({}, with_key, { children: children }));
                }
                return React.cloneElement(value, with_key, children);
            }),
            React.createElement(Result, null, function () {
                // ! 需要用一个 Result 包裹起来只是因为需要延迟一下 children(arg) 的顺序
                _this.force_update = true;
                return children(arg);
            })));
    };
    return Compose;
}(react_1.Component));
exports.Compose = Compose;
