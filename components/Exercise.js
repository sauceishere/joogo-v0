
// import * as React from 'react';
import React, { Component, useState, useEffect  } from 'react';
import { Text, View, StyleSheet, Dimensions, StatusBar, Image, TouchableOpacity, SafeAreaView, ScrollView, Button, Platform, ActivityIndicator, Modal } from 'react-native';
import {WebView} from 'react-native-webview';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as firebase from 'firebase';
// https://js.tensorflow.org/api_react_native/latest/å https://github.com/tensorflow/tfjs/tree/master/tfjs-react-native
import { Camera } from 'expo-camera';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native'; // https://js.tensorflow.org/api_react_native/latest/#cameraWithTensors
// https://www.npmjs.com/package/@tensorflow/tfjs-react-native
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import * as Permissions from 'expo-permissions';
// import MediaMeta from 'react-native-media-meta'; // https://github.com/mybigday/react-native-media-meta
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
import { v4 as uuidv4 } from 'uuid';
// import {vidViewLogTemp} from '../shared/Consts';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'; //https://docs.expo.io/versions/latest/sdk/keep-awake/
import { Constants, Accelerometer } from 'expo-sensors'; // https://docs.expo.io/versions/latest/sdk/accelerometer/ # https://snack.expo.io/@professorxii/expo-accelerometer-example


const TensorCamera = cameraWithTensors(Camera); // https://js.tensorflow.org/api_react_native/latest/#cameraWithTensors

const goBackIconSize = 40;

