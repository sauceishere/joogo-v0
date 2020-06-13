import * as React from 'react';
import { Component, useState } from 'react';
import { StyleSheet, SafeAreaView, Image, View, ScrollView, Text, TouchableOpacity, TextInput, Button, Dimensions, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Modal } from 'react-native';
import * as firebase from 'firebase';
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuidv4 } from 'uuid';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/


export default class PostScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: firebase.auth().currentUser.uid,
      text: null,
      rawImage: null, // _pickImage uri
      rawImageWidth: null,
      rawImageHeight: null,
      rawImageDur: null,
      rawImageSize: null,
      compressedImage: null, // video uri after compressed 
      imageTn: null, // thumbsnail
      isUploading: false,
      allComplete: false, 
    };
  }

  maxRawImageSize = 300 * 1024 * 1024; // 300 MB in byte
  maxRawImageDur = 5 * 60 * 1000; // 5 minutes in milisecond

  TnTargetSize = 256 * 144; // 480 * 270; // 640 * 360; // 256 * 144; // 1920 * 1080// 1280 * 720, 854 * 480
  TnCompRate = null;
  vidId = uuidv4();
  

  componentDidMount() {
    console.log('------------- componentDidMount Post started 1.');
    console.log('this.vidId: ', this.vidId);
  }


  componentWillUnmount() {
    console.log('------------- componentWillUnmount Post.');
  }


  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ // https://docs.expo.io/versions/latest/sdk/imagepicker/#imagepickermediatypeoptions
      mediaTypes: ImagePicker.MediaTypeOptions.Videos, 
      allowsEditing: true,
      aspect: [9, 16], // [3,4]
      quality: 1,
    });
    if (!result.cancelled) {

      FileSystem.getInfoAsync( result.uri ).then( (contents) => {
        console.log('getInfoAsync contents: ', contents);
        this.setState({ rawImageSize : contents.size });
      }).catch(error => {
        console.log('getInfoAsync error: ', error);
      });

      this.setState({ rawImage: result.uri, rawImageWidth: result.width, rawImageHeight: result.height, rawImageDur: result.duration });
      console.log('_pickImage result: ', result);
    } else {
      alert('Failed to pick Video. Please try again.');
    }
  };


  // https://medium.com/@joananespina/uploading-to-firebase-storage-with-react-native-39f4a500dbcb
  _uriToBlobVid = (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        // return the blob
        resolve(xhr.response);
        console.log('_uriToBlobVid completed');
      };
      xhr.onerror = function() {
        // something went wrong
        reject(new Error('uriToBlobVid failed'));
      };
      // this helps us get a blob
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }


  _uploadVidMetaRawToFirestore = () => {
    
    return new Promise((resolve, reject)=>{
      firebase.firestore().collection("vidMetaRaw").doc(this.vidId).set({
        TITLE: this.state.text,
        UID: firebase.auth().currentUser.uid,
        TS: Date.now() / 1000, // unix
        VIDID: this.vidId,
        // VIDEXT: '.' + vidExt,
        // TNEXT: '.' + tnExt,
      }).then((ref)=>{
        resolve(ref);
        console.log('_uploadVidMetaRawToFirestore completed');
      }).catch((error)=>{
        console.log('_uploadVidMetaRawToFirestore error xxxxx ', error);
        reject(error);
      });
    });   
     
  }  


  // Video to Firebase Storage as Blob
  _uploadVidToStorage = (blob) => {
    return new Promise((resolve, reject)=>{
      var storageRef = firebase.storage().ref();
      // storageRef.child('finvid/' + this.vidId + '.mp4').put(blob, {
      storageRef.child('finvid/' + this.vidId ).put(blob, {
        contentType: 'video/mp4'
      }).then((snapshot)=>{
        blob.close();
        resolve(snapshot);
        console.log('_uploadVidToStorage completed');
      }).catch((error)=>{
        console.log('_uploadVidToStorage error xxxxx ', error);
        reject(error);
      });
    });
  }   


  // https://docs.expo.io/versions/latest/sdk/video-thumbnails/
  _generateThumbnail = async () => {
    try {
      // Calculate compress rate for Thumbsnail photo. 20200418
      if ( this.state.rawImageHeight * this.state.rawImageWidth > this.TnTargetSize) {
        this.TnCompRate =  this.TnTargetSize / ( this.state.rawImageHeight * this.state.rawImageWidth );
      } else {
        this.TnCompRate = 1;
      }
      console.log('this.TnCompRate: ', this.TnCompRate);

      const { uri } = await VideoThumbnails.getThumbnailAsync(
        // 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
        this.state.rawImage,
        {
          compress: this.TnCompRate, // compress rate 0 to 1
          time: 2000, // The time position where the image will be retrieved in ms
        }
      );
      this.setState({ imageTn: uri });
      console.log('_generateThumbnail completed:, ', this.state.imageTn);
    } catch (error) {
      alert('_generateThumbnail error xxxxx ', error);
      console.warn(error);
    }
  };


  // https://medium.com/@joananespina/uploading-to-firebase-storage-with-react-native-39f4a500dbcb
  _uriToBlobVidTn = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        // return the blob
        resolve(xhr.response);
        console.log('_uriToBlobVidTn completed');
      };
      xhr.onerror = function() {
        // something went wrong
        reject(new Error('uriToBlobVidTn failed'));
      };
      // this helps us get a blob
      xhr.responseType = 'blob';
      xhr.open('GET', this.state.imageTn, true);
      xhr.send(null);
    });
  }  


  // Thumbsnail to Firebase Storage
  _uploadTNToStorage = (blob) => {
    return new Promise((resolve, reject)=>{
      var storageRef = firebase.storage().ref();
      // storageRef.child('tn/' + this.vidId + '.jpg').put(blob, {
      storageRef.child('tn/' + this.vidId ).put(blob, {
        contentType: 'image/jpeg'
      }).then((snapshot)=>{
        blob.close();
        resolve(snapshot);
        console.log('_uploadTNToStorage completed');
      }).catch((error)=>{
        console.log('_uploadTNToStorage error xxxxx ', error);
        reject(error);
      });
    });
  }  
  
  
  _handlePost = async() => {
    console.log('this.state: ', this.state);
    // console.log('this.state.text: ', typeof(this.state.text) );

    const _goBackToHome = () => {
      console.log('Go back to Home');
      this.setState({ allComplete: false}); // remove modal 
      this.props.navigation.goBack();
    };
    
    if (this.state.rawImage && this.state.text && this.state.rawImageSize < this.maxRawImageSize && this.state.rawImageDur < this.maxRawImageDur ) { // if image and text exists
      this.setState({ isUploading: true });

      // For thumbsnail
      await this._generateThumbnail();  
      this._uriToBlobVidTn().then((blob)=>{
        return this._uploadTNToStorage(blob);
      }).then((snapshot)=>{
        console.log("_handlePost Thumbsnail completed");
        this.setState({ allComplete: true, isUploading: false });
      }).catch((error)=>{
        console.log("_handlePost Thumbsnail error xxxxx ", error);
        throw error;
      });    


      // For Video
      // this._compressVideo();
      await this._uriToBlobVid(this.state.rawImage).then((blob)=>{
        this._uploadVidMetaRawToFirestore();
        return this._uploadVidToStorage(blob);
      }).then((snapshot)=>{
        console.log("_handlePost Video completed");
        this.setState({ allComplete: true, isUploading: false });
      }).catch((error)=>{
        console.log("_handlePost Video error xxxxx ", error);
        throw error;
      });      


      ////// set timer X secconds and then back to dashboard
      var countSec = 0;
      var countup = function(){
        console.log(countSec++);
        _goBackToHome(); // back to dashboard
      } 
      setTimeout(countup, 3 * 1000); // milliseconds

    } else {
      if (!this.state.text) {
        console.log('Please fill out Video title.');
        alert('Please fill out Video title.');
      } else if (!this.state.rawImage) {
        console.log('Please pick a Video.');
        alert('Please pick a Video.');
      } else if (this.state.rawImageSize >= this.maxRawImageSize && this.state.rawImageDur >= this.maxRawImageDur) {
        console.log('Your video is too long & too big. Please reduce video length & file size.');  
        alert('Your video is too long & too big. Please reduce video length & size.'); 
      } else if (this.state.rawImageSize >= this.maxRawImageSize) {
        console.log('Your video size is too big. Please reduce video file size.');  
        alert('Your video size is too big. Please reduce video file size.');  
      } else if (this.state.rawImageDur >= this.maxRawImageDur) {
        console.log('Your video is too long. Please reduce video length.');  
        alert('Your video is too long. Please reduce video length.');         
      } else {
        console.log('Error: unknown error _handlePost.');
        alert('Error: unknown error _handlePost.');
      }
    }

  
  };

 

  render() {
    const { rawImage, compressedImage, imageTn, isUploading, allComplete } = this.state;

    return (

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> 
        <SafeAreaView style={styles.container}>

          <Modal visible={allComplete} animationType='fade' transparent={true}>
            <View style={styles.modal}>
              <Text style={styles.postedText}>
                Thank you for posting!{"\n"}We will notify you once your video is ready.{"\n"}
              </Text>
            </View>
          </Modal>

          <View style={styles.inputContainer}>
            {/* <Image source={require("../assets/tempAvatar.jpg")} style={styles.avatar}></Image> */}
            <View>
              <Text style={styles.videoTitleTitle}>1 -> Fill out Video Title (Max 50 charactors)</Text>
            </View>

            <View style={{ marginTop: Dimensions.get('window').height * 0.01,  height: Dimensions.get('window').height * 0.1}}>
              <TextInput
                // autoFocus={true}
                multiline={true}
                numberOfLines={2}
                maxLength={50}
                style={{ flex: 1, backgroundColor: 'white',borderWidth: 1, borderColor: 'lightgray', borderRadius: 5, padding: 10, textAlignVertical: 'top'}}
                placeholder="e.g. Move your legs up and down"
                onChangeText={text => this.setState({ text })}
                value={this.state.text}
              >
              </TextInput>
            </View>

            <View>
              <Text style={styles.videoTitleTitle}>2 -> Pick a Video (Max size: 300MB, length: 5min) </Text>
            </View>

            <View>
              <TouchableOpacity style={styles.pickImage} onPress={this._pickImage}>
                  <Ionicons name="md-camera" size={50} color="gray"></Ionicons>
              </TouchableOpacity>
            </View>

            <View style={styles.showImage}>
                <Image source={{ uri: this.state.rawImage }} style={{ width: Dimensions.get('window').height * 0.35 * 9/16, height: Dimensions.get('window').height * 0.35, borderRadius: 5 }}></Image>
            </View>



            { allComplete ?
              <View style={styles.uploadingIndicator}>
                {/* <Text style={{color: '#ffa500', fontSize: 20, fontWeight: 'bold', textAlign: 'center'}}>
                  Thank you for posting!{"\n"}We will notify you once your video is ready.
                </Text> */}
              </View>  
            :
              <View>
                {isUploading ?
                  <View style={styles.uploadingIndicator}>
                    {/* { imageTn && <Image source={{ uri: imageTn }} style={{ width: 200, height: 200 }} />}
                    <Text>{ imageTn }</Text> */}
                    <ActivityIndicator size='large' color='#ffa500' />
                    <Text>Uploading....</Text>
                  </View>
                :
                  <View style={{width: '100%', marginTop: Dimensions.get('window').height * 0.03, marginBottom: Dimensions.get('window').height * 0.03,}}>
                    <TouchableOpacity onPress={this._handlePost} style={styles.postButton} >
                      <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold',}}> Post </Text>
                    </TouchableOpacity>
                  </View>
                }
              </View>
            } 



          </View>

        </SafeAreaView>
      </TouchableWithoutFeedback>  
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    marginHorizontal: Dimensions.get('window').width * 0.05,
    flexDirection: "column",
    justifyContent: 'flex-start'
  },
  videoTitleTitle: {
    marginTop: Dimensions.get('window').height * 0.03,
    color: 'gray',
    fontSize: 15,
    //fontWeight: 'bold',
  }, 
  pickImage: {
    alignItems: "center",
    marginVertical: Dimensions.get('window').height * 0.02,
  },
  showImage: {
    // marginVertical: Dimensions.get('window').height * 0.05, 
    height: Dimensions.get('window').height * 0.35,
    alignItems: "center",
  },
  postButton: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',    
    backgroundColor: '#ffa500',
    // width: Dimensions.get('window').width * 0.7,
    borderRadius: 5,
    height: 40,
    shadowColor: 'black', // iOS
    shadowOffset: { width: 5, height: 5 }, // iOS
    shadowOpacity: 0.8, // iOS
    shadowRadius: 5, // iOS   
    elevation: 5, // Android
  },
  uploadingIndicator: {
    // position: 'absolute',
    // top: 20,
    // right: 20,
    marginTop: 15,
    flexGrow:1,
    height:null,
    width:null,    
    alignItems: 'center',
    justifyContent: 'center',    
  },  
  postedText: {
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  modal: {
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
    elevation: 10, // Android    
  },  
});
