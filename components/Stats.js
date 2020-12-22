

// WebView referred to https://snack.expo.io/@wodin/webview-example
import React from 'react';
import {Component} from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as firebase from 'firebase';

import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
import * as SQLite from 'expo-sqlite';
// import { real } from '@tensorflow/tfjs';
import moment from 'moment'; // https://momentjs.com/docs/

// import {dbSQLite, dbName} from './DashboardScreen';
import * as ScreenOrientation from 'expo-screen-orientation'; // https://docs.expo.io/versions/latest/sdk/screen-orientation/#screenorientationlockasyncorientationlock
import { AdMobBanner } from 'expo-ads-admob'; 
import { scrW, scrH, winW, winH, sBarH, vButtonH } from './DashboardScreen'; // get screen size & window size from DashboardScreen.js
import * as FacebookAds from 'expo-ads-facebook'; // https://docs.expo.io/versions/latest/sdk/facebook-ads/

// export default function App() {
export default class Stats extends Component {


    constructor(props) {
        super(props);
        this.state = {
            // dbName: 'db_' + firebase.auth().currentUser.uid, //UID will be assigned during componentDidMount // {vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
            // sumLogName: 'sumLog_' + firebase.auth().currentUser.uid, // summary log for Total Calorie Burned, Total Hours Played, Total Times Played
            // dbContents: null, // get data from db
            scoreTtl: null, // total calories burned.
            playSumTtl: null,  // total duration played.
            playCnt: null, // total times played.
            dataByYearWeeks: null, // data for google chart
            isLoading: true, 
            didLoadChartData: false,
            // StatsDataLoadedAt: this.props.navigation.getParam('StatsDataLoadedAt') || null,
            // lastPlayEnded: this.props.navigation.getParam('lastPlayEnded') || null,
            adUnitID: this.props.navigation.getParam('adUnitID'),
        }
    };


