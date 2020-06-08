import React, { Component, useState } from 'react';
import { StyleSheet, Text, View, Button} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';
import { Ionicons } from "@expo/vector-icons";
// import { NavigationEvents } from 'react-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileScreen from '../components/ProfileScreen';
import PostScreen from '../components/PostScreen';
import NotificationScreen from '../components/NotificationScreen';


const goToProfile =() => {
  console.log('goToProfile');
  this.props.navigation.push('Profile');
}

const GoToPost =() => {
  console.log('GoToPost');
  this.props.navigation.push('Post');
}  

const GoToHistory =() => {
  console.log('GoToHistory');
  this.props.navigation.push('History');
}  

const GoToNotification =() => {
  console.log('GoToNotification');
  this.props.navigation.push('Notification');
}  

export default class Footer extends Component {
// export default function Footer({ navigation }) {

  
  render() {
    return (
      <View style={{width:'100%'}}>
        {/* <LinearGradient colors={['#ffbf00', '#ffb300', 'orange']} style={styles.footerContainer}>  */}
        <View style={styles.footerContainer}>
        {/* https://docs.expo.io/versions/latest/sdk/linear-gradient/ */}
          <Ionicons name='ios-person' size={28} color="white" style={styles.ProfileIcon} onPress={goToProfile}/>
          <Ionicons name="ios-add-circle-outline" size={44} color="white" style={styles.PostIcon} onPress={GoToPost}/>
          <Ionicons name='ios-aperture-outline' size={28} color="white" style={styles.NotificationIcon} onPress={GoToHistory}/>
          <Ionicons name='ios-notifications-outline' size={28} color="white" style={styles.NotificationIcon} onPress={GoToNotification}/>
        {/* </LinearGradient> */}
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 80,
  },

});