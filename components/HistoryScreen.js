// import * as React from 'react';
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation'; // https://qiita.com/kana-t/items/366c9c07a4c81d6b6c1e
import * as firebase from 'firebase';
import moment from "moment"; 
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { convertCompilerOptionsFromJson } from 'typescript';
import * as SQLite from 'expo-sqlite';



// const str_pad_left = function (string,pad,length) { // convert from sec to min:sec // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
//     return (new Array(length+1).join(pad)+string).slice(-length);
// };

export default class HistoryScreen extends Component {
    render() {
        // return (
        //     <SafeAreaView style={styles.container}>
        //         <Text>Under Construction Now, </Text>
        //         <Text>will be ready soon to view your Post & Exercise history.</Text>
        //     </SafeAreaView>
        // )
        // return <MyNavigator />;
        return <AppContainer/>;
    }

}



class ExerciseHistory extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            doneComponentDidMount: false,
            // param: this.props.navigation.getParam('greeting'),
            // viewPtSum: null,
            // playSum: null,
            // viewTimes: null,
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
    
            await this._requestLoadExerHist(); // kick 
            
        }; // closing if 

        this.setState({doneComponentDidMount: true});

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
                // alert('No data to be shown.'); 
               
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
            // post.SC_PCT = post.SC + '%'; // Add % for percentageBar 20200613

            // post.VIDLEN = parseInt(post.VIDLEN); // video length in XXmXXs
            // if (post.VIDLEN >= 60) {
            //     post.VIDLEN_ = str_pad_left( post.VIDLEN / 60,'0',2) + 'm' + str_pad_left( post.VIDLEN - post.VIDLEN / 60 * 60,'0',2) + 's'
            // } else { 
            //     post.VIDLEN_ = '00m' + str_pad_left( post.VIDLEN, '0', 2) + 's' 
            // }; // convert sec to min:sec

            // post.PLAYSUM = parseInt(post.PLAYSUM); // video length in XXmXXs
            // if (post.PLAYSUM >= 60) {
            //     post.PLAYSUM_ = str_pad_left( post.PLAYSUM / 60,'0',2) + 'm' + str_pad_left( post.PLAYSUM - post.PLAYSUM / 60 * 60,'0',2) + 's'
            // } else { 
            //     post.PLAYSUM_ = '00m' + str_pad_left( post.PLAYSUM, '0', 2) + 's' 
            // }; // convert sec to min:sec

            if ( parseInt(post.PLAYSUM / 60) <= 10 ) { // less than 10 minutes
                if ( (post.PLAYSUM - (parseInt(post.PLAYSUM / 60) * 60)) <= 10 ) { // less than 10 seconds
                    post.PLAYSUM_ = '0' + parseInt(post.PLAYSUM / 60) + 'm' + '0' + parseInt((post.PLAYSUM - (parseInt(post.PLAYSUM / 60) * 60))) + 's';
                } else {
                    post.PLAYSUM_ = '0' + parseInt(post.PLAYSUM / 60) + 'm' + parseInt((post.PLAYSUM - (parseInt(post.PLAYSUM / 60) * 60))) + 's';
                }
            } else {
                if ( (post.PLAYSUM - (parseInt(post.PLAYSUM / 60) * 60)) <= 10 ) { // less than 10 seconds
                post.PLAYSUM_ = parseInt(post.PLAYSUM / 60) + 'm' + '0' + parseInt((post.PLAYSUM - (parseInt(post.PLAYSUM / 60) * 60))) + 's';
                } else {
                post.PLAYSUM_ = parseInt(post.PLAYSUM / 60) + 'm' + parseInt((post.PLAYSUM - (parseInt(post.PLAYSUM / 60) * 60))) + 's';
                }
            };



            // if (post.PLAYSUM > post.VIDLEN) {
            //     post.PLAYSUM_ = post.VIDLEN_; // Copy post.VIDLEN_ if playing time id longer than video length. 20200614
            // }
            
            // post.PLAYPCT = parseInt(post.PLAYPCT); // remove decimal place
            // if (post.PLAYPCT * 100 >= 100) {
            //     post.PLAYPCT_PCT = '100%'; // force to 100 if over 100%. 20200614 // Add % for percentageBar 20200613
            // } else {
            //     post.PLAYPCT_PCT = (post.PLAYPCT * 100) + '%'; // Add % for percentageBar 20200613
            // }
            

            if ( this.oldestLogTs > post.TS) { // Assign timestamp of the oldest video fetched by _loadDashboardFlatlist to control next video to be fetched by _loadDashboardFlatlist 20200528
                // this.setState({oldestLogTs : post.TS});
                this.oldestLogTs = post.TS;
            } 
    
            post.SC = parseFloat(post.SC).toFixed(); // no decimal for Calories

            // post.TNURL = 'https://firebasestorage.googleapis.com/v0/b/joogo-v0.appspot.com/o/tn%2F' + post.VIDID + '?alt=media' // URL for Thumbsnail photo 20200528         
    
            console.log('-- post: ' , post.TS );
    
        // } )(); 
    
    
        return (
            <View style={styles.feedItem}>
                
                {/* left pane */}
                <View style={{  }}>
                    <TouchableOpacity>
                        <Image source={{uri: post.TNURL }} style={styles.postImage} resizeMode="cover" />   
                    </TouchableOpacity>
                </View>
    
                {/* right pane */}   
                <View style={{ flex: 2, flexDirection: "column", marginHorizontal: 3, }}> 
    
                    <View style={styles.textContents}>
                        <Text style={styles.timestamp}>{moment.unix(post.TS).fromNow()}</Text> 
                        <Text style={styles.title}>' 
                            { ((post.VIDNAME).length > 40) ? 
                                (((post.VIDNAME).substring(0, 40-3)) + '...') 
                            : 
                                post.VIDNAME 
                            }
                        '</Text>

                        <Text style={styles.name}>
                            { ((post.NNAME).length > 25) ? 
                                    (((post.NNAME).substring(0, 25-3)) + '...') 
                            : 
                                post.NNAME 
                            }
                        </Text>
                    </View>    
    
                    <View style={styles.textMetadata}>
                        <View style={{flexDirection: "row", marginTop: 2, marginLeft: 3,}}>
                            <Ionicons name='ios-flame' size={22} color="#73788B"/>
                            <Text style={styles.points}> {post.SC} Calories</Text>
                        </View>
                        {/* <View style={{flexDirection: "column",}}>
                            <View style={[styles.percentageBar, {width: post.SC_PCT} ]}></View>
                            <View style={[styles.percentageBarBase, {width: Dimensions.get('window').width * 0.48} ]}></View>  
                        </View> */}

                        <View style={{flexDirection: "row", marginTop: 1, marginLeft: 2,}}>
                            <Ionicons name='ios-time' size={20} color="#73788B"/>
                            {/* <Ionicons name='logo-youtube' size={17} color="#73788B"/> */}
                            <Text style={styles.views}> {post.PLAYSUM_} </Text>
                        </View>
                        {/* <View style={{flexDirection: "column",}}>
                            <View style={[styles.percentageBar, {width: post.PLAYPCT_PCT} ]}></View>
                            <View style={[styles.percentageBarBase, {width: Dimensions.get('window').width * 0.48} ]}></View>
                        </View> */}
                    </View>  
                    
                </View>
                
            </View>
        );
    }; // closing renderpost    



    render() {
        console.log('------------- render.');
        const { isLoading, } = this.state;

        return (
            <View style={styles.container}>

                {/* <TouchableOpacity onPress={ () => this.props.navigation.navigate('Stack2', { greeting: 'Hallo Post',}) } style={styles.PageSwitchButton} > 
                    <Text style={{color: 'gray', fontSize: 16, fontWeight: 'bold',}}> Go to 'Chart' </Text>
                </TouchableOpacity> */}


                { isLoading ? 
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="large" color='#ffa500'/>
                        <Text>Loading....</Text>
                    </View>
                : 
                    <View style={{width: '100%', flexDirection: 'column', flexWrap: 'nowrap' }}>

                        {/* <View style={{width: '100%', flex: 1, marginTop: Dimensions.get('window').height * 0.05, }}>
                            <Text style={styles.pageTitle}>Burned Calorie History</Text>    
                        </View> */}
                    
                        {/* <View style={{width: '100%', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-around', alignItems: 'center', marginTop: Dimensions.get('window').height * 0.02, paddingHorizontal: Dimensions.get('window').width * 0.02}} >
                            <View style={styles.tileItem}>
                                <Ionicons name='ios-flame' size={22} style={styles.tileItemIcon}/>
                                <Text style={styles.tileItemField}>{viewPtSum}</Text>    
                                <Text style={styles.tileItemTitle}>Total Calories Burned</Text>
                            </View>          

                            <View style={styles.tileItem}>
                                <Ionicons name='ios-time' size={22} style={styles.tileItemIcon}/>
                                <Text style={styles.tileItemField}>{playSum}</Text>  
                                <Text style={styles.tileItemTitle}>Total Hours Played</Text> 
                            </View>
                            
                            <View style={styles.tileItem}>
                                <Ionicons name='logo-youtube' size={22} style={styles.tileItemIcon}/>
                                <Text style={styles.tileItemField}>{viewTimes}</Text>  
                                <Text style={styles.tileItemTitle}>Total Times Played</Text>
                            </View>      
                        </View>  */}

                        {/* <SafeAreaView style={{alignSelf: "stretch", marginTop: Dimensions.get('window').height * 0.01, flex:1 }}>  */}
                        <SafeAreaView style={{ marginTop: Dimensions.get('window').height * 0.01, height: Dimensions.get('window').height -10  }}>
                            <FlatList
                                style={styles.feed}
                                data={this.state.postsExer}
                                renderItem={({ item }) => this.renderPost(item)}
                                keyExtractor={item => item.SENDID}
                                showsVerticalScrollIndicator={false}
                                key={item => item.SENDID} // https://stackoverflow.com/questions/45947921/react-native-cant-fix-flatlist-keys-warning
                                // onRefresh={this._handleRefresh}
                                // refreshing={this.state.refreshing}
                                onEndReached={this._handleLoadMore}
                                onEndReachedThreshold={1}
                            >
                            </FlatList>
                        </SafeAreaView>

                    </View>
                } 

            </View>
        );
    }

} // closing class ExerciseHistory








