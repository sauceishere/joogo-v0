import React, { Component, useState, useEffect  } from 'react';
import { Text, View, StyleSheet, Dimensions, StatusBar, Image, TouchableOpacity, SafeAreaView, ScrollView, Button, Platform, ActivityIndicator, Modal } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation'; // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationlockasyncorientationlock
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";

export default class Live extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shouldPlay: false,
      flagUpdateScore: false,
      vidFullUrl: 'llNFfJPyNvI', //'R-BFosRw_oU',// 'llNFfJPyNvI',// 'https://www.youtube.com/embed/llNFfJPyNvI?autoplay=1', //'https://www.youtube.com/watch?v=-wtIMTCHWuI', // 'https://www.youtube.com/embed/llNFfJPyNvI',  -wtIMTCHWuI // autoplay=1&showinfo=0&controls=1&fullscreen=1', //?mute=1&autoplay=1&showinfo=0&controls=1&fullscreen=1', // &mute=0&showinfo=1&controls=0&fullscreen=1//'https://www.youtube.com/watch?v=sDhqARXot8Y', // // get from Firebase Storage
      vidPlayAt: 0,
      vidEndAt: 0,
    }  
    // this._handlePlayAndPause = this._handlePlayAndPause.bind(this);
    // this._vidDefault = this._vidDefault.bind(this);
    // this._showPausedVid = this._showPausedVid.bind(this);
    // this._showPlayingVid = this._showPlayingVid.bind(this); 
    this._goBackToHome = this._goBackToHome.bind(this);
  }

  async componentWillUnmount() {
    console.log('------------------- componentWillUnmount YTonly started');
    this.setState({ shouldPlay: false });
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT); // back to portrait

    console.log('vidPlayedtime: ', Date.now() / 1000, this.state.vidPlayAt, Date.now() / 1000 - this.state.vidPlayAt);
    console.log('------------------- componentWillUnmount YTonly completed');
  }  


  async componentDidMount() {
    console.log('------------------- componentDidMount YTonly started');
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE); // to landscape
    // console.log( 'ScreenOrientation.ScreenOrientationInfo: ', ScreenOrientation.ScreenOrientationInfo(orientation) );
    // console.log( 'ScreenOrientation.PlatformOrientationInfo: ', ScreenOrientation.PlatformOrientationInfo(screenOrientationArrayIOS) );
  }


  _goBackToHome = async () => {
    console.log('------------------------------------------------------ Go back to Home');
    // const ts = Date.now() / 1000;
    this.setState({ shouldPlay : false, flagUpdateScore: false }); // added 20200523
    // this.setState({ shouldPlay : false, flagUpdateScore: false, lastPlayEnded: ts  });
    // this.setState({ shouldPlay : false});
    // clearInterval(_updateScore); // did NOT work 20200603
    // clearInterval(videoCountDown); // did NOT work 20200603
    // ScreenOrientation.unlockAsync(); // back to portrait
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT); // back to portrait
    
    this.props.navigation.goBack();
    // this.props.navigation.navigate('DashboardScreen', { lastPlayEnded });

    // await this._saveVidViewLog(); // removed because this process is duplicated with componentWillUnmount
  }  


  // async _vidDefault () {
  //   console.log('=============== _vidDefault ===============');
  //   // await this.webviewRef.injectJavaScript(`

  //   // // // https://developers.google.com/youtube/iframe_api_reference?hl=ja
  //   // // 2. This code loads the IFrame Player API code asynchronously.
  //   // // var tag = document.createElement('script');

  //   // // document.getElementById("log0").innerHTML = tag;

  //   // // tag.src = "https://www.youtube.com/iframe_api";
  //   // // var firstScriptTag = document.getElementsByTagName('script')[0];
    
  //   // // document.getElementById("log1").innerHTML = firstScriptTag;
  //   // // document.getElementById("player").style.border = '5px solid yellow';

  //   // // firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);  // tag を　firstScriptTag　の前に挿入する

  //   // document.getElementById("player").style.border = '5px solid orange';

    

  //   // // // 3. This function creates an <iframe> (and YouTube player)
  //   // // //    after the API code downloads.
  //   // var player;
  //   // // document.getElementById("log2").innerHTML = player;
  //   // function onYouTubeIframeAPIReady() {
  //   //   player = new YT.Player('player', {
  //   //     height: '360',
  //   //     width: '640',
  //   //     videoId: 'M7lc1UVf-VE',
  //   //     events: {
  //   //       'onReady': onPlayerReady,
  //   //       'onStateChange': onPlayerStateChange
  //   //     }
  //   //   });
  //   // }

  //   // document.getElementById("player").style.border = '5px solid pink';

  //   // // document.getElementById("log3").innerHTML = player;


  //   // // // document.getElementsByTagName("iframe").play();
  //   // // // document.getElementsByTagName("video")[0].click();
  //   // // // document.getElementsByTagName("video")[0].body.style.border = '5px solid red';
  //   // // // document.getElementsByTagName("video")[0].setAttribute("preload", "auto"); 
  //   // // // document.getElementsByTagName("video")[0].setAttribute("muted", "true"); 
  //   // // // document.getElementsByTagName("video")[0].removeAttribute('controls'); // hide control panels
  //   // // // document.getElementsByTagName("video")[0].style.objectFit = 'fill'; // fill to widnow screen 
  //   // // // document.getElementsByTagName("video")[0].style.height = '100%';
  //   // // // document.getElementsByTagName("video")[0].style.width = '100%'; 
  //   // // // // document.body.style.border = '5px solid red';
  //   // // // // document.getElementsByTagName("video")[0].onended = (event) => {
  //   // // // //   window.alert('1）動画が終了した、または 2）それ以上データがない' + 'ため、動画が停止しました。');
  //   // // // // };
  //   // `);



  //   console.log('_vidDefault this.state.shouldPlay: ', this.state.shouldPlay);
  // }      


  // _handlePlayAndPause = async () =>  {
  //   console.log('=============== _handlePlayAndPause ===============');
  //   const _playVideo = () => {
  //     // this.videoState.cntPressPlayButton += 1; // increment to count 
  //     this.setState({ shouldPlay: true });
  //   }
  //   const _pauseVideo = () => {
  //     // this.videoState.cntPressPauseButton += 1; // increment to count
  //     this.setState({ shouldPlay: false });
  //   }

  //   if (this.state.shouldPlay == false) { // Go into this block when video is NOT playing
  //     console.log('=========================== play ================================');
  //     // this.vidState.loopStartAt = Date.now()/1000;
  //     // this.setState({ loopStartAt : Date.now()/1000 });
  //     await _playVideo(); 
  //     await this.webviewRef.injectJavaScript(`
        
  //       function f2playVideo() {
  //         document.getElementById("player").style.border = '5px solid green';
  //         player.playVideo();
  //         // event.target.playVideo();
  //       }
  //       f2playVideo();


  //     //   // event.target.playVideo();
  //       // player.playVideo();
  //     //   // document.getElementById("player").play();
  //       // $("#playvideo").click(function(){
  //       //   $("#player").src += "?autoplay=1";
  //       // });

  //       //   // document.getElementById("player")[0].style.border = '5px solid purple';
  //       //   // document.getElementsByTagName("script")[0].style.border = '5px solid purple';
  //       //   // document.getElementById("ytplayer").style.border = '5px solid blue';
  //       //   // document.getElementById("ytplayer").play();
  //       //   // document.getElementById("ytplayer")[0].play();
  //       //   // document.getElementsByTagName("iframe").style.border = '5px solid red';
  //       //   // document.getElementsByTagName("iframe")[0].click();
  //       //   // document.getElementsByTagName("iframe")[0].play();
  //       //   // document.getElementsByTagName("body")[0].click();
  //       //   // document.getElementsByTagName("body")[0].style.border = '5px solid red';
  //       //   // document.getElementsByTagName("video").play();
  //       //   // document.getElementsByTagName("video").click();
  //       //   // document.getElementsByTagName("body").play();
  //       //   // document.getElementsByTagName("body").click();
  //       //   // <iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
  //       //   // document.getElementsByTagName("video")[0].setAttribute("muted", "false"); 
  //     `)
  //     // INJECTED_JS = `(
  //     //   document.getElementById("player").style.border = '5px solid green';
  //     // )`      
  //   } else { // when video is playing
  //     console.log('=========================== pause ================================');
  //     // this.vidState.vidPlayedSum = this.vidState.vidPlayedSum + (Date.now()/1000 - this.vidState.loopStartAt); // add increment time
  //     await _pauseVideo();
  //     await this.webviewRef.injectJavaScript(`

  //       function f2stopVideo() {
  //         document.getElementById("player").style.border = '5px solid red';
  //         player.pauseVideo();
  //       }
  //       f2stopVideo();

  //       // player.stopVideo();
  //       //   // $("#playvideo").click(function(){
  //       //   //   $("#player").src += "?autoplay=0";
  //       //   // });

  //       //   // document.getElementsById("player")[0].style.border = '5px solid purple';
  //       //   // document.getElementsByTagName("script")[0].style.border = '5px solid purple';
  //       //   // document.getElementsByTagName("iframe").style.border = '5px solid purple';
  //       //   // document.getElementsByTagName("video")[0].pause();
  //       //   // document.getElementsByTagName("video")[0].click();
  //       //   // document.getElementsByTagName("body")[0].style.border = '5px solid purple';
  //       //   // document.getElementsByTagName("video").click();
  //       //   // document.getElementsByTagName("body").click();
  //     `)

  //     // INJECTED_JS = `(
  //     //   document.getElementById("player").style.border = '5px solid red';
  //     // )`;
  //   }
  // }  




  render() {
    console.log('----------------- render --------------------');

    const { shouldPlay, vidFullUrl, vidPlayAt, vidEndAt } = this.state;
    console.log( 'vidFullUrl: ', vidFullUrl);


    var htmlContents = `<!DOCTYPE html>
      <html>
      <head>

      <meta name="viewport" content="initial-scale=1.0">
      </head>
        <body style="margin: 0px; background-color:#000;">
          <!-- 1. The <iframe> (and video player) will replace this <div> tag. -->
          <div id="player" style="width: '100%'; height: '100%';"></div>
          <!-- <input type="button" name="playbutton" value="v-play" onclick="fplayVideo();"/>  -->
          <!-- <input type="button" name="stopbutton" value="v-stop" onclick="fstopVideo();"/>  -->

          <script>
            // 2. This code loads the IFrame Player API code asynchronously.
            var tag = document.createElement('script');

            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // 3. This function creates an <iframe> (and YouTube player)
            //    after the API code downloads.
            var player;
            function onYouTubeIframeAPIReady() {
              player = new YT.Player('player', {
                // height: '100%',
                // width: '100%',
                videoId: '${vidFullUrl}', //'llNFfJPyNvI', //'R-BFosRw_oU', 
                events: {
                  'onReady': onPlayerReady,
                  'onStateChange': onPlayerStateChange,
                },
                playerVars: {rel:0, playsinline:0  }, // https://developers.google.com/youtube/player_parameters?hl=ja
              });
            }

            // 4. The API will call this function when the video player is ready.
            function onPlayerReady(event) {
              // document.getElementById("player").style.border = '5px solid orange';
            }

            // 5. The API calls this function when the player's state changes.
            //    The function indicates that when playing a video (state=1),
            //    the player should play for six seconds and then stop.
            var vidPlaying = false;
            var vidPlayAt = 0;

            function onPlayerStateChange(event) {
              if (event.data == YT.PlayerState.PLAYING && !vidPlaying) {
                setTimeout(function () {
                  vidPlayAt = Date.now() / 1000;
                  window.ReactNativeWebView.postMessage( JSON.stringify( {"vidPlayAt": vidPlayAt } ) );
                }, 100)

                vidPlaying = true;
              } 
              
              if (event.data == YT.PlayerState.ENDED && vidPlaying) {
                setTimeout(function () {
                  window.ReactNativeWebView.postMessage( JSON.stringify( {"vidEndAt": Date.now() / 1000 , "vidPlayedTime": (Date.now() / 1000 - vidPlayAt).toFixed(1) } ) );
                }, 100)

                vidPlaying = false;
              }
            }

            function fplayVideo() {
              document.getElementById("player").style.border = '5px dotted green';
              player.playVideo();
            }

            function fstopVideo() {
              document.getElementById("player").style.border = '5px dotted red';
              player.pauseVideo();
            }

          </script>
        </body>
      </html>`


    return (
      
      <View style={styles.container}>
        <StatusBar hidden />


        <View style={styles.trainerVideoContainer}>
          <WebView
            ref={r => (this.webviewRef = r)}
            // source={{ uri: this.state.vidFullUrl }}
            // source={{ html: '<iframe id="player" type="text/html" width="100%" height="100%" src="https://www.youtube.com/embed/llNFfJPyNvI?enablejsapi=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>' }}
            // source={{ html: '<iframe id="player" width="100%" height="100%" frameborder="0" allow="autoplay" allowfullscreen allowtransparency="true"></iframe>' }}
            // source={{ html: '<iframe id="player" width="100%" height="100%" src="https://www.youtube.com/embed/llNFfJPyNvI?enablejsapi=1?autoplay=1" frameborder="0" allow="autoplay" allowfullscreen allowtransparency="true"></iframe><a href="#" id="playvideo" width="100" height="100" style="background-color:blue;" >Play buttonGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG</a><' }}
            // source={{ html: '<div width="100px" height="100px" id="player"></div> <div id="log0"></div> <div id="log1"></div> <div id="log2"></div> <div id="log3"></div>' }}
            style={ styles.trainerVideo } 
            // onNavigationStateChange={this._vidDefault}
            // injectedJavaScriptBeforeContentLoaded={INJECTED_JS_ONLOAD}
            // injectedJavaScript={INJECTED_JS_ONLOAD}
            // onMessage={onMessage}
            // onMessage={(event) => {event.nativeEvent.data}}
            onMessage={(event) => {
              // if (vidPlayAt == 0 && vidEndAt == 0) { // to assign only once at the fisrt play
              if (JSON.parse(event.nativeEvent.data)["vidPlayAt"]) {
                this.setState({ vidPlayAt: JSON.parse(event.nativeEvent.data)["vidPlayAt"] });
                console.log('vidPlayAt: ', this.state.vidPlayAt );
              }
              // if (vidEndAt == 0 && vidPlayAt != 0) { // to assign only once at the fisrt play
              if (JSON.parse(event.nativeEvent.data)["vidEndAt"]) {
                this.setState({ vidEndAt: JSON.parse(event.nativeEvent.data)["vidEndAt"], vidPlayedTime: JSON.parse(event.nativeEvent.data)["vidPlayedTime"] });
                console.log('endAt: ', this.state.vidEndAt );
                console.log('vidPlayedTime: ', this.state.vidPlayedTime );
              }
            }}
            source={{ html: htmlContents }}
          /> 
        </View>  


        {/* { shouldPlay ? */}
          {/* <View style={ styles.playButtonContainer }>
            <TouchableOpacity onPress={ this._handlePlayAndPause } style={{height: Dimensions.get('screen').width * 0.7, width: Dimensions.get('screen').width * 0.7, }} > 
            </TouchableOpacity>
          </View> */}
        {/* : */}
          {/* <View style={ styles.playButtonContainer }>
            <TouchableOpacity onPress={ this._handlePlayAndPause } style={{height: Dimensions.get('screen').width * 0.7, width: Dimensions.get('screen').width * 0.7, }} > 
            <Ionicons name="ios-play-circle" color="#ffa500" size={150} style={styles.playButton} /> 
            </TouchableOpacity>
          </View>   */}
        {/* } */}
        

        <View style={styles.goBackIconContainer}>
          <TouchableOpacity onPress={ this._goBackToHome }  >
            <Ionicons name="md-arrow-back" size={50} color="#ffa500" style={styles.goBackIcon}/>
          </TouchableOpacity>   
        </View>


      </View>

    )

  }

}




