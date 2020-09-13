// import React, { Component, useState } from 'react';
import * as React from 'react';
import { StyleSheet, View, StatusBar, Text} from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer,  } from 'react-navigation';

import Header from '../shared/Header';

import DashboardScreen from '../components/DashboardScreen';
import Exercise from '../components/Exercise';
import ProfileScreen from "../components/ProfileScreen";
import PostScreen from "../components/PostScreen";
import HistoryScreen from "../components/HistoryScreen";
import LeaderboardScreen from "../components/Leaderboard";
import Live from "../components/Live";
import LiveYT from "../components/LiveYT";
import Chart from "../components/Chart";

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons';


const screens = {

  Home: {
    screen: DashboardScreen,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () => <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        // headerStyle: () => <GradientHeader />,
        headerTitle: () => <Header title='Playlist' navigation={navigation} />,
        // title: 'Homeee',
        // headerTitleAlign: 'center',
        // header: props => <GradientHeader/>,
        headerStyle: {
          backgroundColor: '#ffa500',
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        },    
      }
    },
  },
  Exercise: {
    screen: Exercise,
    navigationOptions: ({ navigation }) => {
      return {
        // navigationOptions : { // https://reactnavigation.org/docs/en/stack-navigator.html#stacknavigatorconfig
        //   headerTitleAlign: 'center',
        //   headerStyle: { backgroundColor: 'transparent' },
        // },  
        // headerTitle: () => <Header title='Exe' navigation={navigation} />,
        // title: 'Exercise',
        // headerTitleAlign: 'center',
        // header: props => <GradientHeader/>,
        headerShown: false,
        // headerStyle: {
        //   backgroundColor: 'transparent',
        //   position: 'absolute',
        //   top: 0,
        //   left: 0,
        //   right: 0,
        // },   
      }
    },   
  },
  Profile: {
    screen: ProfileScreen,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () =>  <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        headerTitle: () => <Header title='Profile' navigation={navigation} />,
        // title: 'Profile',
        // headerTitleAlign: 'center',
        // // header: props => <GradientHeader/>,
        headerStyle: {
          backgroundColor: '#ffa500', //#ffbf00
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        },   
      }
    }, 
  },
  Post: {
    screen: PostScreen,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () =>  <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        headerTitle: () => <Header title='Post' navigation={navigation} />,
        // title: 'Post Video',
        // headerTitleAlign: 'center',
        // // header: props => <GradientHeader/>,
        headerStyle: {
          backgroundColor: '#ffa500',
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        },     
      }
    }, 
  },
  History: {
    screen: HistoryScreen,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () =>  <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        headerTitle: () => <Header title='History' navigation={navigation} />,
        // title: 'Post Video',
        // headerTitleAlign: 'center',
        // // header: props => <GradientHeader/>,
        headerStyle: {
          backgroundColor: '#ffa500',
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        },     
      }
    }, 
  },  
  Leaderboard: {
    screen: LeaderboardScreen,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () =>  <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        headerTitle: () => <Header title='Leaderboard' navigation={navigation} />,
        // title: 'Post Video',
        // headerTitleAlign: 'center',
        // // header: props => <GradientHeader/>,
        headerStyle: {
          backgroundColor: '#ffa500',
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        },     
      }
    }, 
  },    
  Live: {
    screen: Live,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () =>  <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        // headerTitle: () => <Header title='Live' navigation={navigation} />,
        // title: 'Post Video',
        // headerTitleAlign: 'center',
        // // header: props => <GradientHeader/>,
        headerShown: false,
        // headerStyle: {
        //   backgroundColor: '#ffa500',
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        // },     
      }
    }, 
  },  
  LiveYT: {
    screen: LiveYT,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () =>  <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        // headerTitle: () => <Header title='Live' navigation={navigation} />,
        // title: 'Post Video',
        // headerTitleAlign: 'center',
        // // header: props => <GradientHeader/>,
        headerShown: false,
        // headerStyle: {
        //   backgroundColor: '#ffa500',
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        // },     
      }
    }, 
  },  
  Chart: {
    screen: Chart,
    navigationOptions: ({ navigation }) => { //https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25
      return {
        // headerTitle: () => <Header title='Search' navigation={navigation} style={styles.Header}/>,
        // headerStyle: () =>  <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} />, // { backgroundColor: 'orange' }, // #FF8C00
        // headerTitle: () => <Header title='Live' navigation={navigation} />,
        // title: 'Post Video',
        // headerTitleAlign: 'center',
        // // header: props => <GradientHeader/>,
        headerShown: false,
        // headerStyle: {
        //   backgroundColor: '#ffa500',
          // position: 'absolute',
          // top: 0,
          // left: 0,
          // right: 0,
        // },     
      }
    }, 
  },  



}


// home stack navigator screens
const HomeStack = createStackNavigator(screens);  


const GradientHeader = () => (  
// const GradientHeader = props => (  
  <View style={{ width:'100%' }}>
      <LinearGradient 
        colors={['#ffbf00', '#ffb300', 'orange']} 
        // style={styles.LGHeader} 
        // navigation={navigation}  
        >
        {/* <Header {...props} /> */}
        {/* <Header/>  */}
        {/* <Ionicons name='md-arrow-back' size={28} style={styles.backIcon} /> */}
        <Text>{'img filter'}</Text>
      </LinearGradient> 
  </View>
  )




const styles = StyleSheet.create({
  LGHeader: {
    // width: '100%',
    // borderBottomColor: 'black',
    // borderBottomWidth: 5,
    // shadowColor: "#E9446A",
    // shadowOffset: { width: 0, height: 10 },
    // shadowRadius: 10,
    // shadowOpacity: 0.3    
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: StatusBar.currentHeight,
    justifyContent: 'space-between',
    paddingHorizontal: 80,
    // backgroundColor: 'transparent',
  },
  // HeaderText: {
  //   backgroundColor: 'black',
  // },

});

const AppStack = createAppContainer(HomeStack);
export default AppStack;