const Stack = createSwitchNavigator(
    {
      Stack1: { screen: ExerciseHistory },
    //   Stack2: { screen: Chart },
    },
    {
      initialRouteName: 'Stack1'
    }
);

const AppContainer = createAppContainer(Stack); 
  






const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: 10,
        // marginTop: 5,
        backgroundColor: '#DCDCDC',
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
        fontSize: 19,
        fontWeight: 'bold',
        textAlign: 'center',
        // borderColor: 'blue',
        // borderWidth: 2,
    },
    tileItem: {
        // borderColor: 'red',
        // borderWidth: 2,
        width: Dimensions.get('window').width * 0.3,
        height: Dimensions.get('window').width * 0.3,
        // flex: 1, 
        flexDirection: 'column',
        justifyContent: 'space-around',

        backgroundColor: "#FFF",
        borderRadius: 8,
        // paddingHorizontal: 6,
        // paddingVertical: 5,
        // flexDirection: "row",
        // flex: 3,
        // marginVertical: 5,
        // shadowColor: 'black', // iOS
        // shadowOffset: { width: 5, height: 5 }, // iOS
        // shadowOpacity: 0.3, // iOS
        // shadowRadius: 2, // iOS   
        // elevation: 2, // Android
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
        // height: 35,
        color: 'dimgray',
        textAlignVertical: 'center',
        textAlign: 'center',
        paddingHorizontal: 5,
        // borderColor: 'green',
        // borderWidth: 2,
    },
    feed: {
        marginHorizontal: 8, // 16
        // backgroundColor: 'pink',
    },
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 5, // 10
        padding: 8,
        flexDirection: "row",
        flex: 2,
        marginVertical: 5,
        shadowColor: 'black', // iOS
        shadowOffset: { width: 3, height: 3 }, // iOS
        shadowOpacity: 0.1, // iOS
        shadowRadius: 2, // iOS   
        elevation: 2, // Android
        // justifyContent: 'space-between',
    },    

    textContents: {
        flexDirection: "column", 
        // width: Dimensions.get('window').width * 0.4, //0.48 //160,
        // backgroundColor: 'pink',
    },
    timestamp: {
        fontSize: 13,
        color: '#454D65', //"#C4C6CE",
        marginTop: 0,
        fontWeight: "500",
        textAlign: 'right',
        marginRight: 5,
    },    
    title: {
        marginTop: 1,
        fontSize: 14,
        // fontWeight: 'bold',
        color: '#ffa500', //'#ffbf00' // "#838899"
        marginBottom: 1,
    },
    // avatar: {
    //     width: 36,
    //     height: 36,
    //     borderRadius: 18,
    //     marginRight: 12
    // },
    name: {
        fontSize: 12,
        fontWeight: "500",
        color: '#C4C6CE', //'#454D65' 
        marginBottom: 1,
    },
        
    textMetadata: {
        flexDirection: "column", 
        // position: 'absolute',
        // bottom: 4,
        // width: Dimensions.get('window').widtxh * 0.4, //0.48 //160,
        // backgroundColor: 'blue',        
    },
    length:{
        // fontWeight: 'bold',
        marginLeft: 4,
    },    
    points:{
        // fontWeight: 'bold',
        marginLeft: 4,
    },
    // tags:{
    //     marginLeft: 6,
    // },
    views:{
        marginLeft: 3,
    },
    // likes: {
    // },
    percentageBar: {
        flex: 1,
        // position: 'absolute',
        left: 0,
        height: 3, //Dimensions.get('window').height * 0.03,
        // bottom: 1,//Dimensions.get('window').height * 0.015,
        backgroundColor: '#ffa500',
    },
    percentageBarBase: {
        flex: 1,
        // position: 'absolute',
        left: 0,
        height: 1, //Dimensions.get('window').height * 0.01,
        // bottom: 0, //Dimensions.get('window').height * 0.015,
        backgroundColor: '#ffa500',
    },      
    postImage: {
        width: Dimensions.get('window').width * 0.3 * (225/150), //150,
        height: Dimensions.get('window').width * 0.3, //225,
        // width: 200,
        borderRadius: 5,
        marginVertical: 5,
        left: 0,
        marginRight: 3,
        // bottom: 0,
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
