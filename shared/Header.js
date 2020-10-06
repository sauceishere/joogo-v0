// https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25

import React, { Component, useState } from 'react';
// import * as React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';


const goToHome = () => {
  navigation.goBack();
}

export default function Header({ title, headerCenter, headerRight, navigation }) {
// export default class Header extends Component {  

  // render() {  
    return ( 
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerRight}>{headerRight}</Text>
      </View>
    );
  // }
}



const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    // height: '50%',
    // flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: 'transparent',
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    // textAlignVertical: 'center',
  },
  LGHeader: {
    // width: '100%',
    // borderBottomColor: 'black',
    // borderBottomWidth: 5,
    // shadowColor: "#E9446A",
    // shadowOffset: { width: 0, height: 10 },
    // shadowRadius: 10,
    // shadowOpacity: 0.3    
    width: '100%',
    height: 100, //StatusBar.currentHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    justifyContent: 'space-between',
    // paddingHorizontal: 40,
    backgroundColor: 'transparent',
  },  
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    letterSpacing: 1,
    // textAlignVertical: 'center',
  },
  headerRight: {
    fontWeight: 'bold',
    fontSize: 12,
    color: 'white',
    position: 'absolute',
    right: 0,
  },  

  backIcon: {
    position: 'absolute',
    left: 5,
  },
   
});