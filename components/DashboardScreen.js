
import * as React from 'react';
import { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Dimensions, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, Modal, Keyboard, TouchableWithoutFeedback, Picker,TextInput  } from 'react-native';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import moment from "moment"; // for flatlist
import {GlobalStyles} from '../shared/GlobalStyles';
import * as firebase from 'firebase';
import * as firestore from 'firebase/firestore';
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
import { v4 as uuidv4 } from 'uuid';
import Constants from 'expo-constants'; // https://docs.expo.io/versions/latest/react-native/refreshcontrol/
import {vidViewLogDirName} from '../shared/Consts';
import { AdMobBanner } from 'expo-ads-admob'; 
import ThreeAxisSensor from 'expo-sensors/build/ThreeAxisSensor';


const str_pad_left = function (string,pad,length) { // convert from sec to min:sec // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
    return (new Array(length+1).join(pad)+string).slice(-length);
};

// var num_post = 0; // to control when to shoe Adds in FlatList 20200618
var post_num = 0; // to control when to shoe Adds in FlatList 20200623

export const LB_PER_KG = 2.205; // pounds / kilograms


export default class DashboardScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
        // seed: 1,
        error: null,
        refreshing: false,
        // oldestVidTs: Date.now() / 1000,
        flagMastersLoaded: false, // becomes true when wpart & const_exer downloaded from firebase 20200606.
        wpart: null, // will be assigned after downloaded from Firebase. 20200606
        const_exer: null, // will be assigned after downloaded from Firebase. 20200606
        adUnitID: null, // get adUnitID form Firebase 20200625
        // mets_per_part: null, //20200804
        scaler_scale: null,
        scaler_mean: null,
        reg_sgd: null,
        // wval: null, // weight value
        // wunit: null, // weight unit
        // fillingNow: true, // control modal        
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


    // Check Directories & Files in current directory. // THIS IS FOR MANUAL ACTION 
    FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogDirName ).then( content => {
      console.log('check this.curDir Dirs and Files: ', content); // how many localFiles in array
    })

    // Delete File // THIS IS FOR MANUAL ACTION AGAINST ERROR
    FileSystem.deleteAsync( this.curDir + this.state.vidViewLogDirName ).then( (dir) => {
      console.log('---------- File Deleted: ', dir);
    }).catch(error => {
      console.log('error: ', error);
    });    



    try {

      // // check if vidViewLogDirName Directory already exists, if not then create directory 20200502
      await FileSystem.getInfoAsync( this.curDir + this.state.vidViewLogDirName).then( async contents => {
        console.log('getInfoAsync contents[size] in MB: ', contents['size'] / 1024 / 1024 );
        if ( contents['exists'] == true & contents['isDirectory'] == true ) { // if folder already exists.
          console.log('vidViewLogDirName already exists');

          if ( contents['size'] > 50 * 1024 * 1024 ) { // if folder size is over 50MB, then delete files. 20200608
            FileSystem.deleteAsync( this.curDir + this.state.vidViewLogDirName ).then( (dir) => {
              console.log('---------- vidViewLog Folder Deleted');
              console.log('Video View Log files can not be sent out. Please contact help center');
              alert('Video View Log files can not be sent out. Please contact help center');
            }).catch(error => {
              console.log('Error deleting vidViewLog Folder: ', error);
            });    
          }

        } else { // if folder NOT exists, then create the directory
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
      if ( FileSystem.readDirectoryAsync( this.curDir  + this.state.vidViewLogDirName) ) {

        await FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogDirName ).then( localFilesArray => {
          this.localFiles = localFilesArray;
          console.log('----- this.localFiles.length: ', this.localFiles.length);
          console.log('----- this.localFiles: ', this.localFiles); // how many localFiles in array
        }).catch( error => {
          console.log('FileSystem.readDirectoryAsync error: ', error);
          // alert('FileSystem.readDirectoryAsync error: ', error);
        })

        if (this.localFiles.length > 0){
          this.localFiles.forEach( async (Localfile, num_file) => { // loop files
            console.log('num_file: ', num_file, Localfile);
            
            // read local file
            FileSystem.readAsStringAsync( this.curDir  + this.state.vidViewLogDirName + '/' + Localfile).then( localFileContents => {
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
                    // vidId: JSON.parse(localFileContents)["vidId"],
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
                  })
                }).then( result => result.json() )
                  .then( response => { 
                    console.log('----- _sendSingleVidViewLog response:', response );
                    if (response["code"] == 'ok' ) {
                        //Delete SINGLE file in the LOCAL directory
                        // console.log('Deleting SINGLE Localfile ');

                        FileSystem.deleteAsync( this.curDir  + this.state.vidViewLogDirName + '/' + Localfile).then( () => {
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
    console.log('------------- componentDidMount Dashboard started');

    if (this.state.doneComponentDidMount == false) { // if variable is null. this if to prevent repeated loop.
      // console.log('this.state.vidFullUrl started ');
      this.setState({isLoading: true});


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
              // console.log('response.userProfile: ', response.userProfile);
              this.setState({
                wval: response.userProfile.WVAL,
                wunit: response.userProfile.WUNIT,
              });
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
    console.log('------------- _makeRemoteRequest');
    const { page, flagMastersLoaded } = this.state;

    const _loadDashboardFlatlist = (idTokenCopied) => {
      console.log('----- Dashboard _loadDashboardFlatlist.');
      console.log('this.largestMETS: ', this.largestMETS);
      
      fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/loadDashboardFlatlistYT-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
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
              wpart: response.wpart,
              const_exer: response.const_exer,
              // mets_per_part: response.mets_per_part, // 20200804
              scaler_scale: response.scaler_scale, // 20200824
              scaler_mean: response.scaler_mean, // 20200824
              reg_sgd: response.reg_sgd, // 20200824
              adUnitID: response.const_exer.adUnitID,
            }); 
            // console.log('this.state.const_exer: ', this.state.const_exer );
            // console.log('this.state.mets_per_part: ', this.state.mets_per_part );
            // console.log('this.state.scaler_scale: ', this.state.scaler_scale );
            // console.log('this.state.scaler_mean: ', this.state.scaler_mean );
            // console.log('this.state.reg_sgd: ', this.state.reg_sgd );

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
      const { wpart, const_exer, wval, wunit, scaler_scale, scaler_mean, reg_sgd } = this.state;
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
          
          post.LEN = parseInt(post.LEN); // video length in XXmXXs
          if (post.LEN >= 60) {
            this.LEN = str_pad_left( post.LEN / 60,'0',2) + 'm' + str_pad_left( post.LEN - post.LEN / 60 * 60,'0',2) + 's'
          } else { 
            this.LEN = '00m' + str_pad_left( post.LEN, '0', 2) + 's' 
          }; // convert sec to min:sec
          
          if (wunit == 'kg') {
            this.CAL = ( parseFloat(post.METS_COMPUTED) * wval * (post.LEN / 60 / 60) ).toFixed(1); 
          } else { // wunit = 'lb'
            this.CAL = ( parseFloat(post.METS_COMPUTED) * (wval/LB_PER_KG) * (post.LEN / 60 / 60) ).toFixed(1); 
          }

          if (post.METS_COMPUTED > 10) {
            this.INTENSITY = 'High Intensity';
          } else if (post.METS_COMPUTED > 6) {
            this.INTENSITY = 'Medium Intensity';
          } else {
            this.INTENSITY = 'Low Intensity';
          }

          //// This is to display Free mode
          if (post.TITLE == "Free Mode"  && post.NNAME == "JooGo Fit") {
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
                <View style={{ flex: 2, flexDirection: "row", left: 10}}>
                    {/* <View style={{ }}> 
                        <Image source={{uri: post.avatarFullUrl}} style={styles.avatar} resizeMode="cover"/>
                    </View>  */}

                    <View style={{flexDirection: "column"}}>
                        <Text style={styles.name}>{post.NNAME}</Text>
                        {/* <Text style={styles.timestamp}>{moment.unix(post.TS).fromNow()}</Text> */}
                    </View>
                </View>

                {/* bottom row */}    
                <View style={{ flex: 2, flexDirection: "row" }}> 

                  {/* bottom left pane */}
                  <View style={styles.textContents}>
                  <Text style={styles.title}> '
                      { ((post.TITLE).length > 70) ? 
                        (((post.TITLE).substring(0, 70-3)) + '...') 
                      : 
                        post.TITLE 
                      }
                      ' </Text>

                    <View style={styles.textMetadata}>

                      <View style={{flexDirection: "row", marginVertical: 2, marginLeft: 3,}}>
                          <Ionicons name='ios-flame' size={20} color="#73788B"/>
                          <Text style={styles.points}> {this.CAL} Calories</Text>
                      </View>

                      <View style={{flexDirection: "row", marginVertical: 2, marginLeft: 1,}}>
                          <Ionicons name='ios-time' size={20} color="#73788B"/>
                          <Text style={styles.length}> {this.LEN} </Text>
                      </View>

                      <View style={{flexDirection: "row", marginVertical: 2, marginLeft: 2,}}>
                          <Ionicons name='ios-body' size={20} color="#73788B"/>
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
                    <TouchableOpacity onPress={ () => this.props.navigation.push('Live', {post, const_exer, scaler_scale, scaler_mean, reg_sgd} ) } >
                        <Image source={{uri: post.TNURL }} style={styles.postImage} resizeMode="cover" />   
                    </TouchableOpacity>
                  </View>

                </View>
                    
              </View>  

              <View style={styles.ads}>
                <AdMobBanner
                  bannerSize="mediumRectangle"
                  adUnitID = 'ca-app-pub-3940256099942544/6300978111' // {this.state.adUnitID} // Banner ID ca-app-pub-9079750066587969/4230406044 // Test ID ca-app-pub-3940256099942544/6300978111
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
                        <Text style={styles.name}>{post.NNAME}</Text>
                        {/* <Text style={styles.timestamp}>{moment.unix(post.TS).fromNow()}</Text>  */}
                    </View>
                </View>
  
                {/* bottom row */}    
                <View style={{ flex: 2, flexDirection: "row" }}> 
  
                    {/* bottom left pane */}
                    <View style={styles.textContents}>
                      <Text style={styles.title}> '
                      { ((post.TITLE).length > 70) ? 
                        (((post.TITLE).substring(0, 70-3)) + '...') 
                      : 
                        post.TITLE 
                      }
                      ' </Text>

                      <View style={styles.textMetadata}>

                        <View style={{flexDirection: "row", marginVertical: 2, marginLeft: 3,}}>
                            <Ionicons name='ios-flame' size={20} color="#73788B"/>
                            <Text style={styles.points}> {this.CAL} Calories</Text>
                        </View>

                        <View style={{flexDirection: "row", marginVertical: 2, marginLeft: 1,}}>
                            <Ionicons name='ios-time' size={20} color="#73788B"/>
                            <Text style={styles.length}> {this.LEN} </Text>
                        </View>

                        <View style={{flexDirection: "row", marginVertical: 2, marginLeft: 2,}}>
                            <Ionicons name='ios-body' size={20} color="#73788B"/>
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
                      <TouchableOpacity onPress={ () => this.props.navigation.push('Live', { post, const_exer, scaler_scale, scaler_mean, reg_sgd} ) } >
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
    const { isLoading, wpart, const_exer, scaler_scale, scaler_mean, reg_sgd, } = this.state;

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
          <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="large" color='#ffa500'/>
            <Text>Loading....</Text>
          </View>
        :
          <SafeAreaView style={{ top: 0, bottom: 0}}> 

            <FlatList
              style={styles.feed}
              data={this.state.posts}
              // data={this.allPosts}
              renderItem={({ item }) => this.renderPost(item)}
              // renderItem={this.renderPost}
              // keyExtractor={item => item.id}
              keyExtractor={item => item.VIDID}
              showsVerticalScrollIndicator={false}
              // key={item =>  item.VIDID} // https://stackoverflow.com/questions/45947921/react-native-cant-fix-flatlist-keys-warning
              onRefresh={this._handleRefresh}
              refreshing={this.state.refreshing}
              onEndReached={this._handleLoadMore}
              onEndReachedThreshold={0}
            >
            </FlatList>

          </SafeAreaView>

        }

        
        {/* <LinearGradient colors={['#ffa500', '#ffb300', 'orange']} style={styles.footerContainer}>  */}
        <View style={styles.footerContainer}>
          {/* https://docs.expo.io/versions/latest/sdk/linear-gradient/ */}
          <Ionicons name='ios-person' size={28} color="white" style={styles.ProfileIcon} onPress={ () => this.props.navigation.push('Profile') } />  
          {/* <Ionicons name="ios-add-circle-outline" size={28} color="white" style={styles.PostIcon} onPress={ () => this.props.navigation.push('Post') }/> */}
          <MaterialIcons name='history' size={28} color="white" style={styles.HistoryIcon} onPress={ () => this.props.navigation.push('History') }/>
          {/* <Ionicons name="ios-medal" size={28} color="white" style={styles.PostIcon} onPress={ () => this.props.navigation.push('Leaderboard') }/>  */}
          {/* <Ionicons name='ios-flame' size={28} color="white" style={styles.NotificationIcon} onPress={ () => this.props.navigation.push('Live', { const_exer, scaler_scale, scaler_mean, reg_sgd } ) }/> */}
          <Ionicons name='logo-youtube' size={28} color="white" style={styles.NotificationIcon} onPress={ () => this.props.navigation.push('LiveYT', { const_exer, scaler_scale, scaler_mean, reg_sgd } ) }/>
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
    paddingHorizontal: 50,
    // marginTop: 50,
  },  
  feed: {
    marginHorizontal: 0, // 8, 16
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
      shadowOffset: { width: 5, height: 5 }, // iOS
      shadowOpacity: 0.3, // iOS
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
      width: Dimensions.get('window').width * 0.4,//0.52 //160,
  },
  title: {
      marginTop: 6,
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
  },
  views:{
    marginLeft: 4,
  },
  likes: {

  },
  postImage: {
    width: Dimensions.get('window').width * 0.35 * (225/150), //150,
    height: Dimensions.get('window').width * 0.35, //225,
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
    shadowOffset: { width: 5, height: 5 }, // iOS
    shadowOpacity: 0.3, // iOS
    shadowRadius: 2, // iOS   
    elevation: 2, // Android
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

});