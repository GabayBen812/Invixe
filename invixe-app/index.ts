import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './App';

// Ignore system RTL: always display as designed (LTR layout), regardless of device language.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
