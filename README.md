# react-compose
A way to deal with React Render Props Component Callback Hell.

In flat vdom, which won't make React rebuild the DOM.

https://github.com/facebook/react/issues/12664

## With many Render Props Components

```jsx
import { createContext } from '@xialvjun/create-react-context';

const Counter = createContext({
  state: { count: 0 },
  inc() {
    this.setState({ count: this.state.count + 1 });
  },
});

const Auth = createContext({
  state: { logined: false },
  async login() {
    await api.login();
    this.setState({ logined: true });
  },
});

<Auth>
  {auth => <Counter>
    {counter => null}
  </Counter>}
</Auth>
```

**Two Render Props Components may be OK. What if 3, 4, 5 ? It's a callback hell!**

## So we can

```jsx
import { Adopt } from 'react-adopt';

<Adopt mapper={{ counter: <Counter/>, auth: <Auth> }}>
  {({ counter, auth }) => null}
</Adopt>
```

**But [`react-adopt` has bugs](https://github.com/facebook/react/issues/12664)**

## Then I made

```jsx
import { Compose } from '@xialvjun/react-compose';
import { Query } from 'react-apollo';

// property in mapper can be React Element, Component, or even inline SFC without concern of performance.
<Compose mapper={{
  counter: <Counter/>,
  auth: Auth,
  book: <Query query={search_book} variables={{id: book_id}} />,
  old_render_props: ({ children }) => <SomeComponent render={children} />,
  }}>
  {({ counter, auth, book, old_render_props }) => null}
</Compose>

let book_ids = ['aaa', 'bbb', 'ccc', 'ddd'];
// mapper can be an array or an object
<Compose mapper={book_ids.map(bid => <Query key={bid} query={search_book} variables={{id: bid}} />)}>
  {books => books[0].loading}
</Compose>

function ManyParams({ children }) {
  // attention here, there are many params rather than only on for children
  return children(1, 2, 3, 4);
}
function SingleParams({ children }) {
  return children(28);
}
<Compose mapper={{ mp: ManyParams, sp: SingleParams }}>
  {({ mp, sp }) => <div>
    {isEqual(mp, [1,2,3,4]) ? 'YES' : 'NO'}
    {isEqual(sp, 23) ? 'YES' : 'NO'}
  </div>}
</Compose>

<Compose mapper={{ mp: ManyParams, sp: SingleParams }} strict>
  {({ mp, sp }) => <div>
    {isEqual(mp, [1,2,3,4]) ? 'YES' : 'NO'}
    {/* is Compose is in strict mode, results will always be an array */}
    {isEqual(sp, [23]) ? 'YES' : 'NO'}
  </div>}
</Compose>
```
