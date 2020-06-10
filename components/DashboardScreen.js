
import * as React from 'react';
import { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Dimensions, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import moment from "moment"; // for flatlist
import {GlobalStyles} from '../shared/GlobalStyles';
import * as firebase from 'firebase';
import * as firestore from 'firebase/firestore';
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
import { v4 as uuidv4 } from 'uuid';
import Constants from 'expo-constants'; // https://docs.expo.io/versions/latest/react-native/refreshcontrol/
import {vidViewLogDirName} from '../shared/Consts';



const str_pad_left = function (string,pad,length) { // convert from sec to min:sec // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
    return (new Array(length+1).join(pad)+string).slice(-length);
};


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
        seed: 1,
        error: null,
        refreshing: false,
        oldestVidTs: Date.now() / 1000,
        flagMastersLoaded: false, // becomes true when wpart & const_exer downloaded from firebase 20200606.
        wpart: null, // will be assigned after downloaded from Firebase. 20200606
        const_exer: null, // will be assigned after downloaded from Firebase. 20200606
    }
    // this.allSnapShot = this.allSnapShot.bind(this);
    this._sendVidViewLog = this._sendVidViewLog.bind(this);
    this._checkVidViewLogDirectory = this._checkVidViewLogDirectory.bind(this);
    this._makeRemoteRequest = this._makeRemoteRequest.bind(this);
    this._handleLoadMore = this._handleLoadMore.bind(this);
    this._handleRefresh = this._handleRefresh.bind(this);
  }


  oldestVidTs = Date.now() / 1000; // Assign timestamp of the oldest video fetched by _loadDashboardFlatlist to control next video to be fetched by _loadDashboardFlatlist 20200528


  async _checkVidViewLogDirectory(){ 
    console.log('----------- _checkVidViewLogDirectory start' );
    // // check if vidViewLog local directory exists, if not then create directory. 
    this.curDir = FileSystem.documentDirectory; // get root directory
    // console.log('this.curDir: ', this.curDir);  


    // // Check Directories & Files in current directory. // THIS IS FOR MANUAL ACTION 
    // FileSystem.readDirectoryAsync( this.curDir ).then( content => {
    //   console.log('this.curDir Dirs and Files: ', content); // how many localFiles in array
    // })

    // // Delete File // THIS IS FOR MANUAL ACTION AGAINST ERROR
    // FileSystem.deleteAsync( this.curDir + this.state.vidViewLogDirName + '/' + "1589984839.296_361f78ed-35be-477e-8676-adaa2fbc3805_cf136872-0f7b-4a06-9918-febc2967efe0.json" ).then( (dir) => {
    //   console.log('---------- File Deleted: ', dir);
    // }).catch(error => {
    //   console.log('error: ', error);
    // });    



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

        } else { // if folder NOT exists.
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
          alert('FileSystem.readDirectoryAsync error: ', error);
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
      alert('_sendVidViewLog error: ', err)
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
            console.log('----- Dashboard _getUserProfile response.' );
            if (response["code"] == 'new_user' ) {
              console.log('==== Dashboard.js New User and going to Profile.js for FIRST fill out');
              this.props.navigation.push('Profile', {isNewUser: true}); // navigate to Profile.js Edit mode by {isNewUser: true} for this.state.isEditing:true. 20200526
            } else if ( response["code"] == 'ok' ) {
              null
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
 
   
  _makeRemoteRequest = async () => {
    console.log('------------- _makeRemoteRequest');
    const { page, flagMastersLoaded } = this.state;

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
          flagMastersLoaded: flagMastersLoaded,
        })
      }).then( result => result.json() )
        .then( response => { 
          // console.log('------------------ _makeRemoteRequest response: ', response);

          if( response["code"] == 'okFirst'){
            console.log('---------------- okFirst');
            console.log('_makeRemoteRequest response.detail.vidMetas: ', response.detail.vidMetas );
            this.setState({
              posts: page === 1 ? response.detail.vidMetas  : [ ...this.state.posts, ...response.detail.vidMetas ],
              refreshing: false,
              isLoading: false,
              flagMastersLoaded: true, // this to identify its downloaded
              wpart: response.wpart,
              const_exer: response.const_exer,
            }); 

          } else if (response["code"] == 'ok') {
            console.log('_makeRemoteRequest response.detail.vidMetas: ', response.detail.vidMetas );
            // console.log('_makeRemoteRequest response.detail.vidMetas JSON.parse: ', JSON.parse(response.detail.vidMetas) ); // Error [SyntaxError: JSON Parse error: Unexpected identifier "object"]
            // console.log('_makeRemoteRequest response.detail.vidMetas JSON.stringify: ', JSON.stringify(response.detail.vidMetas));
            // console.log('_makeRemoteRequest response.detail.vidMetas JSON.parse JSON.stringify: ', JSON.parse( JSON.stringify(respsonse.detail.vidMetas) ) );

            this.setState({
              // posts: page === 1 ? response.detail.vidMetas  : [...this.state.posts, ...response.detail.vidMetas ],
              // posts: page === 1 ? JSON.parse(JSON.stringify( response.detail.vidMetas ) ) : [...this.state.data, ...JSON.parse( JSON.stringify( response.detail.vidMetas) ) ],
              posts: page === 1 ? response.detail.vidMetas  : [ ...this.state.posts, ...response.detail.vidMetas ],
              // error: response.error || null,
              // loading: false,
              refreshing: false,
              isLoading: false,
            });     

          } else if (response["code"] == 'no_more_data') {
            // this.setState({ loading: false , isLoading: false,});
            console.log('No more data by _loadDashboardFlatlist.');
            // alert('No more video.'); 
           
          }

        }).catch((error) => {
          // this.setState({ loading: false, isLoading: false, });
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
    this.oldestVidTs = Date.now() / 1000; // reset timestamp to current time
    this.setState({
        page: 1,
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
    console.log('------------- _handleLoadMore this.oldestVidTs: ', this.oldestVidTs);
    this.setState({ page: this.state.page + 1 }, () => {
      this._makeRemoteRequest();
    });
  };



  renderPost = post => {
      const { wpart, const_exer } = this.state;
      console.log('==================================== post: ');

      // (() => {
          if (post.VIEW > 1000000) { // view times
            this.VIEW = parseInt(post.VIEW / 1000000) + 'M ' // million
          } else if (post.VIEW > 1000) { 
            this.VIEW = parseInt(post.VIEW / 1000) + 'K '// thousand
          } else { 
            this.VIEW = parseInt(post.VIEW)
          }; 

          this.PTSUM = parseFloat(post.PTSUM); // cummulative points that the users exercised. 
          
          post.LEN = parseInt(post.LEN); // video length in XXmXXs
          if (post.LEN >= 60) {
            this.LEN = str_pad_left( post.LEN / 60,'0',2) + 'm' + str_pad_left( post.LEN - post.LEN / 60 * 60,'0',2) + 's'
          } else { 
            this.LEN = '00m' + str_pad_left( post.LEN, '0', 2) + 's' 
          }; // convert sec to min:sec
          
          this.TTLPT = parseFloat(post.TTLPT).toFixed(2); // point for this video that can be earned. Fix decimal place

          if ( this.oldestVidTs > post.TS) { // Assign timestamp of the oldest video fetched by _loadDashboardFlatlist to control next video to be fetched by _loadDashboardFlatlist 20200528
            this.oldestVidTs = post.TS;
          } 

          post.TNURL = 'https://firebasestorage.googleapis.com/v0/b/joogo-v0.appspot.com/o/tn%2F' + post.VIDID + '?alt=media' // URL for Thumbsnail photo 20200528         

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
        

          console.log('------------- renderPost: ' , post.VIDID, post.TITLE, );

          // } )(); 

  


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
                      <TouchableOpacity onPress={ () => this.props.navigation.push('Exercise', {post, wpart, const_exer} ) } >
                          <Image source={{uri: post.TNURL }} style={styles.postImage} resizeMode="cover" />   
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

        { isLoading ? 
           <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="large" color='#ffa500'/>
            <Text>Loading....</Text>
          </View>
        :
          <View> 

            <FlatList
              style={styles.feed}
              data={this.state.posts}
              // data={this.allPosts}
              renderItem={({ item }) => this.renderPost(item)}
              // keyExtractor={item => item.id}
              keyExtractor={item => item.vidId}
              showsVerticalScrollIndicator={false}
              key={item => item.vidId} // https://stackoverflow.com/questions/45947921/react-native-cant-fix-flatlist-keys-warning
              onRefresh={this._handleRefresh}
              refreshing={this.state.refreshing}
              onEndReached={this._handleLoadMore}
              onEndReachedThreshold={0}
            >
            </FlatList>

          </View>

        }

        
        {/* <LinearGradient colors={['#ffa500', '#ffb300', 'orange']} style={styles.footerContainer}>  */}
        <View style={styles.footerContainer}>
          {/* https://docs.expo.io/versions/latest/sdk/linear-gradient/ */}
          <Ionicons name='ios-person' size={28} color="white" style={styles.ProfileIcon} onPress={ () => this.props.navigation.push('Profile') } />  
          <Ionicons name="ios-add-circle-outline" size={28} color="white" style={styles.PostIcon} onPress={ () => this.props.navigation.push('Post') }/>
          <MaterialIcons name='history' size={28} color="white" style={styles.HistoryIcon} onPress={ () => this.props.navigation.push('History')}/>
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
    marginHorizontal: 8, // 16
  },
  feedItem: {
      backgroundColor: "#FFF",
      borderRadius: 5, // 10
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
      width: 160,
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