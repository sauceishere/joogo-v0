
// import * as React from 'react';
import React, { Component, useState, useEffect  } from 'react';
import { Text, View, StyleSheet, Dimensions, StatusBar, Image, TouchableOpacity, SafeAreaView, ScrollView, Button, Platform, ActivityIndicator, } from 'react-native';
import { WebView } from 'react-native-webview';
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

import * as ScreenOrientation from 'expo-screen-orientation'; // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationlockasyncorientationlock
// import Svg, { Circle, Rect,} from 'react-native-svg';
import * as SQLite from 'expo-sqlite';

// import {slow1} from '../assets/octopus';
import {LB_PER_KG} from '../shared/Consts';
import { NonMaxSuppressionV5 } from '@tensorflow/tfjs';
import { isNonNullExpression } from 'typescript';




const TensorCamera = cameraWithTensors(Camera); // https://js.tensorflow.org/api_react_native/latest/#cameraWithTensors

const goBackIconSize = 50; //40

// const ttlCW = 12; // total cell of width
// const ttlCH = 6; // total cell of height
// const octopusImageSizePct = 0.25; // percentage of Dimensions.get('window').width. 20200824



export default class Live extends Component {


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
      // vidFullUrl: '', // get from Firebase Storage
      // vidLength: this.props.navigation.getParam('post')['LEN'], // length of video navigated from Dashboard.js
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
      // mdCumTtlBeforeModel2: 0, // test puspose only 20201025
      noseToAnkle: 0, // initiate as null  
      flagNoseToAnkle: false, // flag 1 when noseToAnkle is fixed , before video starts. 
      rightToLeft: 0, // initiate as null  
      flagRightToLeft: false, // flag 1 when rightToLeft is fixed , before video starts. 
      flagAllPosOk: false, // Flag 1 when all positions collected
      flagCountdownFinished: false, // true when countdown finished to controll PlayAndPauseButton
      shouldPlay: false, // not play at default
      flagUpdateScore: false, //
      // flagVidEnd: false, // Flag 1 when Video ends, then stop logging
      vidViewLogTemp: 'vidViewLogTemp_' + firebase.auth().currentUser.uid, //{vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
      vidViewLog: 'vidViewLog_' + firebase.auth().currentUser.uid, //{vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
      // ULBColorTop: 'transparent',
      // ULBColorBottom: 'transparent',
      // ULBColorLeft: 'transparent',
      // ULBColorRight: 'transparent',
      flagAccelerometerIsAvailable: false,
      accelerometerData: { x: 0, y: 0, z: 0 },
      flagShowGoBackIcon: true, // to contrl hide and unhide goBackIcon
      progressBarWidth: 0, // initial at zero
      // flagLoopUpdateScore: false, // to control if the first loop to updateScore. 20200812
      // mdCumPrev: null, // keep Previous mdCum to compare with the latest mdCum. 20200813
      // octopusLoc: { // Location of Octopus Image
      //   xRW: 2, yRW: 2, // 10=rightWrist // Red
      //   xLW: 9, yLW: 2, // 9=leftwrist // Blue
      //   xRA: 5, yRA: 5, // 16=rightAnkle // Red
      //   xLA: 6, yLA: 5, // 15=leftAnkle // Blue        
      // },
      wval: this.props.navigation.getParam('wval'), 
      wunit: this.props.navigation.getParam('wunit'),
      lastPlayEnded: null, // to control reload Stas.js and Leaderboard.js
      outNTAFlag: false, // to control if user is too close to camera, then show attention 20201025
      // frameOutFlag: false, // to control if user is out of screen. 20201025
      outAccelFlag: false, // to control if device is moving. 20201025
      missingPos: null, // DEBUGGING PURPOSE ONLY. to show which body parts is missing, 20201102 
      outOfIniPos: null, // DEBUGGING PURPOSE ONLY. to show which body parts is out of Initial Position, 20201102 
      iP_f: false, // to control whether display red circle 20201102
      iP_lw: false, // to control whether display red circle 20201102
      iP_rw: false, // to control whether display red circle 20201102
      iP_la: false, // to control whether display red circle 20201102
      iP_ra: false, // to control whether display red circle 20201102
    }
    this.handleImageTensorReady = this.handleImageTensorReady.bind(this);  
    // this._handlePlayAndPause = this._handlePlayAndPause.bind(this);
    this._vidDefault = this._vidDefault.bind(this);
    // this._showPausedVid = this._showPausedVid.bind(this);
    // this._showPlayingVid = this._showPlayingVid.bind(this); 
    this._goBackToHome = this._goBackToHome.bind(this);
    this._saveVidViewLog = this._saveVidViewLog.bind(this);
    this._sendVidViewLog = this._sendVidViewLog.bind(this);
  }

  TESTMODE = 0; // 0 = Production, 1 = TESMODE by nose & shoulder,

  viewId = uuidv4();

  // resize Width & Height, Smaller is faster
  inputTensorWidth = Dimensions.get('window').width * this.props.navigation.getParam('const_exer')['inputTensorRatio']['width'] ; // this.props.navigation.getParam('const_exer')['inputTensor']['width']; //200; // 250; // 200; // 152; //Dimensions.get('window').width / 3; // 152  
  inputTensorHeight = Dimensions.get('window').height * this.props.navigation.getParam('const_exer')['inputTensorRatio']['height'] ; // this.props.navigation.getParam('const_exer')['inputTensor']['height']; //399; // 250; // 299; //200; //Dimensions.get('window').height / 3; // 200


  // DON'T CHANGE OR ADJUST textureDims because Posenet can not scan whole screen. 
  textureDims = Platform.OS === 'ios' ? 
    { // https://github.com/tensorflow/tfjs/blob/master/tfjs-react-native/integration_rn59/components/webcam/realtime_demo.tsx
      width: this.props.navigation.getParam('const_exer')['textureDimsIos']['width'], // 1800, //960, //Dimensions.get('window').width, // 960, // 1024, //768, //512, // 540, //256, // 1080, //videoSize, 
      height: this.props.navigation.getParam('const_exer')['textureDimsIos']['height'] , // 1200, //960, //Dimensions.get('window').height, // 960, // 1024, //768, //512, //960, //453, // 1920, //videoSize,
    }
   : //  For Android
    { // https://github.com/tensorflow/tfjs/blob/master/tfjs-react-native/integration_rn59/components/webcam/realtime_demo.tsx
      width: this.props.navigation.getParam('const_exer')['textureDims']['width'], // 1800, //960, //Dimensions.get('window').width, // 960, // 1024, //768, //512, // 540, //256, // 1080, //videoSize, 
      height: this.props.navigation.getParam('const_exer')['textureDims']['height'], // 1200, //960, //Dimensions.get('window').height, // 960, // 1024, //768, //512, //960, //453, // 1920, //videoSize,
    }; 

  // textureDims = { // https://github.com/tensorflow/tfjs/blob/master/tfjs-react-native/integration_rn59/components/webcam/realtime_demo.tsx
  //   width: this.props.navigation.getParam('const_exer')['textureDims']['width'], // 1800, //960, //Dimensions.get('window').width, // 960, // 1024, //768, //512, // 540, //256, // 1080, //videoSize, 
  //   height: this.props.navigation.getParam('const_exer')['textureDims']['height'], // 1200, //960, //Dimensions.get('window').height, // 960, // 1024, //768, //512, //960, //453, // 1920, //videoSize,
  // };

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

  // vidMeta = this.props.navigation.getParam('post')
  // wpart = this.props.navigation.getParam('wpart');
  // mets_per_part = this.props.navigation.getParam('mets_per_part');
  scaler_scale = this.props.navigation.getParam('scaler_scale');
  scaler_mean = this.props.navigation.getParam('scaler_mean');
  model = this.props.navigation.getParam('model');
  model2 = this.props.navigation.getParam('model2');
  
  // // when Landscape
  initialPositions = {
    x0Min: this.inputTensorWidth * 2/5, // nose
    x0Max: this.inputTensorWidth * 3/5, // nose
    y0Min: this.inputTensorHeight * 0/4, // nose
    y0Max: this.inputTensorHeight * 2/4, // nose
    x9Min: this.inputTensorWidth * 0/5, // leftWrist
    x9Max: this.inputTensorWidth * 2/5, // leftWrist
    y9Min: this.inputTensorHeight * 1/4, // leftWrist
    y9Max: this.inputTensorHeight * 3/4, // leftWrist
    x10Min: this.inputTensorWidth * 3/5, // rightWrist
    x10Max: this.inputTensorWidth * 5/5, // rightWrist   
    y10Min: this.inputTensorHeight * 1/4, // rightWrist
    y10Max: this.inputTensorHeight * 3/4, // rightWrist 
    xBothAnkleMin: this.inputTensorWidth * 1/5, 
    xBothAnkleMax: this.inputTensorWidth * 4/5,                           
    yBothAnkleMin: this.inputTensorHeight * 3/4, 
    yBothAnkleMax: this.inputTensorHeight * 4/4,       
    NoseToAnkleMin: this.inputTensorHeight * 1.5/4, // y distance between nose to ankle should be more than this  
    RightToLeftMin: this.inputTensorWidth * 1/5, // x distance between right to left wrist should be more than this.    
  };

  // // when Portrait 20201004
  // initialPositions = {
  //   x9Min: this.inputTensorWidth * 3/4, // 3/4 // leftWrist
  //   x9Max: this.inputTensorWidth * 4/4, // leftWrist
  //   y9Min: this.inputTensorHeight * 1/5, // leftWrist
  //   y9Max: this.inputTensorHeight * 3/5, // leftWrist
  //   x10Min: this.inputTensorWidth * 0/4, // rightWrist
  //   x10Max: this.inputTensorWidth * 1/4, // rightWrist   
  //   y10Min: this.inputTensorHeight * 1/5, // rightWrist
  //   y10Max: this.inputTensorHeight * 3/5, // rightWrist 
  //   xBothAnkleMin: this.inputTensorWidth * 1/4, 
  //   xBothAnkleMax: this.inputTensorWidth * 3/4,                           
  //   yBothAnkleMin: this.inputTensorHeight * 3/5, 
  //   yBothAnkleMax: this.inputTensorHeight * 5/5,       
  //   NoseToAnkleMin: this.inputTensorHeight * 1.5/5, // y distance between nose to ankle should be more than this  
  //   // RightToLeftMin: this.inputTensorWidth * 2/4, // x distance between right to left wrist should be more than this.    
  // };


  pos = { // coordinate at the loop
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

  mdCum = { // ACCUMULATE moved distance 
    x0 : 0, // 
    x1 : 0, //
    x2 : 0, // 
    x3 : 0, // 
    x4 : 0, //          
    x5 : 0, // 
    x6 : 0, // 
    x7 : 0, // 
    x8 : 0, //        
    x9 : 0, // 
    x10 : 0, //
    x11 : 0, // 
    x12 : 0, //   
    x13 : 0, //
    x14 : 0, // 
    x15 : 0, //   
    x16 : 0, //  
    y0 : 0, // 
    y1 : 0, // 
    y2 : 0, // 
    y3 : 0, // 
    y4 : 0, //          
    y5 : 0, // 
    y6 : 0, // 
    y7 : 0, // 
    y8 : 0, //        
    y9 : 0, // 
    y10 : 0, // 
    y11 : 0, // 
    y12 : 0, //
    y13 : 0, // 
    y14 : 0, // 
    y15 : 0, //
    y16 : 0, //   
  }

  mdCumA = { // accumulate moving distance for previous loop for mdCumA vs mdCumB 20200814
    x0 : 0, // 
    x1 : 0, //
    x2 : 0, // 
    x3 : 0, // 
    x4 : 0, //          
    x5 : 0, // 
    x6 : 0, // 
    x7 : 0, // 
    x8 : 0, //        
    x9 : 0, // 
    x10 : 0, //
    x11 : 0, // 
    x12 : 0, //   
    x13 : 0, //
    x14 : 0, // 
    x15 : 0, //   
    x16 : 0, //  
    y0 : 0, // 
    y1 : 0, // 
    y2 : 0, // 
    y3 : 0, // 
    y4 : 0, //          
    y5 : 0, // 
    y6 : 0, // 
    y7 : 0, // 
    y8 : 0, //        
    y9 : 0, // 
    y10 : 0, // 
    y11 : 0, // 
    y12 : 0, //
    y13 : 0, // 
    y14 : 0, // 
    y15 : 0, //
    y16 : 0, //    
  }

  mdCumB = { // accumulate moving distance for previous loop for mdCumA vs mdCumB 20200814
    x0 : 0, // 
    x1 : 0, //
    x2 : 0, // 
    x3 : 0, // 
    x4 : 0, //          
    x5 : 0, // 
    x6 : 0, // 
    x7 : 0, // 
    x8 : 0, //        
    x9 : 0, // 
    x10 : 0, //
    x11 : 0, // 
    x12 : 0, //   
    x13 : 0, //
    x14 : 0, // 
    x15 : 0, //   
    x16 : 0, //  
    y0 : 0, // 
    y1 : 0, // 
    y2 : 0, // 
    y3 : 0, // 
    y4 : 0, //          
    y5 : 0, // 
    y6 : 0, // 
    y7 : 0, // 
    y8 : 0, //        
    y9 : 0, // 
    y10 : 0, // 
    y11 : 0, // 
    y12 : 0, //
    y13 : 0, // 
    y14 : 0, // 
    y15 : 0, //
    y16 : 0, //   
  };

  flagHighLow ={
    lank: 0,
    rank: 0,
    lkne: 0,
    rkne: 0,
  }; // to control if position is smaller than support position. 20201002

  // mdCumNowArray = {} // to assign array of mdCum
  mdCumAll = [] // to append ALL of mdCum from start to end for vidViewLog
  posAll = [] // to append ALL of this.pos from start to end 
  scorePrev = 0; // for compare with mdCumTtl 20200810 
  cntLoopUpdateScore = 0; //to control if the first loop to updateScore. 20200812
  flag_mdCum = 1; // flag to switch 20200814

  // attentionTxt = 'Fit your body'; //'Move yourself inside orange below'; 

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
    x: 0,
    y: 0,
    z: 0,    
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


  missingPos = []; // DEBUGGING PURPOSE ONLY. to show which body parts is missing, 20201102 
  outOfIniPos = []; // DEBUGGING PURPOSE ONLY. to show which body parts is out of Initial Position, 20201102 
  updateMissingPosTiming = 0; // to control update timing for updateMissingPosTiming 20201102
  flagIp = {
    f: false,
    lw: false,
    rw: false,
    la: false,
    ra: false,
  } // to control whether display red circle on initialPosture 20201102



  _subscribeToAccelerometer = () => {
    console.log('_subscribeToAccelerometer --------- ');
    this._subscription = Accelerometer.addListener( accelerometerData => 
      // setData(accelerometerData);
      // console.log('accelerometerData subscribe: ', accelerometerData);
      this.setState({ accelerometerData })
    );
    Accelerometer.setUpdateInterval(1 * 1000); // update every X miliseconds
  };


  _unsubscribeFromAccelerometer = () => {
    console.log('_unsubscribeFromAccelerometer');
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };


  _goBackToHome = async () => {
    console.log('------------------------------------------------------ Go back to Home');
    const ts = Date.now() / 1000;
    // this.setState({ shouldPlay : false, flagUpdateScore: true }); // added 20200523
    this.setState({ shouldPlay : false, flagUpdateScore: false, lastPlayEnded: ts  });
    // this.setState({ shouldPlay : false});
    // clearInterval(_updateScore); // did NOT work 20200603
    // clearInterval(videoCountDown); // did NOT work 20200603
    ScreenOrientation.unlockAsync(); // back to portrait
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT); // back to portrait
    
    this.props.navigation.goBack();
    // this.props.navigation.navigate('DashboardScreen', { lastPlayEnded });

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
    
      const flipHorizontal = Platform.OS === 'ios' ? false : true; // false : true;
      // const flipHorizontal = true; // false : true;
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
    console.log('------------------- componentWillUnmount Live started');

    this.setState({ shouldPlay: false });

    if(this.rafId) {  // this is for Tensorflow
      cancelAnimationFrame(this.rafId);
    }

    this.vidState.vidEndAt = Date.now()/1000;

    await this._unsubscribeFromAccelerometer();

    deactivateKeepAwake();

    ScreenOrientation.unlockAsync(); // back to portrait
    // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT); // back to portrait

    await this._saveVidViewLog();

    console.log('------------------- componentWillUnmount Live completed');
  }



  async componentDidMount() {
    console.log('------------------- componentDidMount Live started 114');
    // console.log('this.props.navigation.getParam: ', this.props.navigation.getParam('wval') );
    // console.log('------ this.mets_per_part: ', this.mets_per_part);
    // console.log('------ this.camState: ', this.camState);
    // console.log( 'slow1[secFromStart]: ', typeof slow1 );
    // console.log( 'slow1[secFromStart]: ', slow1["1"] );
    // console.log('this.scaler_scale: ', this.scaler_scale );
    // console.log('this.scaler_mean: ', this.scaler_mean );
    // console.log('this.model: ', this.model );
    console.log('screen width, height: ', Dimensions.get('screen').width, Dimensions.get('screen').height);
    console.log('window width, height: ', Dimensions.get('window').width, Dimensions.get('window').height);
    console.log('inputTensorWidth, inputTensorHeight: ', this.inputTensorWidth, this.inputTensorHeight );
    console.log('textureDims.width .height: ', this.textureDims.width, this.textureDims.height );    
    // console.log('LB_PER_KG: ', LB_PER_KG);
    // console.log('this.state.vidViewLogTemp: ', this.state.vidViewLogTemp);
    // console.log('this.props.navigation.getParam(model2): ', this.props.navigation.getParam('model2') );



    if (this.state.wunit == 'kg') {
      this.WEIGHT_KG = this.state.wval;
    } else { // wunit = 'lb'
      this.WEIGHT_KG = this.state.wval / LB_PER_KG;
    }
    console.log('this.WEIGHT_KG: ', this.WEIGHT_KG);
  
    
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE); // to landscape
    // console.log( 'ScreenOrientation.ScreenOrientationInfo: ', ScreenOrientation.ScreenOrientationInfo(orientation) );
    // console.log( 'ScreenOrientation.PlatformOrientationInfo: ', ScreenOrientation.PlatformOrientationInfo(screenOrientationArrayIOS) );
    

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
      // if (this.state.vidFullUrl === '') { //. this if to prevent repeated loop. 
      //   const storage = firebase.storage(); // Create a storage reference from our storage service
      //   const storageRef = storage.ref(); // Create a reference to the file we want to download
      //   const starsRef = storageRef.child( 'finvid/' + this.props.navigation.getParam('post')['VIDID']  );      
      //   await starsRef.getDownloadURL().then( (url) => {
      //     this.setState({vidFullUrl : url }); // assign to this.state
      //     console.log('this.state.vidFullUrl: ', this.state.vidFullUrl);
      //   }).catch(function(error) {
      //     alert(error);
      //     // A full list of error codes is available at
      //     // https://firebase.google.com/docs/storage/web/handle-errors
      //     switch (error.code) {
      //       case 'storage/object-not-found': // File doesn't exist
      //         break;
      //       case 'storage/unauthorized': // User doesn't have permission to access the object
      //         break;
      //       case 'storage/canceled': // User canceled the upload
      //         break;
      //       case 'storage/unknown': // Unknown error occurred, inspect the server response
      //         break;
      //     }
      //   })        
      // }


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
    console.log('------------------- componentDidMount Live completed');

  } // closing componentDidMount


  async _vidDefault () {
    console.log('=============== _vidDefault ===============');
    // await this.webviewRef.injectJavaScript(`
    // document.getElementsByTagName("video")[0].pause();
    // document.getElementsByTagName("video")[0].setAttribute("preload", "auto"); 
    // document.getElementsByTagName("video")[0].setAttribute("muted", "true"); 
    // document.getElementsByTagName("video")[0].removeAttribute('controls'); // hide control panels
    // document.getElementsByTagName("video")[0].style.objectFit = 'fill'; // fill to widnow screen 
    // document.getElementsByTagName("video")[0].style.height = '100%';
    // document.getElementsByTagName("video")[0].style.width = '100%'; 
    // // document.body.style.border = '5px solid red';
    // // document.getElementsByTagName("video")[0].onended = (event) => {
    // //   window.alert('1）動画が終了した、または 2）それ以上データがない' + 'ため、動画が停止しました。');
    // // };
    // `);
    console.log('_vidDefault this.state.shouldPlay: ', this.state.shouldPlay);
  }      