export default class Exercise extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // videoPlay: true, // it will be 'false' when video is paused.
      // goBackButton: false, // it will be 'true' when goBackButton is pressed, and then hide overlay
      isTfReady: false,
      isLoadingPosenet: true,
      isPosenetLoaded: false, 
      cameraType: Camera.Constants.Type.front,
      modelName: 'posenet',
      vidFullUrl: '', // get from Firebase Storage
      vidLength: this.props.navigation.getParam('post')['LEN'], // length of video navigated from Dashboard.js
      // isVidMetaLoaded: false,
      // isWPartLoaded: false,
      isReadyToCD: false, // not used 
      // isFinScoreLoaded: false,
      // finScoreUrl: '',
      // vidStartAt: null,
      // loopStartAt: null,
      countdownTxt: null, 
      scoreNow: 0, // score to show on top right of screen
      mdCumTtlNow: 0, 
      noseToAnkle: 0, // initiate as null  
      flagNoseToAnkle: false, // flag 1 when noseToAnkle is fixed , before video starts. 
      rightToLeft: 0, // initiate as null  
      flagRightToLeft: false, // flag 1 when rightToLeft is fixed , before video starts. 
      flagAllPosOk: false, // Flag 1 when all positions collected
      flagCountdownFinished: false, // true when countdown finished to controll PlayAndPauseButton
      shouldPlay: false, // not play at default
      flagUpdateScore: false, //
      flagVidEnd: false, // Flag 1 when Video ends, then stop logging
      vidViewLogTemp: this.props.navigation.getParam('vidViewLogTemp'), //{vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
      // ULBColorTop: 'transparent',
      // ULBColorBottom: 'transparent',
      // ULBColorLeft: 'transparent',
      // ULBColorRight: 'transparent',
      flagAccelerometerIsAvailable: false,
      accelerometerData: { x: 0, y: 0, z: 0 },
      flagShowGoBackIcon: true, // to contrl hide and unhide goBackIcon
      progressBarWidth: 0, // initial at zero
    }
    this.handleImageTensorReady = this.handleImageTensorReady.bind(this);  
    this._handlePlayAndPause = this._handlePlayAndPause.bind(this);
    this._vidDefault = this._vidDefault.bind(this);
    // this._showPausedVid = this._showPausedVid.bind(this);
    // this._showPlayingVid = this._showPlayingVid.bind(this); 
    this._goBackToHome = this._goBackToHome.bind(this);
    this._saveVidViewLog = this._saveVidViewLog.bind(this);
    this._sendVidViewLog = this._sendVidViewLog.bind(this);
  }

  TESTMODE = 0; // 0 = Production, 1 = TESMODE by nose & shoulder,

  viewId = uuidv4();

  inputTensorWidth = this.props.navigation.getParam('const_exer')['inputTensor']['width']; //200; // 250; // 200; // 152; //Dimensions.get('window').width / 3; // 152  
  inputTensorHeight = this.props.navigation.getParam('const_exer')['inputTensor']['height']; //399; // 250; // 299; //200; //Dimensions.get('window').height / 3; // 200

  textureDims = { // https://github.com/tensorflow/tfjs/blob/master/tfjs-react-native/integration_rn59/components/webcam/realtime_demo.tsx
    width: this.props.navigation.getParam('const_exer')['textureDims']['width'], // 1800, //960, //Dimensions.get('window').width, // 960, // 1024, //768, //512, // 540, //256, // 1080, //videoSize, 
    height: this.props.navigation.getParam('const_exer')['textureDims']['height'], // 1200, //960, //Dimensions.get('window').height, // 960, // 1024, //768, //512, //960, //453, // 1920, //videoSize,
  };

  MIN_KEYPOINT_SCORE = this.props.navigation.getParam('const_exer')['minKeypointScore'];


  playButtonSize = Dimensions.get('window').width * 0.4;

  vidState = {
    LOOPTIMES: 0,
    renderPoseTimes: 0,
    everyIntSec: 0,
    vidStartAt: 0, // initialize as 0 to avoid null 20200519
    loopStartAt: null, //Date.now()/1000, // sec
    vidEndAt: 0, // initialize as 0 to avoid null 20200519
    vidPlayedSum: 0, // Zero sec at initial
    scorePointSum: 0, // Zero point at initial
    cntPressPlayButton: 0, // to count how many times Play button is pressed and send it to Firestore vidViewLog. Zero point at initial
    cntPressPauseButton: 0, // to count how many times Pause button is pressed and send it to Firestore vidViewLog.Zero point at initial
    numFrameVidStart: 0, // this.vidState.renderPoseTimes as frame number when video start
    numFrameAllPosOk: 0, // this.vidState.renderPoseTimes as frame number when All position confirmed
    numFrameVidEnd: 0, // this.vidState.renderPoseTimes as frame number when video end
  } 

  camState = {
    screenHeight: Dimensions.get('screen').height,
    screenWidth: Dimensions.get('screen').width,
    windowHeight: Dimensions.get('window').height,
    windowWidth: Dimensions.get('window').width,    
  }

  cntIniPos = 0; // to count how many times exercisers fit into initialPoistions to control NOT to start countdown too early. 20200516

  // vidMeta = ''; // to store data from Firestore
  // wpart = ''; // to store data from Firestore
  vidMeta = this.props.navigation.getParam('post');
  wpart = this.props.navigation.getParam('wpart');
  

  initialPositions = {
    x9Min: this.inputTensorWidth * 0/4, // leftWrist
    x9Max: this.inputTensorWidth * 1/4, // leftWrist
    y9Min: this.inputTensorHeight * 1/4, // leftWrist
    y9Max: this.inputTensorHeight * 3/4, // leftWrist
    x10Min: this.inputTensorWidth * 3/4, // rightWrist
    x10Max: this.inputTensorWidth * 4/4, // rightWrist   
    y10Min: this.inputTensorHeight * 1/4, // rightWrist
    y10Max: this.inputTensorHeight * 3/4, // rightWrist 
    xBothAnkleMin: this.inputTensorWidth * 1/4, 
    xBothAnkleMax: this.inputTensorWidth * 3/4,                           
    yBothAnkleMin: this.inputTensorHeight * 3/4, 
    yBothAnkleMax: this.inputTensorHeight * 4/4,       
    NoseToAnkleMin: this.inputTensorHeight * 2/4, // y distance between nose to ankle should be more than this  
    xRightToLeftMin: this.inputTensorWidth * 2/4, // x distance between right to left wrist should be more than this.    
  };


  pos = {
    x0 : null, // initiate as null
    y0 : null, // initiate as null    
    x1 : null, // initiate as null
    y1 : null, // initiate as null
    x2 : null, // initiate as null
    y2 : null, // initiate as null   
    x7 : null, // initiate as null
    y7 : null, // initiate as null
    x8 : null, // initiate as null
    y8 : null, // initiate as null
    x9 : null, // initiate as null
    y9 : null, // initiate as null
    x10 : null, // initiate as null
    y10 : null, // initiate as null 
    x13 : null, // initiate as null
    y13 : null, // initiate as null
    x14 : null, // initiate as null
    y14 : null, // initiate as null
    x15 : null, // initiate as null
    y15 : null, // initiate as null
    x16 : null, // initiate as null  
    y16 : null, // initiate as null  
    x5 : null, // initiate as null    
    y5 : null, // initiate as null
    x6 : null, // initiate as null
    y6 : null, // initiate as null
    x11 : null, // initiate as null
    y11 : null, // initiate as null
    x12 : null, // initiate as null
    y12 : null, // initiate as null 
  }

  md = { // moved distance
    y0 : 0, // moving distance
    y1 : 0, // moving distance
    y2 : 0, // moving distance
    y9 : 0, // moving distance
    y10 : 0, // moving distance         
    y13 : 0, // moving distance
    y14 : 0, // moving distance
    y15 : 0, // moving distance
    y16 : 0, // moving distance       
    y5 : 0, // moving distance
    y6 : 0, // moving distance
    y11 : 0, // moving distance
    y12 : 0, // moving distance 
  }

  mdCum = { // moved distance cummulative
    y0 : 0, // accumulate moving distance
    y7 : 0, // accumulate moving distance
    y8 : 0, // accumulate moving distance
    y9 : 0, // accumulate moving distance
    y10 : 0, // accumulate moving distance         
    y13 : 0, // accumulate moving distance
    y14 : 0, // accumulate moving distance
    y15 : 0, // accumulate moving distance
    y16 : 0, // accumulate moving distance       
    y5 : 0, // accumulate moving distance
    y6 : 0, // accumulate moving distance
    y11 : 0, // accumulate moving distance
    y12 : 0, // accumulate moving distance
  }

  // mdCumNowArray = {} // to assign array of mdCum
  mdCumAll = [] // to append ALL of mdCum from start to end for vidViewLog
  posAll = [] // to append ALL of this.pos from start to end 

  attentionTxt = 'Fit your body below'; //'Move yourself inside orange below'; 

  // countdownTxt = '';
  frameOutCntCriteria = this.props.navigation.getParam('const_exer')['frameOutCntCriteria']; // if accumulate count of out times of Frame is more than X times, then shower borderColor. 

  frameOutCnt = { // to check if body parts of exerciser is out of camera Frame. 
    right: 0,
    left: 0,
    top: 0,
    bottom: 0};

  frameOutCntPrev = { // for comparing with current vs previous assignment. Frame
    right: 0,
    left: 0,
    top: 0,
    bottom: 0};

  frameOutCntCum = { // to record in Firestore vidViewLog. Frame 
    right: 0,
    left: 0,
    top: 0,
    bottom: 0};
  frameOutCntCumObj = [] // this is just to avoid error on sendSingleVidViewLog-py. 20200530

  ULBColor = { // default border color   
      top: 'transparent',
      bottom: 'transparent',
      left: 'transparent',
      right: 'transparent',   
    }

  outCriteriaAccel = { // if accelerometerData is over this criteria, then count up cntOutAccel to detect if camera moved 
    x: this.props.navigation.getParam('const_exer')['outCriteriaAccel']['x'],
    y: this.props.navigation.getParam('const_exer')['outCriteriaAccel']['y'],
    z: this.props.navigation.getParam('const_exer')['outCriteriaAccel']['z'],
  };

  prevAccelData = { // for compare this.state.accelerometerData previous vs latest to detect if camera moved
    x: null,
    y: null,
    z: null,    
  };
  
  cntOutAccel = 0; // count up if over outCriteriaAccel out of Accelerometer standard to detect if camera moved

  identifiedBPartsAll = []; // which body parts is identified on each loop, and save it array and send to Firestore vidViewLog. 

  outNTA = { // NoseToAnkle to control if user comes too close to camera. 20200523
    DistMoveCriteria : this.props.navigation.getParam('const_exer')['outNTA']['DistMoveCriteria'], // if NoseToAnkle becomes over XX% of initial NoseToAnkle
    cnt : 0, // count how many time 
    outTimesCriteria : this.props.navigation.getParam('const_exer')['outNTA']['outTimesCriteria'], // judge as out if out more than X 
    flag : false, // control only one time go into block
  }

  coefNTA = this.props.navigation.getParam('const_exer')['coefNTA']; // 20200614





  _subscribeToAccelerometer = () => {
    console.log('_subscribeToAccelerometer');
    this._subscription = Accelerometer.addListener(
      // setData(accelerometerData);
      accelerometerData => this.setState({ accelerometerData })      
    );
    Accelerometer.setUpdateInterval(1 * 1000); // update very X miliseconds

  };


  _unsubscribeFromAccelerometer = () => {
    console.log('_unsubscribeFromAccelerometer');
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };


  _goBackToHome = async () => {
    console.log('------------------------------------------------------ Go back to Home');
    // this.setState({ shouldPlay : false, flagUpdateScore: true }); // added 20200523
    this.setState({ shouldPlay : false, flagVidEnd: true, flagUpdateScore: true  });
    // this.setState({ shouldPlay : false});
    // clearInterval(_updateScore); // did NOT work 20200603
    // clearInterval(videoCountDown); // did NOT work 20200603
    this.props.navigation.goBack();
    // await this._saveVidViewLog(); // removed because this process is duplicated with componentWillUnmount
  }  


  // https://github.com/tensorflow/tfjs/blob/master/tfjs-react-native/integration_rn59/components/webcam/realtime_demo.tsx
  handleImageTensorReady( images, ) {    
    console.log('--------- handleImageTensorReady images: ', images );
    
    const loop = async () => {
      console.log('-LOOPTIMES: ', this.vidState.LOOPTIMES);
      this.vidState.LOOPTIMES++; // increment
      // console.log('--------- images2: ', images ); // images[Symbol.iterator]()
      var nextImageTensor = await images.next().value; // read values
      // console.log('--------- nextImageTensor: ', nextImageTensor);
      // console.log('images.next().done; ', images.next().done)
    
      const flipHorizontal = Platform.OS === 'ios' ? false : true;
      const pose = await this.state.posenetModel.estimateSinglePose( nextImageTensor, { flipHorizontal }); // predict
      tf.dispose(nextImageTensor); 
      this.setState({ pose }); // assign pose to state, and run rendor
      requestAnimationFrame(loop);
      // console.log('---------- end of loop');
    }
    // console.log('-------------------       going into loop');
    loop();
  }


  async componentWillUnmount() {
      console.log('------------------- componentWillUnmount Exercise started');
    if(this.rafId) {  
      cancelAnimationFrame(this.rafId);
    }  
      await this._unsubscribeFromAccelerometer();
      deactivateKeepAwake();
      await this._saveVidViewLog();
      console.log('------------------- componentWillUnmount Exercise completed');
  }


  async componentDidMount() {
    console.log('------------------- componentDidMount Exercise started 64');

    activateKeepAwake();


    // const ratios = await Camera.getSupportedRatiosAsync();
    // console.log('ratios: ', Camera.getSupportedRatiosAsync());
    // const sizes = await ?Camera.getAvailablePictureSizesAsync(ratio);
    // console.log('sizes: ', sizes);


    try {

      // Wait for tf to be ready.
      await tf.ready()
      // tf.ready().then(() => {
      //   console.log('--------- tf.ready');
      //   this.setState({ isTfReady: true });
      // }).catch( error =>{
      //   console.log('tf.ready error: ', error);
      //   alert('tf.ready error: ', error);
      // });;


      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      // const { status } = await Permissions.askAsync(Permissions.CAMERA).then( () => {
      //   console.log('--------- Permissions.CAMERA done');
      //   this.setState({ hasCameraPermission: status === 'granted', });
      // }).catch( error =>{
      //   console.log('Permissions.CAMERA error: ', error);
      //   alert('Permissions.CAMERA error: ', error);
      // });


      // await Camera.getAvailablePictureSizesAsync().then( ratio => { // https://docs.expo.io/versions/v37.0.0/sdk/camera/#getavailablepicturesizesasync 20200531
      //   console.log('ratio: ', ratio);
      // }).catch(function(error) {
      //   console.log("Error getAvailablePictureSizesAsync:", error);
      //   alert("Error getAvailablePictureSizesAsync:", error);
      // });  
      // console.log('cameraPicSize: ', cameraPicSize);
      console.log('Camera.Constants.VideoQuality: ', Camera.Constants.VideoQuality); 


      console.log('--------- loading posenetModel now...');
      const posenetModel =  await posenet.load({ // https://github.com/tensorflow/tfjs-models/tree/master/posenet
        architecture: 'MobileNetV1',
        outputStride: this.props.navigation.getParam('const_exer')['posenetModel']['outputStride'], // 16 larger is faster but no json file for 32. 
        inputResolution: { width: this.inputTensorWidth, height: this.inputTensorHeight },
        multiplier: this.props.navigation.getParam('const_exer')['posenetModel']['multiplier'], // 0.75 smaller is faster
        quantBytes: this.props.navigation.getParam('const_exer')['posenetModel']['quantBytes'] // 2 small is faster
      });
      console.log('--------- posenetModel loaded');


      // get trainerVideo full URL from Firebase storage 2020315
      if (this.state.vidFullUrl === '') { //. this if to prevent repeated loop. 
        const storage = firebase.storage(); // Create a storage reference from our storage service
        const storageRef = storage.ref(); // Create a reference to the file we want to download
        const starsRef = storageRef.child( 'finvid/' + this.props.navigation.getParam('post')['VIDID']  );      
        await starsRef.getDownloadURL().then( (url) => {
          this.setState({vidFullUrl : url }); // assign to this.state
          console.log('this.state.vidFullUrl: ', this.state.vidFullUrl);
        }).catch(function(error) {
          alert(error);
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/object-not-found': // File doesn't exist
              break;
            case 'storage/unauthorized': // User doesn't have permission to access the object
              break;
            case 'storage/canceled': // User canceled the upload
              break;
            case 'storage/unknown': // Unknown error occurred, inspect the server response
              break;
          }
        })        
      }


      if (this.state.isReadyToCD == false) {
        this.setState({
          isTfReady: true,
          hasCameraPermission: status === 'granted',
          isLoadingPosenet: false, // load posenet model
          posenetModel,  
          isPosenetLoaded: true,
          isReadyToCD: true,
        });
      };


    } catch (err) {
      // this.directories = []; // create empty array,
      console.log('posenetModel or Firestorage or FireStorage loading error: ', err);
      alert('posenetModel or Firestorage or FireStorage  loading error: ', err);
    }

    // console.log('========== this.state.vidLength: ', this.state.vidLength);     
    console.log('------------------- componentDidMount Exercise completed');

  } // closing componentDidMount


  async _vidDefault () {
    console.log('=============== _vidDefault ===============');
    await this.webviewRef.injectJavaScript(`
    document.getElementsByTagName("video")[0].pause();
    document.getElementsByTagName("video")[0].setAttribute("preload", "auto"); 
    document.getElementsByTagName("video")[0].setAttribute("muted", "true"); 
    document.getElementsByTagName("video")[0].removeAttribute('controls'); // hide control panels
    document.getElementsByTagName("video")[0].style.objectFit = 'fill'; // fill to widnow screen 
    document.getElementsByTagName("video")[0].style.height = '100%';
    document.getElementsByTagName("video")[0].style.width = '100%'; 
    // document.body.style.border = '5px solid red';
    // document.getElementsByTagName("video")[0].onended = (event) => {
    //   window.alert('1）動画が終了した、または 2）それ以上データがない' + 'ため、動画が停止しました。');
    // };
    `);
    console.log('_vidDefault this.state.shouldPlay: ', this.state.shouldPlay);
    // console.log('_vidDefault flagVidEnd: ', this.state.flagVidEnd)
  }      


  _handlePlayAndPause = async () =>  {
    console.log('=============== _handlePlayAndPause ===============');
    const _playVideo = () => {
      this.videoState.cntPressPlayButton += 1; // increment to count 
      this.setState({ shouldPlay: true });
    }
    const _pauseVideo = () => {
      this.videoState.cntPressPauseButton += 1; // increment to count
      this.setState({ shouldPlay: false });
    }

    if (this.state.shouldPlay == false) { // Go into this block when video is NOT playing
      console.log('=========================== play ================================');
      this.vidState.loopStartAt = Date.now()/1000;
      // this.setState({ loopStartAt : Date.now()/1000 });
      await _playVideo(); 
      await this.webviewRef.injectJavaScript(`
        document.getElementsByTagName("video")[0].play();
        document.getElementsByTagName("video")[0].setAttribute("muted", "false"); 
      `)
    } else { // when video is playing
      console.log('=========================== pause ================================');
      this.vidState.vidPlayedSum = this.vidState.vidPlayedSum + (Date.now()/1000 - this.vidState.loopStartAt); // add increment time
      await _pauseVideo();
      await this.webviewRef.injectJavaScript(`
        document.getElementsByTagName("video")[0].pause();
      `)
    }
  }


  async _sendVidViewLog( vidViewLogFileName ){
    console.log('----------- _sendVidViewLog start' );
    
    // // Upload vidViewLog to Firestore
    try {
      if ( FileSystem.readDirectoryAsync( FileSystem.documentDirectory + this.state.vidViewLogTemp) ) {
            
        // read SINGLE local file
        FileSystem.readAsStringAsync( FileSystem.documentDirectory + this.state.vidViewLogTemp + '/' + vidViewLogFileName + '.json').then( localFileContents => {
          // console.log( 'localFileContents: ', localFileContents);


////////// sendSingleVidViewLog-py ////////////////////////////
          // sendSingleVidViewLog-py
          const _sendSingleVidViewLog = (idTokenCopied) => {
            console.log('----- _sendSingleVidViewLog Exercise.js .');
            // console.log('----- _getUserProfile idTokenCopied: ', idTokenCopied);
            // console.log('JSON.parse(localFileContents)["identifiedBparts"]: ', JSON.parse(localFileContents)["identifiedBparts"]);
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
                cntFrameOut: JSON.parse(localFileContents)["frameOutCntCum"], // this is a Dictionary, count how many times out from Frame
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
                    FileSystem.deleteAsync( FileSystem.documentDirectory + this.state.vidViewLogTemp + '/' + vidViewLogFileName + '.json').then( () => {
                      console.log('SINGLE Localfile Uploaded & Deleted: ', vidViewLogFileName );
                      
                    }).catch( error => {
                      console.log('FileSystem.deleteAsync error: ', error);
                      // alert('FileSystem.deleteAsync error.');
                    })
                    
                } else { // response[code] is Error      
                  console.log('Received response[code] = error from functions.');
                  alert('Received response[code] = error from functions. Please log-in again.');
                }
               
            }).catch( error => {
              console.log('Error _sendSingleVidViewLog-py: ', error);
              alert('Error response from _sendSingleVidViewLog, Please log-in again.');
            });
          }         


          // https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
          firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
            const idTokenCopied = idToken;

            _sendSingleVidViewLog(idTokenCopied); // run http trigger
            
          }).catch(function(error) {
            console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
          });  

          
        });

      } else {
        console.log('NO vidViewLog to upload to Firestore.'); // Do nothing since no files to be sent to Firebase
      };
        
    } catch (err) {
      console.log('_sendVidViewLog error: ', err);
    }
  
  }


  _saveVidViewLog = async () => {
    console.log('----------- _saveVidViewLog Exercise.js start' );

    const ts = Date.now() / 1000; // unix //date.getTime().toString();
    // console.log('ts: ', ts);
    const vidId = this.props.navigation.getParam('post')['VIDID'];
    const viewId = uuidv4();
    const vidViewLogFileName = ts + '_' + vidId + '_' + viewId;

    var jsonContents = {};
    jsonContents["ts"] = ts;
    jsonContents["vidId"] = vidId;
    jsonContents["viewId"] = viewId;
    jsonContents["uid"] = firebase.auth().currentUser.uid;
    jsonContents["startAt"] = this.vidState.vidStartAt;
    jsonContents["endAt"] = this.vidState.vidEndAt;
    jsonContents["nTa"] = this.state.noseToAnkle;
    jsonContents["pt"] = this.state.mdCumTtlNow;
    jsonContents["score"] = this.state.scoreNow; 
    jsonContents["mdCumAll"] = this.mdCumAll; // this is an Array

    if ( this.vidState.vidPlayedSum > this.state.vidLength) {
      jsonContents["playSum"] = this.state.vidLength; // force to assign video length because played time should not be longer than video length. 20200614
    } else {
      jsonContents["playSum"] = this.vidState.vidPlayedSum; // 
    }  
    jsonContents["playPct"] = ( this.vidState.vidPlayedSum + 0.00001 ) / this.state.vidLength;
    jsonContents['cntOutAccel'] = this.cntOutAccel;
    jsonContents['cntPressPlayButton'] = this.vidState.cntPressPlayButton;
    jsonContents['cntPressPauseButton'] = this.vidState.cntPressPauseButton;
    jsonContents['frameOutCntCum'] = this.frameOutCntCum; // this is a Dictionary
    // jsonContents['frameOutCntCum'] = JSON.stringify( this.frameOutCntCumObj.push(this.frameOutCntCum) ); // this is a Dictionary
    // jsonContents['frameOutCntCum'] = this.frameOutCntCumObj.push(this.frameOutCntCum) ; // this is a Dictionary
    jsonContents['identifiedBparts'] = this.identifiedBPartsAll; // this is an Array
  
    jsonContents['iTWidth'] = this.inputTensorWidth; 
    jsonContents['iTHeight'] = this.inputTensorHeight;
    jsonContents['scHeight'] = this.camState.screenHeight;
    jsonContents['scWidth'] = this.camState.screenWidth;
    jsonContents['winHeight'] = this.camState.windowHeight;
    jsonContents['winWidth'] = this.camState.windowWidth;
    jsonContents['texDimsWidth'] = this.textureDims.width;
    jsonContents['texDimsHeight'] = this.textureDims.height;

    jsonContents['outNTAcnt'] = this.outNTA.cnt;
    jsonContents['numFrameVidStart'] = this.vidState.numFrameVidStart;
    jsonContents['numFrameAllPosOk'] = this.vidState.numFrameAllPosOk;
    jsonContents['numFrameVidEnd'] = this.vidState.numFrameVidEnd; 

    jsonContents = JSON.stringify(jsonContents); // convert to string for saving file
    // console.log('jsonContents: ', jsonContents);

    // vidViewLog for Firestore
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + this.state.vidViewLogTemp + '/' + vidViewLogFileName + '.json', 
      jsonContents,
      ).then( () => {
        console.log('----------- vidViewLog saved: ');
        // this.setState({ savedFileName: vidViewLogFileName });
        
        this._sendVidViewLog( vidViewLogFileName );

      }).catch(error => {
        console.log('vidViewLog error: ', error);
        // deactivateKeepAwake();
      });

  }





  renderPose() {
    console.log('-------- renderPose.: ', this.vidState.renderPoseTimes);

    const {pose, vidLength, flagAllPosOk, noseToAnkle, flagNoseToAnkle, rightToLeft, flagRightToLeft ,vidFullUrl, shouldPlay, flagUpdateScore, flagVidEnd } = this.state;
    // console.log('-------- pose: ', pose);


    try{


      // const _AppendIdentifiedBPartsAll = (identifiedBpartsEach) => { // this runs every posenet loop to push identifiedBPartsEach to Array. 20200520
      //   console.log('======================= _AppendIdentifiedBPartsAll 1 ========= ', Date.now()/1000);
      //   // this.identifiedBPartsAll.push( JSON.stringify({ 'lp': this.vidState.LOOPTIMES, 'ts': Date.now()/1000, 'idBParts': identifiedBpartsEach }) ); // append to array per each loop
      //   this.identifiedBPartsAll.push( JSON.stringify({ 'ts': Date.now()/1000 }) ); 
      // }


////////// _playVideoAtStart  ////////////////////    
      const _playVideoAtStart = () => { // this runs when countdown timer becomes 0
        this.vidState.vidStartAt = Date.now()/1000;
        this.vidState.loopStartAt = Date.now()/1000;

        console.log('======================= _playVideoAtStart ========= ', Date.now()/1000);

        this.setState({ flagCountdownFinished: true, shouldPlay: true});
        this.webviewRef.injectJavaScript(`
            document.getElementsByTagName("video")[0].play();
        `)

        this.vidState.numFrameVidStart = this.vidState.renderPoseTimes; // for record to Firestore vidViewLog. 20200524
           
        //// check if Accelerometer is available or not. 20200520
        Accelerometer.isAvailableAsync().then( () => { 
          console.log('----------- AccelerometerIsAvailable');
          this.setState({ flagAccelerometerIsAvailable: true }); 
          this._subscribeToAccelerometer(); // run Accelerometer
        }).catch(error => {
          console.log('AccelerometerIs NOT Available: ', error);
        });


      }



////////// update score ////////////////////
      if (this.state.shouldPlay === true & this.state.flagUpdateScore === false & this.state.flagVidEnd === false)  { //

        var _updateScore = setInterval( () => {

          var secFromStart = parseInt( Date.now() / 1000 - this.vidState.vidStartAt);
          console.log('================================== secFromStart: ', secFromStart );
          
          var finscore_now = JSON.parse(this.vidMeta["FINSCORE"])[ secFromStart.toString() ] ; // current time's finscore
          console.log('--- finscore_now: ', finscore_now);

          var NTAForScore = noseToAnkle * this.coefNTA; // 20200614
          console.log('--- noseToAnkle: ', noseToAnkle);

          var mdCumTtlNow = 
          (this.mdCum.y0 / NTAForScore * this.wpart.nose) +
          (this.mdCum.y5 / NTAForScore * this.wpart.leftShoulder) +
          (this.mdCum.y6 / NTAForScore * this.wpart.rightShoulder) +              
          (this.mdCum.y7 / NTAForScore * this.wpart.leftElbow) +   
          (this.mdCum.y8 / NTAForScore * this.wpart.rightElbow) +   
          (this.mdCum.y9 / NTAForScore * this.wpart.leftWrist) +   
          (this.mdCum.y10 / NTAForScore * this.wpart.rightWrist) +   
          (this.mdCum.y11 / NTAForScore * this.wpart.leftHip) +   
          (this.mdCum.y12 / NTAForScore * this.wpart.rightHip) +                 
          (this.mdCum.y13 / NTAForScore * this.wpart.leftKnee) +   
          (this.mdCum.y14 / NTAForScore * this.wpart.rightKnee) +   
          (this.mdCum.y15 / NTAForScore * this.wpart.leftAnkle) +   
          (this.mdCum.y16 / NTAForScore * this.wpart.rightAnkle)  
          console.log('--- mdCumTtlNow: ', mdCumTtlNow);          

          // this.vidState.scorePointSum = this.vidState.scorePointSum + 9; 
          var scoreNow = mdCumTtlNow / finscore_now * 100; // its like percentage 
          if (scoreNow > 100) { // if score is over 100, then force to 100.
            scoreNow = 100;
          }
          console.log('--- scoreNow: ', scoreNow);


          //// calcalate progressBarWidth 20200605
          var progressBarWidth = ( this.vidState.vidPlayedSum / this.state.vidLength ) * Dimensions.get('window').width;


          this.setState({ mdCumTtlNow : mdCumTtlNow.toFixed(2), scoreNow: parseInt( scoreNow ), progressBarWidth: progressBarWidth });// this is what shows as score on top right.
          

////////// Append mdCum moved distance Cummulative for vidViewLog  ////////////////////        
          var mdCumNowArray = {
          "0": this.mdCum.y0.toFixed(), // nose
          "5": this.mdCum.y5.toFixed(), // leftShoulder
          "6": this.mdCum.y6.toFixed(), // rightShoulder           
          "7": this.mdCum.y7.toFixed(), // leftElbow
          "8": this.mdCum.y8.toFixed(), // rightElbow
          "9": this.mdCum.y9.toFixed(), // leftWrist
          "10": this.mdCum.y10.toFixed(), // rightWrist
          "11": this.mdCum.y11.toFixed(), // leftHip
          "12": this.mdCum.y12.toFixed(), // rightHip            
          "13": this.mdCum.y13.toFixed(), // leftKnee
          "14": this.mdCum.y14.toFixed(), // rightKnee
          "15": this.mdCum.y15.toFixed(), // leftAnkle
          "16": this.mdCum.y16.toFixed() }; // rightAnkle
          // console.log('--- mdCumNowArray: ', mdCumNowArray); 


          this.mdCumAll.push( JSON.stringify({ 'sec': secFromStart, 'ts': Date.now()/1000, 'score': scoreNow.toFixed(4), 'playSum': this.vidState.vidPlayedSum.toFixed(2), 'mdCumNowArray': mdCumNowArray, 'pos': this.pos }) ); // append froms Start to End 
         


////////// Video End  ////////////////////
          console.log('this.vidState.vidPlayedSum , vidLength: ', this.vidState.vidPlayedSum , vidLength );
          if ( this.vidState.vidPlayedSum > vidLength + 1 ) { // add 1 seconds on vidLength
            console.log('=========================== Video end ========== time from vidStartAt', Date.now()/1000 - this.vidState.vidStartAt );
            clearInterval(_updateScore); 
            this.vidState.vidEndAt = Date.now()/1000;
            this.setState({flagVidEnd: true, flagUpdateScore: false, showModal: true});  // deleted 
            // this.setState({flagVidEnd: true , showModal: true});    

            this.vidState.numFrameVidEnd = this.vidState.renderPoseTimes; // for record to Firestore vidViewLog. 20200524
        
          } 
          

          if ( this.state.shouldPlay === false ) { // this will force to stop setInterval(_updateScore) when user outNTA or press gobackhome BEFORE video ends. 20200603
            console.log('this will force to stop setInterval(_updateScore).');
            clearInterval(_updateScore); 
          }

        }, 1000 ); // update score every X millisecond  

        console.log('---------------------------------------- flagUpdateScore: true'); // deleted 20200523
        this.setState({flagUpdateScore: true}); // deleted 20200523

      } // closing if (this.state.shouldPlay === true & this.state.flagUpdateScore === false & this.state.flagVidEnd === false)

      if ( pose != null ) {
        // console.log('-------- pose.keypoints: ', pose.keypoints)

        var identifiedBpartsEach = []; // reset at each loop 20200520

        const keypoints = pose.keypoints
          .filter(k => k.score > this.MIN_KEYPOINT_SCORE)
          .map((k,i) => {

            console.log(k.part, ' : ', Math.round(k.position.x), Math.round(k.position.y), 's:', k.score.toFixed(2) )

////////// check if exerciser is out of camera range. 20200127 ////////////////////      
            if (k.position.x > this.inputTensorWidth * 4/4) { 
              this.frameOutCnt.right += 1; 
              this.frameOutCntCum.right += 1;
              console.log('out on observers Right > > > > > > > > > > ', this.frameOutCnt.right);
            }
            if (k.position.x < this.inputTensorWidth * 0/4) {
              this.frameOutCnt.left += 1;
              this.frameOutCntCum.left += 1;
              console.log('out on observers Left < < < < < < < < < < ', this.frameOutCnt.left);
            }
            if (k.position.y < this.inputTensorHeight * 0/4) {
              this.frameOutCnt.top += 1;
              this.frameOutCntCum.top += 1;
              console.log('out on observers Top ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ', this.frameOutCnt.top);
            }
            if (k.position.y > this.inputTensorHeight * 4/4 + StatusBar.currentHeight ) { // added StatusBar.currentHeight since frame out to bottom often seen. 20200531
              this.frameOutCnt.bottom += 1;
              this.frameOutCntCum.bottom += 1;
              console.log('out on observers Bottom v v v v v v v v v v v ', this.frameOutCnt.bottom);
            }



  ////////// assign each value to this.pos.xxx ////////////////////
            if ( k.part === 'nose') {
              this.pos.x0 = Math.round(k.position.x);
              // identifiedBpartsEach.push("0");
              // identifiedBpartsEach.push([0, Math.round(k.position.x), Math.round(k.position.y), k.score.toFixed(2) ]);
              identifiedBpartsEach.push( { 'p': '0', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y0 != null) { // after 2nd loop
                if ( this.pos.y0 > Math.round(k.position.y) ) { // if previous position > present position
                  this.md.y0 = (this.pos.y0 - Math.round(k.position.y) ); // cum + moving distance
                } else {
                  this.md.y0 = 0; // reset variable
                }
              } else { // 1st loop
                this.pos.y0 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y0 nose');
              }      
              this.pos.y0 = Math.round(k.position.y); // update present position  
            } else if (k.part == 'leftEye') {
              // this.pos.x1 = Math.round(k.position.x);
              this.pos.y1 = Math.round(k.position.y);
              // identifiedBpartsEach.push("1");
              identifiedBpartsEach.push( { 'p': '1', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
            } else if (k.part== 'rightEye') {
              // this.pos.x2 = Math.round(k.position.x);
              this.pos.y2 = Math.round(k.position.y);
              // identifiedBpartsEach.push("2");
              identifiedBpartsEach.push( { 'p': '2', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
            } else if (k.part == 'leftElbow') {
              // identifiedBpartsEach.push("7");
              identifiedBpartsEach.push( { 'p': '7', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y7 != null) { // after 2nd loop
                if ( this.pos.y7 > Math.round(k.position.y) ) { // if previous position > present position
                  this.md.y7 = (this.pos.y7 - Math.round(k.position.y)); // cum + moving distance
                } else {
                  this.md.y7 = 0; // reset variable
                }
              } else { // 1st loop
                this.pos.y7 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y7 leftElbow');
              }      
              this.pos.y7 = Math.round(k.position.y); // update present position                     
            } else if (k.part == 'rightElbow') {
              // identifiedBpartsEach.push("8");
              identifiedBpartsEach.push( { 'p': '8', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y8 != null) { // after 2nd loop
                if ( this.pos.y8 > Math.round(k.position.y) ) { // if previous position > present position
                  this.md.y8 = (this.pos.y8 - Math.round(k.position.y)); // cum + moving distance
                } else {
                  this.md.y8 = 0; // reset variable
                }
              } else { // 1st loop
                this.pos.y8 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y8 rightElbow');
              }      
              this.pos.y8 = Math.round(k.position.y); // update present position  
            } else if (k.part == 'leftWrist') {
              this.pos.x9 = Math.round(k.position.x); 
              // identifiedBpartsEach.push("9");
              identifiedBpartsEach.push( { 'p': '9', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y9 != null) { // after 2nd loop
                if ( this.pos.y9 > Math.round(k.position.y) ) { // if previous position > present position
                  this.md.y9 = (this.pos.y9 - Math.round(k.position.y)); // cum + moving distance
                } else {
                  this.md.y9 = 0; // reset variable
                }
              } else { // 1st loop
                this.pos.y9 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y9 leftWrist');
              }      
              this.pos.y9 = Math.round(k.position.y); // update present position  
            } else if (k.part == 'rightWrist') {
              this.pos.x10 = Math.round(k.position.x); 
              // identifiedBpartsEach.push("10");
              identifiedBpartsEach.push( { 'p': '10', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y10 != null) { // after 2nd loop
                if ( this.pos.y10 > Math.round(k.position.y) ) { // if previous position > present position
                  this.md.y10 = (this.pos.y10 - Math.round(k.position.y)); // cum + moving distance
                } else {
                  this.md.y10 = 0; // reset variable
                }
              } else { // 1st loop
                this.pos.y10 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y10 rightWrist');
              }      
              this.pos.y10 = Math.round(k.position.y); // update present position 
            } else if (k.part == 'leftShoulder') {
              // identifiedBpartsEach.push("5");
              identifiedBpartsEach.push( { 'p': '5', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y5 != null) { // after 2nd loop
                  if ( this.pos.y5 > Math.round(k.position.y) ) { // if previous position > present position
                    this.md.y5 = (this.pos.y5 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y5 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y5 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y5 leftShoulder');
              }      
              this.pos.y5 = Math.round(k.position.y); // update present position                     
            } else if (k.part == 'rightShoulder') {
              // identifiedBpartsEach.push("6");
              identifiedBpartsEach.push( { 'p': '6', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y6 != null) { // after 2nd loop
                  if ( this.pos.y6 > Math.round(k.position.y) ) { // if previous position > present position
                    this.md.y6 = (this.pos.y6 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y6 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y6 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y6 rightShoulder');
              }      
              this.pos.y6 = Math.round(k.position.y); // update present position  
            } else if (k.part == 'leftHip') {
              // identifiedBpartsEach.push("11");
              identifiedBpartsEach.push( { 'p': '11', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y11 != null) { // after 2nd loop
                  if ( this.pos.y11 > Math.round(k.position.y) ) { // if previous position > present position
                    this.md.y11 = (this.pos.y11 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y11 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y11 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y11 leftHip');
              }      
              this.pos.y11 = Math.round(k.position.y); // update present position  
            } else if (k.part == 'rightHip') {
              // identifiedBpartsEach.push("12");
              identifiedBpartsEach.push( { 'p': '12', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y12 != null) { // after 2nd loop
                  if ( this.pos.y12 > Math.round(k.position.y)) { // if previous position > present position
                    this.md.y12 = (this.pos.y12 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y12 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y12 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y12 rightHip');
              }      
              this.pos.y12 = Math.round(k.position.y); // update present position 
            } else if (k.part == 'leftKnee') {
              // identifiedBpartsEach.push("13");
              identifiedBpartsEach.push( { 'p': '13', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y13 != null) { // after 2nd loop
                  if ( this.pos.y13 > Math.round(k.position.y) ) { // if previous position > present position
                    this.md.y13 = (this.pos.y13 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y13 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y13 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y13 leftKnee');
              }      
              this.pos.y13 = Math.round(k.position.y); // update present position                     
            } else if (k.part == 'rightKnee') {
              // identifiedBpartsEach.push("14");
              identifiedBpartsEach.push( { 'p': '14', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y14 != null) { // after 2nd loop
                  if ( this.pos.y14 > Math.round(k.position.y) ) { // if previous position > present position
                    this.md.y14 = (this.pos.y14 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y14 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y14 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y14 rightKnee ');
              }      
              this.pos.y14 = Math.round(k.position.y); // update present position  
            } else if (k.part == 'leftAnkle') {
              this.pos.x15 = Math.round(k.position.x); 
              // identifiedBpartsEach.push("15");
              identifiedBpartsEach.push( { 'p': '15', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y15 != null) { // after 2nd loop
                  if ( this.pos.y15 > Math.round(k.position.y) ) { // if previous position > present position
                    this.md.y15 = (this.pos.y15 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y15 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y15 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y15 leftAnkle');
              }      
              this.pos.y15 = Math.round(k.position.y); // update present position  
            } else if (k.part == 'rightAnkle') {
              this.pos.x16 = Math.round(k.position.x); 
              // identifiedBpartsEach.push("16");
              identifiedBpartsEach.push( { 'p': '16', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.y16 != null) { // after 2nd loop
                  if ( this.pos.y16 > Math.round(k.position.y)) { // if previous position > present position
                    this.md.y16 = (this.pos.y16 - Math.round(k.position.y)); // cum + moving distance
                  } else {
                    this.md.y16 = 0; // reset variable
                  }
              } else { // 1st loop
                this.pos.y16 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y16 rightAnkle');
              }      
              this.pos.y16 = Math.round(k.position.y); // update present position 

            // } else { // maybe error
              // console.log('getting Eye or Ear this.pos.');
              // if (k.part == 'rightEye' || k.part == 'leftEye' || k.part == 'rightEar' || k.part == 'leftEar') {
                // console.log('Eyes or Ears....');
              // }
            };


          }); // closing .map


///////// check if User moves towards Camera by noseToAnkle. 20200523 //////////// 
          if (shouldPlay == true && flagVidEnd == false)  { // check if video is playing
            if (this.pos.y0 != null && this.pos.y15 != null && this.pos.y16 != null) { // check if all necessary position data exist
              // if ( ( (this.pos.y15 + this.pos.y16) / 2 ) - this.pos.y0 > noseToAnkle * this.outNTA.DistMoveCriteria) { // check if data is out of criteria
              if ( Math.max(this.pos.y15 + this.pos.y16) - this.pos.y0 > noseToAnkle * this.outNTA.DistMoveCriteria) { // check if data is out of criteria
                console.log('---------- out NoseToAnkle');
                this.outNTA.cnt++; // increment
                if (this.outNTA.cnt > this.outNTA.outTimesCriteria && this.outNTA.flag == false) { // check if count of out times more than criteria
                  console.log('xxxxxxxxxxxxxxxxxxxxxx You moved too close to Camera.');
                  this.outNTA.flag = true; // to control to go in only one time.
                  
                  
                  // this.setState({shouldPlay : false, flagShowGoBackIcon : false, flagVidEnd : true }); // to stop playing video, and hide goBackIcon
                  // console.log('xxxxxxxxxxxxxxxxxxxxxx You moved too close to Camera. Video will stop');
                  // alert('You moved too close to Camera. Video will stop.');
                  
                  // ////// set timer X seconds and then isEditing: false
                  // var countSec = 0;
                  // var countup = async function(){
                  //   console.log(countSec++);
                  //   this._goBackToHome(); // move back to home
                  // } 
                  // setTimeout(countup, 5 * 1000); // run after XX millisecond

                }
              }
            }   
          }
        



          // console.log('identifiedBpartsEach: ', identifiedBpartsEach.length, ' | ', identifiedBpartsEach);

          if ( identifiedBpartsEach.length == 0 ) { // will not append 'bp' to avoid error
            this.identifiedBPartsAll.push( JSON.stringify({ 'lp': this.vidState.LOOPTIMES, 'ts': Date.now()/1000 }) ); // append to array per each loop
          } else {
            this.identifiedBPartsAll.push( JSON.stringify({ 'lp': this.vidState.renderPoseTimes, 'ts': Date.now()/1000, 'bp': identifiedBpartsEach }) ); // append to array per each loop
          }
          // this.identifiedBPartsAll = []; // emptize it because do not want to record.
    





////////// assign noseToAnkle & rightToLeft until this.state.flagCountdownFinished becomes true////////////////////
            // // assign noseToAnkle
            if (this.state.flagCountdownFinished == false) { // go into this block until countdown finish 

              ///////////////////////////////////
              // // TESTMODE DUMMY 
              if (this.TESTMODE == 1) { // when test
                if (flagNoseToAnkle == false) { 
                  this.setState({ 
                    noseToAnkle: 100, 
                    flagNoseToAnkle: true,
                  });       
                  console.log('8888888888 TESTMODE 8888888888888 DUMMY all pos confirmed.');     
                }
              }
              ///////////////////////////////////


              if (this.pos.y0 != null && this.pos.y15 != null && this.pos.y16 != null) {
                // if ( ( (this.pos.y15 + this.pos.y16) / 2 ) - this.pos.y0 > noseToAnkle) { // average of leftAnkle and rightAnkle
                if ( Math.max(this.pos.y15 + this.pos.y16) - this.pos.y0 > noseToAnkle) { // max of leftAnkle and rightAnkle 20200920
                  console.log('this.pos.x0, y0: ', this.pos.x0, this.pos.y0);
                  // this.noseToAnkle = ( (this.pos.y15 + this.pos.y16) / 2 ) - this.pos.y0 ;
                  this.setState({ 
                    // noseToAnkle: ( (this.pos.y15 + this.pos.y16) / 2 ) - this.pos.y0, // average of leftAnkle and rightAnkle
                    noseToAnkle: Math.max(this.pos.y15 + this.pos.y16) - this.pos.y0, // max of leftAnkle and rightAnkle 20200920
                    flagNoseToAnkle: true,
                  });
                  console.log('noseToAnkle updated: ', noseToAnkle);
                  // flagNoseToAnkle = 1; // flag 1 to stop assigning noseToAnkle
                  // this.setState({ flagNoseToAnkle: true});
                }
              }            

              // // assign rightToLeft
              if (this.pos.x10  != null && this.pos.x9 != null) {
                if ( this.pos.x9 - this.pos.x10 > rightToLeft) {
                  console.log('this.pos.x10, x9: ', this.pos.x10, this.pos.x9);
                    this.setState({ 
                      rightToLeft: this.pos.x9 - this.pos.x10, 
                      flagRightToLeft: true, 
                    });
                    console.log('rightToLeft updated: ', rightToLeft);
                }
              }  

            }


  ////////// to check if all the positions are ready in camera  ////////////////////

            if (vidFullUrl != '' && flagAllPosOk == false) { // Go into this block unitl countdown starts.

              ///////////////////////////////////////////////////////////
              // // DUMMY TESTMODE == 1
                // if ( this.pos.y0 != null && this.pos.y5 != null && this.pos.y6 != null) { //  TEST PURPOSE ONLY 
              ////////////////////////////////////////////////////////////


                if ( flagNoseToAnkle == true && 
                    this.pos.y0 != null && 
                    this.pos.y5 != null && 
                    this.pos.y6 != null && 
                    this.pos.y7 != null && 
                    this.pos.y8 != null && 
                    this.pos.y9 != null && 
                    this.pos.y10 != null && 
                    this.pos.y11 != null && 
                    this.pos.y12 != null && 
                    this.pos.y13 != null && 
                    this.pos.y14 != null && 
                    this.pos.y15 != null && 
                    this.pos.y16 != null) { // all the positions is within camera range 20200114 
                

                  // // to check initialPositions       
                  if (this.pos.x9 > this.initialPositions.x9Min && this.pos.x9 < this.initialPositions.x9Max &&
                      this.pos.y9 > this.initialPositions.y9Min && this.pos.y9 < this.initialPositions.y9Max &&
                      this.pos.x10 > this.initialPositions.x10Min && this.pos.x10 < this.initialPositions.x10Max &&
                      this.pos.y10 > this.initialPositions.y10Min && this.pos.y10 < this.initialPositions.y10Max &&
                      this.pos.x15 > this.initialPositions.xBothAnkleMin && this.pos.x15 < this.initialPositions.xBothAnkleMax &&
                      this.pos.y15 > this.initialPositions.yBothAnkleMin &&
                      this.pos.x16 > this.initialPositions.xBothAnkleMin && this.pos.x16 < this.initialPositions.xBothAnkleMax &&
                      this.pos.y16 > this.initialPositions.yBothAnkleMin 
                      ) {
                  
              ////////////////////////////////////////////////////////////       
              
              

                    this.cntIniPos += 1;
                    // console.log('---------- this.cntIniPos: ', this.cntIniPos);

                    // hide webCam, initialPosture.png & start countdown 
                    if (flagAllPosOk == false && this.cntIniPos > 2) { // flag to control going through one time 
                      //flagAllPosOk = 1; // flag to confirm all the positions are within camera range
                      this.setState({ flagAllPosOk: true });
                      console.log('oooooooooooooooooooooooooooooooooooooooooo All the positions confirmed ooooooooooooooooooooooooooooooooooooooooooooo ');
                      
                      this.vidState.numFrameAllPosOk = this.vidState.renderPoseTimes; // for record to Firestore vidViewLog. 20200524

                      var videoCountDownSec = 5; // total countdown seconds until trainerVideo starts
                      // console.log('------------------ 0002');

                      var videoCountDown = setInterval( function(){
                        // console.log('------------------ 0002.5: ', videoCountDownSec);
                        this.setState({countdownTxt: videoCountDownSec + ' ...'}); // assign 
                        console.log('--------------------- videoCountDownSec... : ', videoCountDownSec);
                        videoCountDownSec--; // decrement
                        if (videoCountDownSec < 0) { // when becomes smaller than zero
                          clearInterval(videoCountDown); // terminate interval
                          // this.attentionTxt = ''; // emptize text
                          _playVideoAtStart(); //  start video function
                          // this._handlePlayAndPause;
                          console.log('videoCountDown ends ');
                        }

                        // console.log('---- 1439   this.state.flagAllPosOk: ', this.state.flagAllPosOk );
                        // console.log('---- 1439   this.state.flagCountdownFinished: ', this.state.flagCountdownFinished );
                        // console.log('---- 1439   this.state.flagShowGoBackIcon: ', this.state.flagShowGoBackIcon );
                        // console.log('---- 1439   this.state.flagUpdateScore: ', this.state.flagUpdateScore );
                        // console.log('---- 1439   this.state.shouldPlay: ', this.state.shouldPlay );

                        if ( this.state.flagVidEnd === true ) { // this will force to stop setInterval(videoCountDown) when user press gobackhome DURING COUNTDOWN. 20200603
                          console.log('this will force to stop setInterval(videoCountDown).');
                          clearInterval(videoCountDown); 
                        }
                       

                      }.bind(this), 1000 ); // countdown interval in second  // add .bind(this) because https://stackoverflow.com/questions/31045716/react-this-setstate-is-not-a-function
                      // console.log('------------------ 0003');

                    } 

                  } else { // if initialPositions not confirmed
                    console.log('initialPositions NOT confirmed');
                  }   
                  
                } else { // if all positions not confirmed 
                  // console.log('All the positions NOT confirmed xxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
                }



            // } else if (isWPartLoaded == false && isVidMetaLoaded == false) {
            //   console.log('WPart, VidMeta, vidFullUrl from Firebase Not loaded yet.');
            }   




        // to start logging to mdCum after Video started
        // console.log('FlagVidStart, FlagVidEnd; ', FlagVidStart, FlagVidEnd) 
        if (this.state.shouldPlay == true && this.state.flagVidEnd == false)  {  
          // console.log('------------------ 0005');
          this.mdCum.y0 = this.mdCum.y0 + this.md.y0;
          this.mdCum.y5 = this.mdCum.y5 + this.md.y5;
          this.mdCum.y6 = this.mdCum.y6 + this.md.y6;              
          this.mdCum.y7 = this.mdCum.y7 + this.md.y7;
          this.mdCum.y8 = this.mdCum.y8 + this.md.y8;
          this.mdCum.y9 = this.mdCum.y9 + this.md.y9;
          this.mdCum.y10 = this.mdCum.y10 + this.md.y10;
          this.mdCum.y11 = this.mdCum.y11 + this.md.y11;
          this.mdCum.y12 = this.mdCum.y12 + this.md.y12;               
          this.mdCum.y13 = this.mdCum.y13 + this.md.y13;
          this.mdCum.y14 = this.mdCum.y14 + this.md.y14;
          this.mdCum.y15 = this.mdCum.y15 + this.md.y15;
          this.mdCum.y16 = this.mdCum.y16 + this.md.y16;             
          
          // console.log('md: ', md);
          // console.log('mdCum: ', mdCum);      

        }


        // const adjacentKeypoints = posenet.getAdjacentKeyPoints(pose.keypoints, MIN_KEYPOINT_SCORE);
        // console.log('adjacentKeypoints: ', adjacentKeypoints);

        // const lines = adjacentKeypoints.map(([from, to], i) => {
          // console.log('-------- Line: ', i, from.position.x, from.position.y, to.position.x, to.position.y);
        // });


////////// judge & color RED if out of screen ////////////////////      
        // compare frameOutCnt with previous value & change border-color to RED if over criteria or Reset. 20200127
        // console.log('------------------ judge out of screen');
        if (this.frameOutCnt.top > this.frameOutCntCriteria) {
            if (this.frameOutCntPrev.top < this.frameOutCnt.top) { // increased from previous assignment
              this.ULBColor.top = 'red';
              // this.setState({ ULBColorTop: 'red' });
            } else if (this.frameOutCntPrev.top === this.frameOutCnt.top) {// compare with previous assignment
              this.ULBColor.top = 'transparent';   
              // this.setState({ ULBColorTop: 'transparent' });             
              this.frameOutCnt.top = 0; // reset
            }
        }
        this.frameOutCntPrev.top = this.frameOutCnt.top; // update value     

        if (this.frameOutCnt.bottom > this.frameOutCntCriteria) {
            if (this.frameOutCntPrev.bottom < this.frameOutCnt.bottom) { // increased from previous assignment
              this.ULBColor.bottom = 'red';
              // this.setState({ ULBColorBottom: 'red' });
            } else if (this.frameOutCntPrev.bottom === this.frameOutCnt.bottom) {// compare with previous assignment
              this.ULBColor.bottom = 'transparent';
              // this.setState({ ULBColorBottom: 'transparent' });
              this.frameOutCnt.bottom = 0; // reset
            }
        }
        this.frameOutCntPrev.bottom = this.frameOutCnt.bottom; // update value   

        if (this.frameOutCnt.left > this.frameOutCntCriteria) {
          if (this.frameOutCntPrev.left < this.frameOutCnt.left) { // increased from previous assignment
            this.ULBColor.left = 'red';
            // this.setState({ ULBColorLeft: 'red' });
          } else if (this.frameOutCntPrev.left === this.frameOutCnt.left) {// compare with previous assignment
            this.ULBColor.left = 'transparent'; 
            // this.setState({ ULBColorLeft: 'transparent' });               
            this.frameOutCnt.left = 0; // reset
          }
        }
        this.frameOutCntPrev.left = this.frameOutCnt.left; // update value    

        if (this.frameOutCnt.right > this.frameOutCntCriteria) {
          if (this.frameOutCntPrev.right < this.frameOutCnt.right) { // increased from previous assignment
            this.ULBColor.right = 'red';
            // this.setState({ ULBColorRight: 'red' });
          } else if (this.frameOutCntPrev.right === this.frameOutCnt.right) {// compare with previous assignment
            this.ULBColor.right = 'transparent';   
            // this.setState({ ULBColorRight: 'transparent' });          
            this.frameOutCnt.right = 0; // reset
          }
        }
        this.frameOutCntPrev.right = this.frameOutCnt.right; // update value
        
      
      // } else if (flagVidEnd === false) {
        // console.log('----------------- pose is null --------------------');
        // return null;      
      } else { 
        console.log('----------------- pose is Null --------------------');
        return null;
      } 


    }catch(err) { // closing try block
      console.log('renderpose error: ', err);  
    }  

    this.vidState.renderPoseTimes++; // increment

  } // closing renderPose






  render() {
    console.log('----------------- render --------------------');
    const { isPosenetLoaded, isReadyToCD, flagAllPosOk, flagCountdownFinished, shouldPlay, flagVidEnd, scoreNow, vidStartAt, loopStartAt, countdownTxt, mdCumTtlNow, showModal, accelerometerData, flagShowGoBackIcon } = this.state;

    if (shouldPlay == true) { // increment only shouldPlay=true. this means not incremented whe video is paused.
      this.vidState.vidPlayedSum = this.vidState.vidPlayedSum + (Date.now()/1000 - this.vidState.loopStartAt); // add increment time
    }
    console.log( '-- Interval: ', (Date.now()/1000 - this.vidState.loopStartAt).toFixed(2)  ); // this does not have any meaning, just to show how fast code runs.
    this.vidState.loopStartAt = Date.now()/1000;


////////// to check if mobile devices is fixed & no move by Accelerometer
    if (shouldPlay == true && flagVidEnd == false) { // this runs only when video is playing after countdown until video ends
      if (this.prevAccelData.x == null || this.prevAccelData.y == null || this.prevAccelData.z == null) { // only 1st loop, Do assign only, 
        this.prevAccelData.x = accelerometerData.x; // assign only
        this.prevAccelData.y = accelerometerData.y; // assign only
        this.prevAccelData.z = accelerometerData.z; // assign only
      } else {
        // console.log('accelerometerData move from previous x,y,z: ', Math.abs(this.prevAccelData.x - accelerometerData.x).toFixed(2), Math.abs(this.prevAccelData.y - accelerometerData.y).toFixed(2), Math.abs(this.prevAccelData.z - accelerometerData.z).toFixed(2),)
        if ( Math.abs(this.prevAccelData.x - accelerometerData.x) > this.outCriteriaAccel.x || Math.abs(this.prevAccelData.y - accelerometerData.y) > this.outCriteriaAccel.y || Math.abs(this.prevAccelData.z - accelerometerData.z) > this.outCriteriaAccel.z) { // if any of x,y,z is out of criteria
          console.log('xxxxxxxxxx OutAccel');
          this.cntOutAccel += 1; // increment
          if (this.cntOutAccel % 3 == 0) { // if divided by x == 0 , means it will alert when every X cntOutAccel.
            console.log('Please fix and Do not move your device. this.cntOutAccel: ', this.cntOutAccel);
            alert('Please fix and Do not move your device.');
          }
        }
        this.prevAccelData.x = accelerometerData.x; // assign only
        this.prevAccelData.y = accelerometerData.y; // assign only
        this.prevAccelData.z = accelerometerData.z; // assign only        
      }
    } 



    return (
        <View style={styles.container}>
          

          { isPosenetLoaded ?  

            <View style={styles.layerOneContainer}>


              { flagAllPosOk ?

                <View style={{ height: '100%', width: '100%', }}>

                  {/* <View style={[ styles.webCamContainer, {zindex: 200, borderColor: 'orange', borderWidth: 0, } ]}> */}
                  {/* <View style={[ {zindex: 200}, styles.webCamContainer ]}> */}
                  <View style={ styles.webCamContainer }>
                    <TensorCamera
                      // Standard Camera props
                      // style={[ {zindex: 200}, styles.webCam ]}
                      style={ styles.webCam }
                      type={Camera.Constants.Type.front}
                      // Tensor related props
                      cameraTextureWidth = {this.textureDims.width}
                      cameraTextureHeight = {this.textureDims.height}  
                      resizeHeight={this.inputTensorHeight} 
                      resizeWidth={this.inputTensorWidth}                                              
                      resizeDepth={3}
                      onReady={ this.handleImageTensorReady }  // data => this.processOutput(data) // https://medium.com/@namar/high-performance-image-classification-with-react-native-336db0a96cd
                      autorender={true}
                    />
                  </View>

                  <View style={styles.trainerVideoContainer}>
                  {/* <View style={[ {zindex: 400 }, styles.trainerVideoContainer ]}> */}
                    <WebView
                      ref={r => (this.webviewRef = r)}
                      source={{ uri: this.state.vidFullUrl }}
                      // style={[ {zindex: 400 }, styles.trainerVideo]} 
                      style={ styles.trainerVideo } 
                      onNavigationStateChange={this._vidDefault}
                    /> 
                  </View> 

                </View>

              :  

                <View style={{ height: '100%', width: '100%',}}>

                  <View style={styles.trainerVideoContainer}>
                    <WebView
                      ref={r => (this.webviewRef = r)}
                      source={{ uri: this.state.vidFullUrl }}
                      style={ styles.trainerVideo } 
                      onNavigationStateChange={this._vidDefault}
                    /> 
                  </View>  

                  <View style={ styles.webCamContainer }> 
                    <TensorCamera
                      // Standard Camera props
                      style={ styles.webCam } // remove webCam when flagAllPosOk = true
                      type={Camera.Constants.Type.front}
                      // Tensor related props
                      cameraTextureWidth = {this.textureDims.width}
                      cameraTextureHeight = {this.textureDims.height}  
                      resizeHeight={this.inputTensorHeight} 
                      resizeWidth={this.inputTensorWidth}                                                                            
                      resizeDepth={3} // 3 
                      onReady={ this.handleImageTensorReady }  // data => this.processOutput(data) // https://medium.com/@namar/high-performance-image-classification-with-react-native-336db0a96cd
                      autorender={true}
                    />
                  </View>   

                </View>

              }



              { flagVidEnd ?
                // <View style={styles.modelResults}> 
                // </View>
                null
              :  
                <View style={styles.modelResults}>
                  {this.renderPose()}
                </View>
              }   


              { flagAllPosOk && 
                <View style={styles.scoreContainer}>
                  { flagCountdownFinished ? 
                    <Text style={styles.scoreText}>
                      {scoreNow} 
                    </Text>
                  :
                    <Text style={styles.scoreText}>
                      {countdownTxt}
                    </Text>                    
                  }
                </View>
              }


              { shouldPlay ?
                <View style={ styles.playButtonContainer }>
                  <TouchableOpacity onPress={ this._handlePlayAndPause } style={{height: Dimensions.get('screen').width * 0.7, width: Dimensions.get('screen').width * 0.7}} >  
                  </TouchableOpacity>
                </View>
              :
                <View style={ styles.playButtonContainer }>
                  
                  { flagCountdownFinished ?
                    <TouchableOpacity onPress={ this._handlePlayAndPause } style={{height: Dimensions.get('screen').width * 0.7, width: Dimensions.get('screen').width * 0.7}}> 
                      <Ionicons name="ios-play-circle" color="#ffa500" size={this.playButtonSize} style={styles.playButton} />
                    </TouchableOpacity>
                  :
                    <View></View>
                  }

                </View>
              }

                 
              { flagAllPosOk && 
                <View style={[styles.upperLayerContainer, {
                  borderTopColor: this.ULBColor.top,
                  borderBottomColor: this.ULBColor.bottom,
                  borderLeftColor: this.ULBColor.left,
                  borderRightColor: this.ULBColor.right,
                  borderWidth: Dimensions.get('window').height * 0.01} ]}>
                  {/* <Text>upperLayerContainer</Text> */}
                  {/* time progress bar */} 
                  <View style={[styles.progressBar, {width: this.state.progressBarWidth} ]}>
                  </View>
                </View>
              }
              {/* https://reactnativecode.com/set-padding-dynamically/https://reactnativecode.com/set-padding-dynamically/ */}
               

              { flagAllPosOk ?  
                // <View style={[styles.initialPostureContainer, {height: 0, width: 0}]}>
                // </View>
                null
              :
                <View style={styles.initialPostureContainer}>
                  <Image style={styles.initialPostureImage} source={require('../assets/initialPosture_310x310dotted.png')} />
                </View>
              }


              { flagAllPosOk ? 
                null
              :
                <View style={styles.attentionContainer}>
                  <Text style={styles.attentionText}>
                    {this.attentionTxt}
                  </Text>
                </View>
              }


              { flagVidEnd && 
                <View style={styles.modalLike}>
                  <Text style={styles.modalLikeTitle}>
                    Score:
                  </Text>
                  <Text style={styles.modalLikeText}>
                    {scoreNow}
                  </Text>
                  <Text style={styles.modalLikeTitle}>
                    Movage points:
                  </Text>
                  <Text style={styles.modalLikeText}>
                    {mdCumTtlNow}
                  </Text>
                </View>   
              }


            </View> // close styles.layerOneContainer,
          
          :

            // <View style={{ height: '100%', width: '100%' }}>
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size='large' color='#ffa500' />
                <Text> Loading Data...</Text>
              </View> 
            // {/* </View> */}

          }


          <View style={styles.goBackIconContainer}>
            <TouchableOpacity onPress={ this._goBackToHome }  >
              <Ionicons name="md-arrow-back" size={goBackIconSize} color="#ffa500" style={styles.goBackIcon}/>
            </TouchableOpacity>   
          </View>


      
        </View> //close styles.Container,

    ) // closing return  

  } // closing render()

} // closing class



const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    // alignItems: 'center',
    // justifyContent: 'center',
    // padding: 24,
    top: StatusBar.currentHeight,
    height: Dimensions.get('window').height, // StatusBar.currentHeight, // Dynamically get & summate screen height & statusbar height.
    width: Dimensions.get('window').width,
    position: 'absolute',
    flex: 0,
    // zindex: 0, // 20200531
    // borderColor: 'green',
    // borderWidth: 1,
  },
  layerOneContainer: {
    // backgroundColor: 'blue',
    opacity: 1, // to see through trainerVideo 20200530
    height: Dimensions.get('window').height, // StatusBar.currentHeight, // Dynamically get & summate screen height & statusbar height.
    width: Dimensions.get('window').width,
    position: 'absolute',
    flex: 0,    
    // borderColor: 'purple', 
    // borderWidth: 2,   
    // zindex: 1, //20200531
  }, 
  trainerVideoContainer: {
    flex: 1,
    flexGrow: 1, // added 20200530
    // height: '100%',
    // width: '100%' ,
    height: Dimensions.get('window').height,
    // width: Dimensions.get('window').width,
    // height: 800, 
    // width: 300,
    width: null,
    // zindex: 100,
    // alignItems: 'center',
    // justifyContent: 'center',  
    borderColor: 'white', // BORDER IS NECESSARY BUT DONT KNOW WHY. 20200531
    borderWidth: 0.1, // BORDER IS NECESSARY BUT DONT KNOW WHY. 20200531
    // position: absolute, // DON'T ADD THIS, IT WILL BE BLUE EXPO ERROR SCREEN. 20200524
  },
  trainerVideo: {
    flex: 0, //1
    // flexGrow: 1,
    // position: absolute, // DON'T ADD THIS, EXPO WILL NOT START 20200530
    // position: 'relative',
    // height: '100%',
    // width: '100%',
    height: Dimensions.get('window').height, 
    // width: Dimensions.get('window').width,    
    alignItems: 'center',
    justifyContent: 'center',  
    // zindex: 300,     
    top: 0,
  },

  modelResults: {
    position:'absolute',
    // right: 0,
    // top: 0,
    height: 0, // 800/2,
    width: 0, // 600/2,
    // zIndex: 20,
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 0,
  },   

  webCamContainer: {
    flex: 0,
    // flexGrow:1,
    // display: 'flex',
    // height: Dimensions.get('window').height, // 200
    // width: Dimensions.get('window').width, // 152    
    height: '100%',
    width: '100%',      
    position: 'absolute', // DO NOT REMOVE THIS. WEBCAM SIZE BECOMES HALF SIZE HEIGHT OF WINDOW. 20200524
    // top: 0, //bottom: 0
    // right: 0, //Dimensions.get('window').width * 0.05,   
    // zIndex: 200,    
    // display: 'none',
    // margin: 5,
    borderColor: 'black', // BORDER IS NECESSARY BUT DONT KNOW WHY. 20200531
    borderWidth: 0.1, // BORDER IS NECESSARY BUT DONT KNOW WHY. 20200531    
  },  
  webCam: {
    alignItems: 'center',
    justifyContent: 'center',
    // height: null,
    // width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
    height: '100%',
    width: '100%',      
    // zIndex: 201,
    // borderColor: 'green',
    // borderStyle: 'dotted',
    // borderWidth: 3,
    position: 'absolute', //'relative',
    // top: 0,
    // right: 10,
  }, 

  scoreContainer: {
    // backgroundColor: 'white',
    // zIndex: 201, // removed 20200531
    position: 'absolute',
    top: Dimensions.get('window').height * 0.03,
    right: Dimensions.get('window').width * 0.03, 
    height: Dimensions.get('window').height * 0.13, // 0.1
    width: Dimensions.get('window').width * 0.4, //0.4
    backgroundColor: 'rgba(20, 20, 20, 0.5)', // darkgray seethrough background
    borderRadius: 10, 
    // padding: 3,
    // opacity: 0.5,   
  },
  scoreText:{
    // alignItems: 'center',
    // justifyContent: 'center',
    fontSize: 70,
    textAlign: 'center',
    textShadowColor: 'black',
    textShadowRadius: 10,
    color: '#ffa500',
    textAlignVertical: 'center',
    // fontFamily: fredoka-one,
  },   
  playButtonContainer: {
    flexGrow:1,
    height: null, //Dimensions.get('window').height * 0.5, // null,
    width: null, //Dimensions.get('window').width * 0.5, // null,    
    alignItems: 'center',
    justifyContent: 'center', 
    // zIndex: 202, // removed 20200531
    // backgroundColor: 'green',
    // alignItems: 'center',
    // justifyContent: 'center',
    // top: Dimensions.get('window').height * 0.5 - (playButtonSize / 2),
    // left: Dimensions.get('window').width * 0.5 - (playButtonSize / 2),
    // position: 'absolute',
    // textAlign: 'center',
  },
  playButton: {
    // height: Dimensions.get('screen').width * 0.5,
    // width: Dimensions.get('screen').width * 0.5,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center', 
    flexDirection: 'row',  
  }, 

  initialPostureContainer: {
    // zIndex: 300, // removed 20200531
    flexGrow:1,
    position: 'absolute',
    bottom: 0,
    // top: Dimensions.get('window').height * 0.1,
    width: '100%', //Dimensions.get('window').width * 1,
    // height: null,
    alignItems: 'center',
    justifyContent: 'center',
    // borderColor: 'blue',
    // borderWidth: 5,
  },
  initialPostureImage: {
    // width: Dimensions.get('window').width * 1,
    width: '100%',
    // bottom: navigatorBarHeight,
    height: Dimensions.get('window').width , // photo size = 392*256   
    bottom: 0,
    // borderColor: 'yellow',
    // borderWidth: 5,
  }, 

 
  attentionContainer: {
    // zIndex: 301, // removed 20200531
    flex: 1,
    // flexGrow:1,
    position: 'absolute',
    top: Dimensions.get('window').height * 0.03,
    // width: Dimensions.get('window').width * 0.9,
    // height: null,
    // width: null,    
    // alignItems: 'center',
    // justifyContent: 'center',   
    marginHorizontal: Dimensions.get('window').width * 0.2,
    backgroundColor: 'rgba(20, 20, 20, 0.5)', 
    borderRadius: 10, 
    // paddingHorizontal: 10,
  },
  attentionText: {
    // textShadowColor: 'black',
    // textShadowRadius: 5,
    fontSize: 35,
    color: '#ffa500',
    textAlign: 'center',
    // backgroundColor: 'rgba(220, 220, 220, 0.7)', 
  },


  upperLayerContainer: {
    position: 'absolute',
    top: 0, //StatusBar.currentHeight,
    height: Dimensions.get('window').height, // StatusBar.currentHeight, // Dynamically get & summate screen height & statusbar height.
    width: Dimensions.get('window').width,
    // zIndex: 400, // removed 20200531
    opacity: 0.9,
    // backgroundColor: '#ffa500', 
    // borderColor: 'blue',
    // borderWidth: 3,
  },
  progressBar: {
    flex: 1,
    position: 'absolute',
    left: 0,
    height: Dimensions.get('window').height * 0.03,
    bottom: Dimensions.get('window').height * 0.015,
    backgroundColor: 'orange',
  },

  modalLike: {
    // flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',  
    marginVertical: Dimensions.get('window').height * 0.3,     
    marginHorizontal: Dimensions.get('window').width * 0.1,
    height: Dimensions.get('window').height * 0.4,
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: '#ffa500', 
    borderRadius: 10,
    opacity: 1.0,
    shadowColor: 'black', // iOS
    shadowOffset: { width: 20, height: 20 }, // iOS
    shadowOpacity: 0.8, // iOS
    shadowRadius: 10, // iOS   
    // elevation: 10, // Android
    // zindex: 401, // removed 20200531
    position: 'absolute'
  },
  modalLikeTitle: {
    color: 'white', 
    fontSize: 30, 
    // fontWeight: 'bold', 
    textAlign: 'center',
  },  
  modalLikeText: {
    color: 'white', 
    fontSize: 70, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },  
   
  loadingIndicator: {
    // position: 'absolute',
    // top: 20,
    // right: 20,
    flexGrow:1,
    height:null,
    width:null,    
    alignItems: 'center',
    justifyContent: 'center',    
    // zIndex: 500, // removed 20200531
  },

  goBackIconContainer: {
    // marginTop: 10,
    // marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',   
    backgroundColor: 'rgba(20, 20, 20, 0.5)', // 'rgba(220, 220, 220, 0.5)'
    position: 'absolute',
    top: Dimensions.get('window').height * 0.02,
    left: Dimensions.get('window').width * 0.05, 
    // zIndex: 501, // removed 20200531
    height: goBackIconSize,
    width: goBackIconSize,
    borderRadius: goBackIconSize,
  },  
  goBackIcon: {
    textShadowColor: 'white',
    // textShadowRadius: 5,
    textAlign: 'center',
  },   

});