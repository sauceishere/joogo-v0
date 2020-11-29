// import * as React from 'react';
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation'; // https://qiita.com/kana-t/items/366c9c07a4c81d6b6c1e
import * as firebase from 'firebase';
import moment from "moment"; 
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { convertCompilerOptionsFromJson } from 'typescript';
import * as ScreenOrientation from 'expo-screen-orientation'; // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationlockasyncorientationlock
import { AdMobBanner } from 'expo-ads-admob'; 

const str_pad_left = function (string,pad,length) { // convert from sec to min:sec // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
    return (new Array(length+1).join(pad)+string).slice(-length);
};

// var post_num = 1; // this actually is rank.

export default class Leaderboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            doneComponentDidMount: false,
            // param: this.props.navigation.getParam('greeting'),
            AVE_PLAYSUM_MIN_WK: null,
            AVE_PLAYSUM_SEC_WK: null,
            // AVE_PT_WK: null,
            AVE_VIEW_WK: null,
            AVE_SCORE_WK: null,
            posts: null, // assign response from loadLeaderboard-py
            within_top: null,
            // oldestLogTs: Date.now() / 1000,
            // page: 1,
            // seed: 1,
            // error: null,
            // refreshing: false,
            // isFlatlistLoaded: false,
            adUnitID: this.props.navigation.getParam('adUnitID'),
        }
        this._requestLoadLeaderboard = this._requestLoadLeaderboard.bind(this);
        this._handleLoadMore = this._handleLoadMore.bind(this);
    }

    // oldestLogTs =  Date.now() / 1000;

    post_num = 1; // this actually is rank.


    _requestLoadLeaderboard = async () => {
        console.log('------------- _requestLoadLeaderboard');
        const { page } = this.state;

        const _loadLeaderboard =  (idTokenCopied) => {
            console.log('----- History _loadLeaderboard.');
            //   console.log('this.oldestLogTs: ', this.oldestLogTs);
            
            fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/loadLeaderboard-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
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
                        console.log('_loadLeaderboard response.detail: ', response.detail );

                        // to control when to display 'ad'. 20200623
                        var i;
                        for (i = 0; i < response.detail.data.length; i++) {
                            console.log('this.post_num: ', this.post_num);
                            response.detail.data[i]['rank'] = this.post_num;  // assign rank
                            this.post_num++; // increment
                        }

                        this.setState({
                            isLoading: false,
                            AVE_PLAYSUM_MIN_WK: response.detail.AVE_PLAYSUM_MIN_WK,
                            AVE_PLAYSUM_SEC_WK: response.detail.AVE_PLAYSUM_SEC_WK,
                            // AVE_PT_WK: response.detail.AVE_PT_WK,
                            AVE_VIEW_WK: response.detail.AVE_VIEW_WK,
                            AVE_SCORE_WK: response.detail.AVE_SCORE_WK,
                            within_top: response.detail.within_top,
                            posts: response.detail.data,
                        }); 
                        // console.log('this.state.posts: ', this.state.posts);
                    } 
        
            }).catch((error) => {
                this.setState({ isLoading: false, });
                console.log('Error _loadLeaderboard: ', error);
                alert('Error _loadLeaderboard. Please try again later.');
            });

        }

        await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
            const idTokenCopied = idToken;
        
            _loadLeaderboard(idTokenCopied);
        
        }).catch(function(error) {
            console.log('Error xxxxxxxxxxxxxxxx Could not get idToken _loadLeaderboard : ', error);
            alert('Error, Could not get idToken _loadLeaderboard. please try again later.')
        });  

    }



    async componentDidMount() {
        console.log('------------- componentDidMount Leaderboard started');
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    
        if (this.state.doneComponentDidMount === false) { // if variable is null. this if to prevent repeated loop.
            console.log('this.state.doneComponentDidMount === false');
            // this.setState({isLoading: true});
            await this._requestLoadLeaderboard(); // kick 
            
        }; // closing if 

        this.setState({doneComponentDidMount: true});

        console.log('------------- componentDidMount Leaderboard.js done');
    } // closing componentDidMount



    _handleLoadMore = async () => {
        console.log('------------- _handleLoadMore: ', this.oldestLogTs);
        this.setState({ page: this.state.page + 1 }, () => {
            this._requestLoadLeaderboard();
        });
    };    



    renderPost = post => {
        // const { oldestLogTs } = this.state;
        console.log('------ renderpost: ');
      

        if (post.SCORESUM == '') {
            this.SCORESUM = '0'; // force to Zero if none
        } else if (post.SCORESUM > 0) {   
            this.SCORESUM = post.SCORESUM.toFixed().toString(); // omit decimal place // convert to string for rendering 
        } else {
            this.SCORESUM = '0'; // force to Zero if none
        }
        // this.PTSUM = this.PTSUM.toString() // convert to string for rendering 



        // (() => {
        console.log('-- post: ' , post.rank, post.UID, post.NNAME, this.SCORESUM, post.USERSELF );
    
        // } )(); 
    
    
        return (
            <View style={styles.feedItem}>
                
                {/* left pane */}
                <View style={{ width: Dimensions.get('window').width * 0.10, }}>
                    <Text style={styles.rank}>{post.rank}</Text> 
                </View>

                {/* medal pane */}
                <View style={{ width: Dimensions.get('window').width * 0.10, }}>
                    { post.MEDAL == 'GOLD' ?
                        <Image style={{width: Dimensions.get('window').width * 0.06, height: Dimensions.get('window').width * 0.06,}} source={require('../assets/goldMedal100x100.png')} />
                    :
                        null    
                    }
                </View>                

                <View style={{ width: Dimensions.get('window').width * 0.50, }}>
                    <Text style={styles.name, {color: post.USERSELF == 1 ? '#ffa500': '#454D65', fontWeight: post.USERSELF == 1 ? 'bold': 'normal'  }}>{post.NNAME}</Text>
                </View>    

                {/* right pane */}   
                <View style={{ width: Dimensions.get('window').width * 0.20, }}> 
                    <Text style={styles.point}>{this.SCORESUM}</Text> 
                </View>
                
            </View>
        );
    }; // closing renderpost    



    render() {
        console.log('------------- render.');
        const { isLoading, AVE_PLAYSUM_MIN_WK, AVE_PLAYSUM_SEC_WK, AVE_SCORE_WK, AVE_VIEW_WK, within_top, adUnitID } = this.state;

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
                    <View style={{width: '100%', flexDirection: 'column', flexWrap: 'nowrap', }}>

                        <View style={{width: '100%', flex: 1, marginTop: Dimensions.get('window').height * 0.02, }}>
                            <Text style={styles.pageTitle}>Top Calorie Burners' Weekly Average</Text>    
                        </View>
                    
                        <View style={{width: '100%', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-around', alignItems: 'center', marginTop: Dimensions.get('window').height * 0.05, paddingHorizontal: Dimensions.get('window').width * 0.02}} >
                            <View style={styles.tileItem}>
                                {/* <Text style={styles.tileItemTitle}> <Ionicons name='ios-body' size={18} style={styles.tileItemIcon}/> {' '} Movage Earned</Text> */}
                                <Ionicons name='ios-flame' size={22} style={styles.tileItemIcon}/>
                                <Text style={styles.tileItemField}>{AVE_SCORE_WK}</Text>  
                                <Text style={styles.tileItemTitle}>Calorie Burned</Text>  
                            </View>          

                            <View style={styles.tileItem}>
                                {/* <Text style={styles.tileItemTitle}> <Ionicons name='ios-time' size={18} style={styles.tileItemIcon}/> {' '} Mins Worked Out</Text>  */}
                                <Ionicons name='ios-time' size={22} style={styles.tileItemIcon}/> 
                                <Text style={styles.tileItemField}>{AVE_PLAYSUM_MIN_WK}</Text>  
                                <Text style={styles.tileItemTitle}>Mins Played</Text> 
                            </View>
                            
                            <View style={styles.tileItem}>
                                {/* <Text style={styles.tileItemTitle}> <Ionicons name='logo-youtube' size={18} style={styles.tileItemIcon}/> {' '} Times Played</Text> */}
                                <Ionicons name='logo-youtube' size={22} style={styles.tileItemIcon}/> 
                                <Text style={styles.tileItemField}>{AVE_VIEW_WK}</Text>  
                                <Text style={styles.tileItemTitle}>Times Played</Text>
                            </View>      
                        </View> 

                        <View style={{alignSelf: "stretch", marginTop: Dimensions.get('window').height * 0.03, paddingHorizontal: Dimensions.get('window').width * 0.03}}> 
                            <Text style={styles.pageTitle}>Burned Calorie Ranking</Text> 
                            <SafeAreaView style={{ marginTop: Dimensions.get('window').height * 0.01, height: Dimensions.get('window').height * 0.5 }}>
                            <FlatList
                                style={styles.feed}
                                data={this.state.posts}
                                renderItem={({ item }) => this.renderPost(item)}
                                keyExtractor={item => item.UID}
                                showsVerticalScrollIndicator={false}
                                key={item => item.UID} // https://stackoverflow.com/questions/45947921/react-native-cant-fix-flatlist-keys-warning
                                // onRefresh={this._handleRefresh}
                                // refreshing={this.state.refreshing}
                                // onEndReached={this._handleLoadMore}
                                // onEndReachedThreshold={1}
                            >
                            </FlatList>
                            </SafeAreaView>
                        </View>

                    </View>
                } 


                <View style={styles.ads}>
                    <AdMobBanner
                    bannerSize="smartBanner"
                    adUnitID = {adUnitID} //'ca-app-pub-9079750066587969/4230406044' // {this.state.adUnitID} // Banner ID ca-app-pub-9079750066587969/4230406044 // Test ID ca-app-pub-3940256099942544/6300978111
                    servePersonalizedAds // true or false
                    onDidFailToReceiveAdWithError={(error) => console.log('AdMob error: ', error)} />
                </View>


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
        shadowColor: 'black', // iOS
        shadowOffset: { width: 5, height: 5 }, // iOS
        shadowOpacity: 0.3, // iOS
        shadowRadius: 2, // iOS   
        elevation: 2, // Android
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
        // paddingHorizontal: 5,
        // borderColor: 'green',
        // borderWidth: 2,
    },
    feed: {
        // marginHorizontal: 8, // 16
        // backgroundColor: 'pink',
    },
    feedItem: {
        backgroundColor: "#FFF",
        borderRadius: 3, // 10
        paddingHorizontal: 5,
        paddingVertical: 5,
        flexDirection: "row",
        flex: 3,
        marginVertical: 2,
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
        // marginVertical: 2,
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffa500', //'#ffbf00' // "#838899"
        paddingLeft: 5,
    },
    medal: {
        // marginVertical: 2,
        fontSize: 15,
        // fontWeight: 'bold',
        // color: '#ffa500', //'#ffbf00' // "#838899"
    },    
    name: {
        // marginVertical: 2,
        fontSize: 15,
        fontWeight: "500",
        // color: '#C4C6CE', //'#454D65' 
    },    
    point: {
        // marginVertical: 2,
        fontSize: 15,
        color: '#454D65', //"#C4C6CE",
        fontWeight: "bold",
        textAlign: 'right',
        // paddingRight: 5,
    },    

        
    // textMetadata: {
    //     position: 'absolute',
    //     bottom: 4,
    // },
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
    ads: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',  
        // borderColor: 'green',
        // borderWidth: 2,        
    },  
})
