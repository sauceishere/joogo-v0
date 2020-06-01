
import * as React from 'react';
import { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// import { Constants, FileSystem } from 'expo';
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
import * as firebase from 'firebase';
// import 'react-native-get-random-values'; // https://www.npmjs.com/package/uuid#getrandomvalues-not-supported 20200429
import { v4 as uuidv4 } from 'uuid';

// import * as RNFS from 'react-native-fs';

import { activateKeepAwake } from 'expo-keep-awake'; //https://docs.expo.io/versions/latest/sdk/keep-awake/


import { Constants, Accelerometer } from 'expo-sensors'; // https://docs.expo.io/versions/latest/sdk/accelerometer/ # https://snack.expo.io/@professorxii/expo-accelerometer-example



export default class NotificationScreen extends React.Component {

  
  
  constructor(){
    super();
    this.state = {
      savedFileName: null,
      vidViewLogFileName: null,
      // time: '',
      // readContents: '',

      flagAccelerometerIsAvailable: false,
      accelerometerData: { x: 0, y: 0, z: 0 },
    }
    
  }
  
  
  vidViewLogDirName = 'VIDVIEWDLOGS';
  // exerLogDirName = 'EXERLOGS';
  

  outStdAccel = { // if accelerometerData is over this criteria, then count up cntOutAccel  
    x: 0.1,
    y: 0.1,
    z: 0.1,
  };

  prevAccelData = {
    x: null,
    y: null,
    z: null,    
  };

  cntOutAccel = 0; // count up if over outStdAccel
  

  _subscribeToAccelerometer = () => {
    this._subscription = Accelerometer.addListener(
      // setData(accelerometerData);
      accelerometerData => this.setState({ accelerometerData })      
    );
    Accelerometer.setUpdateInterval(1 * 1000); // update very X miliseconds

  };

  _unsubscribeFromAccelerometer = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };



  async componentDidMount(){
    console.log('------------- componentDidMount Notification started')
    this.curDir = FileSystem.documentDirectory; // get root directory
    console.log('this.curDir: ', this.curDir);
    
    // useKeepAwake();
    activateKeepAwake();


    await Accelerometer.isAvailableAsync()
      .then( () => {
        console.log('----------- AccelerometerIsAvailable');
        this.setState({ flagAccelerometerIsAvailable: true }); 
        this._subscribeToAccelerometer();
      }).catch(error => {
        console.log('AccelerometerIs NOT Available: ', error);
      });

    

    // // Delete Directory
    // FileSystem.deleteAsync( this.curDir +  this.vidViewLogDirName ).then( (ls) => {
    //   console.log('Directory Deleted: ', ls);
    // }).catch(error => {
    //   console.log('error: ', error);
    // });


    // FileSystem.getInfoAsync( this.curDir + this.vidViewLogDirName ).then( (contents) => {
    //   console.log('getInfoAsync contents: ', contents);
    // }).catch(error => {
    //   console.log('getInfoAsync error: ', error);
    // });


    try {
      this.directories = await FileSystem.readDirectoryAsync( this.curDir );

      // // check if vidViewLogDirName Directory already exists, if not then create directory
      if ( this.directories.includes( this.vidViewLogDirName ) ) {
        console.log('vidViewLogDirName Directory already exists.'); // Do nothing because the directory already exists  

        FileSystem.readDirectoryAsync( this.curDir + this.vidViewLogDirName ).then( content => {
          console.log('vidViewLogDirName localFiles: ', content); // how many localFiles in array
        });

        // FileSystem.readAsStringAsync( this.curDir + this.vidViewLogDirName ).then( content => {
        //   console.log('readAsStringAsync: ', content);
        // })

      } else {  
        FileSystem.makeDirectoryAsync(this.curDir + this.vidViewLogDirName); // create the directory
        console.log('vidViewLogDirName Directory created');
      }


      // // check if exerLogDirName Directory already exists, if not then create directory
      // if ( this.directories.includes( this.exerLogDirName ) ) {
      //   console.log('exerLogDirName Directory already exists.'); // Do nothing because the directory already exists  

      //   FileSystem.readDirectoryAsync( this.curDir + this.exerLogDirName ).then( content => {
      //     console.log('exerLogDirName localFiles: ', content); // how many localFiles in array
      //   });

      // } else {  
      //   FileSystem.makeDirectoryAsync(this.curDir + this.exerLogDirName); // create the directory
      //   console.log('exerLogDirName Directory created');
      // }      


    } catch (err) {
      // this.directories = []; // create empty array,
      console.log('err: ', err)
    }


  }




  async componentWillUnmount() {
    console.log('----------- componentWillUnmount Notification');
    deactivateKeepAwake();
    this._unsubscribeFromAccelerometer();
  }




  async _savefile(){
    console.log('----------- _savefile: ', Date.now() / 1000);
    // const date = new Date();
    // console.log('date: ', date);
    const ts = Date.now() / 1000; // unix // date.getTime().toString();
    // console.log('ts: ', ts);
    const vidId = 'vidIdididii';
    const viewId = uuidv4();
    const vidViewLogFileName = ts + '_' + vidId + '_' + viewId;
    const exerLogFileName = ts + '_' + viewId;

    var jsonContents = {};
    jsonContents["ts"] = ts;
    jsonContents["vidId"] = vidId;
    jsonContents["viewId"] = viewId;
    jsonContents["uid"] = firebase.auth().currentUser.uid;
    jsonContents = JSON.stringify(jsonContents); // convert to string for saving file
    // console.log('jsonContents: ', jsonContents);

    // vidViewLog for Firestore
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + this.vidViewLogDirName + '/' + vidViewLogFileName + '.json', 
      jsonContents,
      ).then( () => {
        console.log('----------- vidViewLog saved: ', jsonContents);
        this.setState({ savedFileName: vidViewLogFileName }); 
      }).catch(error => {
        console.log('vidViewLog error: ', error);
      });

    // exerciseLog for Firebase Storage
    // await FileSystem.writeAsStringAsync(
    //   FileSystem.documentDirectory + this.exerLogDirName + '/' + exerLogFileName + '.json', 
    //   jsonContents,
    //   ).then( () => {
    //     console.log('----------- exerLog saved: ', jsonContents);
    //     // this.setState({ savedFileName: exerLogFileName }); 
    //   }).catch(error => {
    //     console.log('exerLog error: ', error);
    //   });

  } 




  async _sendfile(){
    console.log('----------- _sendfile: ', Date.now() /1000 );
    this.cntSentVidViewLog = 0; // to count how many cntSentVidViewLog files successfully sent out
    // this.cntSentExerViewLog = 0; // to count how many cntSentExerViewLog files successfully sent out
    

    // // Upload vidViewLog to Firestore
    try {
      if ( FileSystem.readDirectoryAsync( this.curDir  + this.vidViewLogDirName) ) {

        await FileSystem.readDirectoryAsync( this.curDir + this.vidViewLogDirName ).then( localFilesArray => {
          this.localFiles = localFilesArray;
          // console.log('localFilesArray: ', localFilesArray); // how many localFiles in array
        })
        console.log('----- len this.localFiles: ', this.localFiles.length);

        if (this.localFiles.length > 0){
          this.localFiles.forEach( async (Localfile, num_file) => { // loop files
            console.log('num_file: ', num_file);
            
            // read local file
            FileSystem.readAsStringAsync( this.curDir  + this.vidViewLogDirName + '/' + Localfile).then( localFileContents => {
              // console.log( 'localFileContents: ', localFileContents);

              // Send to Firestore
              firebase.firestore().collection("users").doc( firebase.auth().currentUser.uid ).collection("vidViewed").doc( Localfile ).set({
                ts: JSON.parse(localFileContents)["ts"],
                vidId: JSON.parse(localFileContents)["vidId"],
                viewId: JSON.parse(localFileContents)["viewId"],  
                uid: firebase.auth().currentUser.uid ,         
                sendId: uuidv4(),
              }).then( () => {
                this.setState({ vidViewLogFileName: Localfile }); 

                //Delete a file in the LOCAL directory
                FileSystem.deleteAsync( this.curDir + this.vidViewLogDirName + '/' + Localfile).then( () => {
                  console.log('Localfile Deleted: ', Localfile);
                })

                this.cntSentVidViewLog++; // count increment
              }).catch( (error) => {
                console.error("Error uploading document: ", error);
              });

            });

          });

        } else {
          console.log('No files in the directory.'); // Do nothing since no files to be sent to Firebase
        };
        
      } else {  
        console.log('No directory.'); // This is a very rare case
      }
    } catch (err) {
      // this.directories = []; // create empty array,
      console.log('err: ', err)
    }

    console.log('----- this.cntSentVidViewLog: ', this.cntSentVidViewLog);




    // // Upload cntSentExerViewLog to Firebase Storage
    // try {
    //   if ( FileSystem.readDirectoryAsync( this.curDir  + this.vidViewLogDirName) ) {

    //     await FileSystem.readDirectoryAsync( this.curDir + this.vidViewLogDirName ).then( localFilesArray => {
    //       this.localFiles = localFilesArray;
    //       // console.log('localFilesArray: ', localFilesArray); // how many localFiles in array
    //     })
    //     console.log('----- len this.localFiles: ', this.localFiles.length);

    //     if (this.localFiles.length > 0){
    //       this.localFiles.forEach( async (Localfile, num_file) => { // loop files
    //         console.log('num_file: ', num_file);

    //         // upload to Storage
    //         const storage= firebase.storage(); // https://firebase.google.com/docs/storage/web/start?hl=ja
    //         const storageRef = storage.ref(); // Create a reference to the file we want to download
            
    //         ////////////////////////////////////////////
    //         // そもそもStoreとStorageの２箇所にアップロード必要なのか？ // 
    //         // 参照元のURLからファイルでアップロードできるか？ //

    //         // read local file
    //         // FileSystem.readAsStringAsync( this.curDir  + this.vidViewLogDirName + '/' + Localfile).then( localFileContents => {
    //         //   // console.log( 'localFileContents: ', localFileContents);

    //         //   // Send to Firestore
    //         //   firebase.firestore().collection("users").doc( firebase.auth().currentUser.uid ).collection("vidViewed").doc( Localfile ).set({
    //         //     ts: JSON.parse(localFileContents)["ts"],
    //         //     vidId: JSON.parse(localFileContents)["vidId"],
    //         //     viewId: JSON.parse(localFileContents)["viewId"],  
    //         //     uid: firebase.auth().currentUser.uid ,         
    //         //     sendId: uuidv4(),
    //         //   }).then( () => {
    //         //     this.setState({ vidViewLogFileName: Localfile }); 

    //         //     //Delete a file in the LOCAL directory
    //         //     FileSystem.deleteAsync( this.curDir + this.vidViewLogDirName + '/' + Localfile).then( () => {
    //         //       console.log('Localfile Deleted: ', Localfile);
    //         //     })

    //         //     this.cntSentExerViewLog++; // count increment
    //         //   }).catch( (error) => {
    //         //     console.error("Error uploading document: ", error);
    //         //   });

    //         // });

    //       });

    //     } else {
    //       console.log('No files in the directory.'); // Do nothing since no files to be sent to Firebase
    //     };
        
    //   } else {  
    //     console.log('No directory.'); // This is a very rare case
    //   }
    // } catch (err) {
    //   // this.directories = []; // create empty array,
    //   console.log('err: ', err)
    // }

    // console.log('----- this.cntSentExerViewLog: ', this.cntSentExerViewLog);    


  }   
  




  render() {
    // console.log('this.state.accelerometerData: ', this.state.accelerometerData);

    const {accelerometerData} = this.state

    if (this.prevAccelData.x == null || this.prevAccelData.y == null || this.prevAccelData.z == null) { // only 1st loop, Do assign only, 
      this.prevAccelData.x = accelerometerData.x; // assign only
      this.prevAccelData.y = accelerometerData.y; // assign only
      this.prevAccelData.z = accelerometerData.z; // assign only
    } else {
      console.log('Diff from Previous x,y,z: ', Math.abs(this.prevAccelData.x - accelerometerData.x).toFixed(2), Math.abs(this.prevAccelData.y - accelerometerData.y).toFixed(2), Math.abs(this.prevAccelData.z - accelerometerData.z).toFixed(2),)
      if ( Math.abs(this.prevAccelData.x - accelerometerData.x) > this.outStdAccel.x || Math.abs(this.prevAccelData.y - accelerometerData.y) > this.outStdAccel.y || Math.abs(this.prevAccelData.z - accelerometerData.z) > this.outStdAccel.z) {
        console.log('OutAccel');
        this.cntOutAccel++; // increment
        if (this.cntOutAccel % 5 == 0) { // if divided by x == 0 
          console.log('Please fix and Do not move your device. this.cntOutAccel: ', this.cntOutAccel);
          alert('Please fix and Do not move your device.');
        }
      }
      this.prevAccelData.x = accelerometerData.x; // assign only
      this.prevAccelData.y = accelerometerData.y; // assign only
      this.prevAccelData.z = accelerometerData.z; // assign only        
    }


    return (
      <View style={styles.container}>
      

        <TouchableOpacity onPress={() => this._savefile()}>
          <Text style={styles.button}>Save</Text>
        </TouchableOpacity> 

        <Text style={styles.paragraph}>
          Saved file: {this.state.savedFileName}
        </Text>


        {/* <TouchableOpacity onPress={() => this._readfile()}>
          <Text style={styles.button}>Read</Text>
        </TouchableOpacity> 

        <Text style={styles.paragraph}>
          Read file: {this.state.readContents}
        </Text> */}


        <TouchableOpacity onPress={() => this._sendfile()}>
          <Text style={styles.button}>Send</Text>
        </TouchableOpacity> 

        <Text style={styles.paragraph}>
          sent file: {this.state.vidViewLogFileName}
        </Text>


        <Text style={styles.paragraph}>
            x = {this.state.accelerometerData.x.toFixed(2)}
            {', '}y = {this.state.accelerometerData.y.toFixed(2)}
            {', '}z = {this.state.accelerometerData.z.toFixed(2)}
        </Text>


      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    backgroundColor: '#ecf0f1',
  },
  button :{
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    // fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});











// import * as React from 'react';
// import { Component, useState, useEffect } from 'react';
// import { StyleSheet, SafeAreaView, ScrollView, View } from 'react-native';
// // import HTML from 'react-native-render-html'; // npm install react-native-render-html
// // import {screen} from '../routes/homeStack';  // for navigation
// // import { Camera } from 'expo-camera';
// import * as tf from '@tensorflow/tfjs';
// import * as posenet from '@tensorflow-models/posenet';
// import { cameraWithTensors } from '@tensorflow/tfjs-react-native'; // https://js.tensorflow.org/api_react_native/latest/#cameraWithTensors
// import * as Permissions from 'expo-permissions';


// const htmlContent = `
//   <h1>NotificationScreen!</h1>
// `;



// export default class Notification extends React.Component {

//   inputTensorHeight = 200;
//   inputTensorWidth = 152;

// // export default function App() {
// //   const [hasPermission, setHasPermission] = useState(null);
// //   const [type, setType] = useState(Camera.Constants.Type.front);

// //   useEffect(() => {
// //     (async () => {
// //       const { status } = await Camera.requestPermissionsAsync();
// //       setHasPermission(status === 'granted');
// //     })();
// //   }, []);

// //   if (hasPermission === null) {
// //     return <View />;
// //   }
// //   if (hasPermission === false) {
// //     return <Text>No access to camera</Text>;
// //   }


//   componentWillUnmount() {
//       console.log('-------------------       componentWillUnmount');  
//   }

//   async componentDidMount() {
//     console.log('--------- componentDidMount');    
  

//     await tf.setBackend().then( ref => {
//       console.log('--------- tf.setBackend');
//     }).catch(function(error) {
//       // alert('Error tf.setBackend(): ', error.code);
//       console.log('Error tf.setBackend(): ', error);
//       console.log('Error.code tf.setBackend(): ', error.code);
//     });   


//     // await tf.ready().then( ref => {
//     //   console.log('--------- tf.ready');
//     // }).catch(function(error) {
//     //   // alert('Error tf.ready(): ', error.code);
//     //   console.log('Error tf.ready(): ', error);
//     //   console.log('Error.code tf.ready(): ', error.code);
//     // });   
    

//     const { status } = await Permissions.askAsync(Permissions.CAMERA);
//     console.log('--------- Permissions.askAsync(Permissions.CAMERA)');
  

//     console.log('--------- loading posenet now');
//     const posenetModel =  await posenet.load({ // https://github.com/tensorflow/tfjs-models/tree/master/posenet
//       architecture: 'MobileNetV1',
//       outputStride: 16, // 16
//       inputResolution: { width: this.inputTensorWidth, height: this.inputTensorHeight },
//       multiplier: 0.75, // 0.75
//       quantBytes: 2 // 2
//     }).then( ref => {
//       console.log('--------- posenet loaded.');
//     }).catch(function(error) {
//       // alert('Error posenet.load: ', error.code);
//       console.log('Error posenet.load: ', error);
//     });   
    


//     console.log('--------- here.');
  
//   }


//   render() {
//     return (
//       <View style={{ flex: 1, backgroundColor: 'green' }}>
//         {/* <Camera style={{ flex: 1 }} type={type}>
//           <View
//             style={{
//               flex: 1,
//               backgroundColor: 'transparent',
//               flexDirection: 'row',
//             }}>
//           </View>
//         </Camera> */}
//       </View>
//     );
//   }


// }