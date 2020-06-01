// https://www.youtube.com/watch?v=C3oDJdlrEKE&list=PL4cUxeGkcC9ixPU-QkScoRBVxtPPzVjrQ&index=25

import React, { Component, useState } from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from "@expo/vector-icons";
// import { TextInput } from 'react-native-gesture-handler';
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
        {/* <LinearGradient  */}
          {/* colors={['#ffbf00', '#ffb300', 'orange']}  */}
          {/* // style={styles.LGHeader}  */}
        {/* /> */}
          {/* <Header {...props} /> */}
          {/* <Ionicons name='md-arrow-back' size={28} onPress={goToHome} style={styles.backIcon} /> */}
          {/* <Text>{title}</Text> */}
          {/* <Header title={title}/> */}
          {/* <Text>{'adaf'}</Text> */}
        {/* </LinearGradient> */}
        {/* <MaterialIcons name='menu' size={28} onPress={openMenu} style={styles.icon} /> */}
        {/* <ion-icon name="arrow-back-outline"></ion-icon> */}
        {/* <Ionicons name='outline' size={28} color="white" style={styles.backIcon} onPress={goToHome}/> */}
        {/* <MaterialIcons name='menu' size={28} onPress={goToHome} style={styles.backIcon} /> */}
        {/* <Ionicons name='md-arrow-back' size={28} onPress={ () => this.props.navigation.goBack() } style={styles.backIcon} /> */}
        {/* <View> */}
        {/* <Text style={styles.headerText}>{title}</Text> */}
        {/* </View> */}
        {/* <MaterialIcons name='search' size={28} style={styles.SearchIcon} onPress={goSearch}/>
        <MaterialIcons name='filter' size={28} style={styles.FilterIcon} onPress={openFilterModal}/> */}
      </View>
    );
  // }
}


// const GradientHeader = props => (
//   // <View style={{ width:'100%' }}>
//       <LinearGradient
//         colors={['#ffbf00', '#ffb300', 'orange']}
//         style={styles.LGHeader}
//         // navigation={navigation} 
//       >
//         {/* <Header {...props} /> */}
//         <Ionicons name='md-arrow-back' size={28} onPress={goToHome} style={styles.backIcon} />
 
//         <Text>{'adaf'}</Text>
//       </LinearGradient>
//   // </View>
//   )

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    // height: '50%',
    // flexDirection: 'row',
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: 'transparent',
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'space-between'
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
    fontSize: 16,
    color: 'white',
    letterSpacing: 1,
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