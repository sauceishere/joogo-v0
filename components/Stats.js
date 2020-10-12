

// // import * as React from 'react';
// import React, {Component} from 'react';
// import { Text, View, StyleSheet, Dimensions, StatusBar, Image, TouchableOpacity, SafeAreaView, ScrollView, Button, Platform, ActivityIndicator, } from 'react-native';
// import * as firebase from 'firebase';
// import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
// // import { split } from '@tensorflow/tfjs';
// import moment from 'moment'; // https://momentjs.com/docs/
// // import * as Localization from 'expo-localization';
// // import * as RNLocalize from 'react-native-localize'; // https://dev.to/ugglr/react-native-getting-user-device-timezone-and-converting-utc-time-stamps-using-the-offset-3jh8
// // import moment from 'moment-timezone'; // https://dev.to/ugglr/react-native-getting-user-device-timezone-and-converting-utc-time-stamps-using-the-offset-3jh8



// export default class Stats extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//           vidViewLogTemp: 'vidViewLogTemp_' + firebase.auth().currentUser.uid, //{vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
//           vidViewLog: 'vidViewLog_' + firebase.auth().currentUser.uid, //{vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
//         }
//     }

  
//     async componentDidMount() {
  
//       console.log('----------- _checkVidViewLogDirectory start' );
//       // // check if vidViewLog local directory exists, if not then create directory. 
//       this.curDir = FileSystem.documentDirectory; // get root directory
//       // console.log('this.curDir: ', this.curDir);  
      
//       // const deviceTimeZone = Localization.timezone; // get device timezone
//       // console.log('deviceTimeZone: ', deviceTimeZone);
      
//       // // Check Directories & Files in current directory. // THIS IS FOR MANUAL ACTION 
//       FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLog ).then( content => {
//         const files = content;
//         // console.log('check this.curDir Dirs and Files: ', content); // how many localFiles in array
//         // console.log(files);
//         var ind;
//         for (ind of files) {
//             console.log( new Date( parseFloat(ind.toString().split('_')[0]) * 1000) ); // convert to datetime
//             // console.log( new Date( parseFloat(ind.toString().split('_')[0]) * 1000).toLocaleString() );    
//             // console.log( new Date( parseFloat(ind.toString().split('_')[0]) * 1000) + (new Date().getTimezoneOffset() * 60000) );
//             let year = new Date(new Date( parseFloat(ind.toString().split('_')[0]) * 1000).toLocaleDateString()).getFullYear();
//             let month = (new Date( new Date( parseFloat(ind.toString().split('_')[0]) * 1000).toLocaleDateString() ).getMonth() + 1 ).toString().padStart(2,'0') ;
//             let date = (new Date( new Date( parseFloat(ind.toString().split('_')[0]) * 1000).toLocaleDateString() ).getDate() ).toString().padStart(2,'0') ;
//             let day = new Date(new Date( parseFloat(ind.toString().split('_')[0]) * 1000).toLocaleDateString()).getDay();
//             let weeknum = moment(month + "-" + date + "-" + year, "MM-DD-YYYY").week();
//             console.log( 'year month date, day, weeknum: ', year, month, date, day, weeknum);
    
//             FileSystem.readAsStringAsync( this.curDir + this.state.vidViewLog + '/' + ind).then( localFileContents => {
//               console.log(JSON.parse(localFileContents)["ts"]);
//             } );

//         }
//         // Make moment of right now, using the device timezone
//         // const today = moment().tz(deviceTimeZone);
//         // console.log('today: ', today);

          
//       })
      
//       // // Delete File // THIS IS FOR MANUAL ACTION AGAINST ERROR
//       // FileSystem.deleteAsync( this.curDir  ).then( (dir) => {
//       //   console.log('---------- File Deleted: ', dir);
//       // }).catch(error => {
//       //   console.log('error: ', error);
//       // });   
  
  
//     }
  
//     render() {
//         return (
//             <View>
//                 <Text>_checkVidViewLogDirectory </Text>
//             </View>
//         );
//     }
//   }







/////////////////////////////////////////////////////////////////////////////////////////////////

// WebView referred to https://snack.expo.io/@wodin/webview-example
import React from 'react';
import {Component} from 'react';
import { StyleSheet, View, Text, Dimensions} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as firebase from 'firebase';

import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
// import  {SQLite} from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';
// import { real } from '@tensorflow/tfjs';

// import {dbSQLite, dbName} from './DashboardScreen';

// const dbSQLite = SQLite.openDatabase( 'db.' + firebase.auth().currentUser.uid);


// export default function App() {
export default class Stats extends Component {


    constructor(props) {
        super(props);
        this.state = {
            dbName: 'db_' + firebase.auth().currentUser.uid, //UID will be assigned during componentDidMount // {vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
            // sumLogName: 'sumLog_' + firebase.auth().currentUser.uid, // summary log for Total Calorie Burned, Total Hours Played, Total Times Played
            // dbContents: null, // get data from db
            scoreTtl: null, // otal calories burned.
            playSumTtl: null,  // total duration played.
            playCnt: null, // total times played.
        }
    };


