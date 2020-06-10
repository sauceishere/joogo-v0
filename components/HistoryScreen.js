import * as React from 'react';
import { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation'; // https://qiita.com/kana-t/items/366c9c07a4c81d6b6c1e
import * as firebase from 'firebase';
import moment from "moment"; 
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { convertCompilerOptionsFromJson } from 'typescript';


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
            isLoading: false,
            doneComponentDidMount: false,
            param: this.props.navigation.getParam('greeting'),
            viewPtSum: null,
            playSum: null,
            viewTimes: null,
        }
        // this._getExerHistSummary = this._getExerHistSummary.bind(this);
    }


    async componentDidMount() {
        console.log('------------- componentDidMount ExerciseHistory started');
    
        if (this.state.doneComponentDidMount === false) { // if variable is null. this if to prevent repeated loop.
            console.log('this.state.doneComponentDidMount === false');
            // this.setState({isLoading: true});
    
            const _getExerHistSummary = (idTokenCopied) => {
                console.log('----- History _getExerHistSummary.');
                //   console.log('this.oldestVidTs: ', this.oldestVidTs);
                
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
                            playSum = parseInt(playSum / 60 / 60); // convert from second to hour
                            var viewTimes = response.detail.VIEW_TIMES;

                            this.setState({
                                isLoading: false,
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
    
            this.setState({doneComponentDidMount: true});

        }; // closing if 

        console.log('------------- componentDidMount ExerciseHistory done');
    } // closing componentDidMount


    // _renderPost = post => {
    //     const {  } = this.state;
    //     console.log('------ _renderpost: ');
    // }


    render() {
        console.log('------------- render.');
        const { isLoading, viewPtSum, playSum, viewTimes } = this.state;
        // console.log('exerHistSummary: ', viewPtSum, playSum, viewTimes ); 


        return (
            <View style={styles.container}>

                <TouchableOpacity onPress={ () => this.props.navigation.navigate('Stack2', { greeting: 'Hallo Post',}) } style={styles.PageSwitchButton} >
                    <Text style={{color: 'gray', fontSize: 16, fontWeight: 'bold',}}> Post Video History </Text>
                </TouchableOpacity>


                { isLoading ? 
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="large" color='#ffa500'/>
                        <Text>Loading....</Text>
                    </View>
                :
                    <View style={{width: '100%', }}>

                        <View style={{width: '100%', flex: 1, marginTop: Dimensions.get('window').height * 0.05, marginBottom: Dimensions.get('window').height * 0.1,}}>
                            <Text style={styles.pageTitle}>Work Out History</Text>    
                        </View>
                    
                        <View style={{width: '100%', flex: 1, flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-around', }} >
                            <View style={styles.tileItem}>
                                <Ionicons name='ios-body' size={30} style={styles.tileItemIcon}/>
                                <Text style={styles.tileItemTitle}>Movage Point</Text>
                                <Text style={styles.tileItemField}>{viewPtSum}</Text>    
                            </View>          

                            <View style={styles.tileItem}>
                                <Ionicons name='ios-videocam' size={30} style={styles.tileItemIcon}/>
                                <Text style={styles.tileItemTitle}>Time Length(hr)</Text>
                                <Text style={styles.tileItemField}>{playSum}</Text>  
                            </View>
                            
                            <View style={styles.tileItem}>
                                <Ionicons name='ios-eye' size={30} style={styles.tileItemIcon}/>
                                <Text style={styles.tileItemTitle}>Video Watched</Text>
                                <Text style={styles.tileItemField}>{viewTimes}</Text>  
                            </View>      
                        </View>

    

                        {/* <View>

                            <FlatList
                            style={styles.feed}
                            data={this.state.posts}
                            // data={this.allPosts}
                            renderItem={({ item }) => this._renderPost(item)}
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

                        </View> */}


                    </View>
                }

            </View>
        );
    }
}
  


class PostHistory extends Component {

    constructor(props) {
        super(props);
        this.state = {
            flagProgreeBarStart: false,
            param: this.props.navigation.getParam('greeting'),
        }
    }

    render() {
        return (
            <View
            style={{
                flex: 1,
                justifyContent: 'center',
                borderWidth: 5,
                borderColor: 'yellow',
            }}>
            <Button
                title="Go to Exercise"
                onPress={() =>
                this.props.navigation.navigate('Stack1', {
                    greeting: 'Hallo Exer',
                })
                }
            />
            </View>
        );
    }
}
  
  
  
// const MyNavigator = createSwitchNavigator({
//     ExerciseHistory: ExerciseHistory,
//     PostHistory: PostHistory,
// });


const Stack = createSwitchNavigator(
    {
      Stack1: { screen: ExerciseHistory },
      Stack2: { screen: PostHistory },
    },
    {
      initialRouteName: 'Stack1'
    }
  );



const AppContainer = createAppContainer(Stack); 
  


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
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
        fontSize: 25,
        height: 35,
        color: 'dimgray',
        textAlignVertical: 'center',
        textAlign: 'center',
        paddingHorizontal: 10,
        // borderColor: 'green',
        // borderWidth: 2,
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