    async componentDidMount() {
        // const { dbName, } = this.state;
        console.log('------------- componentDidMount Stats started');
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        console.log('this.state.StatsDataLoadedAt: ', this.state.StatsDataLoadedAt);
        console.log('this.state.lastPlayEnded: ', this.state.lastPlayEnded);
        const ts = Date.now() / 1000;

        // if ( !this.state.StatsDataLoadedAt || this.state.StatsDataLoadedAt < this.state.lastPlayEnded ) { // to laod data again if never loaded OR last load datetime is earlier than last played datetime. 
        //     console.log('--------------------- Loading on Stats.js');

            const _getStats= (idTokenCopied) => {
                console.log('----- Stats _getStats.');
                //   console.log('this.oldestLogTs: ', this.oldestLogTs);
                
                fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/getStats-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
                    method: 'POST',
                    headers: {
                        // 'Accept': 'application/json', 
                        'Content-Type' : 'application/json' // text/html text/plain application/json
                    },
                        // mode: "no-cors", // no-cors, cors, *same-origin
                        body: JSON.stringify({
                        id_token: idTokenCopied,
                        time_diff: new Date().getTimezoneOffset(), // in minutes, eg. bkk = -420
                    })
                }).then( result => result.json() )
                    .then( response => { 
                    // console.log('------------------ _getStats response: ', response);
        
                        if( response["code"] == 'ok'){
                            console.log('---------------- ok');
                            console.log('_getStats response.detail: ', response.detail );

                            var viewPtSum = response.detail.VIEW_PTSUM;
                            viewPtSum = parseInt(viewPtSum); // convert to int
                            var playSum = response.detail.PLAYSUM;
                            if ( playSum < 60 * 60 ) { // less than 1 hour
                                playSum = parseFloat(playSum / 60 / 60 / 10).toFixed(2); // show like 0.1
                            } else { // over 1 hour
                                playSum = parseInt(playSum / 60 / 60); // convert from second to hour
                            }
                            var viewTimes = response.detail.VIEW_TIMES;


                            var chartData = JSON.stringify( response.chartData ); // convert from object to json to match google chart data structure.
                            // chartData = chartData.replace(/"/g, ""); // remove double quotations
                            // chartData.shift(); // rmeove the first array
                            // chartData.unshift( ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]  ); // add array on top
                            console.log('chartData: ', chartData);

                            // var dataByYearWeeks = [ ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] ];   
                            // chartData.map(ind => {
                            //     // console.log('ind: ', ind);
                            //     dataByYearWeeks.push( [ ind ] ); // data array for google chart like ['2020-01', 1,3,2,5,4,6,3]
                            // });
                            // console.log('dataByYearWeeks: ', dataByYearWeeks);

                            this.setState({
                                isLoading: false,
                                scoreTtl: viewPtSum,
                                playSumTtl: playSum,
                                playCnt: viewTimes,
                                dataByYearWeeks: chartData,
                                didLoadChartData: true,
                                // StatsDataLoadedAt: ts,
                            }); 
                        } else {
                            console.log('Error or no_data from getStats-py');
                            alert('Error or no_data from getStats-py');
                        }
            
                }).catch((error) => {
                    this.setState({ isLoading: false, });
                    console.log('Error _getStats: ', error);
                    alert('Error _getStats. Please try again later.');
                });
        
            }
        
            await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
                const idTokenCopied = idToken;
            
                _getStats(idTokenCopied);
            
            }).catch(function(error) {
                console.log('Error xxxxxxxxxxxxxxxx Could not get idToken _getStats : ', error);
                alert('Error, Could not get idToken _getStats. please try again later.')
            });  


        // } else { // if already loaded on Dashboard.js.
        //     console.log('--------------------- No loading on Stats.js');
        //     this.setState({
        //         scoreTtl: this.props.navigation.getParam('scoreTtl') ,
        //         playSumTtl: this.props.navigation.getParam('playSumTtl') ,
        //         playCnt: this.props.navigation.getParam('playCnt') ,
        //         dataByYearWeeks: this.props.navigation.getParam('dataByYearWeeks') ,
        //         isLoading: false,
        //         didLoadChartData: true,
        //     });  
        // }

        

        // // sqllite
        // // https://sqlite.org/datatype3.html
        // // https://qiita.com/falorse/items/17370bc33676e8c03b9d

        // const dbSQLite = SQLite.openDatabase( 'db_' + firebase.auth().currentUser.uid); // initiate SQLite 20201013

        // // get from table
        // dbSQLite.transaction(tx => {
        //     tx.executeSql(
        //       'select * from vidViewLog',
        //       null,
        //     //   (_, { rows: { _array } }) => this.setState({ dbContents: _array} )
        //     // (_array) => this.setState({ dbContents: _array} )
        //     (tx, results) => {
        //         // console.log('results: ', results);


        //         //// create blank arrayPastWeeks. 20201013　https://developers.google.com/chart/interactive/docs/gallery/areachart
        //         // var arrayPastWeeks = [ ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] ];
        //         var jsonPastWeeks = {}; // to append blank object, and later increment actual data.
        //         var arrayYearWeeks = []; // to record Year_Weeks like '202002' in int for 
        //         let dtNow = new Date(); // local datetime 
        //         let deductDays = [0, -7, -14, -21, -28, -35, -42, -49, -56, -63, -70, -77, -84, -91]; // back to 3 months ago
        //         // console.log('Math.abs(Math.min(...deductDays)): ', Math.abs(Math.min(...deductDays)) );
        //         var x;
        //         for (x of deductDays) {
        //             // console.log( moment(dtNow).add(x, 'd').toDate().getFullYear(), (moment(dtNow).add(x, 'd').toDate().getMonth() + 1 ).toString().padStart(2,'0'), (moment(dtNow).add(x, 'd').toDate().getDate() ).toString().padStart(2,'0')  );
        //             let weeknum = moment( (moment(dtNow).add(x, 'd').toDate().getMonth() + 1 ).toString().padStart(2,'0') + "-" + (moment(dtNow).add(x, 'd').toDate().getDate() ).toString().padStart(2,'0') + "-" + moment(dtNow).add(x, 'd').toDate().getFullYear(), "MM-DD-YYYY").week();
        //             jsonPastWeeks[ parseInt( (moment(dtNow).add(x, 'd').toDate().getFullYear().toString() ).concat( weeknum.toString() ) ) ] = { "Sun":0, "Mon":0, "Tue":0, "Wed":0, "Thu":0, "Fri":0, "Sat":0 }; // assign
        //             arrayYearWeeks.push( parseInt( (moment(dtNow).add(x, 'd').toDate().getFullYear().toString() ).concat( weeknum.toString() ) ) ); // keep this to create data array for google chart later
        //         }
        //         // console.log('jsonPastWeeks: ', jsonPastWeeks);


        //         //// create 3 variables for summary 
        //         var scoreTtl = 0; // initiate variable to summate total calories burned.
        //         var playSumTtl = 0;  // initiate variable to summate total duration played.
        //         var playCnt = 0;  // initiate variable to summate total times played.
        //         const dowArray = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
        //         if (results.rows.length > 0) { 
        //             results.rows._array.map(result => {
        //                 // console.log('result: ', result);
        //                 // console.log('result.id, ts, score, playSum, startAt: ', result.id, result.ts, result.score, result.playSum, result.startAt, new Date(result.ts * 1000).toLocaleString() );
        //                 scoreTtl = scoreTtl + result.score;
        //                 playSumTtl = playSumTtl + result.playSum;
        //                 if (result.startAt != null) { // if there is startAt ts exists
        //                     playCnt++;
        //                 };

        //                 // create data for google chart
        //                 if ( parseInt(result.ts) > parseInt(result.ts) - Math.abs(Math.min(...deductDays)) * 60 * 60 * 24 ) { // filter data that is younger than X days old, to reduce data processing.
        //                     let year =  new Date( new Date(result.ts * 1000).toLocaleString()).getFullYear() ;
        //                     let month =  (new Date( new Date(result.ts * 1000).toLocaleString()).getMonth() + 1 ).toString().padStart(2,'0') ;
        //                     let date = (new Date( new Date( result.ts * 1000).toLocaleDateString()).getDate() ).toString().padStart(2,'0') ;
        //                     let dow = new Date( new Date( result.ts * 1000).toLocaleDateString()).getDay() ; // 0 = Sunday
        //                     let dowText = dowArray[dow]; // match from dowArray to convert to text 
        //                     let weeknum = moment(month + "-" + date + "-" + year, "MM-DD-YYYY").week();
        //                     // console.log( 'year month date, dow, weeknum: ', year, month, date, dow, dowText, weeknum);

        //                     jsonPastWeeks[ parseInt( (year.toString()).concat(weeknum.toString()) ).toString() ][dowText] = parseInt( jsonPastWeeks[ (year.toString()).concat(weeknum.toString()) ][dowText] ) + parseInt( result.score );
        //                 }
        //             })
        //             // console.log('jsonPastWeeks: ', jsonPastWeeks);

        //         } else {
        //             console.log('No data in SQLite');
        //         }


        //         //// Convert object to array for google chart
        //         arrayYearWeeks.sort(); // sort Year_Week
        //         // console.log('arrayYearWeeks: ', arrayYearWeeks);
        //         var dataByYearWeeks = [ ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] ];   
        //         arrayYearWeeks.map(ind => {
        //             // console.log('ind: ', ind);
        //             dataByYearWeeks.push( [ ind.toString().slice(0, 4) + "_" + ind.toString().slice(4, 6), jsonPastWeeks[ind]['Sun'], jsonPastWeeks[ind]['Mon'], jsonPastWeeks[ind]['Tue'], jsonPastWeeks[ind]['Wed'], jsonPastWeeks[ind]['Thu'], jsonPastWeeks[ind]['Fri'], jsonPastWeeks[ind]['Sat']]); // data array for google chart like ['2020-01', 1,3,2,5,4,6,3]
        //         });


        //         dataByYearWeeks = JSON.stringify(dataByYearWeeks); // convert from object to json to match google chart data structure.
        

        //         if ( scoreTtl < 1000 ) {
        //             scoreTtl = parseFloat(scoreTtl).toString().slice(0, parseFloat(scoreTtl).toString().indexOf('.') + 2 ); 
        //         } else { // >= 1000
        //             // scoreTtl = parseFloat(scoreTtl).toString().slice(0, parseFloat(scoreTtl / 1000).toString().indexOf('.') + 2 ) + 'K';
        //             scoreTtl = parseInt(scoreTtl).toString();
        //         }

        //         if ( playSumTtl < 60 * 60 * 100 ) { // less than 100 hour
        //             playSumTtl = parseFloat(playSumTtl / 60 / 60).toString().slice(0, parseFloat(playSumTtl / 60 / 60).toString().indexOf('.') + 2 );
        //         } else { 
        //             // playSumTtl = parseInt(playSumTtl / 60 / 60).toString();
        //             playSumTtl = parseFloat(playSumTtl / 60 / 60).toString().slice(0, parseFloat(playSumTtl / 60 / 60).toString().indexOf('.') + 2 );
        //         }

        //         if ( playCnt < 1000 ) {
        //             playCnt = parseInt(playCnt); // 
        //         } else if (scoreTtl > 1000000) { 
        //             // playCnt = parseInt(playCnt / 1000) + 'K'; //
        //             playCnt = parseInt(playCnt);
        //         } else { // 1,000 < x < 1,000,000
        //             playCnt = parseInt(playCnt); 
        //         }
              
        //         this.setState({ scoreTtl: scoreTtl, playSumTtl: playSumTtl, playCnt: playCnt, dataByYearWeeks: dataByYearWeeks, isLoading: false });
        //     }
        //     );
        //   },
        //   () => {console.log('fail in selecting sqlite')},
        //   () => {console.log('success in selecting sqlte: ')},
        // ); 


    };



    render() {  
        console.log('--- render Stats');
        const { scoreTtl, playSumTtl, playCnt, dataByYearWeeks, isLoading, didLoadChartData, adUnitID } = this.state;
        // console.log('scoreTtl, playSumTtl, playCnt: ', scoreTtl, playSumTtl, playCnt);
        // console.log('dataByYearWeeks: ', dataByYearWeeks);


        const initialHTMLContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title></title>
                <meta name="author" content="">
                <meta name="description" content="">
                <meta name="viewport" content="width=device-width, initial-scale=1">

                <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
                
                <style type="text/css">
                    body{
                        background-color: #dcdcdc;
                        width: 95%; 
                        height: 95%;
                    }
                    div#chart_div{
                        border: solid 0.1em white;
                        border-radius: 0.5em;
                        width: 100%; 
                        height: 100%;
                        // padding: 0;
                        background-color: white;
                    }
                    // div#rawData{
                    //     border: solid 0.1em white;
                    //     border-radius: 0.5em;
                    //     width: 100%; 
                    //     height: 10%;
                    //     // padding: 0;
                    //     background-color: pink;
                    // }
                </style>


                <script type="text/javascript">

                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawChart);
            
                function drawChart() {
                    var data = google.visualization.arrayToDataTable( ${dataByYearWeeks} );
            
                    var options_stacked = {
                        isStacked: true,
                        height: 400,
                        width: '94%',
                        legend: {position: 'top', maxLines: 2},
                        vAxis: {title: 'Calories', minValue: 0, format: 'short'},
                        hAxis: {title: 'Year_Week',  titleTextStyle: {color: '#333'}, slantedText: true, slantedTextAngle:90},
                        // colors: ['red', 'yellow', 'orange', 'blue', 'green', 'purple', 'pink'],
                        // colors: ['#b37400', '#cc8400', '#ffa500', '#ffae1a', '#ffc04d', '#ffc967', '#ffdb9a'], // '#e69500', '#ffb733', '#ffd280',
                        // colors: ['#ffdb9a', '#ffc967', '#ffc04d', '#ffae1a', '#ffa500', '#cc8400', '#b37400'],
                        // colors: ['#fd6104', '#fd9a00', '#ffa500', '#ffae1a', '#ffce03', '#fef001', '#ffff00'],
                        colors: ['#fd6104','#f58c00', '#ff980f', '#ffa329', '#ffae42', '#ffdd42', '#ffff00', ], // '#ff9e42', '#ffa500',  '#ffbe42', 
                        areaOpacity: 1,
                        chartArea: { left: 60, top: 60, bottom: 80, right: 10 }, // width:'50%',height:'75%'
                        backgroundColor: { strokeWidth: 0}, 
                        

                    };
            
                    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
                    chart.draw(data, options_stacked);
                }
                </script>

            
            
            </head>
            <body>
                
                <div id="chart_div" ></div>

            </body>
            </html>
        `;


    
        return (
            <View style={styles.container}>
                
                { isLoading ?
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="large" color='#ffa500'/>
                        <Text>Loading....</Text>
                    </View>
                :
                    
                    <View style={{width: '100%', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-around', alignItems: 'center', marginVertical: (scrH - vButtonH) * 0.02, paddingHorizontal: (scrH - vButtonH) * 0.01}} >
                        <View style={styles.tileItem}>
                            <Ionicons name='ios-flame' size={22} style={styles.tileItemIcon}/>
                            <Text style={styles.tileItemField}> {scoreTtl} </Text>    
                            <Text style={styles.tileItemTitle}>Total Calories Burned</Text>
                        </View>          

                        <View style={styles.tileItem}>
                            <Ionicons name='ios-time' size={22} style={styles.tileItemIcon}/>
                            <Text style={styles.tileItemField}>{ playSumTtl }</Text>  
                            <Text style={styles.tileItemTitle}>Total Hours Played</Text> 
                        </View>
                        
                        <View style={styles.tileItem}>
                            <Ionicons name='logo-youtube' size={22} style={styles.tileItemIcon}/>
                            <Text style={styles.tileItemField}> {playCnt} </Text>  
                            <Text style={styles.tileItemTitle}>Total Times Played</Text>
                        </View>      
                    </View> 
                }


                { didLoadChartData ?
                    <WebView
                        originWhitelist={['*']}
                        javaScriptEnabled={true}
                        domStorageEnabled={false}
                        source={{
                        html: initialHTMLContent,
                        }}
                        style={ styles.chartArea }
                    />
                :
                    null
                }   
                

                <View style={styles.ads}>
                    <AdMobBanner
                    bannerSize="largeBanner"
                    adUnitID = {adUnitID} //'ca-app-pub-9079750066587969/4230406044' // {this.state.adUnitID} // Banner ID ca-app-pub-9079750066587969/4230406044 // Test ID ca-app-pub-3940256099942544/6300978111
                    servePersonalizedAds // true or false
                    onDidFailToReceiveAdWithError={(error) => console.log('AdMob error: ', error)} />

                    {/* <FacebookAds.BannerAd
                    placementId="DEMO_AD_TYPE#261513588602407_396181171802314" // DEMO_AD_TYPE#261513588602407_396181171802314
                    type="standard"
                    onPress={() => console.log('click')}
                    onError={error => console.log('error', error)}
                    /> */}
                </View>


            </View>
        );
    }
}  
  

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#DCDCDC',
        alignItems: 'center',
        justifyContent: 'center',
        // padding: 24,
        top: 0, //StatusBar.currentHeight,
        // height: Dimensions.get('screen').width, // when Landscape 
        // width: Dimensions.get('screen').height, // when Landscape 
        // height: Dimensions.get('screen').height, // when Portrait 
        // width: Dimensions.get('screen').width, // when Portrait     
        // position: 'absolute',
        flex: 1,
        // zindex: 0, // 20200531
        // borderColor: 'green',
        // borderWidth: 1,
    },
    tileItem: {
        // borderColor: 'red',
        // borderWidth: 2,
        width: scrW * 0.3,
        height: scrW * 0.3,
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
        fontSize: 26,
        // height: 35,
        color: 'dimgray',
        textAlignVertical: 'center',
        textAlign: 'center',
        paddingHorizontal: 5,
        // borderColor: 'green',
        // borderWidth: 2,
    },
    chartArea: {
        // backgroundColor: '#DCDCDC',
        height: scrW ,
        // height: '100%',
        width: scrW * 0.98,
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
        // backgroundColor: 'green',
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
});


