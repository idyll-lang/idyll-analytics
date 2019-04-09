# idyll-analytics

Tools to collect detailed usage analytics of [Idyll articles](https://idyll-lang.org).

## Installation

To install the analytics package, run the following in your Idyll project:

```
$ npm install --save idyll-analytics
```

## Usage

This code is intended to be used as a custom runtime [plugin](https://github.com/idyll-lang/idyll-plugins) for Idyll. To use it, you need to create a custom context file and import the analytics code there. See the [idyll docs](https://idyll-lang.org/docs/advanced-configuration) for more information on custom contexts.

This plugin relies on [Firebase](https://firebase.google.com/) for data storage, and you'll need to have a Firebase database set up and credentials available in order to use it.

### Creating a custom context file

Create a new file called *context.js* in your Idyll project:

```js
const Analytics = require('./index');

// Fill out these credentials.
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};

module.exports = (context) => {
  const initialState = context.data();

  // Update this with a relevant identifier for your post.
  const analytics = new Analytics('my-post-title', firebaseConfig);

  analytics.onLoad(() => {
    analytics.updateState(initialState);
    context.onUpdate((newState) => {
      analytics.updateState(newState);
    });
  })
}
```

### Configuring Idyll to use the custom context

In your *package.json* file, update the `idyll` option to use your newly created context:

```js
{
  "idyll": {
    "context": "./context.js"
  }
}
```
