import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from 'react-native';
import firebase from 'firebase';

import * as Google from 'expo-google-app-auth'; // sudo expo install expo-google-app-auth https://forums.expo.io/t/undefined-is-not-object-expo-google-loginasync/26889 
// import { convertCompilerOptionsFromJson } from 'typescript';
// import * as GoogleSignIn from 'expo-google-sign-in'; // https://docs.expo.io/versions/latest/sdk/google-sign-in/
// import * as AppAuth from 'expo-app-auth';
// When configured correctly, URLSchemes should contain your REVERSED_CLIENT_ID
// const { URLSchemes } = AppAuth;

// import { NetworkInfo } from "react-native-network-info";




// import {screen} from '../routes/homeStack';  // for navigation

export default class LoginScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
        isSigningIn: false,
        // authedUid: null, // assign uid that is verified. 20200524
        // userProfile: null, // assign userProfile that is received. 20200524
    }
    // this._checkIfNewUser = this._checkIfNewUser.bind(this);
  }

  // isNewUser = 'd'; // if true go to Profile.js, if false go to Dashboard.js 


  


  isUserEqual = (googleUser, firebaseUser) => {
    console.log('------------------- isUserEqual');
    if (firebaseUser) {
      // console.log('------------------- isUserEqual firebaseUser: ', firebaseUser);
      var providerData = firebaseUser.providerData;
      // console.log('------------------- isUserEqual providerData: ', providerData);
      for (var i = 0; i < providerData.length; i++) {
        if ( providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.getBasicProfile().getId() ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };


  _onSignInG = googleUser => {
    console.log('------------------- _onSignInG');
    // console.log('result: ', result);
    
    // console.log('Google Auth Response: ', googleUser);

    // const date = new Date();
    const ts = Date.now() / 1000; // unix // date.getTime().toString(); // unix time


    // const _checkIfNewUser = (ref) => {
    //   console.log('_checkIfNewUser1: ', ref);
    //   this.setState({isNewUser: ref});

    //   if (ref == true) {
    //     console.log("..... this.props.navigation.navigate('ProfileScreen')");
    //     this.props.navigation.navigate("ProfileScreen");
    //   } else { // Existing users go to Dashboard.js
    //     console.log("..... this.props.navigation.navigate('DashboardScreen')");
    //     this.props.navigation.navigate("DashboardScreen"); 
    //   }  
    // }


    // get IP address
    // NetworkInfo.getIPAddress().then(ipAddress => {
    //   let ipadd = ipAddress;
    //   console.log('ipadd: ', ipadd);
    // }).catch( (error) => {
    //   let ipadd = 'error';
    //   console.log('ipadd error: ', error);
    // });

    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(
      function(firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        // console.log('googleUser: ', googleUser);
        console.log('----- firebaseUser: ', firebaseUser);

        if (!this.isUserEqual(googleUser, firebaseUser)) {
          console.log('------------------- !this.isUserEqual');
          // Build Firebase credential with the Google ID token.
          var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
          );
          //  console.log('------------------- credential: ', credential);
          // Sign in with credential from the Google user.
          firebase
            .auth()
            // .signInAndRetrieveDataWithCredential(credential) // hided 20200206 https://stackoverflow.com/questions/54995364/firebase-auth-auth-signinwithcredential-is-deprecated-please-use-firebase-auth
            .signInWithCredential(credential)
            .then( function(result) {
              console.log('user just signed in ');
              // console.log('result: ', result);
              // console.log('result.additionalUserInfo.isNewUser: ', result.additionalUserInfo.isNewUser);
              // console.log('----- Login.js firebase.auth().currentUser.uid: ', firebase.auth().currentUser.uid );
              // _checkIfNewUser(result.additionalUserInfo.isNewUser);
   
              
/////////////////// New User ///////////////////////////////              
              if (result.additionalUserInfo.isNewUser) { // new user
                console.log('======= New User will log in. Login.js');

                // // create profile on Firestore /users/{userId}/
                // firebase.firestore().collection( 'users' ).doc( firebase.auth().currentUser.uid ).set({
                //   TS: Date.now() / 1000, // unix
                //   LLOGIN: Date.now() / 1000, // unix
                //   RCV_AT: firebase.firestore.FieldValue.serverTimestamp(),
                //   UID: firebase.auth().currentUser.uid,
                //    // gmail: result.user.email,
                //    // profile_picture: result.additionalUserInfo.profile.picture,
                //    // first_name: result.additionalUserInfo.profile.given_name,
                //    // last_name: result.additionalUserInfo.profile.family_name,                
                // }).then((ref)=>{
                //   console.log('Firestore /users/{userId}/ created');
                //   // this.setState({ isNewUser : true });
                //   // this.isNewUser = 'true';
                // }).catch((error)=>{
                //   console.log('Error creating Firestore /users/{userId}/: ', error);
                //   alert('Error creating Firestore /users/{userId}/.');
                // });

                // // create profile on Firestore /users/{userId}/current/EXE_PTSUM
                // firebase.firestore().collection( 'users' ).doc( firebase.auth().currentUser.uid ).collection( 'current' ).doc( 'EXE_PTSUM' ).set({
                //   UPD_AT: Date.now() / 1000, // unix
                //   LVIEWID: 'first_create',
                //   EXE_PTSUM: 0,              
                // }).then((ref)=>{
                //   console.log('Firestore /users/{userId}/current/EXE_PTSUM created');
                // }).catch((error)=>{
                //   console.log('Error creating Firestore /users/{userId}/current/EXE_PTSUM: ', error);
                //   alert('Error creating Firestore /users/{userId}/current/EXE_PTSUM.');
                // });

                // // create profile on Firestore /users/{userId}/current/VIEW_PTSUM
                // firebase.firestore().collection( 'users' ).doc( firebase.auth().currentUser.uid ).collection( 'current' ).doc( 'VIEW_PTSUM' ).set({
                //   UPD_AT: Date.now() / 1000, // unix
                //   LVIEWID: 'first_create',
                //   VIEW_PTSUM: 0,              
                // }).then((ref)=>{
                //   console.log('Firestore /users/{userId}/current/VIEW_PTSUM created');
                // }).catch((error)=>{
                //   console.log('Error creating Firestore /users/{userId}/current/VIEW_PTSUM: ', error);
                //   alert('Error creating Firestore /users/{userId}/current/VIEW_PTSUM.');
                // });                
                

                // add record on Firestore /users/{userId}/loginLogs
                // firebase.firestore().collection( 'users' ).doc( firebase.auth().currentUser.uid ).collection( 'loginLogs' ).doc( ts + '_IN').set({
                //   TS: Date.now() / 1000, // unix
                //   INOUT: 'IN',
                //   // IPADD: ip_add.toString(),
                // }).then((ref)=>{
                //   console.log('loginLogs_login_new added');
                // }).catch((error)=>{
                //   console.log('loginLogs_login_new error: ', error);
                // });   





              
                //// whenNewUserLogsIn-py
                const _whenNewUserLogsIn = (idTokenCopied) => {
                  console.log('----- _whenNewUserLogsIn.');
                  // console.log('----- _whenNewUserLogsIn idTokenCopied: ', idTokenCopied);
                  fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/whenNewUserLogsIn-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
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
                      console.log('----- _whenNewUserLogsIn response:' );
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
                    console.log('Error _whenNewUserLogsIn-py: ', error);
                    alert('Error response from _whenNewUserLogsIn, Please log-in again.');
                  });
                }         


                ///////////  whenNewUserLogsIn-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
                firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
                  // Send token to your backend via HTTPS
                  // console.log('----- Got idToken. ');
                  const idTokenCopied = idToken;

                  _whenNewUserLogsIn(idTokenCopied); // run http trigger
                  
                }).catch(function(error) {
                  console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
                });

  




///////////////// Existing user ///////////////////////////                
              } else { // existing user
                console.log('======= Existing user will Newly log in. Login.js');
                // console.log('----- Login.js firebase.auth().currentUser.uid: ', firebase.auth().currentUser.uid );
                // console.log('----- Login.js firebase.auth().currentUser: ', firebase.auth().currentUser );
              

                // // Get user data
                // firebase.firestore().collection("users").doc( firebase.auth().currentUser.uid ).get().then( (QueryUid) => { 
                //   if (QueryUid) {
                //     console.log('QueryUid.data(): ', QueryUid.data());
                //     // this.setState({ userProfile: QueryUid.data() });
                //   }  
                // }).catch(function(error) {
                //   alert("Error getting users/{userId}:", error);
                //   console.log("Error getting users/{userId}}:", error);
                // });  

                // // update Log in time on Firestore /users/{userId}/
                // firebase.firestore().collection( 'users' ).doc( firebase.auth().currentUser.uid ).update({
                //   LLOGIN: Date.now() / 1000, // unix
                // }).then((ref)=>{
                //   console.log('LLOGIN updated');
                // }).catch((error)=>{
                //   console.log('Error LLOGIN update error: ', error);
                // });

                // // add record on Firestore /users/{userId}/loginLogs
                // firebase.firestore().collection( 'users' ).doc( firebase.auth().currentUser.uid ).collection( 'loginLogs' ).doc( ts + '_IN').set({
                //   TS: Date.now() / 1000, // unix
                //   INOUT: 'IN',
                //   // IPADD: ip_add.toString(),
                // }).then((ref)=>{
                //   console.log('loginLogs_login_existing added');
                // }).catch((error)=>{
                //   console.log('Error loginLogs_login_existing error: ', error);
                // });                  





                // whenExistingUserNewlyLogsIn-py
                // const _whenExistingUserNewlyLogsIn = (idTokenCopied) => {
                //   console.log('----- _whenExistingUserNewlyLogsIn.');
                //   console.log('----- _whenExistingUserNewlyLogsIn idTokenCopied: ', idTokenCopied);
                //   fetch('https://asia-northeast1-getfit-f3a98.cloudfunctions.net/whenExistingUserNewlyLogsIn-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
                //     method: 'POST',
                //     headers: {
                //       // 'Accept': 'application/json', 
                //       'Content-Type' : 'application/json' // text/html text/plain application/json
                //     },
                //     // mode: "no-cors", // no-cors, cors, *same-origin
                //     body: JSON.stringify({
                //       id_token: idTokenCopied,
                //     })
                //   }).then( result => result.json() )
                //     .then( response => { 
                //       console.log('----- _whenExistingUserNewlyLogsIn response:', response );
                //       if (response["code"] == 'ok') {
                //         console.log('----- response[code] is ok');
                //         if (response["authedUid"] == firebase.auth().currentUser.uid) {
                //           // this.setState({ authedUid: response["authedUid"], userProfile: response["userProfile"] });
                //           console.log('Correctly received "authedUid"。');
                //         } else {
                //           console.log('Received wrong "authedUid". Please log-in again.');
                //           alert('Received wrong "authedUid". Please log-in again.');
                //         }
                        
                //       } else { // response[code] is Error
                //         console.log('Received response[code] = error from functions.');
                //         alert('Received response[code] = error from functions., Please log-in again.');
                //       }
                //   }).catch( error => {
                //     console.log('Error _whenExistingUserNewlyLogsIn-py: ', error);
                //     alert('Error response from _whenExistingUserNewlyLogsIn, Please log-in again.');
                //   });
                // }         


                // ///////////  whenExistingUserNewlyLogsIn-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
                // firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
                //   // Send token to your backend via HTTPS
                //   console.log('----- Got idToken. ');
                //   const idTokenCopied = idToken;

                //   _whenExistingUserNewlyLogsIn(idTokenCopied); // run http trigger
                  
                // }).catch(function(error) {
                //   console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
                // });




              }

            }).catch(function(error) { // auth error
              // Handle Errors here.
              // var errorCode = error.code;
              // var errorMessage = error.message; // The email of the user's account used.
              // var email = error.email; // The firebase.auth.AuthCredential type that was used.
              // var credential = error.credential;
              console.log('Error _onSignInG: ', error);

            }); 

        } else {
          console.log('User already signed-in Firebase.');
        }

      }.bind(this) ); // https://stackoverflow.com/questions/31045716/react-this-setstate-is-not-a-function

  };


  _signInWithGoogleAsync = async () => {
    console.log('------------------- _signInWithGoogleAsync');
    this.setState({isSigningIn: true}); // change to ActivityIndicator
    try {
      const result = await Google.logInAsync({ // https://forums.expo.io/t/undefined-is-not-object-expo-google-loginasync/26889
        androidClientId: '399964185668-sors0c13tg8nvaapal534ndthdmqp2vf.apps.googleusercontent.com', // This is generated from Google developer site API page. 20200203 https://docs.expo.io/versions/latest/sdk/google/ https://console.cloud.google.com/apis/credentials?clientUpdateTime=2020-02-03T00:17:44.450577Z&project=getfit-f3a98
        // https://blog.expo.io/google-sign-in-with-react-native-and-expo-9cac6c392f0e 20200601
        // behavior: 'web',
        // iosClientId: 'xxxxxxx', //enter ios client id
        scopes: ['email'] //scopes: ['profile', 'email']
      });

      if (result.type === 'success') {
        this._onSignInG(result);

        // console.log("..... this.props.navigation.navigate('DashboardScreen')");
        // this.props.navigation.navigate("DashboardScreen", {
          // username: result.user.givenName
          // userId: result.user.userId,
          // userId: firebase.auth().currentUser.uid,
        // });  
        // () => this.props.navigation.push('Exercise', post) 

        return result.accessToken;

      } else {
        console.log('------------------- else');
        return { cancelled: true };
      }
    } catch (e) {
      // return { error: true };
      console.log('Error _signInWithGoogleAsync: ', e);
      return(alert('Error _signInWithGoogleAsync: ', e)); // added by shibata 20200205
      
    }
  };




  render() {
    const { isSigningIn } = this.state;

    return (
      <View style={styles.container}>

        { isSigningIn ? 

          <View style={styles.LoadingState}>
            {/* <Text>Loading out...</Text>
            <Modal animationType="slide" transparent={false} visible={true}> */}
              <ActivityIndicator size="large" />
              <Text>Loading...</Text>
            {/* </Modal> */}
          </View>

        :

          <View style={styles.btnContainer}>
            <Image style={styles.logo} source={require('../assets/wefit_icon_orange_in_white512.png')} />

              <TouchableOpacity onPress={() => this._signInWithGoogleAsync()}>
                <Image style={styles.google_signin} 
                  source={require('../assets/btn_google_signin_light_normal_web2x.png')}  // 382 * 92
                />
              </TouchableOpacity>        

              {/* <TouchableOpacity onPress={() => this._signInWithFacebook()}>
                <Image style={styles.facebook_signin} 
                  source={require('../assets/btn_continue_with_facebook.png')}  // 988 * 160
                />
              </TouchableOpacity>   */}

          </View>

        }

      </View>

    ); // closing return
    
  } // closing render


} // closing class
// export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffa500',
  },

  logo:{
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140, // 120
    height: 140, // 120
    marginBottom: 20,
  },
  btnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // height: Dimensions.get('screen').height * 0.4,
    // flexDirection: 'column',
    // flex: 3,
    // backgroundColor: 'green',
    // paddingVertical: 0,
    marginTop: 50,
  },  
  google_signin:{
    // flex: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('screen').width * 0.7,
    height: 0.24 * Dimensions.get('screen').width * 0.7,
    resizeMode: 'contain',
    marginVertical: 15,
  },
  facebook_signin:{
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('screen').width * 0.7 * 0.96,
    height: 0.24 * Dimensions.get('screen').width * 0.7,
    resizeMode: 'contain',
    marginVertical: 10,
    borderColor: '#4267b2',
    borderWidth: 3,
    // borderLeftColor: '#4267b2',
    // borderLeftWidth: 3,
    // shadowColor: 'black',
    // shadowRadius: 15,
    // shadowOffset: { height: 10, width: 10 },
    // height: 46,
  },
  LoadingState:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});