
import * as React from 'react';
import { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import moment from "moment"; // for flatlist

// import DownloadFromStorage from '../api/DLtrainerVideo';
// import Footer from '../shared/Footer';
import {GlobalStyles} from '../shared/GlobalStyles';
// import Feed from './Feed';
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from 'expo-linear-gradient';
// import Icon from 'react-native-vector-icons/FontAwesome';
import * as firebase from 'firebase';
// import { firebaseConfigDefault, firebaseConfigStorageFinalTrainerVideo, firebaseConfigStorageRawTrainerVideo, firebaseConfigStorageScoreTrainerVideo } from '../config';
// import { firebaseDefault, firebaseStorageFinalTrainerVideo, firebaseStorageRawTrainerVideo, firebaseStorageScoreTrainerVideo } from '../App.js';
// const firebaseStorageFinalTrainerVideo = firebase.initializeApp(firebaseConfigStorageFinalTrainerVideo, 'firebaseStorageFinalTrainerVideo');

import * as firestore from 'firebase/firestore';

// import Video from 'react-native-video';
// import { Video } from 'expo-av';
// import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
import { v4 as uuidv4 } from 'uuid';

import Constants from 'expo-constants'; // https://docs.expo.io/versions/latest/react-native/refreshcontrol/
import {vidViewLogDirName} from '../shared/Consts';

// var posts = []; // this variable is for temporarily storage before assigning to this.state.posts


const str_pad_left = function (string,pad,length) { // convert from sec to min:sec // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
    return (new Array(length+1).join(pad)+string).slice(-length);
};


export default class DashboardScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
        // vidId: '',
        // vidFType: '', 
        // vidRawUrl: '',     
        // vidFullUrl: '',
        // vidTNFType: '',
        // vidTNRawUrl: '',
        // vidTNFullUrl: '',
        // uid: '',
        // avatarRawUrl: '',
        // avatarFullUrl: '',
        // view: '',
        // ptsum: '',
        // nname: '',
        posts: [],
        doneComponentDidMount: false,
        // VidViewLogFileName: null, // vidViewLog filenames that sent to Firestore
        flagSentVidViewLog: false, // flag true when completed sending 
        vidViewLogDirName: {vidViewLogDirName}['vidViewLogDirName'], // Local storage directory name to keep vidViewLog
        isLoading: false,
        nname: null, // nickname inp
        flpage: 0, // page of flat list to control loadDashboardFlatList-py. 20200527
        loading: false,
        // data: '',
        page: 1,
        seed: 1,
        error: null,
        refreshing: false,
        oldestVidTs: Date.now() / 1000,
    }
    // this.allSnapShot = this.allSnapShot.bind(this);
    this._sendVidViewLog = this._sendVidViewLog.bind(this);
    this._checkVidViewLogDirectory = this._checkVidViewLogDirectory.bind(this);
    this._makeRemoteRequest = this._makeRemoteRequest.bind(this);
  }

  // allPosts = ''; 20200529

  oldestVidTs = Date.now() / 1000; // Assign timestamp of the oldest video fetched by _loadDashboardFlatlist to control next video to be fetched by _loadDashboardFlatlist 20200528


  async _checkVidViewLogDirectory(){ 
    console.log('----------- _checkVidViewLogDirectory start' );
    // // check if vidViewLog local directory exists, if not then create directory. 
    this.curDir = FileSystem.documentDirectory; // get root directory
    // console.log('this.curDir: ', this.curDir);  


    // // Check Directories & Files in current directory. // THIS IS FOR MANUALM ACTION 
    // FileSystem.readDirectoryAsync( this.curDir ).then( content => {
    //   console.log('this.curDir Dirs and Files: ', content); // how many localFiles in array
    // })

    // // Delete File // THIS IS FOR MANUALM ACTION AGAINST ERROR
    // FileSystem.deleteAsync( this.curDir + this.state.vidViewLogDirName + '/' + "1589984839.296_361f78ed-35be-477e-8676-adaa2fbc3805_cf136872-0f7b-4a06-9918-febc2967efe0.json" ).then( (dir) => {
    //   console.log('---------- File Deleted: ', dir);
    // }).catch(error => {
    //   console.log('error: ', error);
    // });    





    try {
      // this.directories = FileSystem.readDirectoryAsync( this.curDir );



      // check if vidViewLogDirName Directory already exists, if not then create directory
      // if ( this.directories.includes( this.state.vidViewLogDirName ) ) {
      //   console.log('vidViewLogDirName Directory already exists.'); // Do nothing because the directory already exists  

      //   FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogDirName ).then( content => {
      //     console.log('vidViewLogDirName localFiles: ', content); // how many localFiles in array
      //   });
      // } else {  
      //   FileSystem.makeDirectoryAsync(this.curDir + this.state.vidViewLogDirName); // create the directory
      //   console.log('vidViewLogDirName Directory created');
      // }



      // // check if vidViewLogDirName Directory already exists, if not then create directory 20200502
      await FileSystem.getInfoAsync( this.curDir + this.state.vidViewLogDirName).then( async contents => {
        // console.log('getInfoAsync: ', contents, contents['exists'], contents['isDirectory']);
        if ( contents['exists'] == true & contents['isDirectory'] == true ) {
          console.log('vidViewLogDirName already exists');

          // await FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogDirName ).then( content => {
          //   console.log('vidViewLogDirName localFiles: ', content); // how many localFiles in array
          // }).catch( error => {
          //   console.log('FileSystem.readDirectoryAsyncerror: ', error);
          //   alert('FileSystem.readDirectoryAsync error: ', error);
          // })

        } else {
          FileSystem.makeDirectoryAsync(this.curDir + this.state.vidViewLogDirName).then( () => { // create the directory
            console.log('vidViewLogDirName Directory created');
          }).catch( error => {
            console.log('FileSystem.makeDirectoryAsync error: ', error);
            alert('FileSystem.makeDirectoryAsync error: ', error);           
          }); 
        }
      }).catch( error => {
        console.log('FileSystem.getInfoAsync error: ', error);
        alert('FileSystem.getInfoAsync error: ', error);
      })
        


      // FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogDirName).then( contents => {
      //   flagvidViewLogDirExist = false; // default is false
      //   if (contents.length > 0) {
      //     contents.forEach( async ( content ) => { // loop files
      //       console.log('content: ', content);
      //       if (content == this.state.vidViewLogDirName) {
      //         flagvidViewLogDirExist = true;
      //         console.log('vidViewLogDirName Directory already exists.'); // Do nothing because the directory already exists
      //       } else {
      //         FileSystem.deleteAsync( this.curDir + '/' + content);
      //         console.log('---------- Directory Deleted: ', this.curDir + content);
      //       }
      //     });
      //   }  

      //   if (flagvidViewLogDirExist == false) {
      //     FileSystem.makeDirectoryAsync(this.curDir + this.state.vidViewLogDirName); // create the directory
      //     console.log('vidViewLogDirName Directory created');
      //   }
      // });  

    } catch(err){
      // this.directories = []; // create empty array,
      console.log('_checkVidViewLogDirectory error: ', err);
      alert('_checkVidViewLogDirectory error: ', err);
    }

  }
    


  async _sendVidViewLog(){
    console.log('----------- Dashboard _sendVidViewLog start' );
    // this.cntSentVidViewLog = 0; // to count how many cntSentVidViewLog files successfully sent out
    // this.cntSentExerViewLog = 0; // to count how many cntSentExerViewLog files successfully sent out
    
    // // Upload vidViewLog to Firestore
    try {
      if ( FileSystem.readDirectoryAsync( this.curDir  + this.state.vidViewLogDirName) ) {

        await FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogDirName ).then( localFilesArray => {
          this.localFiles = localFilesArray;
          console.log('----- this.localFiles.length: ', this.localFiles.length);
          console.log('----- this.localFiles: ', this.localFiles); // how many localFiles in array
        }).catch( error => {
          console.log('FileSystem.readDirectoryAsync error: ', error);
          alert('FileSystem.readDirectoryAsync error: ', error);
        })

        if (this.localFiles.length > 0){
          this.localFiles.forEach( async (Localfile, num_file) => { // loop files
            console.log('num_file: ', num_file, Localfile);
            
            // read local file
            FileSystem.readAsStringAsync( this.curDir  + this.state.vidViewLogDirName + '/' + Localfile).then( localFileContents => {
              // console.log( 'localFileContents: ', localFileContents);

              // Send to Firestore
              // firebase.firestore().collection("users").doc( firebase.auth().currentUser.uid ).collection("vidViewed").doc( Localfile ).set({
              //   ts: JSON.parse(localFileContents)["ts"],
              //   vidId: JSON.parse(localFileContents)["vidId"],
              //   viewId: JSON.parse(localFileContents)["viewId"],  
              //   uid: firebase.auth().currentUser.uid ,         
              //   sendId: uuidv4(),
              //   startAt: JSON.parse(localFileContents)["startAt"],  
              //   endAt: JSON.parse(localFileContents)["endAt"],  
              //   nTa: JSON.parse(localFileContents)["nTa"],  
              //   RCV_AT: firebase.firestore.FieldValue.serverTimestamp(), // https://cloud.google.com/firestore/docs/manage-data/add-data?hl=ja#%E3%82%A6%E3%82%A7%E3%83%96_9
              //   mdCumAll: JSON.parse(localFileContents)["mdCumAll"],
              //   pt: JSON.parse(localFileContents)["pt"], 
              //   score: JSON.parse(localFileContents)["score"],
              //   // posAll: JSON.parse(localFileContents)["posAll"], // TESTMODE only, otherwise Null
              //   playSum: JSON.parse(localFileContents)["playSum"],
              //   playPct: JSON.parse(localFileContents)["playPct"],
              //   cntOutAccel: JSON.parse(localFileContents)["cntOutAccel"],
              //   cntPressPlayButton: JSON.parse(localFileContents)["cntPressPlayButton"],
              //   cntPressPauseButton: JSON.parse(localFileContents)["cntPressPauseButton"],
              //   cntFrameOut: JSON.parse(localFileContents)["outCountCum"], // this is a Dictionary, count how many times out from Frame
              //   identifiedBparts: JSON.parse(localFileContents)["identifiedBparts"], // this is an Array 
 
              //   iTWidth: JSON.parse(localFileContents)["iTWidth"],
              //   iTHeight: JSON.parse(localFileContents)["iTHeight"],
              //   scHeight: JSON.parse(localFileContents)["scHeight"],
              //   scWidth: JSON.parse(localFileContents)["scWidth"],
              //   winHeight: JSON.parse(localFileContents)["winHeight"],
              //   winWidth: JSON.parse(localFileContents)["winWidth"],
              //   texDimsWidth: JSON.parse(localFileContents)["texDimsWidth"],
              //   texDimsHeight: JSON.parse(localFileContents)["texDimsHeight"],
              //   outNTAcnt: JSON.parse(localFileContents)["outNTAcnt"],
              //   numFrameVidStart: JSON.parse(localFileContents)["numFrameVidStart"],
              //   numFrameAllPosOk: JSON.parse(localFileContents)["numFrameAllPosOk"],
              //   numFrameVidEnd: JSON.parse(localFileContents)["numFrameVidEnd"],

              // }).then( () => {
              //   // this.setState({ vidViewLogFileName: Localfile }); 

              //   //Delete a file in the LOCAL directory
              //   FileSystem.deleteAsync( this.curDir + this.state.vidViewLogDirName + '/' + Localfile).then( () => {
              //     console.log('Localfile Uploaded & Deleted: ', num_file, Localfile);
              //   }).catch( error => {
              //     console.log('FileSystem.deleteAsync error: ', error);
              //     alert('FileSystem.deleteAsync error: ', error);
              //   })

              //   // this.cntSentVidViewLog++; // count increment
              // }).catch( (error) => {
              //   console.error("Error uploading document: ", error);
              //   alert("Error uploading document.");
              // });




////////// sendSingleVidViewLog-py ////////////////////////////
              // sendSingleVidViewLog-py
              const _sendSingleVidViewLog = (idTokenCopied) => {
                console.log('----- Dashboard _sendSingleVidViewLog.');
                // console.log('----- _getUserProfile idTokenCopied: ', idTokenCopied);
                fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/sendSingleVidViewLog-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
                  method: 'POST',
                  headers: {
                    // 'Accept': 'application/json', 
                    'Content-Type' : 'application/json' // text/html text/plain application/json
                  },
                  // mode: "no-cors", // no-cors, cors, *same-origin
                  body: JSON.stringify({
                    id_token: idTokenCopied,
                    ts: JSON.parse(localFileContents)["ts"],
                    vidId: JSON.parse(localFileContents)["vidId"],
                    viewId: JSON.parse(localFileContents)["viewId"],  
                    uid: firebase.auth().currentUser.uid ,         
                    sendId: uuidv4(),
                    startAt: JSON.parse(localFileContents)["startAt"],  
                    endAt: JSON.parse(localFileContents)["endAt"],  
                    nTa: JSON.parse(localFileContents)["nTa"],  
                    RCV_AT: firebase.firestore.FieldValue.serverTimestamp(), // https://cloud.google.com/firestore/docs/manage-data/add-data?hl=ja#%E3%82%A6%E3%82%A7%E3%83%96_9
                    mdCumAll: JSON.parse(localFileContents)["mdCumAll"], // this is an Array
                    pt: JSON.parse(localFileContents)["pt"], 
                    score: JSON.parse(localFileContents)["score"],
                    playSum: JSON.parse(localFileContents)["playSum"],
                    playPct: JSON.parse(localFileContents)["playPct"],
                    cntOutAccel: JSON.parse(localFileContents)["cntOutAccel"],
                    cntPressPlayButton: JSON.parse(localFileContents)["cntPressPlayButton"],
                    cntPressPauseButton: JSON.parse(localFileContents)["cntPressPauseButton"],
                    cntFrameOut: JSON.parse(localFileContents)["outCountCum"], // this is a Dictionary, count how many times out from Frame
                    identifiedBparts: JSON.parse(localFileContents)["identifiedBparts"],　// this is an Arrays
                    iTWidth: JSON.parse(localFileContents)["iTWidth"],
                    iTHeight: JSON.parse(localFileContents)["iTHeight"],
                    scHeight: JSON.parse(localFileContents)["scHeight"],
                    scWidth: JSON.parse(localFileContents)["scWidth"],
                    winHeight: JSON.parse(localFileContents)["winHeight"],
                    winWidth: JSON.parse(localFileContents)["winWidth"],
                    texDimsWidth: JSON.parse(localFileContents)["texDimsWidth"],
                    texDimsHeight: JSON.parse(localFileContents)["texDimsHeight"],
                    cntNTAout: JSON.parse(localFileContents)["outNTAcnt"],
                    numFrameVidStart: JSON.parse(localFileContents)["numFrameVidStart"],
                    numFrameAllPosOk: JSON.parse(localFileContents)["numFrameAllPosOk"],
                    numFrameVidEnd: JSON.parse(localFileContents)["numFrameVidEnd"], 
                  })
                }).then( result => result.json() )
                  .then( response => { 
                    console.log('----- _sendSingleVidViewLog response:', response );
                    if (response["code"] == 'ok' ) {
                        //Delete SINGLE file in the LOCAL directory
                        console.log(' d d deleting');
                        FileSystem.deleteAsync( this.curDir  + this.state.vidViewLogDirName + '/' + Localfile).then( () => {
                          console.log('SINGLE Localfile Uploaded & Deleted: ', vidViewLogFileName );
                          deactivateKeepAwake();
                        }).catch( error => {
                          deactivateKeepAwake();
                          console.log('FileSystem.deleteAsync error: ', error);
                          // alert('FileSystem.deleteAsync error.');
                        })
          
                    } else { // response[code] is Error
                      deactivateKeepAwake();
                      console.log('Received response[code] = error from functions.');
                      alert('Received response[code] = error from functions. Please log-in again.');
                    }
                }).catch( error => {
                  deactivateKeepAwake();
                  console.log('Error Dashboard _sendSingleVidViewLog-py: ', error);
                  alert('Error response from _sendSingleVidViewLog, Please log-in again.');
                });
              }         


///////////  sendSingleVidViewLog-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
              firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
                // Send token to your backend via HTTPS
                // console.log('----- Got idToken. ');
                const idTokenCopied = idToken;

                _sendSingleVidViewLog(idTokenCopied); // run http trigger
                
              }).catch(function(error) {
                deactivateKeepAwake();
                console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
              });  




            });
            
          });

          // console.log('----- this.cntSentVidViewLog: ', this.cntSentVidViewLog);

        } else {
          // console.log('No files in the directory.'); // Do nothing since no files to be sent to Firebase
        };
        
      } else {  
        console.log('No directory.'); // This is a very rare case
      }
    } catch (err) {
      // this.directories = []; // create empty array,
      console.log('_sendVidViewLog error: ', err)
      alert('_sendVidViewLog error: ', err)
    }
  
  }


  async componentDidMount() {
    console.log('------------- componentDidMount Dashboard started');
    console.log('------------------------------ this.props.navigation.getParam: ', this.props.navigation.getParam ); //, route.param['authedUid']
    // console.log('firebase.auth(): ', firebase.auth() );
    // posts = []; // clear flatlist
    // console.log('this.state.vidViewLogDirName: ', this.state.vidViewLogDirName);
    // console.log('----- Dashboard.js firebase.auth().currentUser.uid: ', firebase.auth().currentUser.uid );


    if (this.state.doneComponentDidMount == false) { // if variable is null. this if to prevent repeated loop.
      // console.log('this.state.vidFullUrl started ');
      this.setState({isLoading: true});


      ////////// if New User, then go to Profile.js for FIRST fill out ////////////////////////////
      // await firebase.firestore().collection("users").doc( firebase.auth().currentUser.uid ).get().then( (QueryUid) => { 
      //   if (QueryUid) {
      //     // console.log('QueryUid.data(): ', QueryUid.data());
      //     // console.log('QueryUid.data().NNAME: ', QueryUid.data().NNAME);
  
      //     if (QueryUid.data().NNAME) {
      //       this.setState({
      //         nname: QueryUid.data().NNAME,
      //       });
      //       console.log('this.state.nname: ', this.state.nname );
      //     } else { // No Nickname means New User.
      //       console.log('==== Dashboard.js New User coming. Going to Profile.js');
      //       this.props.navigation.push('Profile');
      //     }                    
      //   }
      // }).catch(function(error) {
      //   alert("Error getting users/{userId}:", error);
      //   console.log("Error getting users/{userId}}:", error);
      // });    



////////// if New User, then go to Profile.js for FIRST fill out ////////////////////////////
      // getUserProfile-py
      const _getUserProfile = (idTokenCopied) => {
        console.log('----- Dashboard _getUserProfile.');
        // console.log('----- _getUserProfile idTokenCopied: ', idTokenCopied);
        fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/getUserProfile-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
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
            console.log('----- Dashboard _getUserProfile response:', response );
            if (response["code"] == 'new_user' ) {
              console.log('==== Dashboard.js New User and going to Profile.js for FIRST fill out');
              this.props.navigation.push('Profile', {isNewUser: true}); // navigate to Profile.js Edit mode by {isNewUser: true} for this.state.isEditing:true. 20200526
            } else if ( response["code"] == 'ok' ) {
              null
            } else { // response[code] is Error
              console.log('Received response[code] = error from functions.');
              alert('Received response[code] = error from functions., Please log-in again.');
            }

            this._makeRemoteRequest(); // 20200529


        }).catch( error => {
          console.log('Error Dashboard _getUserProfile-py: ', error);
          alert('Error response from _getUserProfile, Please log-in again.');
        });
      }         


      ///////////  getUserProfile-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
      await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
        // Send token to your backend via HTTPS
        // console.log('----- Got idToken. ');
        const idTokenCopied = idToken;

        _getUserProfile(idTokenCopied); // run http trigger

      }).catch(function(error) {
        console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
      });    






      // this._makeRemoteRequest(); // kick
      // console.log('this.state: ', this.state);      





      // await firebase.firestore().collection("vidMetaFinal").get().then( async (QuerySnapshot) => {
      // // firebase.firestore().doc('/trainerVideo/EggSQY6V7gEZjHQ28sbV').get().then((response) => {
      //     // if (QuerySnapshot.exists) {
      //     if (QuerySnapshot) {
      //         QuerySnapshot.docs.forEach(async (doc) => {
      //             // console.log(`${doc.id} => ${doc.data().name}`); 
      //             var docData = await doc.data(); // assign to object
      //             // console.log('docData: ', docData);
      //             // console.log('docData["VIDID"]: ', docData["VIDID"]);

      //             await firebase.firestore().collection("users").doc( docData["UID"] ).get().then( (QueryUid) => { // get avatart raw url 20200411
      //               if (QueryUid) {
      //                 docData.NNAME = QueryUid.data().NNAME ;
      //                 docData.avatarRawUrl = QueryUid.data().AVTRURL;
      //                 // console.log('docData.NNAME');
      //               }
      //             }).catch(function(error) {
      //               alert("Error getting users/AVTRURL:", error.code);
      //               console.log("Error getting users/AVTRURL:", error.code);
      //             });  
              
      //             // // --------------- Get AVATAR URL 
      //             const storage= firebase.storage(); // https://firebase.google.com/docs/storage/web/start?hl=ja
      //             const storageRef = storage.ref(); // Create a reference to the file we want to download
      //             // const starsRef2 = storageRef.child( 'avatar/' + docData.avatarRawUrl); 
      //             // await starsRef2.getDownloadURL().then( async (fullUrlAvatar) => {
      //             //     docData.avatarFullUrl = fullUrlAvatar;
      //             //     // console.log('docData.avatarFullUrl');
      //             // }).catch(function(error) {
      //             //   alert('Error getting avatar/avatarFullUrl : ', error.code);
      //             //   console.log('Error getting avatar/avatarFullUrl : ', error.code);
      //             // });   
                  

      //             await firebase.firestore().collection("vidMetaFinal").doc( docData["VIDID"] ).collection("activities").doc("current").get().then( (QueryCurrent) => { // get VIEW 20200411
      //               // console.log('--------- vidMetaFinal --  this.state.vidId: ', docData["VIDID"]);
      //               if (QueryCurrent) {
      //                 // console.log('QueryCurrent.data().VIEW: ', QueryCurrent.data().VIEW);
      //                 docData.VIEW = QueryCurrent.data().VIEW;
      //                 docData.PTSUM = QueryCurrent.data().PTSUM;
      //                 // console.log('docData.VIEW');
      //               }
      //             }).catch(function(error) {
      //               alert("Error getting vidMetaFinal/<vidId>/activities/current:", error.code);
      //               console.log("Error getting vidMetaFinal/<vidId>/activities/current:", error.code);
      //             });  
              

      //             //https://firebase.google.com/docs/storage/web/download-files?authuser=0
      //             // const firebaseStorageFinalTrainerVideo = firebase.initializeApp(firebaseConfigStorageFinalTrainerVideo, 'firebaseStorageFinalTrainerVideo');             
      //             const starsRef = storageRef.child( 'tn/' + docData["VIDID"]  ); // 'finalScoreTrainerVideo/1578303596642qvykv2h8.json' // // 'trainerVideo/flower.jpg'
      //             await starsRef.getDownloadURL().then( async (urlTN) => {
      //                 docData.vidTNFullUrl = urlTN;
      //                 // console.log('docData.vidTNFullUrl');
      //             }).catch(function(error) {
      //               alert('Error getting vidTNRawUrl: ', error.code);
      //               console.log('Error getting vidTNRawUrl: ', error.code);
      //               // https://firebase.google.com/docs/storage/web/handle-errors
      //               switch (error.code) {
      //                 case 'storage/object-not-found': // File doesn't exist
      //                   break;
      //                 case 'storage/unauthorized': // User doesn't have permission to access the object
      //                   break;
      //                 case 'storage/canceled': // User canceled the upload
      //                   break;
      //                 case 'storage/unknown': // Unknown error occurred, inspect the server response
      //                   break;
      //               }
      //             }); 

      //             posts.push( docData ); // append to object // this variable is for temporarily storage before assigning to this.state.post
      //             // console.log('posts.push');
                  
      //             this.setState({ posts: JSON.parse(JSON.stringify(posts)) }); // assign to this.state // https://www.quora.com/How-can-I-solve-the-Uncaught-Error-Objects-are-not-valid-as-a-React-child-found-object-with-keys-original-thumbnail-If-you-meant-to-render-a-collection-of-children-can-you-use-an-array-instead
      //             // console.log('--- this.state.posts: '); 

      //             // this.allPosts = JSON.parse(JSON.stringify(posts));
      //             // console.log('--- this.allPosts: ', this.allPosts);
      //             // console.log('--- xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx '); 


      //         });

      //     } else { // doc.data() will be undefined in this case
      //         alert("No document in vidMetaFinal.");
      //         console.log("No document in vidMetaFinal.");
      //     }      
      // }).catch(function(error) {
      //   alert("Error getting vidMetaFinal:", error.code);
      //   console.log("Error getting vidMetaFinal:", error.code);
      // });  
            
    
    } // closing if



    await this._checkVidViewLogDirectory();
    await this._sendVidViewLog();    



    this.setState({ doneComponentDidMount: true, isLoading: false });
    console.log('------------- componentDidMount Dashboard completed');
      
  } // closing componentDidMount



  // async componentDidUpdate() {
  //   console.log('------------- componentDidUpdate Dashboard');
  // }



  async componentWillUnmount() {
    console.log('------------- componentWillUnmount Dashboard');
    // const posts = []; // clear variable
    // posts = []; // added 20200529
  }
 
   
  _makeRemoteRequest = async () => {
    console.log('------------- _makeRemoteRequest');
    const { page } = this.state;
    // const url = `https://randomuser.me/api/?seed=${seed}&page=${page}&results=2`;
    this.setState({ loading: true });


    const _loadDashboardFlatlist = (idTokenCopied) => {
      console.log('----- Dashboard _loadDashboardFlatlist.');
      console.log('this.oldestVidTs: ', this.oldestVidTs);
      
      fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/loadDashboardFlatlist-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
        method: 'POST',
        headers: {
          // 'Accept': 'application/json', 
          'Content-Type' : 'application/json' // text/html text/plain application/json
        },
        // mode: "no-cors", // no-cors, cors, *same-origin
        body: JSON.stringify({
          id_token: idTokenCopied,
          oldestVidTs: this.oldestVidTs,    
        })
      }).then( result => result.json() )
        .then( response => { 
          // console.log('------------------ _makeRemoteRequest response: ', response);
          if (response["code"] == 'ok') {
            console.log('_makeRemoteRequest response.detail.vidMetas: ', response.detail.vidMetas );
            // console.log('_makeRemoteRequest response.detail.vidMetas JSON.parse: ', JSON.parse(response.detail.vidMetas) ); // Error [SyntaxError: JSON Parse error: Unexpected identifier "object"]
            // console.log('_makeRemoteRequest response.detail.vidMetas JSON.stringify: ', JSON.stringify(response.detail.vidMetas) );
            // console.log('_makeRemoteRequest response.detail.vidMetas JSON.parse JSON.stringify: ', JSON.parse( JSON.stringify(response.detail.vidMetas) ) );

            this.setState({
              posts: page === 1 ? response.detail.vidMetas  : [...this.state.posts, ...response.detail.vidMetas ],
              // posts: page === 1 ? JSON.parse(JSON.stringify( response.detail.vidMetas ) ) : [...this.state.data, ...JSON.parse( JSON.stringify( response.detail.vidMetas) ) ],
              // posts: page === 1 ? response.detail.vidMetas  : [ this.state.posts, response.detail.vidMetas ],
            //   // error: response.error || null,
              loading: false,
              refreshing: false,
              isLoading: false,
            });
            // console.log(' ,,,,,,,,,,,,,,here0');
            // this.setState({
              // data: JSON.stringify( response.detail.vidMetas ),
              // posts: JSON.parse(JSON.stringify( response.detail.vidMetas )),
            // });          

          } else if (response["code"] == 'no_more_data') {
            this.setState({ loading: false , isLoading: false,});
            console.log('No more data by _loadDashboardFlatlist.');
            alert('No more video.');
          }

        }).catch((error) => {
          this.setState({ loading: false, isLoading: false, });
          console.log('Error _loadDashboardFlatlist: ', error);
          alert('Error _loadDashboardFlatlist. Please try again later.');
        });

    }


    await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
      // Send token to your backend via HTTPS
      // console.log('----- Got idToken. ');
      const idTokenCopied = idToken;

      _loadDashboardFlatlist(idTokenCopied);

    }).catch(function(error) {
      console.log('Error xxxxxxxxxxxxxxxx Could not get idToken _loadDashboardFlatlist: ', error);
    });  


  };


  _handleRefresh = async () => {
    console.log('------------- _handleRefresh');
    this.oldestVidTs = Date.now() / 1000; // reset timestamp to current time
    this.setState({
        page: 1,
        // seed: this.state.seed + 1,
        refreshing: true,
        oldestVidTs: Date.now() / 1000,
        isLoading: true,
      },
      () => {
        this._makeRemoteRequest();
      }
    );
  };


  _handleLoadMore = async () => {
    // console.log('------------- _handleLoadMore');
    console.log('------------- _handleLoadMore this.oldestVidTs: ', this.oldestVidTs);
    this.setState({ page: this.state.page + 1 }, () => {
      this._makeRemoteRequest();
    });
  };



  renderPost = post => {

      (() => {
          if (post.VIEW > 1000000) { 
            this.VIEW = parseInt(post.VIEW / 1000000) + 'M ' // million
          } else if (post.VIEW > 1000) { 
            this.VIEW = parseInt(post.VIEW / 1000) + 'K '// thousand
          } else { 
            this.VIEW = parseInt(post.VIEW)
          }; 

          this.PTSUM = parseFloat(post.PTSUM);
          
          post.LEN = parseInt(post.LEN); // convert to Int
          if (post.LEN >= 60) {
            this.LEN = str_pad_left( post.LEN / 60,'0',2) + 'm' + str_pad_left( post.LEN - post.LEN / 60 * 60,'0',2) + 's'
          } else { 
            this.LEN = '00m' + str_pad_left( post.LEN, '0', 2) + 's' 
          }; // convert sec to min:sec
          
          this.TTLPT = parseFloat(post.TTLPT).toFixed(2); // fix decimal place

          if ( this.oldestVidTs > post.TS) { // Assign timestamp of the oldest video fetched by _loadDashboardFlatlist to control next video to be fetched by _loadDashboardFlatlist 20200528
            this.oldestVidTs = post.TS;
          } 

          post.TNURL = 'https://firebasestorage.googleapis.com/v0/b/joogo-v0.appspot.com/o/tn%2F' + post.VIDID + '?alt=media' // URL for Thumbsnail photo 20200528
          

          console.log('------------- renderPost: ' , post.TITLE);

          }
          )(); 

      // this._checkVidViewLogDirectory();
      // this._sendVidViewLog();


      return (
          <View style={styles.feedItem}>
              
              {/* upper row */}
              <View style={{ flex: 2, flexDirection: "row", left: 10}}>
                  {/* <View style={{ }}> 
                      <Image source={{uri: post.avatarFullUrl}} style={styles.avatar} resizeMode="cover"/>
                  </View>  */}

                  <View style={{flexDirection: "column"}}>
                      <Text style={styles.name}>{post.NNAME}</Text>
                      <Text style={styles.timestamp}>{moment.unix(post.TS).fromNow()}</Text> 
                  </View>
              </View>

              {/* bottom row */}    
              <View style={{ flex: 2, flexDirection: "row" }}> 

                  <View style={styles.textContents}>
                      <Text style={styles.title}> '{post.TITLE}' </Text>

                      <View style={styles.textMetadata}>
                        <View style={{flexDirection: "row", marginVertical: 3, marginLeft: 2,}}>
                            <Ionicons name='ios-videocam' size={20} color="#73788B"/>
                            <Text style={styles.length}> {this.LEN} </Text>
                        </View>

                        <View style={{flexDirection: "row", marginVertical: 3}}>
                            <MaterialIcons name='center-focus-strong' size={20} color="#73788B"/> 
                            <Text style={styles.tags}> 
                                {String(post.TAG).replace(',', ', ')}
                            </Text>
                        </View>

                        <View style={{flexDirection: "row", marginVertical: 3, marginLeft: 2,}}>
                            <Ionicons name='ios-body' size={20} color="#73788B"/>
                            <Text style={styles.points}> {this.TTLPT} pts</Text>
                        </View>

                        <View style={{flexDirection: "row", marginVertical: 3, marginLeft: 2,}}>
                            <Ionicons name='ios-eye' size={20} color="#73788B"/>
                            <Text style={styles.views}> {this.VIEW} views</Text>
                        </View>

                        {/* <View style={{flexDirection: "row", marginVertical: 2, marginLeft: 2,}}>
                            <Ionicons name='ios-heart' size={20}/> 
                            <Text style={styles.likes}>  {post.likes} </Text>
                        </View> */}

                        {/* <View style={{ flexDirection: "row", position:'absolute', bottom: 5 }}>
                            <Ionicons name="ios-heart-empty" size={28} color="#73788B" style={{ marginRight: 16 }} />
                            <Ionicons name="ios-chatboxes" size={28} color="#73788B" />
                        </View> */}
                      </View>  

                  </View>

                  <View style={{ }}>
                      <TouchableOpacity onPress={ () => this.props.navigation.push('Exercise', post) } >
                          {/* <Image source={{uri: 'https://firebasestorage.googleapis.com/v0/b/getfit-f3a98.appspot.com/o/trainerVideo%2Fflower.jpg?alt=media&token=73769626-91ee-4eb1-b430-b24e0b43105a' }}  style={styles.postImage} resizeMode="cover" /> */}
                          <Image source={{uri: post.TNURL }} style={styles.postImage} resizeMode="cover" />   
                          {/* <Image source={{uri: post.vidTNFullUrl }} style={styles.postImage} resizeMode="cover" />                       */}
                          {/* <Video source={{ uri: post.vidFullUrl }}   // Can be a URL or a local file.
                            style={styles.postImage}
                            // positionMillis={7000}
                            rate={1.0}
                            isMuted={true}
                            resizeMode="cover"
                            // shouldPlay
                            usePoster
                            /> */}
                      </TouchableOpacity>
                  </View>

              </View>
            
          </View>
      );
  };






  render() {
    console.log('---------------- render');
    const { isLoading } = this.state;

    return (
      <View style={styles.container}>

        <SafeAreaView>


        { isLoading ? 
           <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="large" color='#ffa500'/>
            <Text>Loading....</Text>
          </View>
        :
           <ScrollView  style={styles.scrollview}>
           {/* <View  style={styles.scrollview}> */}

            {/* <StatusBar backgroundColor="black" barStyle="dark-content" hidden = {false} translucent = {true} /> */}

            {/* <Button title="Go to Test1" onPress={goToTest1} /> */}
            {/* <Button title="Go to Excercise" onPress={ () => this.props.navigation.push('Exercise')} /> */}

            {/* <Feed/> */}
            <FlatList
              style={styles.feed}
              data={this.state.posts}
              // data={this.allPosts}
              renderItem={({ item }) => this.renderPost(item)}
              // keyExtractor={item => item.id}
              keyExtractor={item => item.vidId}
              showsVerticalScrollIndicator={false}
              // key={item => item.vidId} // https://stackoverflow.com/questions/45947921/react-native-cant-fix-flatlist-keys-warning
              onRefresh={this._handleRefresh}
              refreshing={this.state.refreshing}
              onEndReached={this._handleLoadMore}
              onEndReachedThreshold={0}
            >
            </FlatList>

           {/* </View> */}
          </ScrollView>
        }

        </SafeAreaView>



        {/* <Footer/> */}
        {/* <LinearGradient colors={['#ffa500', '#ffb300', 'orange']} style={styles.footerContainer}>  */}
        <View style={styles.footerContainer}>
          {/* https://docs.expo.io/versions/latest/sdk/linear-gradient/ */}
          {/* <MaterialIcons name='person' size={28} title='account' style={styles.ProfileIcon} onPress={goToProfile}/> */}
          {/* this.setState({doneComponentDidMount: false}) */}
          <Ionicons name='ios-person' size={28} color="white" style={styles.ProfileIcon} onPress={ () => this.props.navigation.push('Profile') } />  
          <Ionicons name="ios-add-circle-outline" size={28} color="white" style={styles.PostIcon} onPress={ () => this.props.navigation.push('Post') }/>
          <Ionicons name='ios-aperture' size={28} color="white" style={styles.HistoryIcon} onPress={ () => this.props.navigation.push('History')}/>
          {/* <Ionicons name='ios-notifications-outline' size={28} color="white" style={styles.NotificationIcon} onPress={ () => this.props.navigation.push('Notification') }/> */}
        {/* </LinearGradient> */}
        </View>

      </View>
    )  
  }

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: 'white',
  },
  scrollview: {
    width: '100%',
    height: '70%',
    top: 5,
    // bottom: 50,//Footer.currentHeight,
    // backgroundColor: 'gray',
    // marginVertical: 20,
    // paddingHorizontal: 0,
    marginBottom: 55,
  },
  footerContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffa500',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 70,
    // marginTop: 50,
  },  
  feed: {
    marginHorizontal: 16
  },
  feedItem: {
      backgroundColor: "#FFF",
      borderRadius: 10,
      padding: 8,
      flexDirection: "column",
      flex: 2,
      marginVertical: 8,
      shadowColor: 'black', // iOS
      shadowOffset: { width: 5, height: 5 }, // iOS
      shadowOpacity: 0.3, // iOS
      shadowRadius: 2, // iOS   
      elevation: 2, // Android
  },
  avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12
  },
  name: {
      fontSize: 15,
      fontWeight: "500",
      color: '#454D65' 
  },
  timestamp: {
      fontSize: 11,
      color: "#C4C6CE",
      marginTop: 0
  },
  textContents: {
      flexDirection: "column", 
      // justifyContent: "space-between", 
      // backgroundColor: 'blue',
      width: 160,
      // marginLeft: 3
  },
  title: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffa500', //'#ffbf00' // "#838899"
      marginBottom: 12,

  },
  textMetadata: {
      position: 'absolute',
      bottom: 4,
  },
  length:{
      // fontWeight: 'bold',
      marginLeft: 4,
  },    
  points:{
      // fontWeight: 'bold',
      marginLeft: 6,
  },
  tags:{
      marginLeft: 6,
      // backgroundColor: 'lightgray',
      // borderRadius: 5,

  },
  views:{
    marginLeft: 4,
  },
  likes: {

  },
  postImage: {
      width: 150,
      height: 225,
      // width: 200,
      borderRadius: 10,
      marginVertical: 5,
      right: 0,
  }


});