//   _handlePlayAndPause = async () =>  {
//     console.log('=============== _handlePlayAndPause ===============');
//     const _playVideo = () => {
//       this.videoState.cntPressPlayButton += 1; // increment to count 
//       this.setState({ shouldPlay: true });
//     }
//     const _pauseVideo = () => {
//       this.videoState.cntPressPauseButton += 1; // increment to count
//       this.setState({ shouldPlay: false });
//     }

//     if (this.state.shouldPlay == false) { // Go into this block when video is NOT playing
//       console.log('=========================== play ================================');
//       this.vidState.loopStartAt = Date.now()/1000;
//       // this.setState({ loopStartAt : Date.now()/1000 });
//       await _playVideo(); 
//       await this.webviewRef.injectJavaScript(`
//         document.getElementsByTagName("video")[0].play();
//         document.getElementsByTagName("video")[0].setAttribute("muted", "false"); 
//       `)
//     } else { // when video is playing
//       console.log('=========================== pause ================================');
//       this.vidState.vidPlayedSum = this.vidState.vidPlayedSum + (Date.now()/1000 - this.vidState.loopStartAt); // add increment time
//       await _pauseVideo();
//       await this.webviewRef.injectJavaScript(`
//         document.getElementsByTagName("video")[0].pause();
//       `)
//     }
//   }


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
                // playPct: JSON.parse(localFileContents)["playPct"],
                // cntOutAccel: JSON.parse(localFileContents)["cntOutAccel"],
                // cntPressPlayButton: JSON.parse(localFileContents)["cntPressPlayButton"],
                // cntPressPauseButton: JSON.parse(localFileContents)["cntPressPauseButton"],
                // cntFrameOut: JSON.parse(localFileContents)["frameOutCntCum"], // this is a Dictionary, count how many times out from Frame
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
                // console.log('----- _sendSingleVidViewLog response:', response );
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
    console.log('----------- _saveVidViewLog Live.js start' );

    const ts = Date.now() / 1000; // unix //date.getTime().toString();
    // console.log('ts: ', ts);
    const vidId = this.props.navigation.getParam('post')['ID'];
    const viewId = uuidv4();
    const vidViewLogFileName = ts + '_' + '_' + this.state.scoreNow + '_' + this.vidState.vidPlayedSum + '_' + viewId;
    // const vidViewLogFileName = ts + '_' + viewId;

    var jsonContents = {};
    jsonContents["ts"] = ts;
    jsonContents["vidId"] = vidId;
    jsonContents["viewId"] = viewId;
    jsonContents["uid"] = firebase.auth().currentUser.uid;
    jsonContents["startAt"] = this.vidState.vidStartAt;
    jsonContents["endAt"] = this.vidState.vidEndAt;
    jsonContents["nTa"] = this.state.noseToAnkle;
    jsonContents["pt"] = this.state.mdCumTtlNow; // METS
    jsonContents["score"] = this.state.scoreNow; // Calorie
    jsonContents["mdCumAll"] = this.mdCumAll; // this is an Array

    jsonContents["playSum"] = this.vidState.vidPlayedSum; // 
    
    // jsonContents["playPct"] = ( this.vidState.vidPlayedSum + 0.00001 ) / this.state.vidLength;
    // jsonContents['cntOutAccel'] = this.cntOutAccel;
    // jsonContents['cntPressPlayButton'] = this.vidState.cntPressPlayButton;
    // jsonContents['cntPressPauseButton'] = this.vidState.cntPressPauseButton;
    // jsonContents['frameOutCntCum'] = this.frameOutCntCum; // this is a Dictionary
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

    // jsonContents['outNTAcnt'] = this.outNTA.cnt;
    // jsonContents['numFrameVidStart'] = this.vidState.numFrameVidStart;
    // jsonContents['numFrameAllPosOk'] = this.vidState.numFrameAllPosOk;
    // jsonContents['numFrameVidEnd'] = this.vidState.numFrameVidEnd; 

    jsonContents['wval'] = this.state.wval;
    jsonContents['wunit'] = this.state.wunit;    

    jsonContents = JSON.stringify(jsonContents); // convert to string for saving file
    console.log('jsonContents: ', jsonContents);
    // console.log('jsonContents keys: ', Object.keys(jsonContents));
    // console.log('jsonContents keys: ');
    // for (var key in jsonContents) {
    //   if (jsonContents.hasOwnProperty(key)) {
    //       console.log(key);
    //   }
    // }

    
    // vidViewLogTemp for Firestore
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + this.state.vidViewLogTemp + '/' + vidViewLogFileName + '.json', 
      jsonContents,
      ).then( () => {
        console.log('----------- vidViewLogTemp saved: ');
        // this.setState({ savedFileName: vidViewLogFileName });
        
        this._sendVidViewLog( vidViewLogFileName );

      }).catch(error => {
        console.log('vidViewLogTemp error: ', error);
        // deactivateKeepAwake();
      });


    // vidViewLog for LOCALLY save. 20200917
    // var jsonContentsSimp = {};
    // jsonContentsSimp["ts"] = ts;
    // jsonContentsSimp["vidId"] = vidId;
    // jsonContentsSimp["viewId"] = viewId;
    // jsonContentsSimp["uid"] = firebase.auth().currentUser.uid;
    // jsonContentsSimp["startAt"] = this.vidState.vidStartAt;
    // jsonContentsSimp["endAt"] = this.vidState.vidEndAt;
    // jsonContentsSimp["nTa"] = this.state.noseToAnkle;
    // jsonContentsSimp["pt"] = this.state.mdCumTtlNow;
    // jsonContentsSimp["score"] = this.state.scoreNow; 
    // jsonContentsSimp["playSum"] = this.vidState.vidPlayedSum; 
    // jsonContentsSimp['wval'] = this.state.wval;
    // jsonContentsSimp['wunit'] = this.state.wunit; 

    // jsonContentsSimp = JSON.stringify(jsonContentsSimp); // convert to string for saving file

    // await FileSystem.writeAsStringAsync(
    //   FileSystem.documentDirectory + this.state.vidViewLog + '/' + vidViewLogFileName + '.json', 
    //   jsonContentsSimp,
    // ).then( () => {
    //   console.log('----------- vidViewLog saved: ');
    // }).catch(error => {
    //   console.log('vidViewLog error: ', error);
    // });   



    // //// Create & Insert into SQLite vidViewLog. 20201015
    // const dbSQLite = SQLite.openDatabase( 'db_' + firebase.auth().currentUser.uid); // initiate SQLite 20201013

    // // create table 'vidViewLog' if not exist
    // dbSQLite.transaction(tx => {
    //     tx.executeSql(
    //     'create table if not exists vidViewLog (id integer primary key not null, ts real, vidId blob, viewId blob, startAt real, endAt real, score real, playSum real, wval blob, wunit text);', // uid blob, nTa real, pt blob,  実行したいSQL文
    //     null, // SQL文の引数
    //     () => {console.log('success in creating sqllite0')}, // 成功時のコールバック関数
    //     () => {console.log('fail in creating sqllite0')} // 失敗時のコールバック関数
    //     );
    // },
    //   () => {console.log('fail in creating sqllite1')}, // 失敗時のコールバック関数
    //   () => {console.log('success in creating sqllite1')} // 成功時のコールバック関数
    // );    

    // // Insert into SQLite vidViewLog.
    // dbSQLite.transaction(tx => {
    //   tx.executeSql(
    //     `insert into vidViewLog (ts, vidId, viewId, startAt, endAt, score, playSum, wval, wunit) values (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    //     [ts, vidId, viewId, this.vidState.vidStartAt, this.vidState.vidEndAt, this.state.scoreNow, this.vidState.vidPlayedSum, this.state.wval, this.state.wunit]
    //   );
    // },
    //   () => {console.log('fail in inserting sqllite')},
    //   () => {console.log('success in inserting sqllite')},
    // );


  }




  renderPose() {
    console.log('-------- renderPose.: ', this.vidState.renderPoseTimes);
    const time0 = Date.now() / 1000; 

    const {pose, vidLength, flagAllPosOk, noseToAnkle, flagNoseToAnkle, rightToLeft, flagRightToLeft ,vidFullUrl, shouldPlay, flagUpdateScore, outNTAFlag, accelerometerData, missingPos, outOfIniPos } = this.state;
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

        this.setState({ flagCountdownFinished: true, shouldPlay: true, flagUpdateScore: true});
        // this.webviewRef.injectJavaScript(`
        //     document.getElementsByTagName("video")[0].play();
        // `)

        this.vidState.numFrameVidStart = this.vidState.renderPoseTimes; // for record to Firestore vidViewLog. 20200524
           
        //// check if Accelerometer is available or not. 20200520
        Accelerometer.isAvailableAsync().then( () => { 
          console.log('----------- AccelerometerIsAvailable');
          this.setState({ flagAccelerometerIsAvailable: true }); 
          this._subscribeToAccelerometer(); // run Accelerometer
        }).catch(error => {
          console.log('Accelerometer is NOT Available: ', error);
        });

      }



