import * as React from 'react';
import { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation'; // https://qiita.com/kana-t/items/366c9c07a4c81d6b6c1e
import * as firebase from 'firebase';
import moment from "moment"; 
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { convertCompilerOptionsFromJson } from 'typescript';


const str_pad_left = function (string,pad,length) { // convert from sec to min:sec // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
    return (new Array(length+1).join(pad)+string).slice(-length);
};

var post_num = 1; // this actually is rank.

export default class Leaderboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            doneComponentDidMount: false,
            param: this.props.navigation.getParam('greeting'),
            viewPtSum: null,
            playSum: null,
            viewTimes: null,
            postsExer: [], // assign response from loadExerHist-py
            // oldestLogTs: Date.now() / 1000,
            page: 1,
            // seed: 1,
            error: null,
            refreshing: false,
            // isFlatlistLoaded: false,
        }
        // this._getExerHistSummary = this._getExerHistSummary.bind(this);
        this._requestLoadExerHist = this._requestLoadExerHist.bind(this);
        this._handleLoadMore = this._handleLoadMore.bind(this);
        this._handleRefresh = this._handleRefresh.bind(this);
    }

    oldestLogTs =  Date.now() / 1000;

    async componentDidMount() {
        console.log('------------- componentDidMount ExerciseHistory started');
    
        if (this.state.doneComponentDidMount === false) { // if variable is null. this if to prevent repeated loop.
            console.log('this.state.doneComponentDidMount === false');
            // this.setState({isLoading: true});
    
            const _getExerHistSummary = (idTokenCopied) => {
                console.log('----- History _getExerHistSummary.');
                //   console.log('this.oldestLogTs: ', this.oldestLogTs);
                
                fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/getExerHistSummary-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
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
                    // console.log('------------------ _getExerHistSummary response: ', response);
        
                        if( response["code"] == 'ok'){
                            console.log('---------------- ok');
                            console.log('_getExerHistSummary response.detail: ', response.detail );

                            var viewPtSum = response.detail.VIEW_PTSUM;
                            viewPtSum = parseInt(viewPtSum); // convert to int
                            var playSum = response.detail.PLAYSUM;
                            if ( playSum < 60 * 60 ) { // less than 1 hour
                                playSum = parseFloat(playSum / 60 / 60 / 10).toFixed(2); // show like 0.1
                            } else { // over 1 hour
                                playSum = parseInt(playSum / 60 / 60); // convert from second to hour
                            }
                            var viewTimes = response.detail.VIEW_TIMES;

                            this.setState({
                                // isLoading: false,
                                viewPtSum: viewPtSum,
                                playSum: playSum,
                                viewTimes: viewTimes,
                            }); 
                        } 
            
                }).catch((error) => {
                    this.setState({ isLoading: false, });
                    console.log('Error _getExerHistSummary: ', error);
                    alert('Error _getExerHistSummary. Please try again later.');
                });
        
            }
        
            await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
                const idTokenCopied = idToken;
            
                _getExerHistSummary(idTokenCopied);
            
            }).catch(function(error) {
                console.log('Error xxxxxxxxxxxxxxxx Could not get idToken _getExerHistSummary : ', error);
                alert('Error, Could not get idToken _getExerHistSummary. please try again later.')
            });  
    
            await this._requestLoadExerHist(); // kick 
            
        }; // closing if 

        this.setState({doneComponentDidMount: true, isLoading: false});

        console.log('------------- componentDidMount ExerciseHistory done');
    } // closing componentDidMount



    _requestLoadExerHist = async () => {
        console.log('------------- _requestLoadExerHist');
        const { page } = this.state;
    
        const _loadExerHist = (idTokenCopied) => {
          console.log('----- History _loadExerHist.');
          console.log('this.oldestLogTs: ', this.oldestLogTs);
          
          fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/loadExerHist-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
            method: 'POST',
            headers: {
              // 'Accept': 'application/json', 
              'Content-Type' : 'application/json' // text/html text/plain application/json
            },
            // mode: "no-cors", // no-cors, cors, *same-origin
            body: JSON.stringify({
              id_token: idTokenCopied,
              oldestLogTs: this.oldestLogTs,    
            })
          }).then( result => result.json() )
            .then( response => { 
              // console.log('------------------ _requestLoadExerHist response: ', response);
    
              if( response["code"] == 'ok'){
                console.log('---------------- ok');
                // console.log('_requestLoadExerHist response.detail: ', response.detail.vidViewedLogs);

                // to control when to display 'ad'. 20200623
                var i;
                for (i = 0; i < response.detail.vidViewedLogs.length; i++) {
                    console.log('post_num: ', post_num);
                    response.detail.vidViewedLogs[i]['rank'] = post_num;  // assign rank
                    post_num++; // increment
                }

                this.setState({
                  postsExer: page === 1 ? response.detail.vidViewedLogs  : [ ...this.state.postsExer, ...response.detail.vidViewedLogs ],
                  refreshing: false,
                  isLoading: false,
                //   flagMastersLoaded: true, // this to identify its downloaded
                //   isFlatlistLoaded: true,
                }); 
                // console.log('this.state.postsExer: ', this.state.postsExer);
    
              } else if (response["code"] == 'no_more_data') {
                this.setState({ isLoading: false,});
                console.log('No more history by _loadExerHist.');
                // alert('No more history.'); 
               
              }
    
            }).catch((error) => {
              this.setState({ isLoading: false, });
              console.log('Error _loadExerHist: ', error);
              alert('Error _loadExerHist. Please try again later.');
            });
    
        }
    
        await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
          const idTokenCopied = idToken;
    
          _loadExerHist(idTokenCopied);
    
        }).catch(function(error) {
          console.log('Error xxxxxxxxxxxxxxxx Could not get idToken _loadExerHist: ', error);
        });  
    
    }; // closing _requestLoadExerHist
    
    
    _handleRefresh = async () => {
        console.log('------------- _handleRefresh');
        this.oldestLogTs = Date.now() / 1000; // reset timestamp to current time
        this.setState({
                page: 1,
                refreshing: true,
                // oldestLogTs: Date.now() / 1000, // reset before fetch data
                isLoading: true,
            },
            () => {
                this._requestLoadExerHist();
            }
        );  
    };
    
    
    _handleLoadMore = async () => {
        console.log('------------- _handleLoadMore: ', this.oldestLogTs);
        this.setState({ page: this.state.page + 1 }, () => {
            this._requestLoadExerHist();
        });
    };


    renderPost = post => {
        // const { oldestLogTs } = this.state;
        console.log('------ renderpost: ');
      
        // (() => {
            post.TTLPT = parseFloat(post.TTLPT).toFixed(2); // point for this video that can be earned. Fix decimal place
            post.SC_PCT = post.SC + '%'; // Add % for percentageBar 20200613

            post.VIDLEN = parseInt(post.VIDLEN); // video length in XXmXXs
            if (post.VIDLEN >= 60) {
                post.VIDLEN_ = str_pad_left( post.VIDLEN / 60,'0',2) + 'm' + str_pad_left( post.VIDLEN - post.VIDLEN / 60 * 60,'0',2) + 's'
            } else { 
                post.VIDLEN_ = '00m' + str_pad_left( post.VIDLEN, '0', 2) + 's' 
            }; // convert sec to min:sec

            post.PLAYSUM = parseInt(post.PLAYSUM); // video length in XXmXXs
            if (post.PLAYSUM >= 60) {
                post.PLAYSUM_ = str_pad_left( post.PLAYSUM / 60,'0',2) + 'm' + str_pad_left( post.PLAYSUM - post.PLAYSUM / 60 * 60,'0',2) + 's'
            } else { 
                post.PLAYSUM_ = '00m' + str_pad_left( post.PLAYSUM, '0', 2) + 's' 
            }; // convert sec to min:sec

            if (post.PLAYSUM > post.VIDLEN) {
                post.PLAYSUM_ = post.VIDLEN_; // Copy post.VIDLEN_ if playing time id longer than video length. 20200614
            }
            
            post.PLAYPCT = parseInt(post.PLAYPCT); // remove decimal place
            if (post.PLAYPCT * 100 >= 100) {
                post.PLAYPCT_PCT = '100%'; // force to 100 if over 100%. 20200614 // Add % for percentageBar 20200613
            } else {
                post.PLAYPCT_PCT = (post.PLAYPCT * 100) + '%'; // Add % for percentageBar 20200613
            }
            // post.PLAYPCT_PCT = post.PLAYPCT + '%'; // Add % for percentageBar 20200613

            if ( this.oldestLogTs > post.TS) { // Assign timestamp of the oldest video fetched by _loadDashboardFlatlist to control next video to be fetched by _loadDashboardFlatlist 20200528
                // this.setState({oldestLogTs : post.TS});
                this.oldestLogTs = post.TS;
            } 
    
            // post.TNURL = 'https://firebasestorage.googleapis.com/v0/b/joogo-v0.appspot.com/o/tn%2F' + post.VIDID + '?alt=media' // URL for Thumbsnail photo 20200528         
    
            console.log('-- post: ' , post.VIDNAME, post.TS, post.VIDID );
    
        // } )(); 
    
    
        return (
            <View style={styles.feedItem}>
                
                {/* left pane */}
                <View style={{ width: Dimensions.get('window').width * 0.10, }}>
                    <Text style={styles.rank}>{post.rank}</Text> 
                </View>

                {/* medal pane */}
                <View style={{ width: Dimensions.get('window').width * 0.08, }}>
                    <Text style={styles.medal}>G</Text> 
                    {/* <Image source={{uri: post.TNURL }} style={styles.postImage} resizeMode="cover" />   */}
                </View>                

                <View style={{ width: Dimensions.get('window').width * 0.62, }}>
                     <Text style={styles.name}>{post.NNAME}</Text>
                </View>    

                {/* right pane */}   
                <View style={{ width: Dimensions.get('window').width * 0.25, }}> 
                    <Text style={styles.point}>{moment.unix(post.TS).fromNow()}</Text> 
                </View>
                
            </View>
        );
    }; // closing renderpost    



    render() {
        console.log('------------- render.');
        const { isLoading, viewPtSum, playSum, viewTimes } = this.state;

        return (
            <View style={styles.container}>

                {/* <TouchableOpacity onPress={ () => this.props.navigation.navigate('Stack2', { greeting: 'Hallo Post',}) } style={styles.PageSwitchButton} > 
                    <Text style={{color: 'gray', fontSize: 16, fontWeight: 'bold',}}> Go to 'Post' History </Text>
                </TouchableOpacity> */}


                { isLoading ? 
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="large" color='#ffa500'/>
                        <Text>Loading....</Text>
                    </View>
                : 
                    <View style={{width: '100%', flexDirection: 'column', flexWrap: 'nowrap' }}>

                        <View style={{width: '100%', flex: 1, marginTop: Dimensions.get('window').height * 0.05, }}>
                            <Text style={styles.pageTitle}>Gold Medalists' activity</Text>    
                        </View>
                    
                        <View style={{width: '100%', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-around', marginTop: Dimensions.get('window').height * 0.05,}} >
                            <View style={styles.tileItem}>
                                <Text style={styles.tileItemTitle}> <Ionicons name='ios-body' size={18} style={styles.tileItemIcon}/> {' '} Movage Earned</Text>
                                <Text style={styles.tileItemField}>{viewPtSum}</Text>    
                            </View>          

                            <View style={styles.tileItem}>
                                <Text style={styles.tileItemTitle}> <Ionicons name='ios-time' size={18} style={styles.tileItemIcon}/> {' '} Hours Worked Out</Text> 
                                <Text style={styles.tileItemField}>{playSum}</Text>  
                            </View>
                            
                            <View style={styles.tileItem}>
                                <Text style={styles.tileItemTitle}> <Ionicons name='logo-youtube' size={18} style={styles.tileItemIcon}/> {' '} Times Played</Text>
                                <Text style={styles.tileItemField}>{viewTimes}</Text>  
                            </View>      
                        </View> 

                        <View style={{alignSelf: "stretch", marginTop: Dimensions.get('window').height * 0.03,}}> 
                            <FlatList
                                style={styles.feed}
                                data={this.state.postsExer}
                                renderItem={({ item }) => this.renderPost(item)}
                                keyExtractor={item => item.SENDID}
                                showsVerticalScrollIndicator={false}
                                key={item => item.SENDID} // https://stackoverflow.com/questions/45947921/react-native-cant-fix-flatlist-keys-warning
                                onRefresh={this._handleRefresh}
                                refreshing={this.state.refreshing}
                                onEndReached={this._handleLoadMore}
                                onEndReachedThreshold={1}
                            >
                            </FlatList>
                        </View>

                    </View>
                } 

            </View>
        );
    }

} // closing class ExerciseHistory

















const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: 10,
        marginTop: 5,
    },
    // inputContainer: {
    //     marginHorizontal: Dimensions.get('window').width * 0.05,
    //     flexDirection: "column",
    //     justifyContent: 'flex-start'
    // },
    PageSwitchButton: {
        position: 'absolute',
        right: 10,
    },
    pageTitle: {
        color: '#ffa500',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 23,
        fontWeight: 'bold',
        textAlign: 'center',
        // borderColor: 'blue',
        // borderWidth: 2,
    },
    tileItem: {
        // borderColor: 'red',
        // borderWidth: 2,
        width: Dimensions.get('window').width * 0.25,
        flex: 1, 
        flexDirection: 'column',
        // justifyContent: 'center',
    },
    tileItemIcon:{
        textAlign: 'center',
        color: "#73788B",
    },
    tileItemTitle:{
        //marginTop: 7, //Dimensions.get('window').height * 0.01,
        color: 'gray',
        fontSize: 10,
        textAlign: 'center',
        // borderColor: 'pink',
        // borderWidth: 2,
    },
    tileItemField: {
        // borderWidth: 1, 
        // borderColor: 'white', 
        // borderRadius: 5, 
        fontWeight: 'bold',
        fontSize: 30,
        height: 35,
        color: 'dimgray',
        textAlignVertical: 'center',
        textAlign: 'center',
        paddingHorizontal: 5,
        // borderColor: 'green',
        // borderWidth: 2,
    },
    feed: {
        // marginHorizontal: 8, // 16
        // backgroundColor: 'pink',
    },
    feedItem: {
        backgroundColor: "#FFF",
        // borderRadius: 5, // 10
        padding: 8,
        flexDirection: "row",
        flex: 3,
        // marginVertical: 5,
        shadowColor: 'black', // iOS
        shadowOffset: { width: 5, height: 5 }, // iOS
        shadowOpacity: 0.3, // iOS
        shadowRadius: 2, // iOS   
        elevation: 2, // Android
    },    

    // textContents: {
    //     flexDirection: "column", 
    //     width: Dimensions.get('window').width * 0.48, //160,
    // },

    rank: {
        marginVertical: 8,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffa500', //'#ffbf00' // "#838899"
    },
    medal: {
        marginVertical: 8,
        fontSize: 15,
        // fontWeight: 'bold',
        // color: '#ffa500', //'#ffbf00' // "#838899"
    },    
    name: {
        marginVertical: 8,
        fontSize: 15,
        fontWeight: "500",
        // color: '#C4C6CE', //'#454D65' 
    },    
    point: {
        marginVertical: 8,
        fontSize: 15,
        color: '#454D65', //"#C4C6CE",
        // fontWeight: "500",
        textAlign: 'right',
        marginRight: 5,
    },    

        
    textMetadata: {
        position: 'absolute',
        bottom: 4,
    },
    postImage: {
        width: Dimensions.get('window').width * 0.43 * 0.8, // 150,
        height: Dimensions.get('window').width * 0.43 * (225/150) * 0.8, // 225,
        // width: 200,
        borderRadius: 5,
        marginVertical: 5,
        right: 0,
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
    },

})
