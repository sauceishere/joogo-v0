
// import * as React from 'react';
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Dimensions, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, Modal, Keyboard, TouchableWithoutFeedback, Picker,TextInput  } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import moment from "moment"; // for flatlist
import {GlobalStyles} from '../shared/GlobalStyles';
import * as firebase from 'firebase';
import * as firestore from 'firebase/firestore';
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
import { v4 as uuidv4 } from 'uuid';
import Constants from 'expo-constants'; // https://docs.expo.io/versions/latest/react-native/refreshcontrol/
// import {vidViewLogDirName} from '../shared/Consts';
import { AdMobBanner } from 'expo-ads-admob'; 
import ThreeAxisSensor from 'expo-sensors/build/ThreeAxisSensor';
// import * as SQLite from 'expo-sqlite';  // os_.platform error came out if use SQLite 20201015

import {LB_PER_KG} from '../shared/Consts';




var post_num = 0; // to control when to show Adds in FlatList 20200623

export default class DashboardScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
        posts: [],
        doneComponentDidMount: false,
        // VidViewLogFileName: null, // vidViewLog filenames that sent to Firestore
        flagSentVidViewLog: false, // flag true when completed sending 
        vidViewLogTemp: 'vidViewLogTemp_' + firebase.auth().currentUser.uid, //UID will be assigned during componentDidMount // {vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
        isLoading: true,
        nname: null, // nickname inp
        flpage: 0, // page of flat list to control loadDashboardFlatList-py. 20200527
        loading: false,
        // data: '',
        page: 1,
        // seed: 1,
        error: null,
        refreshing: false,
        // oldestVidTs: Date.now() / 1000,
        flagMastersLoaded: false, // becomes true when wpart & const_exer downloaded from firebase 20200606.
        // wpart: null, // will be assigned after downloaded from Firebase. 20200606
        const_exer: null, // will be assigned after downloaded from Firebase. 20200606
        adUnitID: null, // get adUnitID form Firebase 20200625
        // mets_per_part: null, //20200804
        scaler_scale: null,
        scaler_mean: null,
        model: null,
        nname: null,
        wval: null, 
        wunit: null, 
        hval: null, 
        hunit: null, 
        nat: null, 
        byr: null,
        gdr: null,
        bt0: null,
        bt1: null,
        ts: null, // account created
        llogin: null,
        lupdate: null,
        // fillingNow: true, // control modal    
        vidViewLog: null,    
        model2: null,
        // dbName: 'db_' + firebase.auth().currentUser.uid,
        // dbSQLite: null,
        isGuest: this.props.navigation.getParam('isGuest'), // navigated from LoginScreen.js or LoadingScreen.js 20201017
        // scoreTtl: null, // for Stats.js
        // playSumTtl: null, // for Stats.js
        // playCnt: null, // for Stats.js
        // dataByYearWeeks: null, // for Stats.js chartData
        // StatsDataLoadedAt: null, // for Stats.js 
        // lastPlayEnded: this.props.navigation.getParam('lastPlayEnded') || 0, // to control if load _getStats-py or not 
    }
    // this.allSnapShot = this.allSnapShot.bind(this);
    this._sendVidViewLog = this._sendVidViewLog.bind(this);
    this._checkVidViewLogDirectory = this._checkVidViewLogDirectory.bind(this);
    this._makeRemoteRequest = this._makeRemoteRequest.bind(this);
    this._handleLoadMore = this._handleLoadMore.bind(this);
    this._handleRefresh = this._handleRefresh.bind(this);
  }


  // oldestVidTs = Date.now() / 1000; // Assign timestamp of the oldest video fetched by _loadDashboardFlatlist to control next video to be fetched by _loadDashboardFlatlist 20200528
  largestMETS = 0; // Initially want to get larger than 0 METS_COMPUTED

  
  async _checkVidViewLogDirectory(){ 
    console.log('----------- _checkVidViewLogDirectory start' );
    // // check if vidViewLog local directory exists, if not then create directory. 
    this.curDir = FileSystem.documentDirectory; // get root directory
    // console.log('this.curDir: ', this.curDir);  


    // // // Check Directories & Files in current directory. // THIS IS FOR MANUAL ACTION 
    // FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogTemp ).then( content => {
    //   console.log('check this.curDir Dirs and Files: ', content); // how many localFiles in array
    // })

    // // Delete File // THIS IS FOR MANUAL ACTION AGAINST ERROR
    // FileSystem.deleteAsync( this.curDir  ).then( (dir) => {
    //   console.log('---------- File Deleted: ', dir);
    // }).catch(error => {
    //   console.log('error: ', error);
    // });    



    try {

      // // check if vidViewLogTemp Directory already exists, if not then create directory 20200502
      await FileSystem.getInfoAsync( this.curDir + this.state.vidViewLogTemp).then( async contents => {
        console.log('vidViewLogTemp getInfoAsync contents[size] in MB: ', contents['size'] / 1024 / 1024, );
        if ( contents['exists'] == true & contents['isDirectory'] == true ) { // if folder already exists.
          console.log('vidViewLogTemp already exists');
          console.log('vidViewLogTemp contents.length: ', contents.length);
          // console.log(FileSystem.documentDirectory + this.state.vidViewLogTemp + '/');
          // console.log(this.curDir + this.state.vidViewLogTemp + '/');

          if ( contents['size'] > 50 * 1024 * 1024 ) { // if folder size is over 50MB, then delete files. 20200608
            FileSystem.deleteAsync( this.curDir ).then( (dir) => {
              console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx vidViewLog Folder Deleted due to exceeded folder size.');
              // console.log('Video View Log files can not be sent out. Please contact help center');
              // alert('Video View Log files can not be sent out. Please contact help center');
            }).catch(error => {
              console.log('Error deleting vidViewLog Folder: ', error);
            });    
          }

        } else { // if folder NOT exists, then create the directory
          FileSystem.makeDirectoryAsync(this.curDir + this.state.vidViewLogTemp).then( () => { // create the directory
            console.log('vidViewLogTemp Directory created');
          }).catch( error => {
            console.log('FileSystem.makeDirectoryAsync error: ', error);
            alert('FileSystem.makeDirectoryAsync error: ', error);           
          }); 
        }
      }).catch( error => {
        console.log('vidViewLogTemp　FileSystem.getInfoAsync error: ', error);
        alert('vidViewLogTemp　FileSystem.getInfoAsync error: ', error);
      })


      // // // check if vidViewLog Directory already exists, if not then create directory 20200917
      // await FileSystem.getInfoAsync( this.curDir + this.state.vidViewLog).then( async contents => {
      //   console.log('vidViewLog getInfoAsync contents[size] in MB: ', contents['size'] / 1024 / 1024 );
      //   if ( contents['exists'] == true & contents['isDirectory'] == true ) { // if folder already exists.
      //     console.log('vidViewLog already exists');
      //     console.log('vidViewLog contents.length: ', contents.length);
      //     // console.log(FileSystem.documentDirectory + this.state.vidViewLog + '/');
      //     // console.log(this.curDir + this.state.vidViewLog + '/');

      //     if ( contents['size'] > 50 * 1024 * 1024 ) { // if folder size is over 50MB, then delete files. 20200608
      //       FileSystem.deleteAsync( this.curDir + this.state.vidViewLog ).then( (dir) => {
      //         console.log('---------- vidViewLog Folder Deleted');
      //         console.log('Video View Log files can not be sent out. Please contact help center');
      //         // alert('Video View Log files can not be sent out. Please contact help center');
      //       }).catch(error => {
      //         console.log('Error deleting vidViewLog Folder: ', error);
      //       });    
      //     }

      //   } else { // if folder NOT exists, then create the directory
      //     FileSystem.makeDirectoryAsync(this.curDir + this.state.vidViewLog).then( () => { // create the directory
      //       console.log('vidViewLog Directory created');
      //     }).catch( error => {
      //       console.log('FileSystem.makeDirectoryAsync error: ', error);
      //       alert('FileSystem.makeDirectoryAsync error: ', error);           
      //     }); 
      //   }
      // }).catch( error => {
      //   console.log('vidViewLog FileSystem.getInfoAsync error: ', error);
      //   alert('vidViewLog FileSystem.getInfoAsync error: ', error);
      // })      


        // // check if db directory exists.
        // this.curDir = FileSystem.documentDirectory; // get root directory
        // // // check if vidViewLogTemp Directory already exists, if not then create directory 20200502
        // await FileSystem.getInfoAsync( this.curDir + '/SQLite/' + dbName ).then( async contents => {
        //     console.log('contents: ', contents);
        //     if ( contents['exists'] == true ) { // if folder already exists.
        //         console.log('dbName already exists');
        //         console.log('dbName contents.length: ', contents.length);
        //         console.log('dbName getInfoAsync contents[size] in MB: ', contents['size'] / 1024 / 1024, );
        //     } else {
        //         console.log('dbName NOT exist');


        //     }
      
        // }).catch( error => {
        //     console.log('dbName FileSystem.getInfoAsync error: ', error);
        //     alert('dbName FileSystem.getInfoAsync error: ', error);
        // })


    } catch(err){
      // this.directories = []; // create empty array,
      console.log('_checkVidViewLogDirectory error: ', err);
      alert('_checkVidViewLogDirectory error: ', err);
    }

  }
    


  async _sendVidViewLog(){
    console.log('----------- Dashboard _sendVidViewLog start' );
    
    // // Upload vidViewLog to Firestore
    try {
      if ( FileSystem.readDirectoryAsync( this.curDir  + this.state.vidViewLogTemp) ) {

        await FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogTemp ).then( localFilesArray => {
          this.localFiles = localFilesArray;
          console.log('----- this.localFiles: ', this.localFiles); // how many localFiles in array
          console.log('----- this.localFiles.length: ', this.localFiles.length);
        }).catch( error => {
          console.log('FileSystem.readDirectoryAsync error: ', error);
          // alert('FileSystem.readDirectoryAsync error: ', error);
        })

        if (this.localFiles.length > 0){
          this.localFiles.forEach( async (Localfile, num_file) => { // loop files
            console.log('num_file: ', num_file, Localfile);
            
            // read local file
            FileSystem.readAsStringAsync( this.curDir  + this.state.vidViewLogTemp + '/' + Localfile).then( localFileContents => {
              // console.log( 'localFileContents: ', localFileContents);


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
                    // playPct: JSON.parse(localFileContents)["playPct"],
                    // cntOutAccel: JSON.parse(localFileContents)["cntOutAccel"],
                    // cntPressPlayButton: JSON.parse(localFileContents)["cntPressPlayButton"],
                    // cntPressPauseButton: JSON.parse(localFileContents)["cntPressPauseButton"],
                    // cntFrameOut: JSON.parse(localFileContents)["outCountCum"], // this is a Dictionary, count how many times out from Frame
                    identifiedBparts: JSON.parse(localFileContents)["identifiedBparts"],　// this is an Arrays
                    iTWidth: JSON.parse(localFileContents)["iTWidth"],
                    iTHeight: JSON.parse(localFileContents)["iTHeight"],
                    scHeight: JSON.parse(localFileContents)["scHeight"],
                    scWidth: JSON.parse(localFileContents)["scWidth"],
                    winHeight: JSON.parse(localFileContents)["winHeight"],
                    winWidth: JSON.parse(localFileContents)["winWidth"],
                    texDimsWidth: JSON.parse(localFileContents)["texDimsWidth"],
                    texDimsHeight: JSON.parse(localFileContents)["texDimsHeight"],
                    // cntNTAout: JSON.parse(localFileContents)["outNTAcnt"],
                    // numFrameVidStart: JSON.parse(localFileContents)["numFrameVidStart"],
                    // numFrameAllPosOk: JSON.parse(localFileContents)["numFrameAllPosOk"],
                    // numFrameVidEnd: JSON.parse(localFileContents)["numFrameVidEnd"], 
                    wval: JSON.parse(localFileContents)["wval"],
                    wunit: JSON.parse(localFileContents)["wunit"], 
                  })
                }).then( result => result.json() )
                  .then( response => { 
                    console.log('----- _sendSingleVidViewLog response:', response );
                    if (response["code"] == 'ok' ) {
                        //Delete SINGLE file in the LOCAL directory
                        // console.log('Deleting SINGLE Localfile ');

                        FileSystem.deleteAsync( this.curDir  + this.state.vidViewLogTemp + '/' + Localfile).then( () => {
                          console.log('SINGLE Localfile Uploaded & Deleted: ', Localfile );
                          // deactivateKeepAwake();
                        }).catch( error => {
                          // deactivateKeepAwake();
                          console.log('FileSystem.deleteAsync error: ', error);
                          // alert('FileSystem.deleteAsync error.');
                        })
          
                    } else { // response[code] is Error
                      // deactivateKeepAwake();
                      console.log('Received response[code] = error from functions.');
                      alert('Received response[code] = error from functions. Please log-in again.');
                    }
                }).catch( error => {
                  // deactivateKeepAwake();
                  console.log('Error Dashboard _sendSingleVidViewLog-py: ', error);
                  // alert('Error response from _sendSingleVidViewLog, Please log-in again.');
                });
              }         


///////////  sendSingleVidViewLog-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
              firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
                // Send token to your backend via HTTPS
                // console.log('----- Got idToken. ');
                const idTokenCopied = idToken;

                _sendSingleVidViewLog(idTokenCopied); // run http trigger
                
              }).catch(function(error) {
                // deactivateKeepAwake();
                console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
              });  

            });
            
          });

        } else {
          // console.log('No files in the directory.'); // Do nothing since no files to be sent to Firebase
        };
        
      } else {  
        console.log('No directory.'); // This is a very rare case
      }
    } catch (err) {
      // this.directories = []; // create empty array,
      console.log('_sendVidViewLog error: ', err)
      // alert('_sendVidViewLog error: ', err)
    }
  
  }


  async componentDidMount() {
    console.log('------------- componentDidMount Dashboard started 09');

    if (this.state.doneComponentDidMount == false) { // if variable is null. this if to prevent repeated loop.
      // console.log('this.state.vidFullUrl started ');
      this.setState({
        isLoading: true,
        // vidViewLogTemp: 'vidViewLogTemp_' + firebase.auth().currentUser.uid,
        vidViewLog: 'vidViewLog_' + firebase.auth().currentUser.uid,
        // dbSQLite: dbSQLite,
      });
  


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
            // console.log('----- Dashboard _getUserProfile response.' );
            if (response["code"] == 'new_user' ) {
              console.log('==== Dashboard.js New User and going to Profile.js for FIRST fill out');
              this.props.navigation.push('Profile', {isNewUser: true}); // navigate to Profile.js Edit mode by {isNewUser: true} for this.state.isEditing:true. 20200526
            } else if ( response["code"] == 'ok' ) {
              console.log('response.userProfile: ', response.userProfile);
              this.setState({
                nname: response["userProfile"].NNAME.toString(),
                wval: response["userProfile"].WVAL.toString(), 
                wunit: response["userProfile"].WUNIT.toString(), 
                hval: response["userProfile"].HVAL.toString(), 
                hunit: response["userProfile"].HUNIT.toString(), 
                nat: response["userProfile"].NAT.toString(), 
                byr: response["userProfile"].BYR.toString(),
                gdr: response["userProfile"].GDR.toString(),
                bt0: response["userProfile"].FAVTAG["0"].toString(),
                bt1: response["userProfile"].FAVTAG["1"].toString(),
                ts: response["userProfile"].TS,
                llogin: response["userProfile"].LLOGIN,
                lupdate: response["userProfile"].UPD_AT,
              });
              // console.log('this.state.vidViewLogTemp: ', this.state.vidViewLogTemp);
            } else { // response[code] is Error
              console.log('Received response[code] = error from functions.');
              alert('Received response[code] = error from functions., Please log-in again.');
            }

        }).catch( error => {
          console.log('Error Dashboard _getUserProfile-py: ', error);
          alert('Error response from _getUserProfile, Please log-in again.');
        });
      }         


      ///////////  getUserProfile-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
      await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
        const idTokenCopied = idToken;

        _getUserProfile(idTokenCopied); // run http trigger

      }).catch(function(error) {
        console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
      });    

      this._makeRemoteRequest(); // kick     
    
    } // closing if

    this._checkVidViewLogDirectory();
    this._sendVidViewLog();    




    // const _getStats= (idTokenCopied) => {
    //     console.log('----- Dashboard _getStats.');
    //     //   console.log('this.oldestLogTs: ', this.oldestLogTs);
    //     const ts = Date.now() / 1000;
        
    //     fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/getStats-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
    //         method: 'POST',
    //         headers: {
    //             // 'Accept': 'application/json', 
    //             'Content-Type' : 'application/json' // text/html text/plain application/json
    //         },
    //             // mode: "no-cors", // no-cors, cors, *same-origin
    //             body: JSON.stringify({
    //             id_token: idTokenCopied,
    //             time_diff: new Date().getTimezoneOffset(), // in minutes, eg. bkk = -420
    //         })
    //     }).then( result => result.json() )
    //         .then( response => { 
    //         // console.log('------------------ _getStats response: ', response);

    //             if( response["code"] == 'ok'){
    //                 console.log('---------------- ok');
    //                 console.log('_getStats response.detail: ', response.detail );

    //                 var viewPtSum = response.detail.VIEW_PTSUM;
    //                 viewPtSum = parseInt(viewPtSum); // convert to int
    //                 var playSum = response.detail.PLAYSUM;
    //                 if ( playSum < 60 * 60 ) { // less than 1 hour
    //                     playSum = parseFloat(playSum / 60 / 60 / 10).toFixed(2); // show like 0.1
    //                 } else { // over 1 hour
    //                     playSum = parseInt(playSum / 60 / 60); // convert from second to hour
    //                 }
    //                 var viewTimes = response.detail.VIEW_TIMES;


    //                 var chartData = JSON.stringify( response.chartData ); // convert from object to json to match google chart data structure.
    //                 // chartData = chartData.replace(/"/g, ""); // remove double quotations
    //                 // chartData.shift(); // rmeove the first array
    //                 // chartData.unshift( ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]  ); // add array on top
    //                 console.log('chartData: ', chartData);

    //                 // var dataByYearWeeks = [ ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] ];   
    //                 // chartData.map(ind => {
    //                 //     // console.log('ind: ', ind);
    //                 //     dataByYearWeeks.push( [ ind ] ); // data array for google chart like ['2020-01', 1,3,2,5,4,6,3]
    //                 // });
    //                 // console.log('dataByYearWeeks: ', dataByYearWeeks);

    //                 this.setState({
    //                     // isLoading: false,
    //                     scoreTtl: viewPtSum,
    //                     playSumTtl: playSum,
    //                     playCnt: viewTimes,
    //                     dataByYearWeeks: chartData,
    //                     // isLoading: false,
    //                     // didLoadChartData: true,
    //                     StatsDataLoadedAt: ts,
    //                 }); 
                
    //             } else {
    //               console.log('Error or no_data from getStats-py');
                 
    //         } 
    
    //     }).catch((error) => {
    //         this.setState({ isLoading: false, });
    //         console.log('Error _getStats: ', error);
    //         alert('Error _getStats. Please try again later.');
    //     });

    // }

    // await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
    //     const idTokenCopied = idToken;
    
    //     _getStats(idTokenCopied);
    
    // }).catch(function(error) {
    //     console.log('Error xxxxxxxxxxxxxxxx Could not get idToken _getStats : ', error);
    //     alert('Error, Could not get idToken _getStats. please try again later.')
    // });      





    this.setState({ doneComponentDidMount: true, isLoading: false });
    console.log('------------- componentDidMount Dashboard completed');
      
  } // closing componentDidMount



  // async componentDidUpdate() {
  //   console.log('------------- componentDidUpdate Dashboard');
  // }



  async componentWillUnmount() {
    console.log('------------- componentWillUnmount Dashboard');
  }
 
   
  // shouldComponentUpdate(nextProps, nextState){ // https://github.com/facebook/react-native/issues/18396 20200621
  //   console.log('------ shouldComponentUpdate this.state.posts.length: ', this.state.posts.length);
  //   console.log('------ shouldComponentUpdate nextState.posts.length: ', nextState.posts.length);

  //   if(this.state.posts.length === nextState.posts.length){
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }


  _makeRemoteRequest = async () => {
    // console.log('------------- _makeRemoteRequest');
    const { page, flagMastersLoaded } = this.state;

    const _loadDashboardFlatlist = (idTokenCopied) => {
      console.log('----- Dashboard _loadDashboardFlatlist.');
      console.log('this.largestMETS: ', this.largestMETS);
      
      fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/loadDashboardFlatlist4-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
        method: 'POST',
        headers: {
          // 'Accept': 'application/json', 
          'Content-Type' : 'application/json' // text/html text/plain application/json
        },
        // mode: "no-cors", // no-cors, cors, *same-origin
        body: JSON.stringify({
          id_token: idTokenCopied,
          largestMETS: this.largestMETS + 0.0001,    
          flagMastersLoaded: flagMastersLoaded,
        })
      }).then( result => result.json() )
        .then( response => { 
          // console.log('------------------ _makeRemoteRequest response: ', response);

          if( response["code"] == 'okFirst'){ // the first load to loa ["flagMastersLoaded"]
            console.log('---------------- okFirst, length: ', response.detail.vidMetas.length );
            // console.log('_makeRemoteRequest response.detail.vidMetas: ', response.detail.vidMetas );

            // to control when to display 'ad'. 20200623
            var i;
            for (i = 0; i < response.detail.vidMetas.length; i++) {
              console.log('post_num: ', post_num);
              if ( post_num % 3 == 0){
                response.detail.vidMetas[i]['ad'] = 'yes';
                // console.log('i: ', response.detail.vidMetas[i]);
              } else {
                response.detail.vidMetas[i]['ad'] = 'no';
                // console.log('i ad: ', response.detail.vidMetas[i]); 
              }
              post_num++; // increment
            }
            
            this.setState({
              posts: page === 1 ? response.detail.vidMetas  : [ ...this.state.posts, ...response.detail.vidMetas ],
              refreshing: false,
              isLoading: false,
              flagMastersLoaded: true, // this to identify its downloaded
              // wpart: response.wpart,
              const_exer: response.const_exer,
              // mets_per_part: response.mets_per_part, // 20200804
              scaler_scale: response.scaler_scale, // 20200824
              scaler_mean: response.scaler_mean, // 20200824
              model: response.reg, // 20200824
              adUnitID: response.const_exer.adUnitID,
              model2: response.reg2, // 20200824
            }); 
            console.log('this.state.const_exer: ', this.state.const_exer );
            // console.log('this.state.mets_per_part: ', this.state.mets_per_part );
            // console.log('this.state.scaler_scale: ', this.state.scaler_scale );
            // console.log('this.state.scaler_mean: ', this.state.scaler_mean );
            console.log('this.state.model2: ', this.state.model2 );

          } else if (response["code"] == 'ok') { // after the second load, no need to load ["flagMastersLoaded"]
            console.log('---------------- ok, length: ', response.detail.vidMetas.length );
            // console.log('_makeRemoteRequest response.detail.vidMetas: ', response.detail.vidMetas );

            // to control when to display 'ad'. 20200623
            var i;
            for (i = 0; i < response.detail.vidMetas.length; i++) {
              console.log('post_num: ', post_num);
              if ( post_num % 3 == 0){
                response.detail.vidMetas[i]['ad'] = 'yes';
                // console.log('i: ', response.detail.vidMetas[i]);
              } else {
                response.detail.vidMetas[i]['ad'] = 'no'; 
                // console.log('i ad: ', response.detail.vidMetas[i]);
              }
              post_num++; // increment
            }


            this.setState({
              posts: page === 1 ? response.detail.vidMetas  : [ ...this.state.posts, ...response.detail.vidMetas ],
              // error: response.error || null,
              // loading: false,
              refreshing: false,
              isLoading: false,
            });     

          } else if (response["code"] == 'no_more_data') {
            this.setState({ isLoading: false,});
            console.log('No more data by _loadDashboardFlatlist.');
            // alert('No more video.'); 
           
          }

        }).catch((error) => {
          this.setState({ isLoading: false, });
          console.log('Error _loadDashboardFlatlist: ', error);
          alert('Error _loadDashboardFlatlist. Please try again later.');
        });

    }

    await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
      const idTokenCopied = idToken;

      _loadDashboardFlatlist(idTokenCopied);

    }).catch(function(error) {
      console.log('Error xxxxxxxxxxxxxxxx Could not get idToken _loadDashboardFlatlist: ', error);
    });  

  }; // closing _makeRemoteRequest


  _handleRefresh = async () => {
    console.log('------------- _handleRefresh');
    // this.oldestVidTs = Date.now() / 1000; // reset timestamp to current time
    this.largestMETS = 0 ; // reset
    // num_post = 0; // reset
    post_num = 0; // reset
    this.setState({
        page: 1,
        refreshing: true,
        // oldestVidTs: Date.now() / 1000,
        isLoading: true,
      },
      () => {
        this._makeRemoteRequest();
      }
    );
  };


  _handleLoadMore = async () => {
    console.log('------------- _handleLoadMore this.largestMETS: ', this.largestMETS);
    // num_post = 0; // reset
    this.setState({ page: this.state.page + 1 }, () => {
      this._makeRemoteRequest();
    });
  };




  // _onWValChange = async (weightVal) =>  {
  //   await this.setState({ wval: weightVal });
  //   console.log( 'this.state.wval: ', this.state.wval );
  // }

  // _onWUnitValueChange = async (unit) =>  {
  //   // console.log( 'year: ', year );
  //   await this.setState({ wunit: unit });
  //   console.log( 'this.state.wunit: ', this.state.wunit );
  // }

  // _handlePost = async() => {
  //   console.log('----------- _handlePost'); 
  //   console.log('wval, wunit: ', this.state.wval, this.state.wunit, );   
  //   if (this.state.wval) { // if weight exists
  //     if (this.state.wunit == 'kg' & this.state.wval < 200) {
  //       console.log('modal will be hided');
  //       this.setState({ fillingNow: false}); // control modal
  //     } else if ( this.state.wunit == 'lb' & this.state.wval < 200 * LB_PER_KG) {
  //       console.log('modal will be hided');
  //       this.setState({ fillingNow: false}); // control modal
  //     } else { // if too heavy or not number.
  //       alert('Your weight may be wrong. ¥n Please fill out weight again');
  //     }
  //   } else {
  //     if (!this.state.wval) { // if weight NOT filled out, 
  //       console.log('Please fill out weight.');
  //       alert('Please fill out weight.');
  //     }
  //   }
  // };




  renderPost = post => {
      const {  const_exer, wval, wunit, scaler_scale, scaler_mean, model, vidViewLogTemp , adUnitID, model2} = this.state;
      // num_post++; // increment var num_post
      console.log('====== post ====== post_num:' , post_num);


      // (() => {
          // if (post.VIEW > 1000000) { // view times
          //   this.VIEW = parseInt(post.VIEW / 1000000) + 'M ' // million
          // } else if (post.VIEW > 1000) { 
          //   this.VIEW = parseInt(post.VIEW / 1000) + 'K '// thousand
          // } else { 
          //   this.VIEW = parseInt(post.VIEW)
          // }; 

          // this.PTSUM = parseFloat(post.PTSUM); // cummulative points that the users exercised. 
          
          // post.LEN = parseInt(post.LEN); // video length in XXmXXs
          // if (post.LEN >= 60) {
          //   this.LEN = str_pad_left( post.LEN / 60,'0',2) + 'm' + str_pad_left( post.LEN - post.LEN / 60 ,'0',2) + 's';
          // } else { 
          //   this.LEN = '00m' + str_pad_left( post.LEN, '0', 2) + 's'; 
          // }; // convert sec to min:sec

          if ( parseInt(post.LEN / 60) <= 10 ) { // less than 10 minutes
            if ( (post.LEN - (parseInt(post.LEN / 60) * 60)) <= 10 ) { // less than 10 seconds
              this.LEN = '0' + parseInt(post.LEN / 60) + 'm' + '0' + parseInt((post.LEN - (parseInt(post.LEN / 60) * 60))) + 's';
            } else {
              this.LEN = '0' + parseInt(post.LEN / 60) + 'm' + parseInt((post.LEN - (parseInt(post.LEN / 60) * 60))) + 's';
            }
          } else {
            if ( (post.LEN - (parseInt(post.LEN / 60) * 60)) <= 10 ) { // less than 10 seconds
              this.LEN = parseInt(post.LEN / 60) + 'm' + '0' + parseInt((post.LEN - (parseInt(post.LEN / 60) * 60))) + 's';
            } else {
              this.LEN = parseInt(post.LEN / 60) + 'm' + parseInt((post.LEN - (parseInt(post.LEN / 60) * 60))) + 's';
            }
          };
          
          if (wunit == 'kg') {
            this.CAL = ( parseFloat(post.METS_COMPUTED) * wval * (post.LEN / 60 / 60) ).toFixed(); 
          } else { // wunit = 'lb'
            this.CAL = ( parseFloat(post.METS_COMPUTED) * (wval/LB_PER_KG) * (post.LEN / 60 / 60) ).toFixed(); 
          }

          if (post.METS_COMPUTED > 10) {
            this.INTENSITY = 'High Intensity';
          } else if (post.METS_COMPUTED > 6) {
            this.INTENSITY = 'Medium Intensity';
          } else {
            this.INTENSITY = 'Low Intensity';
          }

          //// This is to display Free mode
          // if (post.TITLE == "Free Mode"  && post.NNAME == "JooGo Fit") {
          if (post.URL == "FREE") {
            this.CAL = 'Unlimited';
            this.LEN = 'Unlimited Time';
            this.INTENSITY = 'Your Own Intensity';
          }
          
          if ( post.METS_COMPUTED > this.largestMETS) { // Assign to control next video to be fetched by _loadDashboardFlatlist 20200902
            this.largestMETS = post.METS_COMPUTED;
          } 

          // post.TNURL = 'https://firebasestorage.googleapis.com/v0/b/joogo-v0.appspot.com/o/tn%2F' + post.VIDID + '?alt=media' // URL for Thumbsnail photo 20200528         

          //// get thumbsnail full URL from Firebase storage 2020315 
          // const storage = firebase.storage(); // Create a storage reference from our storage service
          // const storageRef = storage.ref(); // Create a reference to the file we want to download
          // const starsRef = storageRef.child( 'tn/' + post.VIDID  );      
          // starsRef.getDownloadURL().then( (url) => {
          //   // Insert url into an <img> tag to "download"
    
          //   // post.TNURL = url;
          //   // console.log('post.TNURL: ', post.TNURL);
          // }).catch(function(error) {
          //   alert(error);
          //   // A full list of error codes is available at
          //   // https://firebase.google.com/docs/storage/web/handle-errors
          //   switch (error.code) {
          //     case 'storage/object-not-found': // File doesn't exist
          //       break;
          //     case 'storage/unauthorized': // User doesn't have permission to access the object
          //       break;
          //     case 'storage/canceled': // User canceled the upload
          //       break;
          //     case 'storage/unknown': // Unknown error occurred, inspect the server response
          //       break;
          //   }
          // })        
        

          console.log('------------- renderPost: ' , post_num, post.ID, post.URL ); // , post.METS_COMPUTED, post.LEN, 
      

        // } )(); 

          


        // if (num_post % 3 == 0 ) { // if num_post can be divided to zero by X. this is frequency of showing ads. 20200619 
        if (post.ad == 'yes') {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> Ads <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

          return (
            <View>
          
              <View style={styles.feedItem}>
                      
                {/* upper row */}
                <View style={{ flex: 2, flexDirection: "row", left: 5}}>
                    {/* <View style={{ }}> 
                        <Image source={{uri: post.avatarFullUrl}} style={styles.avatar} resizeMode="cover"/>
                    </View>  */}

                    <View style={{flexDirection: "column"}}>
                        <Text style={styles.name}>
                        { ((post.NNAME).length > 40) ? 
                          (((post.NNAME).substring(0, 40-3)) + '...') 
                        : 
                          post.NNAME 
                        }
                      </Text>
                        {/* <Text style={styles.timestamp}>{moment.unix(post.TS).fromNow()}</Text> */}
                    </View>
                </View>

                {/* bottom row */}    
                <View style={{ flex: 2, flexDirection: "row" }}> 

                  {/* bottom left pane */}
                  <View style={styles.textContents}>
                    <Text style={styles.title}> '
                      { ((post.TITLE).length > 55) ? 
                        (((post.TITLE).substring(0, 55-3)) + '...') 
                      : 
                        post.TITLE 
                      }
                    ' </Text>

                    <View style={styles.textMetadata}>

                      <View style={{flexDirection: "row", marginVertical: 0.7, marginLeft: 3,}}>
                          <Ionicons name='ios-flame' size={18} color="#73788B"/>
                          <Text style={styles.points}> {this.CAL} Calories</Text>
                      </View>

                      <View style={{flexDirection: "row", marginVertical: 0.7, marginLeft: 1,}}>
                          <Ionicons name='ios-time' size={18} color="#73788B"/>
                          <Text style={styles.length}> {this.LEN} </Text>
                      </View>

                      <View style={{flexDirection: "row", marginVertical: 0.7, marginLeft: 2,}}>
                          <Ionicons name='ios-body' size={18} color="#73788B"/>
                          <Text style={styles.length}> {this.INTENSITY} </Text>
                      </View>

                      {/* <View style={{flexDirection: "row", marginVertical: 3}}>
                          <MaterialIcons name='center-focus-strong' size={20} color="#73788B"/> 
                          <Text style={styles.tags}> 
                              {String(post.TAG).replace(',', ', ')}
                          </Text>
                      </View> */}

                      {/* <View style={{flexDirection: "row", marginVertical: 3, marginLeft: 2,}}>
                          <Ionicons name='ios-eye' size={20} color="#73788B"/>
                          <Text style={styles.views}> {this.VIEW} views</Text>
                      </View> */}

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
                  
                  {/* bottom right pane */}
                  <View style={{ }}>
                    <TouchableOpacity onPress={ () => this.props.navigation.push('Live', {post, const_exer, scaler_scale, scaler_mean, model, vidViewLogTemp, wval, wunit, model2} ) } >
                        <Image source={{uri: post.TNURL }} style={styles.postImage} resizeMode="cover" />   
                    </TouchableOpacity>
                  </View>

                </View>
                    
              </View>  

              <View style={styles.ads}>
                <AdMobBanner
                  bannerSize="mediumRectangle"
                  adUnitID = {adUnitID} //'ca-app-pub-9079750066587969/4230406044' // {this.state.adUnitID} // Banner ID ca-app-pub-9079750066587969/4230406044 // Test ID ca-app-pub-3940256099942544/6300978111
                  servePersonalizedAds // true or false
                  onDidFailToReceiveAdWithError={this.bannerError} />
              </View>  

            </View>          

          );
          // break;

        } else {
          console.log('>>>>>>> NO Ads <<<<<<<<');

          return (
            <View style={styles.feedItem}>
                
                {/* upper row */}
                <View style={{ flex: 2, flexDirection: "row", left: 10}}>
                    {/* <View style={{ }}> 
                        <Image source={{uri: post.avatarFullUrl}} style={styles.avatar} resizeMode="cover"/>
                    </View>  */}
  
                    <View style={{flexDirection: "column"}}>
                      <Text style={styles.name}>
                        { ((post.NNAME).length > 40) ? 
                          (((post.NNAME).substring(0, 40-3)) + '...') 
                        : 
                          post.NNAME 
                        }
                      </Text>
                        {/* <Text style={styles.timestamp}>{moment.unix(post.TS).fromNow()}</Text>  */}
                    </View>
                </View>
  
                {/* bottom row */}    
                <View style={{ flex: 2, flexDirection: "row" }}> 
  
                    {/* bottom left pane */}
                    <View style={styles.textContents}>
                      <Text style={styles.title}> '
                        { ((post.TITLE).length > 55) ? 
                          (((post.TITLE).substring(0, 55-3)) + '...') 
                        : 
                          post.TITLE 
                        }
                      ' </Text>

                      <View style={styles.textMetadata}>

                        <View style={{flexDirection: "row", marginVertical: 0.7, marginLeft: 3,}}>
                            <Ionicons name='ios-flame' size={18} color="#73788B"/>
                            <Text style={styles.points}> {this.CAL} Calories</Text>
                        </View>

                        <View style={{flexDirection: "row", marginVertical: 0.7, marginLeft: 1,}}>
                            <Ionicons name='ios-time' size={18} color="#73788B"/>
                            <Text style={styles.length}> {this.LEN} </Text>
                        </View>

                        <View style={{flexDirection: "row", marginVertical: 0.7, marginLeft: 2,}}>
                            <Ionicons name='ios-body' size={18} color="#73788B"/>
                            <Text style={styles.length}> {this.INTENSITY} </Text>
                        </View>

                        {/* <View style={{flexDirection: "row", marginVertical: 3}}>
                            <MaterialIcons name='center-focus-strong' size={20} color="#73788B"/> 
                            <Text style={styles.tags}> 
                                {String(post.TAG).replace(',', ', ')}
                            </Text>
                        </View> */}

                        {/* <View style={{flexDirection: "row", marginVertical: 3, marginLeft: 2,}}>
                            <Ionicons name='ios-eye' size={20} color="#73788B"/>
                            <Text style={styles.views}> {this.VIEW} views</Text>
                        </View> */}

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
                    
  
                    {/* bottom right pane */}
                    <View style={{ }}>
                      <TouchableOpacity onPress={ () => this.props.navigation.push('Live', { post, const_exer, scaler_scale, scaler_mean, model, vidViewLogTemp, wval, wunit, model2} ) } >
                          <Image source={{uri: post.TNURL }} style={styles.postImage} resizeMode="cover" />   
                      </TouchableOpacity>
                    </View>
  
                </View>
                  
            </View>
          );
          // break;

        // default:
        //     return null;  
        
        }; // closing if


  }; // closing renderpost


  bannerError() {
    console.log("Error AdMob banner");
  }


  render() {
    console.log('---------------- render');
    const { isLoading, const_exer, scaler_scale, scaler_mean, model, vidViewLogTemp, nname, wval, wunit, hval, hunit, nat, byr, gdr, bt0, bt1, ts, llogin, lupdate, isGuest, } = this.state; // scoreTtl, playSumTtl, playCnt, dataByYearWeeks, StatsDataLoadedAt, lastPlayEnded


    return (
      <View style={styles.container}>


        {/* <Modal visible={fillingNow} animationType='fade' transparent={true}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> 
            <SafeAreaView style={styles.container}>

              <View style={styles.modal}>

                <Text style={styles.postedText}>
                  Please input your weight{"\n"}{"\n"}
                </Text>

                <Text style={styles.itemTitle}>Weight</Text>
                <TextInput
                  multiline={false}
                  numberOfLines={1}
                  maxLength={5}
                  style={styles.itemField10}
                  defaultValue= {wval}
                  onChangeText={text => this._onWValChange(text) }
                  value={this.state.wval}
                  keyboardType='numeric'
                >
                </TextInput>  

                <Text style={styles.itemTitle}>Weight Unit</Text>
                <View style={styles.pickerView}>
                  <Picker
                    selectedValue= {wunit}
                    onValueChange = {(itemValue) => this._onWUnitValueChange(itemValue) }
                    style={styles.picker}
                    itemStyle={styles.pickerItem}
                    mode="dialog">
                    <Picker.Item label="" value="" key="null"/>
                    <Picker.Item label="kg" value="kg" key="kg"/>
                    <Picker.Item label="lb" value="lb" key="lb" />
                  </Picker>
                </View>

                <TouchableOpacity onPress={this._handlePost} style={styles.postButton} >
                  <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold',}}> GO </Text>
                </TouchableOpacity>

                <Text style={styles.postedTextNote}>
                  This weight data is for calorie calculation purpose only.{"\n"}
                  We will not keep your weight data.
                </Text>

              </View>

            </SafeAreaView>
          </TouchableWithoutFeedback>  
        </Modal> */}



        { isLoading ? 
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" color='#ffa500'/>
            <Text>Loading....</Text>
          </View>
        :
          <SafeAreaView style={{ position: 'absolute', top: 0, height: Dimensions.get('window').height - 50 - 50, backgroundColor: '#DCDCDC' }}>  
        {/* StatusBar.currentHeight */}

            <FlatList
              style={styles.feed}
              data={this.state.posts}
              // data={this.allPosts}
              renderItem={({ item }) => this.renderPost(item)}
              // renderItem={this.renderPost}
              // keyExtractor={item => item.id}
              keyExtractor={item => item.ID}
              showsVerticalScrollIndicator={false}
              key={item => item.ID} // https://stackoverflow.com/questions/45947921/react-native-cant-fix-flatlist-keys-warning
              onRefresh={this._handleRefresh}
              refreshing={this.state.refreshing}
              onEndReached={this._handleLoadMore}
              onEndReachedThreshold={0}
            >
            </FlatList>

          </SafeAreaView>

        }


        { isGuest ?
          null
        :
          <View style={styles.footerContainer}>
            {/* https://docs.expo.io/versions/latest/sdk/linear-gradient/ */}
            <TouchableOpacity style={styles.footerContainerButton} onPress={ () => this.props.navigation.push('Profile', { nname, wval, wunit, hval, hunit, nat, byr, gdr, bt0, bt1, ts, llogin, lupdate } ) } >
              <Ionicons name='ios-person' size={26} color="white" />  
              <Text style={styles.footerContainerText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerContainerButton} onPress={ () => this.props.navigation.push('History') } >                     
              <FontAwesome5 name='history' size={24} color="white" />
              <Text style={styles.footerContainerText}>History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerContainerButton} onPress={ () => this.props.navigation.push('Stats', { const_exer, } ) }> 
              <Ionicons name='ios-stats' size={26} color="white" />
              <Text style={styles.footerContainerText}>Stats</Text>
            </TouchableOpacity>              

            <TouchableOpacity style={styles.footerContainerButton} onPress={ () => this.props.navigation.push('Leaderboard') }>            
              {/* <Ionicons name='ios-medal' size={26} color="white" /> */}
              <FontAwesome5 name="medal" size={23} color="white" />
              {/* <MaterialIcons name='military_tech' size={26} color="white" /> */}
              {/* <Image style={{ width: 26, height: 26 }} source={require('../assets/leaderboard_icon.png')}/> */}
              <Text style={styles.footerContainerText}>Leaderboard</Text>
            </TouchableOpacity>  

            {/* <Ionicons name="ios-add-circle-outline" size={28} color="white" style={styles.PostIcon} onPress={ () => this.props.navigation.push('Post') }/> */}

            {/* <Ionicons name="ios-medal" size={28} color="white" style={styles.PostIcon} onPress={ () => this.props.navigation.push('Leaderboard') }/>  */}
            {/* <Ionicons name='ios-flame' size={28} color="white" style={styles.NotificationIcon} onPress={ () => this.props.navigation.push('Live', { const_exer, scaler_scale, scaler_mean, model } ) }/> */}

            {/* <Ionicons name='logo-youtube' size={28} color="white" style={styles.NotificationIcon} onPress={ () => this.props.navigation.push('LiveYT', { const_exer, scaler_scale, scaler_mean, model, vidViewLogTemp, wval, wunit } ) }/> */}
          </View>
        }

      </View>
    )  
  }

}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCDCDC',
  },
  // scrollview: {
  //   width: '100%',
  //   height: '70%',
  //   top: 5,
  //   marginBottom: 55,
  // },
  footerContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#ffa500',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    // marginTop: 50,
  },  
  footerContainerButton: { 
    flex: 2, 
    flexDirection: "column" ,
    alignItems: 'center',
    justifyContent: 'center',    
  },
  footerContainerText: {
    alignItems: 'center',
    justifyContent: 'center',    
    fontSize: 10,
    color: "white",
  },
  feed: {
    // marginHorizontal: 0, // 8, 16
    backgroundColor: "#DCDCDC", // feed background
    // top: 70,
    // bottom: 50,
  },
  feedItem: {
      width: Dimensions.get('window').width * 0.95,
      backgroundColor: "#FFF",
      borderRadius: 5, // 10
      padding: 8, //8
      flexDirection: "column",
      flex: 2,
      marginVertical: 5,
      shadowColor: 'black', // iOS
      shadowOffset: { width: 3, height: 3 }, // iOS
      shadowOpacity: 0.1, // iOS
      shadowRadius: 2, // iOS   
      elevation: 2, // Android
      marginHorizontal: 3,
  },
  avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 12
  },
  name: {
      fontSize: 14,
      fontWeight: "bold", // 500
      color: '#454D65' 
  },
  timestamp: {
      fontSize: 11,
      color: "#C4C6CE",
      marginTop: 0
  },
  textContents: {
      flexDirection: "column", 
      flex: 2,
      width: Dimensions.get('window').width * 0.4,//0.52 //160,
      // backgroundColor: 'green',
      marginRight: 3,
      fontSize: 16,
  },
  title: {
      marginTop: 6,
      fontSize: 15,
      // fontWeight: 'bold',
      color: '#ffa500', //'#ffbf00' // "#838899"
      marginBottom: 2,

  },
  textMetadata: {
      position: 'absolute',
      bottom: 1,
      fontSize: 11,
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
  },
  views:{
    marginLeft: 4,
  },
  likes: {

  },
  postImage: {
    width: Dimensions.get('window').width * 0.33 * (225/150), //150,
    height: Dimensions.get('window').width * 0.33, //225,
    // width: 200,
    borderRadius: 5,
    marginVertical: 5,
    right: 0,
  },
  ads:{
    width: Dimensions.get('window').width * 0.95,
    height: 270,
    backgroundColor: "#FFF",
    borderRadius: 5, // 10
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    shadowColor: 'black', // iOS
    shadowOffset: { width: 3, height: 3 }, // iOS
    shadowOpacity: 0.1, // iOS
    shadowRadius: 2, // iOS   
    elevation: 2, // Android
    marginHorizontal: 3,
  },


  modal: {
    // flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',  
    marginVertical: Dimensions.get('window').height * 0.025,     
    marginHorizontal: Dimensions.get('window').width * 0.05,
    height: Dimensions.get('window').height * 0.95,
    width: Dimensions.get('window').width * 0.9,
    backgroundColor: 'black', //'#ffa500', 
    borderRadius: 10,
    opacity: 0.8,
    shadowColor: 'black', // iOS
    shadowOffset: { width: 20, height: 20 }, // iOS
    shadowOpacity: 0.8, // iOS
    shadowRadius: 10, // iOS   
    elevation: 10, // Android
  },  
  postedText: {
    color: '#ffa500', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center',
    width: '80%',
  },
  postedTextNote: {
    color: '#ffa500', 
    fontSize: 12, 
    textAlign: 'left',
    width: '70%',
    marginTop: '3%',
  },    
  itemTitle:{
    marginTop: 7, //Dimensions.get('window').height * 0.01,
    color: '#ffa500',
    fontSize: 15,
    width: '80%',
  },
  itemMandatory: {
    color: 'red',
    fontWeight: 'bold',
  },
  itemField10: {
    borderWidth: 1, 
    borderColor: 'lightgray', 
    borderRadius: 5, 
    fontSize: 17,
    height: 35,
    color: 'dimgray',
    textAlignVertical: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'white',
    width: '80%',
    marginBottom: '3%',
  },
  pickerView: {
    height: 35, 
    // width: 200, 
    backgroundColor: 'white',
    borderWidth: 1, 
    borderColor: 'lightgray', 
    borderRadius: 5, 
    textAlignVertical: 'top',
    // fontSize: 18,
    // color: 'dimgray',
    padding: 2,
    width: '80%',
  },
  picker: {
    // height: Dimensions.get('window').height * 0.7, 
    // width: 200, 
    backgroundColor: 'lightgray',
    borderWidth: 1, 
    borderColor: 'lightgray', 
    borderRadius: 5, 
    // padding: 10, 
    // fontSize: 18,
    color: 'dimgray',
    // textAlign: 'center',
    // textAlignVertical: 'bottom',
    // paddingBottom: 10,
    // backgroundColor: 'pink',
    height: 30,
  },
  postButton: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',    
    backgroundColor: '#ffa500',
    width: '80%',
    borderRadius: 5,
    height: 40,
    shadowColor: 'black', // iOS
    shadowOffset: { width: 5, height: 5 }, // iOS
    shadowOpacity: 0.8, // iOS
    shadowRadius: 5, // iOS   
    elevation: 5, // Android
    marginTop: 40,
  },  
  loadingIndicator: {
    // position: 'absolute',
    // top: 20,
    // right: 20,
    flexGrow: 1,
    height: null,
    width: null,    
    alignItems: 'center',
    justifyContent: 'center',    
    // zIndex: 500, // removed 20200531
  },


});