////////// update score ////////////////////
      if (shouldPlay === true & flagUpdateScore === true) { 
      // if (this.state.shouldPlay === true & this.state.flagUpdateScore === true) { 
        console.log('--- this.state.shouldPlay === true & this.state.flagUpdateScore === true');
        
        // console.log('time0a: ', Date.now() / 1000 - time0); 
 


        var _updateScore = setInterval( () => {

          var secFromStart = parseInt( Date.now() / 1000 - this.vidState.vidStartAt);
          console.log('================================== cntLoop: ', this.cntLoopUpdateScore, ' | sec: ', secFromStart, this.vidState.vidPlayedSum.toFixed(3) );
          // console.log('--- this.pos: ', this.pos);

          var NTAForScore = noseToAnkle * this.coefNTA; // 20200614
          console.log('--- NTAForScore: ', NTAForScore);


          if ( this.cntLoopUpdateScore === 0 ) { // Only for the 1st loop, assign as dummy to avoid 'mdCumTtlNow' mis-calculation. 20200811
            console.log('------ for the 1st cntLoopUpdateScore.'); 

            // this.mdCumNow = this.mdCum; // This is measure to avoid this,mdCumPrev duplicate issue. 20200814
            var mdCumTtlNow = 0; // initial assign
            // var mdCumTtlBeforeModel2 = 0; // validation purpose nly 20201025
            this.scorePrev = 0; // initial assign
            var scoreNow = 0.0;  // initial assign
            console.log('--- this.scorePrev: ', this.scorePrev.toFixed(3));
            console.log('--- scoreNow: ', scoreNow.toFixed(3));
            
            // this.mdCumA = this.mdCum; // update mdCumA
            this.mdCumA.x5 = this.mdCum.x5.toFixed(3); // update mdCum
            this.mdCumA.x6 = this.mdCum.x6.toFixed(3); // update mdCum
            this.mdCumA.x7 = this.mdCum.x7.toFixed(3); // update mdCum
            this.mdCumA.x8 = this.mdCum.x8.toFixed(3); // update mdCum
            this.mdCumA.x9 = this.mdCum.x9.toFixed(3); // update mdCum
            this.mdCumA.x10 = this.mdCum.x10.toFixed(3); // update mdCum
            this.mdCumA.x11 = this.mdCum.x11.toFixed(3); // update mdCum
            this.mdCumA.x12 = this.mdCum.x12.toFixed(3); // update mdCum
            this.mdCumA.x13 = this.mdCum.x13.toFixed(3); // update mdCum
            this.mdCumA.x14 = this.mdCum.x14.toFixed(3); // update mdCum
            this.mdCumA.x15 = this.mdCum.x15.toFixed(3); // update mdCum
            this.mdCumA.y5 = this.mdCum.y5.toFixed(3); // update mdCum
            this.mdCumA.y6 = this.mdCum.y6.toFixed(3); // update mdCum
            this.mdCumA.y7 = this.mdCum.y7.toFixed(3); // update mdCum
            this.mdCumA.y8 = this.mdCum.y8.toFixed(3); // update mdCum
            this.mdCumA.y9 = this.mdCum.y9.toFixed(3); // update mdCum
            this.mdCumA.y10 = this.mdCum.y10.toFixed(3); // update mdCum
            this.mdCumA.y11 = this.mdCum.y11.toFixed(3); // update mdCum
            this.mdCumA.y12 = this.mdCum.y12.toFixed(3); // update mdCum
            this.mdCumA.y13 = this.mdCum.y13.toFixed(3); // update mdCum
            this.mdCumA.y14 = this.mdCum.y14.toFixed(3); // update mdCum
            this.mdCumA.y15 = this.mdCum.x15.toFixed(3); // update mdCum           
          
            // console.log('0 this.mdCum.x10, y13, y15: ', this.mdCum.x10, this.mdCum.y13, this.mdCum.y15 );
            // console.log('0 this.mdCumA.x10, y13, y15: ', this.mdCumA.x10, this.mdCumA.y13, this.mdCumA.y15 );
            // console.log('0 this.mdCumB.x10, y13, y15: ', this.mdCumB.x10, this.mdCumB.y13, this.mdCumB.y15 );

            this.cntLoopUpdateScore++; // increment

          } else {
            // console.log('-- this.cntLoopUpdateScore: ', this.cntLoopUpdateScore);

            if (this.flag_mdCum == 1) {
              console.log('--- this.flag_mdCum == 1, Update mdCumB');
              // console.log('this.mdCum: ', this.mdCum);
              // console.log('this.mdCumA: ', this.mdCumA);
              // console.log('this.mdCumB: ', this.mdCumB);
              // this.mdCumB = this.mdCum; //update mdCumB
              this.mdCumB.x5 = this.mdCum.x5.toFixed(3); // update mdCum
              this.mdCumB.x6 = this.mdCum.x6.toFixed(3); // update mdCum
              this.mdCumB.x7 = this.mdCum.x7.toFixed(3); // update mdCum
              this.mdCumB.x8 = this.mdCum.x8.toFixed(3); // update mdCum
              this.mdCumB.x9 = this.mdCum.x9.toFixed(3); // update mdCum
              this.mdCumB.x10 = this.mdCum.x10.toFixed(3); // update mdCum
              this.mdCumB.x11 = this.mdCum.x11.toFixed(3); // update mdCum
              this.mdCumB.x12 = this.mdCum.x12.toFixed(3); // update mdCum
              this.mdCumB.x13 = this.mdCum.x13.toFixed(3); // update mdCum
              this.mdCumB.x14 = this.mdCum.x14.toFixed(3); // update mdCum
              this.mdCumB.x15 = this.mdCum.x15.toFixed(3); // update mdCum
              this.mdCumB.y5 = this.mdCum.y5.toFixed(3); // update mdCum
              this.mdCumB.y6 = this.mdCum.y6.toFixed(3); // update mdCum
              this.mdCumB.y7 = this.mdCum.y7.toFixed(3); // update mdCum
              this.mdCumB.y8 = this.mdCum.y8.toFixed(3); // update mdCum
              this.mdCumB.y9 = this.mdCum.y9.toFixed(3); // update mdCum
              this.mdCumB.y10 = this.mdCum.y10.toFixed(3); // update mdCum
              this.mdCumB.y11 = this.mdCum.y11.toFixed(3); // update mdCum
              this.mdCumB.y12 = this.mdCum.y12.toFixed(3); // update mdCum
              this.mdCumB.y13 = this.mdCum.y13.toFixed(3); // update mdCum
              this.mdCumB.y14 = this.mdCum.y14.toFixed(3); // update mdCum
              this.mdCumB.y15 = this.mdCum.y15.toFixed(3); // update mdCum     
              // console.log('--- this.mdCumB: ', this.mdCumB);  


              // // flag if position is smaller than support. 20201002
              // if ( this.mdCumB.y13 < this.mdCumB.y11 ) { // leftKnee < leftHip
              //   this.flagHighLow.lkne = 1;
              // } else {
              //   this.flagHighLow.lkne = 0;
              // }
              // if ( this.mdCumB.y14 < this.mdCumB.y12 ) { // rightKnee < rightHip
              //   this.flagHighLow.rkne = 1;
              // } else {
              //   this.flagHighLow.rkne = 0;
              // }
              // if ( this.mdCumB.y15 < this.mdCumB.y13 ) { // leftAnkle < leftKnee
              //   this.flagHighLow.lank = 1;
              // } else {
              //   this.flagHighLow.lank = 0;
              // }
              // if ( this.mdCumB.y16 < this.mdCumB.y14 ) { // righttAnkle < righttKnee
              //   this.flagHighLow.rank = 1;
              // } else {
              //   this.flagHighLow.rank = 0;
              // }              
              
              mdCumTtlNow = 
                ( ( ( ( (this.mdCumB.y10 - this.mdCumA.y10) + (this.mdCumB.y12 - this.mdCumA.y12) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_hip ) / this.scaler_scale.y_hip * this.model.y_hip ) + 

                ( ( ( ( Math.abs( (this.mdCumB.x5 - this.mdCumB.x11) - (this.mdCumA.x5 - this.mdCumA.x11) ) + Math.abs( (this.mdCumB.x6 - this.mdCumB.x12) - (this.mdCumA.x6 - this.mdCumA.x12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_sho ) / this.scaler_scale.x_sho * this.model.x_sho ) + 
                ( ( ( ( Math.abs( (this.mdCumB.x7 - this.mdCumB.x5) - (this.mdCumA.x7 - this.mdCumA.x5) ) + Math.abs( (this.mdCumB.x8 - this.mdCumB.x6) - (this.mdCumA.x8 - this.mdCumA.x6) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_elb ) / this.scaler_scale.x_elb * this.model.x_elb ) + 
                ( ( ( ( Math.abs( (this.mdCumB.x9 - this.mdCumB.x7) - (this.mdCumA.x9 - this.mdCumA.x7) ) + Math.abs( (this.mdCumB.x10 - this.mdCumB.x8) - (this.mdCumA.x10 - this.mdCumA.x8) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_wri ) / this.scaler_scale.x_wri * this.model.x_wri ) +
                ( ( ( ( Math.abs( (this.mdCumB.x13 - this.mdCumB.x11) - (this.mdCumA.x13 - this.mdCumA.x11) ) + Math.abs( (this.mdCumB.x14 - this.mdCumB.x12) - (this.mdCumA.x14 - this.mdCumA.x12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_kne ) / this.scaler_scale.x_kne * this.model.x_kne ) +
                ( ( ( ( Math.abs( (this.mdCumB.x15 - this.mdCumB.x13) - (this.mdCumA.x15 - this.mdCumA.x13) ) + Math.abs( (this.mdCumB.x16 - this.mdCumB.x14) - (this.mdCumA.x16 - this.mdCumA.x14) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_ank ) / this.scaler_scale.x_ank * this.model.x_ank ) +

                ( ( ( ( Math.abs( (this.mdCumB.y5 - this.mdCumB.y11) - (this.mdCumA.y5 - this.mdCumA.y11) ) + Math.abs( (this.mdCumB.y6 - this.mdCumB.y12) - (this.mdCumA.y6 - this.mdCumA.y12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_sho ) / this.scaler_scale.y_sho * this.model.y_sho ) + 
                ( ( ( ( Math.abs( (this.mdCumB.y7 - this.mdCumB.y5) - (this.mdCumA.y7 - this.mdCumA.y5) ) + Math.abs( (this.mdCumB.y8 - this.mdCumB.y6) - (this.mdCumA.y8 - this.mdCumA.y6) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_elb ) / this.scaler_scale.y_elb * this.model.y_elb ) + 
                ( ( ( ( Math.abs( (this.mdCumB.y9 - this.mdCumB.y7) - (this.mdCumA.y9 - this.mdCumA.y7) ) + Math.abs( (this.mdCumB.y10 - this.mdCumB.y8) - (this.mdCumA.y10 - this.mdCumA.y8) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_wri ) / this.scaler_scale.y_wri * this.model.y_wri ) +
                ( ( ( ( Math.abs( (this.mdCumB.y13 - this.mdCumB.y11) - (this.mdCumA.y13 - this.mdCumA.y11) ) + Math.abs( (this.mdCumB.y14 - this.mdCumB.y12) - (this.mdCumA.y14 - this.mdCumA.y12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_kne ) / this.scaler_scale.y_kne * this.model.y_kne ) +
                ( ( ( ( Math.abs( (this.mdCumB.y15 - this.mdCumB.y13) - (this.mdCumA.y15 - this.mdCumA.y13) ) + Math.abs( (this.mdCumB.y16 - this.mdCumB.y14) - (this.mdCumA.y16 - this.mdCumA.y14) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_ank ) / this.scaler_scale.y_ank * this.model.y_ank ) +

                this.model.intercept;


              this.flag_mdCum = 0; // switch flag

            } else { // if this.flag_mdCum = 0
              console.log('--- this.flag_mdCum == 0, Update mdCumA');
              // console.log('this.mdCum: ', this.mdCum);
              // console.log('this.mdCumA: ', this.mdCumA);
              // console.log('this.mdCumB: ', this.mdCumB);
              // this.mdCumA = this.mdCum; // update mdCumA
              this.mdCumA.x5 = this.mdCum.x5.toFixed(3); // update mdCum
              this.mdCumA.x6 = this.mdCum.x6.toFixed(3); // update mdCum
              this.mdCumA.x7 = this.mdCum.x7.toFixed(3); // update mdCum
              this.mdCumA.x8 = this.mdCum.x8.toFixed(3); // update mdCum
              this.mdCumA.x9 = this.mdCum.x9.toFixed(3); // update mdCum
              this.mdCumA.x10 = this.mdCum.x10.toFixed(3); // update mdCum
              this.mdCumA.x11 = this.mdCum.x11.toFixed(3); // update mdCum
              this.mdCumA.x12 = this.mdCum.x12.toFixed(3); // update mdCum
              this.mdCumA.x13 = this.mdCum.x13.toFixed(3); // update mdCum
              this.mdCumA.x14 = this.mdCum.x14.toFixed(3); // update mdCum
              this.mdCumA.x15 = this.mdCum.x15.toFixed(3); // update mdCum
              this.mdCumA.y5 = this.mdCum.y5.toFixed(3); // update mdCum
              this.mdCumA.y6 = this.mdCum.y6.toFixed(3); // update mdCum
              this.mdCumA.y7 = this.mdCum.y7.toFixed(3); // update mdCum
              this.mdCumA.y8 = this.mdCum.y8.toFixed(3); // update mdCum
              this.mdCumA.y9 = this.mdCum.y9.toFixed(3) // update mdCum
              this.mdCumA.y10 = this.mdCum.y10.toFixed(3); // update mdCum
              this.mdCumA.y11 = this.mdCum.y11.toFixed(3); // update mdCum
              this.mdCumA.y12 = this.mdCum.y12.toFixed(3); // update mdCum
              this.mdCumA.y13 = this.mdCum.y13.toFixed(3); // update mdCum
              this.mdCumA.y14 = this.mdCum.y14.toFixed(3); // update mdCum
              this.mdCumA.y15 = this.mdCum.y15.toFixed(3); // update mdCum    
              // console.log('--- this.mdCumA: ', this.mdCumA);  

              mdCumTtlNow = 
                ( ( ( ( (this.mdCumA.y10 - this.mdCumB.y10) + (this.mdCumA.y12 - this.mdCumB.y12) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_hip ) / this.scaler_scale.y_hip * this.model.y_hip ) + 

                ( ( ( ( Math.abs( (this.mdCumA.x5 - this.mdCumA.x11) - (this.mdCumB.x5 - this.mdCumB.x11) ) + Math.abs( (this.mdCumA.x6 - this.mdCumA.x12) - (this.mdCumB.x6 - this.mdCumB.x12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_sho ) / this.scaler_scale.x_sho * this.model.x_sho ) + 
                ( ( ( ( Math.abs( (this.mdCumA.x7 - this.mdCumA.x5) - (this.mdCumB.x7 - this.mdCumB.x5) ) + Math.abs( (this.mdCumA.x8 - this.mdCumA.x6) - (this.mdCumB.x8 - this.mdCumB.x6) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_elb ) / this.scaler_scale.x_elb * this.model.x_elb ) + 
                ( ( ( ( Math.abs( (this.mdCumA.x9 - this.mdCumA.x7) - (this.mdCumB.x9 - this.mdCumB.x7) ) + Math.abs( (this.mdCumA.x10 - this.mdCumA.x8) - (this.mdCumB.x10 - this.mdCumB.x8) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_wri ) / this.scaler_scale.x_wri * this.model.x_wri ) +
                ( ( ( ( Math.abs( (this.mdCumA.x13 - this.mdCumA.x11) - (this.mdCumB.x13 - this.mdCumB.x11) ) + Math.abs( (this.mdCumA.x14 - this.mdCumA.x12) - (this.mdCumB.x14 - this.mdCumB.x12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_kne ) / this.scaler_scale.x_kne * this.model.x_kne ) +
                ( ( ( ( Math.abs( (this.mdCumA.x15 - this.mdCumA.x13) - (this.mdCumB.x15 - this.mdCumB.x13) ) + Math.abs( (this.mdCumA.x16 - this.mdCumA.x14) - (this.mdCumB.x16 - this.mdCumB.x14) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.x_ank ) / this.scaler_scale.x_ank * this.model.x_ank ) +

                ( ( ( ( Math.abs( (this.mdCumA.y5 - this.mdCumA.y11) - (this.mdCumB.y5 - this.mdCumB.y11) ) + Math.abs( (this.mdCumA.y6 - this.mdCumA.y12) - (this.mdCumB.y6 - this.mdCumB.y12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_sho ) / this.scaler_scale.y_sho * this.model.y_sho ) + 
                ( ( ( ( Math.abs( (this.mdCumA.y7 - this.mdCumA.y5) - (this.mdCumB.y7 - this.mdCumB.y5) ) + Math.abs( (this.mdCumA.y8 - this.mdCumA.y6) - (this.mdCumB.y8 - this.mdCumB.y6) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_elb ) / this.scaler_scale.y_elb * this.model.y_elb ) + 
                ( ( ( ( Math.abs( (this.mdCumA.y9 - this.mdCumA.y7) - (this.mdCumB.y9 - this.mdCumB.y7) ) + Math.abs( (this.mdCumA.y10 - this.mdCumA.y8) - (this.mdCumB.y10 - this.mdCumB.y8) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_wri ) / this.scaler_scale.y_wri * this.model.y_wri ) +
                ( ( ( ( Math.abs( (this.mdCumA.y13 - this.mdCumA.y11) - (this.mdCumB.y13 - this.mdCumB.y11) ) + Math.abs( (this.mdCumA.y14 - this.mdCumA.y12) - (this.mdCumB.y14 - this.mdCumB.y12) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_kne ) / this.scaler_scale.y_kne * this.model.y_kne ) +
                ( ( ( ( Math.abs( (this.mdCumA.y15 - this.mdCumA.y13) - (this.mdCumB.y15 - this.mdCumB.y13) ) + Math.abs( (this.mdCumA.y16 - this.mdCumA.y14) - (this.mdCumB.y16 - this.mdCumB.y14) ) + 0.00001) / 2 / NTAForScore ) - this.scaler_mean.y_ank ) / this.scaler_scale.y_ank * this.model.y_ank ) +

                this.model.intercept;


              this.flag_mdCum = 1; // switch flag
            }

            // if ( mdCumTtlNow < 1.3) {
            //   mdCumTtlNow = 1.3; // force to change METS 1.3. This is METS of 'Rest position'. 20200824 
            //   console.log('--- mdCumTtlNow FORCED');
            // }; 

            console.log('--- METS mdCumTtlNow RAW: ', mdCumTtlNow.toFixed(2) );


            if ( mdCumTtlNow > 18) { // if METS becomes impossibly large
              mdCumTtlNow = 18; // force NOT to go too high, because it is impossible. 20201001
              console.log('xxxxxxxxxx METS is too large. Forcing METS to 18');
            } else {
              mdCumTtlNow = mdCumTtlNow * this.model2.coef + this.model2.intercept; // final adjust model 20201001
            };

            if ( this.state.outNTAFlag === true || this.state.outAccelFlag === true) { // if user is too close to camera OR camera is not fixed. 
              mdCumTtlNow = 0.000001; // then NOT to increment. making it not zero to avoid division error
              console.log('xxxxxxxxxx outNTAFlag. Forcing METS to 0.0000001');
            }

            // console.log('--- mdCumTtlBeforeModel2: ', mdCumTtlBeforeModel2.toFixed(2) );
            console.log('--- METS mdCumTtlNow: ', mdCumTtlNow.toFixed(2) );

            // console.log('--- CALORIE last time,  this.scorePrev: ', this.scorePrev.toFixed(3));
            scoreNow = this.scorePrev + ( mdCumTtlNow / 60 / 60 * this.WEIGHT_KG * 1.05 ); // Calculate calorie & increment. 
            console.log('--- CALORIE accumlateive,     scoreNow: ', scoreNow.toFixed(3));
            console.log('--- CALORIE this time, score this time: ', (scoreNow - this.scorePrev).toFixed(3));
            this.scorePrev = scoreNow; // duplicate to compare prev vs. current at the next loop. 20200810

            this.cntLoopUpdateScore++; // increment

            // console.log('1 this.mdCum.x10, y13, y15: ', this.mdCum.x10, this.mdCum.y13, this.mdCum.y15 );
            // console.log('1 this.mdCumA.x10, y13, y15: ', this.mdCumA.x10, this.mdCumA.y13, this.mdCumA.y15 );
            // console.log('1 this.mdCumB.x10, y13, y15: ', this.mdCumB.x10, this.mdCumB.y13, this.mdCumB.y15 );


            ////////// to check if mobile devices is fixed & no move by Accelerometer
            if (shouldPlay == true ) { // this runs only when video is playing after countdown until video ends
              console.log('this.state.accelerometerData -- : ', this.state.accelerometerData);
              // console.log('this.prevAccelData -- : ', this.prevAccelData.x);
              // console.log('this.outCriteriaAccel: ', this.outCriteriaAccel.x);
              console.log(' Diff x, y, z): ', Math.abs(this.prevAccelData.x - this.state.accelerometerData.x).toFixed(2), Math.abs(this.prevAccelData.y - this.state.accelerometerData.y).toFixed(2), Math.abs(this.prevAccelData.z - this.state.accelerometerData.z).toFixed(2) );
              if (this.prevAccelData.x == null || this.prevAccelData.y == null || this.prevAccelData.z == null) { // only 1st loop, Do assign only, 
                // console.log('---- will check accelerometerData -- 1st loop');
                this.prevAccelData.x = this.state.accelerometerData.x.toFixed(3); // assign only
                this.prevAccelData.y = this.state.accelerometerData.y.toFixed(3); // assign only
                this.prevAccelData.z = this.state.accelerometerData.z.toFixed(3); // assign only
              } else { // after 2nd loop
                // console.log('---- will check accelerometerData -- After 2nd loop');
                // console.log('accelerometerData move from previous x,y,z: ', Math.abs(this.prevAccelData.x - accelerometerData.x).toFixed(2), Math.abs(this.prevAccelData.y - accelerometerData.y).toFixed(2), Math.abs(this.prevAccelData.z - accelerometerData.z).toFixed(2),)
                if ( Math.abs(this.prevAccelData.x - this.state.accelerometerData.x) > this.outCriteriaAccel.x || Math.abs(this.prevAccelData.y - this.state.accelerometerData.y) > this.outCriteriaAccel.y || Math.abs(this.prevAccelData.z - this.state.accelerometerData.z) > this.outCriteriaAccel.z) { // if any of x,y,z is out of criteria
                  // console.log('here if');
                  this.cntOutAccel += 1; // increment
                  console.log('xxxxxxxxxx OutAccel, this.cntOutAccel: ', this.cntOutAccel);
                  if (this.cntOutAccel % 2 == 0) { // if divided by x == 0 , means it will alert when every X cntOutAccel.
                    console.log('Please fix and Do not move your device. this.cntOutAccel: ', this.cntOutAccel);
                    // alert('Please fix and Do not move your device.');
                    this.setState( {outAccelFlag: true}); // to NOT to increment METS
                  }
                } else {
                  // console.log('here else');
                  if (this.state.outAccelFlag == true) {
                    this.setState( {outAccelFlag: false}); // to resume to increment METS
                    console.log('reset outAccelFlag')
                  }
                }
                this.prevAccelData.x = this.state.accelerometerData.x.toFixed(3); // assign only
                this.prevAccelData.y = this.state.accelerometerData.y.toFixed(3); // assign only
                this.prevAccelData.z = this.state.accelerometerData.z.toFixed(3); // assign only        
              }
            } 



        
          }
          
          // console.log('2 this.mdCum.x10, y13, y15: ', this.mdCum.x10, this.mdCum.y13, this.mdCum.y15 );
          // console.log('2 this.mdCumA.x10, y13, y15: ', this.mdCumA.x10, this.mdCumA.y13, this.mdCumA.y15 );
          // console.log('2 this.mdCumB.x10, y13, y15: ', this.mdCumB.x10, this.mdCumB.y13, this.mdCumB.y15 );   


          // // Assign this.state.octopusLoc. 20200823
          // var octopusLocEach = {}; //initialize
          // if ( typeof slow1[secFromStart.toString()] !== "undefined") { 
          //   console.log( 'slow1[secFromStart]: ', slow1[secFromStart.toString()] );
          //   octopusLocEach = slow1[secFromStart.toString()]; // Assign Location
          // } else {
          //   console.log( 'slow1[secFromStart]: error' ); 
          //   octopusLocEach = slow1["ERR"]; // assign Location for Error
          // };


          // console.log('time0b: ', Date.now() / 1000 - time0);         
                
          this.setState({ mdCumTtlNow : mdCumTtlNow.toFixed(3), scoreNow: scoreNow.toFixed(1) });// this is what shows as score on top right.
          // this.mdCumAll.push( JSON.stringify({ 'sec': secFromStart, 'cntLoopUpdateScore': this.cntLoopUpdateScore, 'ts': Date.now()/1000, 'score': scoreNow.toFixed(3), 'playSum': this.vidState.vidPlayedSum.toFixed(2), 'pos': this.pos }) ); // append froms Start to End 
          this.mdCumAll = 0; // Dummy. To improve response speed 20201010

          if ( this.state.shouldPlay === false ) { // this will force to stop setInterval(_updateScore) when user outNTA or press gobackhome BEFORE video ends. 20200603
            console.log('this will force to stop setInterval(_updateScore).');
            clearInterval(_updateScore); 
          }

        }, 1000 ); // setInterval, update score every X millisecond  

        console.log('---------------------------------------- flagUpdateScore: false'); 
        this.setState({flagUpdateScore: false}); 

      } // closing if (this.state.shouldPlay === true & this.state.flagUpdateScore === true )


      
      if ( pose != null ) {
        // console.log('-------- pose.keypoints: ', pose.keypoints)
        // console.log('time0c: ', Date.now() / 1000 - time0); 

        var identifiedBpartsEach = []; // reset at each loop 20200520

        var posPerloop = {}; // reset at every single loop 20201029

        const keypoints = pose.keypoints
          .filter(k => k.score > this.MIN_KEYPOINT_SCORE)
          .map((k,i) => {

            console.log(k.part, ' : ', Math.round(k.position.x), Math.round(k.position.y), 's:', k.score.toFixed(2) )


////////// check if user is out of camera range. 20200127 ////////////////////      
            if (k.position.x > this.inputTensorWidth * 0.95) { 
              this.frameOutCnt.right += 1; 
              this.frameOutCntCum.right += 1;
              console.log('out on observers Right > > > > > > > > > > ', this.frameOutCnt.right);
            }
            if (k.position.x < this.inputTensorWidth * 0.05 ) {
              this.frameOutCnt.left += 1;
              this.frameOutCntCum.left += 1;
              console.log('out on observers Left < < < < < < < < < < ', this.frameOutCnt.left);
            }
            if (k.position.y < this.inputTensorHeight * 0.05 ) {
              this.frameOutCnt.top += 1;
              this.frameOutCntCum.top += 1;
              console.log('out on observers Top ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ^ ', this.frameOutCnt.top);
            }
            if (k.position.y > this.inputTensorHeight * 0.98 ) { // added StatusBar.currentHeight since frame out to bottom often seen. 20200531
              this.frameOutCnt.bottom += 1;
              this.frameOutCntCum.bottom += 1;
              console.log('out on observers Bottom v v v v v v v v v v v ', this.frameOutCnt.bottom);
            }

            // console.log('time0d: ', Date.now() / 1000 - time0);


  ////////// assign each value to this.pos.xxx ////////////////////
            if ( k.part === 'nose') {
              // identifiedBpartsEach.push( { 'p': '0', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              if (this.pos.x0 != null) { // after 2nd loop
                this.mdCum.x0 = Math.abs( this.pos.x0 - Math.round(k.position.x) ) + this.mdCum.x0 ;
              } else { // 1st loop
                this.pos.x0 = Math.round(k.position.x); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x0 nose');
              }      
              this.pos.x0 = Math.round(k.position.x); // update present position 
              posPerloop.x0 = Math.round(k.position.x); // update

              if (this.pos.y0 != null) { // after 2nd loop
                this.mdCum.y0 = Math.abs( this.pos.y0 - Math.round(k.position.y) ) + this.mdCum.y0;
              } else { // 1st loop
                this.pos.y0 = Math.round(k.position.y); // assign position
                console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y0 nose');
              }      
              this.pos.y0 = Math.round(k.position.y); // update present position   
              posPerloop.y0 = Math.round(k.position.y); // update            
              
            } else if (k.part == 'leftEye') {
              // this.pos.x1 = Math.round(k.position.x);
            //   this.pos.y1 = Math.round(k.position.y);
              // identifiedBpartsEach.push( { 'p': '1', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              posPerloop.x1 = Math.round(k.position.x); // update
              posPerloop.y1 = Math.round(k.position.y); // update
            } else if (k.part== 'rightEye') {
              // this.pos.x2 = Math.round(k.position.x);
            //   this.pos.y2 = Math.round(k.position.y);
              // identifiedBpartsEach.push( { 'p': '2', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
              posPerloop.x2 = Math.round(k.position.x); // update
              posPerloop.y2 = Math.round(k.position.y); // update
            } else if (k.part == 'leftElbow') {
                // identifiedBpartsEach.push( { 'p': '7', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x7 != null) { // after 2nd loop
                  this.mdCum.x7 = Math.abs( this.pos.x7 - Math.round(k.position.x) ) + this.mdCum.x7;
                } else { // 1st loop
                  this.pos.x7 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x7 leftElbow');
                }      
                this.pos.x7 = Math.round(k.position.x); // update present position 
                posPerloop.x7 = Math.round(k.position.x); // update
    
                if (this.pos.y7 != null) { // after 2nd loop
                    this.mdCum.y7 = Math.abs( this.pos.y7 - Math.round(k.position.y) ) + this.mdCum.y7;
                } else { // 1st loop
                    this.pos.y7 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y7 leftElbow');
                }      
                this.pos.y7 = Math.round(k.position.y); // update present position  
                posPerloop.y7 = Math.round(k.position.y); // update                  
            } else if (k.part == 'rightElbow') {
                // identifiedBpartsEach.push( { 'p': '8', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x8 != null) { // after 2nd loop
                  this.mdCum.x8 = Math.abs( this.pos.x8 - Math.round(k.position.x) ) + this.mdCum.x8;
                } else { // 1st loop
                  this.pos.x8 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x8 rightElbow');
                }      
                this.pos.x8 = Math.round(k.position.x); // update present position 
                posPerloop.x8 = Math.round(k.position.x); // update
    
                if (this.pos.y8 != null) { // after 2nd loop
                    this.mdCum.y8 = Math.abs( this.pos.y8 - Math.round(k.position.y) ) + this.mdCum.y8;
                } else { // 1st loop
                    this.pos.y8 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y8 rightElbow');
                }      
                this.pos.y8 = Math.round(k.position.y); // update present position 
                posPerloop.y8 = Math.round(k.position.y); // update    
            } else if (k.part == 'leftWrist') {
                // identifiedBpartsEach.push( { 'p': '9', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x9 != null) { // after 2nd loop
                  this.mdCum.x9 = Math.abs( this.pos.x9 - Math.round(k.position.x) ) + this.mdCum.x9;
                } else { // 1st loop
                  this.pos.x9 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x9 leftWrist');
                }      
                this.pos.x9 = Math.round(k.position.x); // update present position 
                posPerloop.x9 = Math.round(k.position.x); // update
    
                if (this.pos.y9 != null) { // after 2nd loop
                    this.mdCum.y9 = Math.abs( this.pos.y9 - Math.round(k.position.y) ) + this.mdCum.y9;
                } else { // 1st loop
                    this.pos.y9 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y9 leftWrist');
                }      
                this.pos.y9 = Math.round(k.position.y); // update present position 
                posPerloop.y9 = Math.round(k.position.y); // update 
            } else if (k.part == 'rightWrist') {
                // identifiedBpartsEach.push( { 'p': '10', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x10 != null) { // after 2nd loop
                  this.mdCum.x10 = Math.abs( this.pos.x10 - Math.round(k.position.x) ) + this.mdCum.x10;
                } else { // 1st loop
                  this.pos.x10 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x10 rightWrist');
                }      
                this.pos.x10 = Math.round(k.position.x); // update present position 
                posPerloop.x10 = Math.round(k.position.x); // update
    
                if (this.pos.y10 != null) { // after 2nd loop
                    this.mdCum.y10 = Math.abs( this.pos.y10 - Math.round(k.position.y) ) + this.mdCum.y10;
                } else { // 1st loop
                    this.pos.y10 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y10 rightWrist');
                }      
                this.pos.y10 = Math.round(k.position.y); // update present position  
                posPerloop.y10 = Math.round(k.position.y); // update 
            } else if (k.part == 'leftShoulder') {
                // identifiedBpartsEach.push( { 'p': '5', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x5 != null) { // after 2nd loop
                  this.mdCum.x5 = Math.abs( this.pos.x5 - Math.round(k.position.x) ) + this.mdCum.x5;
                } else { // 1st loop
                  this.pos.x5 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x5 leftShoulder');
                }      
                this.pos.x5 = Math.round(k.position.x); // update present position 
                posPerloop.x5 = Math.round(k.position.x); // update
    
                if (this.pos.y5 != null) { // after 2nd loop
                    this.mdCum.y5 = Math.abs( this.pos.y5 - Math.round(k.position.y) ) + this.mdCum.y5;
                } else { // 1st loop
                    this.pos.y5 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y5 leftShoulder');
                }      
                this.pos.y5 = Math.round(k.position.y); // update present position 
                posPerloop.y5 = Math.round(k.position.y); // update                 
            } else if (k.part == 'rightShoulder') {
                // identifiedBpartsEach.push( { 'p': '6', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x6 != null) { // after 2nd loop
                  this.mdCum.x6 = Math.abs( this.pos.x6 - Math.round(k.position.x) ) + this.mdCum.x6;
                } else { // 1st loop
                  this.pos.x6 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x6 rightShoulder');
                }      
                this.pos.x6 = Math.round(k.position.x); // update present position 
                posPerloop.x6 = Math.round(k.position.x); // update
    
                if (this.pos.y6 != null) { // after 2nd loop
                    this.mdCum.y6 = Math.abs( this.pos.y6 - Math.round(k.position.y) ) + this.mdCum.y6;
                } else { // 1st loop
                    this.pos.y6 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y6 rightShoulder');
                }      
                this.pos.y6 = Math.round(k.position.y); // update present position
                posPerloop.y6 = Math.round(k.position.y); // update 
            } else if (k.part == 'leftHip') {
                // identifiedBpartsEach.push( { 'p': '11', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x11 != null) { // after 2nd loop
                  this.mdCum.x11 = Math.abs( this.pos.x11 - Math.round(k.position.x) ) + this.mdCum.x11;
                } else { // 1st loop
                  this.pos.x11 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x11 leftHip');
                }      
                this.pos.x11 = Math.round(k.position.x); // update present position 
                posPerloop.x11 = Math.round(k.position.x); // update
    
                if (this.pos.y11 != null) { // after 2nd loop
                    this.mdCum.y11 = Math.abs( this.pos.y11 - Math.round(k.position.y) ) + this.mdCum.y11;
                } else { // 1st loop
                    this.pos.y11 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y11 leftHip');
                }      
                this.pos.y11 = Math.round(k.position.y); // update present position  
                posPerloop.y11 = Math.round(k.position.y); // update 
            } else if (k.part == 'rightHip') {
                // identifiedBpartsEach.push( { 'p': '12', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x12 != null) { // after 2nd loop
                  this.mdCum.x12 = Math.abs( this.pos.x12 - Math.round(k.position.x) ) + this.mdCum.x12;
                } else { // 1st loop
                  this.pos.x12 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x12 rightHip');
                }      
                this.pos.x12 = Math.round(k.position.x); // update present position 
                posPerloop.x12 = Math.round(k.position.x); // update
    
                if (this.pos.y12 != null) { // after 2nd loop
                    this.mdCum.y12 = Math.abs( this.pos.y12 - Math.round(k.position.y) ) + this.mdCum.y12;
                } else { // 1st loop
                    this.pos.y12 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y12 rightHip');
                }      
                this.pos.y12 = Math.round(k.position.y); // update present position 
                posPerloop.y12 = Math.round(k.position.y); // update
            } else if (k.part == 'leftKnee') {
                // identifiedBpartsEach.push( { 'p': '13', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x13 != null) { // after 2nd loop
                  this.mdCum.x13 = Math.abs( this.pos.x13 - Math.round(k.position.x) ) + this.mdCum.x13;
                } else { // 1st loop
                  this.pos.x13 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x13 leftKnee');
                }      
                this.pos.x13 = Math.round(k.position.x); // update present position 
                posPerloop.x13 = Math.round(k.position.x); // update
    
                if (this.pos.y13 != null) { // after 2nd loop
                    this.mdCum.y13 = Math.abs( this.pos.y13 - Math.round(k.position.y) ) + this.mdCum.y13;
                } else { // 1st loop
                    this.pos.y13 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y13 leftKnee');
                }      
                this.pos.y13 = Math.round(k.position.y); // update present position 
                posPerloop.y13 = Math.round(k.position.y); // update                    
            } else if (k.part == 'rightKnee') {
                // identifiedBpartsEach.push( { 'p': '14', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x14 != null) { // after 2nd loop
                  this.mdCum.x14 = Math.abs( this.pos.x14 - Math.round(k.position.x) ) + this.mdCum.x14;
                } else { // 1st loop
                  this.pos.x14 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x14 rightKnee');
                }      
                this.pos.x14 = Math.round(k.position.x); // update present position
                posPerloop.x14 = Math.round(k.position.x); // update 
    
                if (this.pos.y14 != null) { // after 2nd loop
                    this.mdCum.y14 = Math.abs( this.pos.y14 - Math.round(k.position.y) ) + this.mdCum.y14;
                } else { // 1st loop
                    this.pos.y14 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y14 rightKnee');
                }      
                this.pos.y14 = Math.round(k.position.y); // update present position
                posPerloop.y14 = Math.round(k.position.y); // update 
            } else if (k.part == 'leftAnkle') {
                // identifiedBpartsEach.push( { 'p': '15', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x15 != null) { // after 2nd loop
                  this.mdCum.x15 = Math.abs( this.pos.x15 - Math.round(k.position.x) ) + this.mdCum.x15;
                } else { // 1st loop
                  this.pos.x15 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x15 leftAnkle');
                }      
                this.pos.x15 = Math.round(k.position.x); // update present position 
                posPerloop.x15 = Math.round(k.position.x); // update
    
                if (this.pos.y15 != null) { // after 2nd loop
                    this.mdCum.y15 = Math.abs( this.pos.y15 - Math.round(k.position.y) ) + this.mdCum.y15;
                } else { // 1st loop
                    this.pos.y15 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y15 leftAnkle');
                }      
                this.pos.y15 = Math.round(k.position.y); // update present position 
                posPerloop.y15 = Math.round(k.position.y); // update
            } else if (k.part == 'rightAnkle') {
                // identifiedBpartsEach.push( { 'p': '16', 'x': Math.round(k.position.x), 'y': Math.round(k.position.y), 'sc': k.score.toFixed(2) } );
                if (this.pos.x16 != null) { // after 2nd loop
                  this.mdCum.x16 = Math.abs( this.pos.x16 - Math.round(k.position.x) ) + this.mdCum.x16;
                } else { // 1st loop
                  this.pos.x16 = Math.round(k.position.x); // assign position
                  console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv x16 rightAnkle');
                }      
                this.pos.x16 = Math.round(k.position.x); // update present position
                posPerloop.x16 = Math.round(k.position.x); // update 
    
                if (this.pos.y16 != null) { // after 2nd loop
                    this.mdCum.y16 = Math.abs( this.pos.y16 - Math.round(k.position.y) ) + this.mdCum.y16;
                } else { // 1st loop
                    this.pos.y16 = Math.round(k.position.y); // assign position
                    console.log('vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv y16 rightAnkle');
                }      
                this.pos.y16 = Math.round(k.position.y); // update present position 
                posPerloop.y16 = Math.round(k.position.y); // update

            };

          }); // closing .map

          // console.log('time0e: ', Date.now() / 1000 - time0); 

          // console.log(' pos pos pos pos posPerloop: ', posPerloop , ' / 30' );


///////// check if User moves towards Camera by noseToAnkle. 20200523 //////////// 
          if (shouldPlay == true )  { // check if video is playing
            // if (this.pos.y0 != null && this.pos.y15 != null && this.pos.y16 != null) { // check if all necessary position data exist
            //   if ( Math.max(this.pos.y15, this.pos.y16) - this.pos.y0 > noseToAnkle * this.outNTA.DistMoveCriteria) { // check if data is out of criteria
            if ( posPerloop.y0 != null && posPerloop.y15 != null && posPerloop.y16 != null) { // check if all necessary position data exist
              if ( Math.max( posPerloop.y15, posPerloop.y16 ) - posPerloop.y0 > noseToAnkle * this.outNTA.DistMoveCriteria) { // check if data is out of criteria
                this.outNTA.cnt++; // increment
                console.log('---------- out NoseToAnkle this.outNTA.cnt: ', this.outNTA.cnt );
                if (this.outNTA.cnt > this.outNTA.outTimesCriteria && this.state.outNTAFlag == false) { // check if count of out times more than criteria
                  console.log('xxxxxxxxxxxxxxxxxxxxxx You moved too close to Camera. Step Back');
                  // this.outNTA.flag = true; // to control to go in only one time.
                  this.setState({ outNTAFlag: true }); // show attention                
                }
              } else {
                if (this.state.outNTAFlag == true) {
                  this.outNTA.cnt = 0; // reset count
                  this.setState({ outNTAFlag: false }); // remove attention 
                }
              }
            }   
          }
        



          // console.log('identifiedBpartsEach: ', identifiedBpartsEach.length, ' | ', identifiedBpartsEach);

          // if ( identifiedBpartsEach.length == 0 ) { // will not append 'bp' to avoid error
          //   this.identifiedBPartsAll.push( JSON.stringify({ 'lp': this.vidState.LOOPTIMES, 'ts': Date.now()/1000 }) ); // append to array per each loop
          // } else {
          //   this.identifiedBPartsAll.push( JSON.stringify({ 'lp': this.vidState.renderPoseTimes, 'ts': Date.now()/1000, 'bp': identifiedBpartsEach }) ); // append to array per each loop
          // }
          // this.identifiedBPartsAll = []; // emptize it because do not want to record.
    
          this.identifiedBPartsAll = 0; // Dummy. To improve response speed 20201010





////////// assign noseToAnkle & rightToLeft until this.state.flagCountdownFinished becomes true////////////////////
            // // assign noseToAnkle
            if (this.state.flagCountdownFinished == false) { // go into this block until countdown finish 

              // ///////////////////////////////////
              // // // TESTMODE DUMMY 
              // if (this.TESTMODE == 1) { // when test
              //   if (flagNoseToAnkle == false) { 
              //     this.setState({ 
              //       noseToAnkle: 100, 
              //       flagNoseToAnkle: true,
              //     });       
              //     console.log('8888888888 TESTMODE 8888888888888 DUMMY all pos confirmed.');     
              //   }
              // }
              ///////////////////////////////////

              if ( posPerloop.y0 != null && posPerloop.y15 != null && posPerloop.y16 != null) { // check if all necessary position data exist
                if ( Math.max( posPerloop.y15, posPerloop.y16 ) - posPerloop.y0 > noseToAnkle) { // check if data is out of criteria
              // if (this.pos.y0 != null && this.pos.y15 != null && this.pos.y16 != null) {
              //   if ( Math.max(this.pos.y15, this.pos.y16) - this.pos.y0 > noseToAnkle) { // max of leftAnkle and rightAnkle 20200920
                  console.log('----- posPerloop y0 y15 y16: ', posPerloop.y0, posPerloop.y15, posPerloop.y16);
                  this.setState({ 
                    noseToAnkle: Math.max( posPerloop.y15, posPerloop.y16) - posPerloop.y0, // max of leftAnkle and rightAnkle 20200920
                    flagNoseToAnkle: true,
                  });
                  console.log('----- noseToAnkle updated: ', this.state.noseToAnkle);
                  // flagNoseToAnkle = 1; // flag 1 to stop assigning noseToAnkle
                  // this.setState({ flagNoseToAnkle: true});
                }
              }            

              // // assign rightToLeft
              if ( posPerloop.x10 != null && posPerloop.x9 != null) {
                if ( posPerloop.x9 - posPerloop.x10 > rightToLeft) {
                  console.log('----- posPerloop.x10, x9: ', posPerloop.x10, posPerloop.x9);
                    this.setState({ 
                      rightToLeft: posPerloop.x9 - posPerloop.x10, 
                      flagRightToLeft: true, 
                    });
                    console.log('----- rightToLeft updated: ', this.state.rightToLeft);
                }
              }  

            }

            // console.log('time0f: ', Date.now() / 1000 - time0);         

  ////////// to check if all the positions are ready in camera  ////////////////////

            if (flagAllPosOk == false) { // Go into this block unitl countdown starts.

              if (this.updateMissingPosTiming != parseInt(Date.now() / 1000) ) {
                
                this.missingPos = []; // reset to none
                this.outOfIniPos = []; // reset to none
                this.flagIp.f = false; // nose // reset to false
                this.flagIp.lw = false; // reset to false
                this.flagIp.rw = false; // reset to false
                this.flagIp.la = false; // reset to false
                this.flagIp.ra = false; // reset to false



                // DEBUGGING PURPOSE, to show which body parts are missing or out of initial posisitons. 20201102
                if (posPerloop.y0 != null) {
                  if (posPerloop.x0 <= this.initialPositions.x0Min || posPerloop.x0 >= this.initialPositions.x0Max ||
                    posPerloop.y0 <= this.initialPositions.y0Min || posPerloop.y0 >= this.initialPositions.y0Max ) {
                      this.outOfIniPos.push('Nose');
                  } else {
                    this.flagIp.f = true;
                  }
                } else {
                  this.missingPos.push('Nose');
                };

                if (posPerloop.y9 != null) {
                  if (posPerloop.x9 <= this.initialPositions.x9Min || posPerloop.x9 >= this.initialPositions.x9Max ||
                    posPerloop.y9 <= this.initialPositions.y9Min || posPerloop.y9 >= this.initialPositions.y9Max) {
                      this.outOfIniPos.push('LW');
                  } else {
                    this.flagIp.lw = true;
                  }
                } else {                  
                  this.missingPos.push('lW');
                };           

                if (posPerloop.y10 != null) {
                  if (posPerloop.x10 <= this.initialPositions.x10Min || posPerloop.x10 >= this.initialPositions.x10Max ||
                    posPerloop.y10 <= this.initialPositions.y10Min || posPerloop.y10 >= this.initialPositions.y10Max) {
                      this.outOfIniPos.push('RW');
                  } else {
                    this.flagIp.rw = true;
                  }
                } else {
                  this.missingPos.push('rW');
                };

                if (posPerloop.y15 != null) {
                  if (posPerloop.x15 <= this.initialPositions.xBothAnkleMin || posPerloop.x15 >= this.initialPositions.xBothAnkleMax ||
                    posPerloop.y15 <= this.initialPositions.yBothAnkleMin) {
                      this.outOfIniPos.push('LA');
                  } else {
                    this.flagIp.la = true;
                  }
                } else {
                  this.missingPos.push('lA');
                };

                if (posPerloop.y16 != null) {
                  if (posPerloop.x16 <= this.initialPositions.xBothAnkleMin || posPerloop.x16 >= this.initialPositions.xBothAnkleMax ||
                    posPerloop.y16 <= this.initialPositions.yBothAnkleMin) {
                      this.outOfIniPos.push('rA');
                  } else {
                    this.flagIp.ra = true;
                  }
                } else {
                  this.missingPos.push('RA');
                };


                // to update this.state to render 20201102
                if ( this.missingPos.length > 0 && this.outOfIniPos.length > 0 ) {
                  this.setState({ missingPos: this.missingPos, outOfIniPos: this.outOfIniPos });
                } else if ( this.missingPos.length > 0 ) {
                  this.setState({ missingPos: this.missingPos, outOfIniPos: null });
                } else if ( this.outOfIniPos.length > 0 ) {
                  this.setState({ missingPos: null, outOfIniPos: this.outOfIniPos });
                };
                console.log('this.state.missingPos: ', this.state.missingPos, this.state.outOfIniPos);


                this.setState({ iP_f: this.flagIp.f, iP_lw: this.flagIp.lw, iP_rw: this.flagIp.rw, iP_la: this.flagIp.la, iP_ra: this.flagIp.ra  });
                 

              };

              this.updateMissingPosTiming = parseInt(Date.now() / 1000); // update updateMissingPosTiming 20201102




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

                  console.log('got all positions ------------------------ ');
                

                  // // to check initialPositions       
                  if (
                      // this.pos.x0 > this.initialPositions.x0Min && this.pos.x0 < this.initialPositions.x0Max &&
                      // this.pos.y0 > this.initialPositions.y0Min && this.pos.y0 < this.initialPositions.y0Max &&
                      // // this.pos.x9 > this.initialPositions.x9Min && this.pos.x9 < this.initialPositions.x9Max &&
                      // // this.pos.y9 > this.initialPositions.y9Min && this.pos.y9 < this.initialPositions.y9Max &&
                      // // this.pos.x10 > this.initialPositions.x10Min && this.pos.x10 < this.initialPositions.x10Max &&
                      // // this.pos.y10 > this.initialPositions.y10Min && this.pos.y10 < this.initialPositions.y10Max &&
                      // this.pos.x15 > this.initialPositions.xBothAnkleMin && this.pos.x15 < this.initialPositions.xBothAnkleMax &&
                      // this.pos.y15 > this.initialPositions.yBothAnkleMin &&
                      // this.pos.x16 > this.initialPositions.xBothAnkleMin && this.pos.x16 < this.initialPositions.xBothAnkleMax &&
                      // this.pos.y16 > this.initialPositions.yBothAnkleMin 

                      posPerloop.x0 > this.initialPositions.x0Min && posPerloop.x0 < this.initialPositions.x0Max &&
                      posPerloop.y0 > this.initialPositions.y0Min && posPerloop.y0 < this.initialPositions.y0Max &&
                      posPerloop.x9 > this.initialPositions.x9Min && posPerloop.x9 < this.initialPositions.x9Max &&
                      posPerloop.y9 > this.initialPositions.y9Min && posPerloop.y9 < this.initialPositions.y9Max &&
                      posPerloop.x10 > this.initialPositions.x10Min && posPerloop.x10 < this.initialPositions.x10Max &&
                      posPerloop.y10 > this.initialPositions.y10Min && posPerloop.y10 < this.initialPositions.y10Max &&
                      posPerloop.x15 > this.initialPositions.xBothAnkleMin && posPerloop.x15 < this.initialPositions.xBothAnkleMax &&
                      posPerloop.y15 > this.initialPositions.yBothAnkleMin &&
                      posPerloop.x16 > this.initialPositions.xBothAnkleMin && posPerloop.x16 < this.initialPositions.xBothAnkleMax &&
                      posPerloop.y16 > this.initialPositions.yBothAnkleMin 

                      ) {

                        
                  
              ////////////////////////////////////////////////////////////       
              
            
                    this.cntIniPos += 1;
                    console.log('---------- this.cntIniPos: ', this.cntIniPos);

                    // hide webCam, initialPosture.png & start countdown 
                    if (flagAllPosOk == false && this.cntIniPos > 1) { // flag to control going through one time 
                      //flagAllPosOk = 1; // flag to confirm all the positions are within camera range
                      this.setState({ flagAllPosOk: true });
                      console.log('oooooooooooooooooooooooooooooooooooooooooo All the positions confirmed ooooooooooooooooooooooooooooooooooooooooooooo ');
                      
                      this.vidState.numFrameAllPosOk = this.vidState.renderPoseTimes; // for record to Firestore vidViewLog. 20200524

                      var videoCountDownSec = 1; // total countdown seconds until trainerVideo starts
                      // console.log('------------------ 0002');

                      var videoCountDown = setInterval( function(){
                        // this.setState({countdownTxt: videoCountDownSec + ' ...'}); // assign 
                        this.setState({countdownTxt: 'GO' }); // assign 
                        // console.log('--------------------- videoCountDownSec... : ', videoCountDownSec);
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

                        // if ( this.state.flagVidEnd === true ) { // this will force to stop setInterval(videoCountDown) when user press gobackhome DURING COUNTDOWN. 20200603
                        //   console.log('this will force to stop setInterval(videoCountDown).');
                        //   clearInterval(videoCountDown); 
                        // }
                       

                      }.bind(this), 1000 ); // countdown interval in second  // add .bind(this) because https://stackoverflow.com/questions/31045716/react-this-setstate-is-not-a-function
                      // console.log('------------------ 0003');

                    } 

                  } else { // if initialPositions not confirmed
                    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxx      initialPositions NOT confirmed       xxxxxxxxxxxxxxxxxxxxxxxxxx');
                  }   
                  
                } else { // if all positions not confirmed 
                  // console.log('All the positions NOT confirmed xxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
                }



            // } else if (isWPartLoaded == false && isVidMetaLoaded == false) {
            //   console.log('WPart, VidMeta, vidFullUrl from Firebase Not loaded yet.');
            }   




        // to start logging to mdCum after Video started
        // console.log('FlagVidStart, FlagVidEnd; ', FlagVidStart, FlagVidEnd) 
        // if (this.state.shouldPlay == true && this.state.flagVidEnd == false)  {  
        //   // console.log('------------------ 0005');
        //   this.mdCum.y0 = this.mdCum.y0 + this.md.y0;
        //   this.mdCum.y5 = this.mdCum.y5 + this.md.y5;
        //   this.mdCum.y6 = this.mdCum.y6 + this.md.y6;              
        //   this.mdCum.y7 = this.mdCum.y7 + this.md.y7;
        //   this.mdCum.y8 = this.mdCum.y8 + this.md.y8;
        //   this.mdCum.y9 = this.mdCum.y9 + this.md.y9;
        //   this.mdCum.y10 = this.mdCum.y10 + this.md.y10;
        //   this.mdCum.y11 = this.mdCum.y11 + this.md.y11;
        //   this.mdCum.y12 = this.mdCum.y12 + this.md.y12;               
        //   this.mdCum.y13 = this.mdCum.y13 + this.md.y13;
        //   this.mdCum.y14 = this.mdCum.y14 + this.md.y14;
        //   this.mdCum.y15 = this.mdCum.y15 + this.md.y15;
        //   this.mdCum.y16 = this.mdCum.y16 + this.md.y16;             
          
        //   // console.log('md: ', md);
        //   // console.log('mdCum: ', mdCum);      

        // }


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
              console.log('RED RED RED RED RED ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^. ');
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
              console.log('RED RED RED RED RED vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv ');
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
            console.log('RED RED RED RED RED <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<. ');
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
            console.log('RED RED RED RED RED >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>. ');
            // this.setState({ ULBColorRight: 'red' });
          } else if (this.frameOutCntPrev.right === this.frameOutCnt.right) {// compare with previous assignment
            this.ULBColor.right = 'transparent';   
            // this.setState({ ULBColorRight: 'transparent' });          
            this.frameOutCnt.right = 0; // reset
          }
        }
        this.frameOutCntPrev.right = this.frameOutCnt.right; // update value
        
      
          
      } else { 
        console.log('----------------- pose is Null --------------------');
        return null;
      } 


    } catch(err) { // closing try block
      console.log('renderpose error: ', err);  
    }  

    this.vidState.renderPoseTimes++; // increment

    // console.log('time0g: ', Date.now() / 1000 - time0); 

  } // closing renderPose






  render() {
    console.log('----------------- render --------------------');
    var time1 = Date.now() / 1000; 

    const { isPosenetLoaded, isReadyToCD, flagAllPosOk, flagCountdownFinished, shouldPlay, scoreNow, vidStartAt, loopStartAt, countdownTxt, mdCumTtlNow, showModal, accelerometerData, flagShowGoBackIcon, octopusLoc, outNTAFlag, outAccelFlag, missingPos, outOfIniPos, iP_f, iP_lw, iP_rw, iP_la, iP_ra } = this.state;

    if (shouldPlay == true) { // increment only shouldPlay=true. this means not incremented whe video is paused.
      this.vidState.vidPlayedSum = this.vidState.vidPlayedSum + (Date.now()/1000 - this.vidState.loopStartAt); // add increment time
    }
    console.log( '-- Interval: ', (Date.now()/1000 - this.vidState.loopStartAt).toFixed(2)  ); // this does not have any meaning, just to show how fast code runs.
    this.vidState.loopStartAt = Date.now()/1000;

    // console.log('time1a: ', Date.now() / 1000 - time1);

    console.log('iP_f, iP_lw, iP_rw, iP_la, iP_ra: ', iP_f, iP_lw, iP_rw, iP_la, iP_ra);



// ////////// to check if mobile devices is fixed & no move by Accelerometer
//     if (shouldPlay == true ) { // this runs only when video is playing after countdown until video ends
//       console.log('this.state.accelerometerData: ', this.state.accelerometerData);
//       if (this.prevAccelData.x == null || this.prevAccelData.y == null || this.prevAccelData.z == null) { // only 1st loop, Do assign only, 
//         this.prevAccelData.x = accelerometerData.x; // assign only
//         this.prevAccelData.y = accelerometerData.y; // assign only
//         this.prevAccelData.z = accelerometerData.z; // assign only
//       } else { // after 2nd loop
//         // console.log('accelerometerData move from previous x,y,z: ', Math.abs(this.prevAccelData.x - accelerometerData.x).toFixed(2), Math.abs(this.prevAccelData.y - accelerometerData.y).toFixed(2), Math.abs(this.prevAccelData.z - accelerometerData.z).toFixed(2),)
//         if ( Math.abs(this.prevAccelData.x - accelerometerData.x) > this.outCriteriaAccel.x || Math.abs(this.prevAccelData.y - accelerometerData.y) > this.outCriteriaAccel.y || Math.abs(this.prevAccelData.z - accelerometerData.z) > this.outCriteriaAccel.z) { // if any of x,y,z is out of criteria
//           this.cntOutAccel += 1; // increment
//           console.log('xxxxxxxxxx OutAccel, this.cntOutAccel: ', this.cntOutAccel);
//           if (this.cntOutAccel % 3 == 0) { // if divided by x == 0 , means it will alert when every X cntOutAccel.
//             console.log('Please fix and Do not move your device. this.cntOutAccel: ', this.cntOutAccel);
//             alert('Please fix and Do not move your device.');
//             this.setState( {outAccelFlag: true}); // to NOT to increment METS
//           }
//         } else {
//           if (outAccelFlag == true) {
//             this.setState( {outAccelFlag: false}); // to resume to increment METS
//             console.log('resume outAccelFlag')
//           }
//         }
//         this.prevAccelData.x = accelerometerData.x; // assign only
//         this.prevAccelData.y = accelerometerData.y; // assign only
//         this.prevAccelData.z = accelerometerData.z; // assign only        
//       }
//     } 

    // console.log('time1b: ', Date.now() / 1000 - time1);



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

                  {/* <View style={styles.trainerVideoContainer}> */}
                  {/* <View style={[ {zindex: 400 }, styles.trainerVideoContainer ]}> */}
                    {/* <WebView
                      ref={r => (this.webviewRef = r)}
                      source={{ uri: this.state.vidFullUrl }}
                      // style={[ {zindex: 400 }, styles.trainerVideo]} 
                      style={ styles.trainerVideo } 
                      onNavigationStateChange={this._vidDefault}
                    /> 
                  </View>  */}

                </View>

              :  

                <View style={{ height: '100%', width: '100%',}}>

                  {/* <View style={styles.trainerVideoContainer}>
                    <WebView
                      ref={r => (this.webviewRef = r)}
                      source={{ uri: this.state.vidFullUrl }}
                      style={ styles.trainerVideo } 
                      onNavigationStateChange={this._vidDefault}
                    /> 
                  </View>   */}

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


     
              <View style={styles.modelResults}>
                {this.renderPose()}
              </View>
            

              { flagAllPosOk && 
                <View style={styles.scoreContainer}>
                  { flagCountdownFinished ? 
                    <Text style={styles.scoreText}>
                      {scoreNow >= 100 ? parseInt(scoreNow).toFixed(0) : scoreNow } {/* Remove decimal when scoreNow is larger than X */}
                    </Text>
                  :
                    <Text style={styles.scoreText}>
                      {countdownTxt}
                    </Text>                    
                  }
                </View>
              }


              {/* { shouldPlay ?
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
              } */}

                 
              { flagAllPosOk && 
                <View style={[styles.upperLayerContainer, {
                  borderTopColor: this.ULBColor.top,
                  borderBottomColor: this.ULBColor.bottom,
                  borderLeftColor: this.ULBColor.left,
                  borderRightColor: this.ULBColor.right,
                  borderWidth: Dimensions.get('window').height * 0.03} ]}>
  
                  {/* <View style={[styles.progressBar, {width: this.state.progressBarWidth} ]}>
                  </View> */}
                </View>
              }
              {/* https://reactnativecode.com/set-padding-dynamically/https://reactnativecode.com/set-padding-dynamically/ */}
               

              { flagAllPosOk ?  
                null
              :
                <View style={styles.initialPostureContainer}>
                  <Image style={styles.initialPostureImage} source={require('../assets/initialPosture_310x310dotted.png')} /> 
                  {/* <Image style={styles.initialPostureImageBodyPart} source={require('../assets/iP_f_g.png')} /> */}

                  { iP_f ?
                    <Image style={styles.initialPostureImage} source={require('../assets/iP_f_g.png')} />
                  :
                    null
                  }

                  { iP_lw ?
                    <Image style={styles.initialPostureImage} source={require('../assets/iP_lw_g.png')} />
                  :
                    null
                  }

                  { iP_rw ?
                    <Image style={styles.initialPostureImage} source={require('../assets/iP_rw_g.png')} />
                  :
                    null
                  }

                  { iP_la ?
                    <Image style={styles.initialPostureImage} source={require('../assets/iP_la_g.png')} />
                  :
                    null
                  }

                  { iP_ra ?
                    <Image style={styles.initialPostureImage} source={require('../assets/iP_ra_g.png')} />
                  :
                    null
                  }
                </View>
              }

              { flagAllPosOk ?
                <View style={styles.attentionContainer}>
                  { outNTAFlag ?
                    <Text style={[styles.attentionText, {color: 'red'} ]}>
                      Step{"\n"}Back
                    </Text>
                  :
                    null
                  }

                  { outAccelFlag ?
                    <Text style={[styles.attentionText, {color: 'red'} ]}>
                      Fix{"\n"}Smartphone
                    </Text>                    
                  :
                    null
                  }
                </View>
              :
                <View style={styles.attentionContainer}>
                  <Text style={styles.attentionText}>
                    Fit{"\n"}Your Body
                  </Text>
                  {/* <Text style={styles.attentionTextRed}>
                    {!outOfIniPos ?
                      null
                    :
                      outOfIniPos + ' are Out' 
                    }
                  </Text> */}
                </View>
              }


              { flagAllPosOk ?
                // TEMPORARY DISPLAY METS. 20200823
                <View style={styles.metsContainer}>
                  <Text style={styles.metsText}>
                    { parseFloat(mdCumTtlNow).toFixed(1) }
                  </Text>
                </View>
              :
                <View style={styles.metsContainer}>
                  <Text style={styles.metsText}>
                    {!missingPos ?
                      null
                    :
                    　missingPos 
                    }
                  </Text>
                </View>
              }


              {/* { flagVidEnd && 
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
              } */}


              {/* Display octopusImage */}
              {/* { shouldPlay ?
                <View style={styles.octopusContainer}>
                  <Image style={[{ left: (this.camState.windowHeight * octopusLoc.xRW) - (this.camState.windowWidth * octopusImageSizePct/2 ), top: (this.camState.windowWidth * octopusLoc.yRW) - (this.camState.windowWidth * octopusImageSizePct/2 ) }, styles.octopusImage]} source={require('../assets/rWrist.png')} />
                  <Image style={[{ left: (this.camState.windowHeight * octopusLoc.xLW) - (this.camState.windowWidth * octopusImageSizePct/2 ), top: (this.camState.windowWidth * octopusLoc.yLW) - (this.camState.windowWidth * octopusImageSizePct/2 ) }, styles.octopusImage]} source={require('../assets/lWrist.png')} />
                  <Image style={[{ left: (this.camState.windowHeight * octopusLoc.xRA) - (this.camState.windowWidth * octopusImageSizePct/2 ), top: (this.camState.windowWidth * octopusLoc.yRA) - (this.camState.windowWidth * octopusImageSizePct/2 ) }, styles.octopusImage]} source={require('../assets/rAnkle.png')} />
                  <Image style={[{ left: (this.camState.windowHeight * octopusLoc.xLA) - (this.camState.windowWidth * octopusImageSizePct/2 ), top: (this.camState.windowWidth * octopusLoc.yLA) - (this.camState.windowWidth * octopusImageSizePct/2 ) }, styles.octopusImage]} source={require('../assets/lAnkle.png')} />
                </View>
              :
                null
              }   */}


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
    top: 0, //StatusBar.currentHeight,
    height: Dimensions.get('screen').width, // when Landscape 
    width: Dimensions.get('screen').height, // when Landscape 
    // height: Dimensions.get('screen').height, // when Portrait 
    // width: Dimensions.get('screen').width, // when Portrait     
    position: 'absolute',
    flex: 0,
    // zindex: 0, // 20200531
    // borderColor: 'green',
    // borderWidth: 1,
  },
  layerOneContainer: {
    // backgroundColor: 'blue',
    opacity: 1, // to see through trainerVideo 20200530
    height: Dimensions.get('screen').width, // when Landscape 
    width: Dimensions.get('screen').height, // when Landscape 
    // height: Dimensions.get('screen').height, // when Portrait 
    // width: Dimensions.get('screen').width, // when Portrait 
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
    top: Dimensions.get('window').width * 0.07, // when Landscape
    right: Dimensions.get('window').height * 0.12, // when Landscape
    height: Dimensions.get('window').width * 0.24, // when Landscape
    width: Dimensions.get('window').height * 0.26, // when Landscape
    // top: Dimensions.get('window').width * 0.08, // when Portrait
    // right: Dimensions.get('window').height * 0.02, // when Portrait
    // height: Dimensions.get('window').width * 0.22, // when Portrait
    // width: Dimensions.get('window').height * 0.21, // when Portrait    
    backgroundColor: 'rgba(20, 20, 20, 0.7)', // darkgray seethrough background
    borderRadius: 5,  
    justifyContent: 'center',
  },
  scoreText:{
    // alignItems: 'center',
    // justifyContent: 'center',
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'right',
    textShadowColor: 'black',
    textShadowRadius: 10,
    color: '#ffa500',
    textAlignVertical: 'center',
    paddingRight: 5,
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
    // flexGrow:1,
    position: 'absolute',
    bottom: 0,
    width: '100%', //Dimensions.get('window').width * 1,
    alignItems: 'center',
    justifyContent: 'center',
    // left: Dimensions.get('window').width / 2 - 310 / 2,
    // borderColor: 'blue',
    // borderWidth: 1,
  },
  initialPostureImage: {
    position: 'absolute',
    left: Dimensions.get('window').height / 2 - 310 / 2, // when Landscape //  centering the image in consideration with android navigation bar. 20200816 
    width: Dimensions.get('window').width * 0.95, // when Landscape // photo size = 475*310
    height: Dimensions.get('window').width * 0.95, // when Landscape
    bottom: Dimensions.get('window').width * 0.05, // when Landscape
    // left: Dimensions.get('window').width / 2 - 310 / 2, // when Portrait
    // width: Dimensions.get('window').width, // when Portrait
    // height: Dimensions.get('window').width * 370/310, // when Portrait
    // bottom: Dimensions.get('window').height * 0.1, // when Portrait
    // justifyContent: 'center',
    // borderColor: 'green',
    // borderWidth: 6,
  }, 

  attentionContainer: {
    // zIndex: 301, // removed 20200531
    // flex: 1,
    flexGrow:1,
    position: 'absolute',
    top: Dimensions.get('window').width * 0.25, // when Landscape 
    left: Dimensions.get('window').height * 0.02, // when Landscape 
    // top: Dimensions.get('window').height * 0.13, // when Portrait 
    // left: Dimensions.get('window').width * 0.04, // when Portrait 
    // width: Dimensions.get('window').width * 0.9,
    // height: null,
    // width: null,    
    alignItems: 'center',
    justifyContent: 'center',   
    // marginHorizontal: Dimensions.get('window').width * 0.2,
    backgroundColor: 'rgba(20, 20, 20, 0.7)', 
    borderRadius: 10,
    // borderColor: 'pink',
    // borderWidth: 1,    
  },
  attentionText: {
    // textShadowColor: 'black',
    // textShadowRadius: 5,
    fontSize: 38,
    color: '#ffa500',
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    // backgroundColor: 'rgba(220, 220, 220, 0.7)', 
  },
  attentionTextRed: {
    // textShadowColor: 'black',
    // textShadowRadius: 5,
    fontSize: 28,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    // backgroundColor: 'rgba(220, 220, 220, 0.7)', 
  },  

  metsContainer: {
    // zIndex: 301, // removed 20200531
    // flex: 1,
    flexGrow:1,
    position: 'absolute',
    bottom: Dimensions.get('window').width * 0.02, // when Landscape 
    left: Dimensions.get('window').height * 0.02, // when Landscape 
    // bottom: Dimensions.get('window').height * 0.13, // when Portrait 
    // left: Dimensions.get('window').width * 0.04, // when Portrait 
    // width: Dimensions.get('window').width * 0.9,
    // height: null,
    // width: null,    
    alignItems: 'center',
    justifyContent: 'center',   
    // marginHorizontal: Dimensions.get('window').width * 0.2,
    backgroundColor: 'rgba(20, 20, 20, 0.7)', 
    borderRadius: 10,
    // borderColor: 'pink',
    // borderWidth: 1,    
  },
  metsText: {
    // textShadowColor: 'black',
    // textShadowRadius: 5,
    fontSize: 30,
    color: '#ffa500',
    textAlign: 'center',
    paddingHorizontal: 5,
    paddingVertical: 5,
    // backgroundColor: 'rgba(220, 220, 220, 0.7)', 
  },

  // octopusContainer: {
  //   // flexGrow:1,
  //   flex: 0,
  //   position: 'absolute',
  //   bottom: 0,
  //   width: '100%', //Dimensions.get('window').width * 1,
  //   height: '100%',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   // borderColor: 'green',
  //   // borderWidth: 3,
  // },
  // octopusImage: {
  //   position: 'absolute',
  //   // width: Dimensions.get('window').width * 1 / ttlCH * 1.5,
  //   // height: Dimensions.get('window').width * 1 / ttlCH * 1.5,
  //   height: Dimensions.get('window').width * octopusImageSizePct,
  //   width: Dimensions.get('window').width * octopusImageSizePct,  
  // },


  upperLayerContainer: {
    position: 'absolute',
    top: 0, //StatusBar.currentHeight,
    height: Dimensions.get('window').width, // when Landscape // - StatusBar.currentHeight, // Dynamically get & summate screen height & statusbar height.
    width: Dimensions.get('window').height, // when Landscape // - StatusBar.currentHeight,
    // height: Dimensions.get('window').height, // when Portrait
    // width: Dimensions.get('window').width, // when Portrait
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
    flexGrow: 1,
    height: null,
    width: null,    
    alignItems: 'center',
    justifyContent: 'center',    
    // zIndex: 500, // removed 20200531
  },

  goBackIconContainer: {
    // marginTop: 10,
    // marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',   
    backgroundColor: 'rgba(20, 20, 20, 0.7)', // 'rgba(220, 220, 220, 0.5)'
    position: 'absolute',
    top: Dimensions.get('window').width * 0.07, // when Landscape
    left: Dimensions.get('window').height * 0.02, // when Landscape
    // top: Dimensions.get('window').height * 0.04, // when Portrait
    // left: Dimensions.get('window').width * 0.04, // when Portrait
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