    async componentDidMount() {
        const { dbName, } = this.state;
        console.log('------------- componentDidMount Stats started');
        dbSQLite = SQLite.openDatabase( 'db.' + firebase.auth().currentUser.uid);



        // check if db directory exists.
        this.curDir = FileSystem.documentDirectory; // get root directory
        // // check if vidViewLogTemp Directory already exists, if not then create directory 20200502
        await FileSystem.getInfoAsync( this.curDir + 'SQLite' + dbName ).then( async contents => {
            if ( contents['exists'] == true & contents['isDirectory'] == true ) { // if folder already exists.
                console.log('dbName already exists');
                console.log('dbName contents.length: ', contents.length);
                console.log('dbName getInfoAsync contents[size] in MB: ', contents['size'] / 1024 / 1024, );
            } else {
                console.log('dbName NOT exist');
            }
      
        }).catch( error => {
            console.log('dbName FileSystem.getInfoAsync error: ', error);
            alert('dbName FileSystem.getInfoAsync error: ', error);
        })



        // sqllite
        // https://sqlite.org/datatype3.html
        // https://qiita.com/falorse/items/17370bc33676e8c03b9d

        // create table
        dbSQLite.transaction(tx => {
            tx.executeSql(
              'create table if not exists vidViewLog (id integer primary key not null, ts real, vidId blob, viewId blob, startAt real, endAt real, score real, playSum real, wval blob, wunit text);', // uid blob, nTa real, pt blob,  実行したいSQL文
              null, // SQL文の引数
              () => {console.log('success in creating sqllite0')}, // 成功時のコールバック関数
              () => {console.log('fail in creating sqllite0')} // 失敗時のコールバック関数
            );
          },
          () => {console.log('fail in creating sqllite1')}, // 失敗時のコールバック関数
          () => {console.log('success in creating sqllite1')} // 成功時のコールバック関数
        );

        // insert into table
        dbSQLite.transaction(tx => {
            tx.executeSql(
              `insert into vidViewLog (ts, vidId, score) values (?, ?, ?);`,
              [Date.now() / 1000, '332602b9-13f5-412f-bb5a-d67589bf6427', '0.4' ]
            );
          },
          () => {console.log('fail in inserting sqllite')},
          () => {console.log('success in inserting sqllite')},
        );

        // get from table
        dbSQLite.transaction(tx => {
            tx.executeSql(
              'select * from vidViewLog',
              null,
            //   (_, { rows: { _array } }) => this.setState({ dbContents: _array} )
            // (_array) => this.setState({ dbContents: _array} )
            (tx, results) => {
                // console.log('results: ', results);
                var scoreTtl = 0; // initiate variable to summate total calories burned.
                var playSumTtl = 0;  // initiate variable to summate total duration played.
                var playCnt = 0;  // initiate variable to summate total times played.
                if (results.rows.length > 0) { 
                    results.rows._array.map(result => {
                        console.log('result.id, ts, score, playSum, startAt: ', result.id, result.ts, result.score, result.playSum, result.startAt);
                        // console.log(result);
                        scoreTtl = result.score++;
                        playSumTtl = result.playSum++;
                        if (result.startAt > 0) {
                            playCnt++;
                        }
                    })

                } else {
                    console.log('No data in SQLite');
                }

                scoreTtl = 999999;
                if ( scoreTtl < 1000 ) {
                    scoreTtl = parseFloat(scoreTtl).toFixed(1); // show like 0.1
                } else if (scoreTtl > 1000000) { 
                    scoreTtl = parseFloat(scoreTtl / 1000 / 10).toFixed(1) + 'K'; // show like 0.1
                } else { // 1,000 < x < 1,000,000
                    scoreTtl = parseInt(scoreTtl); 
                }

                if ( playSumTtl < 60 * 60 * 10 ) { // less than 10 hour
                    playSumTtl = parseFloat(playSumTtl / 60 / 60 ).toFixed(1); // show like 0.1
                } else { 
                    playSumTtl = parseInt(playSumTtl / 60 / 60); // convert from second to hour
                }

                if ( playCnt < 1000 ) {
                    playCnt = parseInt(playCnt); // 
                } else if (scoreTtl > 1000000) { 
                    playCnt = parseInt(playCnt / 1000) + 'K'; //
                } else { // 1,000 < x < 1,000,000
                    playCnt = parseInt(playCnt); 
                }

                this.setState({ scoreTtl: scoreTtl, playSumTtl: playSumTtl, playCnt: playCnt });
            }
            );
          },
          () => {console.log('fail in selecting sqlite')},
          () => {console.log('success in selecting sqlte: ')},
        ); 


        // });
    };


    // NULL. The value is a NULL value.
    // INTEGER. The value is a signed integer, stored in 1, 2, 3, 4, 6, or 8 bytes depending on the magnitude of the value.
    // REAL. The value is a floating point value, stored as an 8-byte IEEE floating point number.
    // TEXT. The value is a text string, stored using the database encoding (UTF-8, UTF-16BE or UTF-16LE).
    // BLOB. The value is a blob of data, stored exactly as it was input.

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





