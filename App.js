// import * as React from 'react';
import React from 'react';
import {Platform} from 'react-native';
// import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';  // https://www.youtube.com/watch?v=ZcaQJoXY-3Q https://github.com/nathvarun/Expo-Google-Login-Firebase
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';

import * as firebase from 'firebase';
import { firebaseConfig } from './config';
import Stack from './routes/homeStack';

firebase.initializeApp(firebaseConfig);

console.log('++++++++++++++++++++++++++++++++++++++++++ Platform.OS: ', Platform.OS);

// Distribute page by homeStack.js
const AppSwitchNavigator = createSwitchNavigator({  
  LoadingScreen: LoadingScreen,
  LoginScreen: LoginScreen,
  DashboardScreen: Stack,
});

const AppNavigator = createAppContainer(AppSwitchNavigator);


export default class App extends React.Component {  

  constructor(props) {
    super(props)

    // this to hide showing warning 'Setting a timer for a long period of time' // https://qiita.com/i47_rozary/items/34d9abb3c404d1d9a7ac 20200417  
    global.__old_console_warn = global.__old_console_warn || console.warn;
    global.console.warn = (...args) => {
      let tst = (args[0] || '') + '';
      if (tst.startsWith('Setting a timer')) {
        return;
      }
      return global.__old_console_warn.apply(console, args);
    };

  }


  render() {
    return <AppNavigator />
  }
}
