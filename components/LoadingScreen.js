// import * as React from 'react';
// import { Component } from 'react';
import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import firebase from 'firebase';

// import {screen} from '../routes/homeStack';  // for navigation


export default class LoadingScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authedUid: null, // assign uid that is verified. 20200524
      userProfile: null, // assign userProfile that is received. 20200524
    }
    // this._authLoginToken = this._authLoginToken.bind(this);
  }

  componentDidMount() {
    console.log('------------- componentDidMount LoadingScreen started');
    this.checkIfLoggedIn();
  }



  checkIfLoggedIn = () => {
    firebase.auth().onAuthStateChanged(
      function(user) {
        console.log('AUTH STATE CHANGED CALLED ')

        // const date = new Date();
        const ts = Date.now() / 1000; // unix // date.getTime().toString(); // unix time    
        

        if (user) { // if user logeed in
          console.log('====== Existing User already logged in. Loading.js ');
         

          //// to check if user is logged with idToken. 20200521
          const _whenLoggedInExistingUserLogsIn = (idTokenCopied) => {
            console.log('----- _whenLoggedInExistingUserLogsIn.');
            // console.log('----- _whenLoggedInExistingUserLogsIn idTokenCopied: ', idTokenCopied);
            fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/whenLoggedInExistingUserLogsIn-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
              method: 'POST',
              headers: {
                // 'Accept': 'application/json', 
                'Content-Type' : 'application/json' // text/html text/plain application/json
              },
              // mode: "no-cors", // no-cors, cors, *same-origin
              body: JSON.stringify({
                id_token: idTokenCopied,
              })
            }).then( result => result.json() )
              .then( response => { 
                console.log('----- Loading.js _whenLoggedInExistingUserLogsIn response.' );
                if (response["code"] == 'ok') {
                  console.log('----- response[code] is ok');
                  if (response["authedUid"] == firebase.auth().currentUser.uid) {
                    // this.setState({ authedUid: response["authedUid"], userProfile: response["userProfile"] });
                    console.log('Correctly received "authedUid".');
                  } else {
                    console.log('Received wrong "authedUid". Please log-in again.');
                    alert('Received wrong "authedUid". Please log-in again.');
                  }
                  
                } else { // response[code] is Error
                  console.log('Received response[code] = error from functions.');
                  alert('Received response[code] = error from functions., Please log-in again.');
                }
            }).catch( error => {
              console.log('Error _whenLoggedInExistingUserLogsIn-py: ', error);
              alert('Error response from _whenLoggedInExistingUserLogsIn, Please log-in again.');
            });
          }
  
  

///////////  whenLoggedInExistingUserLogsIn-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
          firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
            // Send token to your backend via HTTPS
            // console.log('----- Got idToken. ');
            const idTokenCopied = idToken;

            _whenLoggedInExistingUserLogsIn(idTokenCopied); // run http trigger

          }).catch(function(error) {
            console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
          });

          console.log('------------------------------ Going to Dashboard.js');  
          this.props.navigation.navigate('DashboardScreen', { authedUid: 'authhh' });

        } else { // if user NOT logged in
          console.log('== User NOT logged in, Going to Login.js');
          this.props.navigation.navigate('LoginScreen');
        }

      }.bind(this)

    );
  };

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }
  
}
// export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffa500', // '#ffbf00'
  }
});