const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    // alignItems: 'center',
    // justifyContent: 'center',
    // padding: 24,
    top: 0, //StatusBar.currentHeight,
    height: Dimensions.get('screen').width, // when Landscape 
    width: Dimensions.get('screen').height - 70, // when Landscape 
    // height: Dimensions.get('screen').height, // when Portrait 
    // width: Dimensions.get('screen').width, // when Portrait     
    position: 'absolute',
    flex: 0,
    // zindex: 0, // 20200531
    // borderColor: 'green',
    // borderWidth: 5,
  },
  trainerVideoContainer: {
    // flex: 1,
    // flexGrow: 1, // added 20200530
    height: '100%',
    width: '100%' ,
    // height: Dimensions.get('screen').width,
    // width: Dimensions.get('screen').height,
    // height: 800, 
    // width: 300,
    // width: Dimensions.get('window').height - 1,
    // zindex: 100,
    // alignItems: 'center',
    // justifyContent: 'center',  
    // borderColor: 'black', // BORDER IS NECESSARY BUT DONT KNOW WHY. 20200531
    // borderWidth: 0.1, // BORDER IS NECESSARY BUT DONT KNOW WHY. 20200531
    // position: absolute, // DON'T ADD THIS, IT WILL BE BLUE EXPO ERROR SCREEN. 20200524
    resizeMode: 'contain',
  },
  trainerVideo: {
    // flex: 0, //1
    // flexGrow: 1,
    // position: absolute, // DON'T ADD THIS, EXPO WILL NOT START 20200530
    // position: 'relative',
    height: '100%',
    width: '100%',
    // height: Dimensions.get('window').width, 
    // width: Dimensions.get('window').width,    
    alignItems: 'center',
    justifyContent: 'center',  
    // zindex: 300,     
    // top: 0,
    // borderColor: 'blue',
    // borderWidth: 4,
  },
  playButtonContainer: {
    // flexGrow:1,
    // height: Dimensions.get('window').width * 0.2, // null,
    // width: Dimensions.get('window').width * 0.2, // null, 
    // height: null,
    // width: null,   
    alignItems: 'center',
    justifyContent: 'center', 
    // zIndex: 202, // removed 20200531
    // backgroundColor: 'green',
    // top: Dimensions.get('window').height * 0.5 - (playButtonSize / 2),
    // left: Dimensions.get('window').width * 0.5 - (playButtonSize / 2),
    top: Dimensions.get('screen').width / 2,
    left: Dimensions.get('screen').height / 2,
    position: 'absolute',
    // textAlign: 'center',
    borderColor: 'blue',
    borderWidth: 4,      
  },
  playButton: {
    // height: Dimensions.get('screen').width * 0.2,
    // width: Dimensions.get('screen').width * 0.2,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center', 
    flexDirection: 'row', 
    borderColor: 'purple',
    borderWidth: 4,       
  }, 

  goBackIconContainer: {
    // marginTop: 10,
    // marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',   
    backgroundColor: 'rgba(20, 20, 20, 0.7)', // 'rgba(220, 220, 220, 0.5)'
    position: 'absolute',
    top: Dimensions.get('screen').width * 0.07, // when Landscape
    left: Dimensions.get('screen').height * 0.02, // when Landscape
    // top: Dimensions.get('window').height * 0.04, // when Portrait
    // left: Dimensions.get('window').width * 0.04, // when Portrait
    height: 70,
    width: 70,
    borderRadius: 70,
  },  
  goBackIcon: {
    textShadowColor: 'white',
    // textShadowRadius: 5,
    textAlign: 'center',
  },  

});



  






