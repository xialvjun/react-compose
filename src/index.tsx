import * as React from "react";
import { Component } from "react";
import { ReactNode, ReactType, ReactElement, ComponentClass, SFC } from "react";

class Result extends Component<{ children: () => ReactNode }> {
  render() {
    return this.props.children();
  }
}

export type MapperProp = ReactElement<any> | ComponentClass | SFC;

/**
 * todo: children 的 arg 参数的 any 类型应该是取决于 T 的
 * mapper 可以是数组，也可以是扁对象
 * mapper 内部的元素可以是:
 * 1. 类: 可以是 继承了 Component 的类，或者是 StatelessFunctionComponent. SFC 可以把 不以 children 作为 render_props 的组件临时转换为以 children 作为 render_props
 * 2. 类的实例: 相当于对函数做了 curry 操作，提前提供了一些参数，最后只剩下 children 参数
 */
export class Compose<
  T extends Record<string, MapperProp> | MapperProp[]
> extends Component<{
  mapper: T;
  children: (arg: any) => ReactNode;
  strict: boolean;
}> {
  force_update = false;
  componentWillUpdate() {
    this.force_update = false;
  }
  render() {
    const { mapper, children, strict = false } = this.props;
    const mapper_is_array =
      Object.prototype.toString.call(mapper) === "[object Array]";
    const arg: any = mapper_is_array ? [] : {};
    return (
      <React.Fragment>
        {Object.keys(mapper).map((key: keyof T) => {
          const value = mapper[key];
          const with_key = mapper_is_array ? null : { key };
          const children = (...args) => {
            arg[key] = args;
            if (!strict && args.length === 1) {
              arg[key] = args[0];
            }
            if (this.force_update) {
              this.forceUpdate();
            }
            return null;
          };
          if (typeof value === "function") {
            if (value.__proto__ === React.Component) {
              return React.createElement(value as any, with_key, children);
            }
            // ! 把 value 当函数适用于 SFC。真实用例: mapper={[({ children }) => <OldRenderProps render={children} some_other_props />] 。如果仍然用 createElement，则每次都会重建 DOM
            return (value as any)({ ...with_key, children });
          }
          return React.cloneElement(value as any, with_key, children);
        })}
        <Result>
          {() => {
            // ! 需要用一个 Result 包裹起来只是因为需要延迟一下 children(arg) 的顺序
            this.force_update = true;
            return children(arg);
          }}
        </Result>
      </React.Fragment>
    );
  }
}