    render() {  
        console.log('--- render Stats');
        const { scoreTtl, playSumTtl, playCnt } = this.state;
        console.log('scoreTtl, playSumTtl, playCnt: ', scoreTtl, playSumTtl, playCnt);

        // const data = '[{"name":"E","value":0.12702},{"name":"T","value":0.09056},{"name":"A","value":0.08167},{"name":"O","value":0.07507},{"name":"I","value":0.06966},{"name":"N","value":0.06749},{"name":"S","value":0.06327},{"name":"H","value":0.06094},{"name":"R","value":0.05987},{"name":"D","value":0.04253},{"name":"L","value":0.04025},{"name":"C","value":0.02782},{"name":"U","value":0.02758},{"name":"M","value":0.02406},{"name":"W","value":0.0236},{"name":"F","value":0.02288},{"name":"G","value":0.02015},{"name":"Y","value":0.01974},{"name":"P","value":0.01929},{"name":"B","value":0.01492},{"name":"V","value":0.00978},{"name":"K","value":0.00772},{"name":"J","value":0.00153},{"name":"X","value":0.0015},{"name":"Q","value":0.00095},{"name":"Z","value":0.00074}]'
        // const data = '[ 5, 10, 15, 20, 25, 30, 50 ]';



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
                        // height: 100%;
                        // padding: 0;
                        // background-color: pink;
                    }
                </style>
            
            
            </head>
            <body>
                <div id="chart_div" ></div>

                <script type="text/javascript">
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawChart);
            
                function drawChart() {
                    var data = google.visualization.arrayToDataTable([
                    ['Year', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    ['12',  1000,      400,300,200,100,800,1000],
                    ['13',  1170,      460, 200, 800, 1200, 500, 400],
                    ['14',  660,       1120, 2000, 3000,300,300,200],
                    ['15',  1030,      540, 200,3000,400,30,300],
                    ['16',  1000,      400,300,200,100,800,1000],
                    ['17',  660,       1120, 2000, 3000,300,300,200],
                    ['18',  1030,      540, 200,3000,400,30,300],
                    ['20',  1000,      400,300,200,100,800,1000]
                    ]);
            
                    // var options = {
                    //   title: 'Company Performance',
                    //   hAxis: {title: 'Year',  titleTextStyle: {color: '#333'}},
                    //   vAxis: {minValue: 0}
                    // };
            
                    var options_stacked = {
                        isStacked: true,
                        height: 400,
                        width: '95%',
                        legend: {position: 'top', maxLines: 2},
                        vAxis: {title: 'Calories', minValue: 0},
                        hAxis: {title: 'Week',  titleTextStyle: {color: '#333'}, slantedText: true, slantedTextAngle:90},
                        // animation: {startup: true, duration: 3},
                        // colors: ['red', 'yellow', 'orange', 'blue', 'green', 'purple', 'pink'],
                        // colors: ['#b37400', '#cc8400', '#ffa500', '#ffae1a', '#ffc04d', '#ffc967', '#ffdb9a'], // '#e69500', '#ffb733', '#ffd280',
                        // colors: ['#ffdb9a', '#ffc967', '#ffc04d', '#ffae1a', '#ffa500', '#cc8400', '#b37400'],
                        // colors: ['#fd6104', '#fd9a00', '#ffa500', '#ffae1a', '#ffce03', '#fef001', '#ffff00'],
                        colors: ['#fd6104','#f58c00', '#ff980f', '#ffa329', '#ffae42', '#ffdd42', '#ffff00', ], // '#ff9e42', '#ffa500',  '#ffbe42', 
                        areaOpacity: 1,
                        chartArea:{left:60, top:60, bottom: 50, right: 10}, // width:'50%',height:'75%'
                        

                    };
            
                    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
                    chart.draw(data, options_stacked);
                }
                </script>


            </body>
            </html>
        `;


    
        return (
            <View style={styles.container}>
                
                <View style={{width: '100%', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-around', alignItems: 'center', marginVertical: Dimensions.get('window').height * 0.02, paddingHorizontal: Dimensions.get('window').height * 0.01}} >
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

              
                <WebView
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    source={{
                    html: initialHTMLContent,
                    // baseUrl: 'https://fcc3ddae59ed.us-west-2.playback.live-video.net',
                    }}
                    style={ styles.chartArea }
                />


            </View>
        );
    }
}  
  

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#DCDCDC',
        // alignItems: 'center',
        // justifyContent: 'center',
        // padding: 24,
        top: 0, //StatusBar.currentHeight,
        // height: Dimensions.get('screen').width, // when Landscape 
        // width: Dimensions.get('screen').height, // when Landscape 
        height: Dimensions.get('screen').height, // when Portrait 
        width: Dimensions.get('screen').width, // when Portrait     
        position: 'absolute',
        flex: 1,
        // zindex: 0, // 20200531
        // borderColor: 'green',
        // borderWidth: 1,
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
    // chartArea :{
    //     backgroundColor: '#DCDCDC',
    //     height: Dimensions.get('screen').width,
    // },
});


