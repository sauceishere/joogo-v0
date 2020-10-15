

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
import * as SQLite from 'expo-sqlite';
// import { real } from '@tensorflow/tfjs';
import moment from 'moment'; // https://momentjs.com/docs/

// import {dbSQLite, dbName} from './DashboardScreen';


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
            didLoadChartData: false,
            test: "test desu",
            test2: "test2 yo",
        }
    };


    async componentDidMount() {
        // const { dbName, } = this.state;
        console.log('------------- componentDidMount Stats started');

        const dbSQLite = SQLite.openDatabase( 'db_' + firebase.auth().currentUser.uid); // initiate SQLite 20201013

        // sqllite
        // https://sqlite.org/datatype3.html
        // https://qiita.com/falorse/items/17370bc33676e8c03b9d

        // // create table
        // dbSQLite.transaction(tx => {
        //     tx.executeSql(
        //     'create table if not exists vidViewLog (id integer primary key not null, ts real, vidId blob, viewId blob, startAt real, endAt real, score real, playSum real, wval blob, wunit text);', // uid blob, nTa real, pt blob,  実行したいSQL文
        //     null, // SQL文の引数
        //     () => {console.log('success in creating sqllite0')}, // 成功時のコールバック関数
        //     () => {console.log('fail in creating sqllite0')} // 失敗時のコールバック関数
        //     );
        // },
        // () => {console.log('fail in creating sqllite1')}, // 失敗時のコールバック関数
        // () => {console.log('success in creating sqllite1')} // 成功時のコールバック関数
        // );

        // insert into table
        dbSQLite.transaction(tx => {
            tx.executeSql(
              `insert into vidViewLog (ts, vidId, score, playSum, startAt) values (?, ?, ?, ?, ?);`,
              [Date.now() / 1000, '332602b9-13f5-412f-bb5a-d67589bf6427', Math.random() * 100, Math.random()*100, parseInt(Math.random()) ]
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


                // create blank arrayPastWeeks. 20201013　https://developers.google.com/chart/interactive/docs/gallery/areachart
                // var arrayPastWeeks = [ ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] ];
                var jsonPastWeeks = {}; // to append blank object, and later increment actual data.
                var arrayYearWeeks = []; // to record Year_Weeks like '202002' in int for 
                let dtNow = new Date(); // local datetime 
                let deductDays = [0, -7, -14, -21, -28, -35, -42, -49, -56, -63, -70, -77, -84, -91]; // back to 3 months ago
                console.log('Math.abs(Math.min(...deductDays)): ', Math.abs(Math.min(...deductDays)) );
                var x;
                // for (x of deductDays) {
                //     // console.log( moment(dtNow).add(x, 'd').toDate().getFullYear(), (moment(dtNow).add(x, 'd').toDate().getMonth() + 1 ).toString().padStart(2,'0'), (moment(dtNow).add(x, 'd').toDate().getDate() ).toString().padStart(2,'0')  );
                //     let weeknum = moment( (moment(dtNow).add(x, 'd').toDate().getMonth() + 1 ).toString().padStart(2,'0') + "-" + (moment(dtNow).add(x, 'd').toDate().getDate() ).toString().padStart(2,'0') + "-" + moment(dtNow).add(x, 'd').toDate().getFullYear(), "MM-DD-YYYY").week();
                //     arrayPastWeeks.push( [ parseInt( (moment(dtNow).add(x, 'd').toDate().getFullYear().toString() ).concat( weeknum.toString() ) ) ,0,0,0,0,0,0,0] ) // like ["Year-Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] ["2020-52",0,0,0,0,0,0,0]
                // };
                // arrayPastWeeks = arrayPastWeeks.sort(function(a, b){return a.Year_Week - b.Year_Week}); // sort Year_week Descending
                // console.log('arrayPastWeeks: ', arrayPastWeeks);

                for (x of deductDays) {
                    // console.log( moment(dtNow).add(x, 'd').toDate().getFullYear(), (moment(dtNow).add(x, 'd').toDate().getMonth() + 1 ).toString().padStart(2,'0'), (moment(dtNow).add(x, 'd').toDate().getDate() ).toString().padStart(2,'0')  );
                    let weeknum = moment( (moment(dtNow).add(x, 'd').toDate().getMonth() + 1 ).toString().padStart(2,'0') + "-" + (moment(dtNow).add(x, 'd').toDate().getDate() ).toString().padStart(2,'0') + "-" + moment(dtNow).add(x, 'd').toDate().getFullYear(), "MM-DD-YYYY").week();
                    jsonPastWeeks[ parseInt( (moment(dtNow).add(x, 'd').toDate().getFullYear().toString() ).concat( weeknum.toString() ) ) ] = { "Sun":0, "Mon":0, "Tue":0, "Wed":0, "Thu":0, "Fri":0, "Sat":0 }; // assign
                    arrayYearWeeks.push( parseInt( (moment(dtNow).add(x, 'd').toDate().getFullYear().toString() ).concat( weeknum.toString() ) ) ); // keep this to create array for google chart
                }
                // console.log('jsonPastWeeks: ', jsonPastWeeks);





                // console.log('arrayPastWeeks: ', JSON.stringify(arrayPastWeeks));

                // var arrayPastWeeksDummy = [
                // ["Year-Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                // ['2020-15',  1030,      540, 200,3000,400,30,300],
                // ['2020-16',  1000,      400,300,200,100,800,1000],
                // ['2020-17',  660,       1120, 2000, 3000,300,300,200],
                // ['2020-18',  1030,      540, 200,3000,400,30,300],
                // ['2020-20',  1000,      400,300,200,100,800,1000]
                // ];
                // arrayPastWeeksDummy = JSON.stringify(arrayPastWeeksDummy);
                // console.log('arrayPastWeeksDummy: ', arrayPastWeeksDummy);

            

                // create 3 variables for summary 
                var scoreTtl = 0; // initiate variable to summate total calories burned.
                var playSumTtl = 0;  // initiate variable to summate total duration played.
                var playCnt = 0;  // initiate variable to summate total times played.
                const dowArray = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ];
                if (results.rows.length > 0) { 
                    results.rows._array.map(result => {
                        // console.log('result: ', result);
                        // console.log('result.id, ts, score, playSum, startAt: ', result.id, result.ts, result.score, result.playSum, result.startAt, new Date(result.ts * 1000).toLocaleString() );
                        scoreTtl = scoreTtl + result.score;
                        playSumTtl = playSumTtl + result.playSum;
                        if (result.startAt != null) { // if there is startAt ts exists
                            playCnt++;
                        };

                        // create data for google chart
                        if ( parseInt(result.ts) > parseInt(result.ts) - Math.abs(Math.min(...deductDays)) * 60 * 60 * 24 ) { // filter data that is younger than X days old, to reduce data processing.
                            let year =  new Date( new Date(result.ts * 1000).toLocaleString()).getFullYear() ;
                            let month =  (new Date( new Date(result.ts * 1000).toLocaleString()).getMonth() + 1 ).toString().padStart(2,'0') ;
                            let date = (new Date( new Date( result.ts * 1000).toLocaleDateString()).getDate() ).toString().padStart(2,'0') ;
                            let dow = new Date( new Date( result.ts * 1000).toLocaleDateString()).getDay() ; // 0 = Sunday
                            // console.log('dow: ', dow);
                            let dowText = dowArray[dow]; // match from dowArray to convert to text 
                            // console.log('dowText: ', dowText);
                            let weeknum = moment(month + "-" + date + "-" + year, "MM-DD-YYYY").week();

                            // var ind;
                            // for (ind of arrayPastWeeks) {
                            //     console.log('ind: ', ind["Year_Week"]);
                            //     if ( ind["Year_Week"] == parseInt( (year.toString()).concat(weeknum.toString()) ) ) {
                            //         arrayPastWeeks[ind][dow + 1] = arrayPastWeeks[ind][dow + 1] + result.score; // increment result.score
                            //         break 
                            //     }
                            // }

                            jsonPastWeeks[ parseInt( (year.toString()).concat(weeknum.toString()) ).toString() ][dowText] = parseInt( jsonPastWeeks[ (year.toString()).concat(weeknum.toString()) ][dowText] ) + parseInt( result.score );
                        
                            // console.log( 'year month date, dow, weeknum: ', year, month, date, dow, weeknum);
                        }
                    })
                    console.log('jsonPastWeeks: ', jsonPastWeeks);

                } else {
                    console.log('No data in SQLite');
                }



                // arrayPastWeeks = arrayPastWeeks.sort(function(a, b){return b.Year_Week - a.Year_Week}); // sort Year_week Descending
                // arrayPastWeeks = JSON.stringify(arrayPastWeeks); // convert to json datatype.



                // arrayPastWeeks= {
                //     202001: {
                //       Fri: 7,
                //       Mon: 3,
                //       Sat: 8,
                //       Sun: 2,
                //       Thu: 6,
                //       Tue: 4,
                //       Wed: 5
                //     },
                //     202002: {
                //       Fri: 107,
                //       Mon: 3,
                //       Sat: 8,
                //       Sun: 2,
                //       Thu: 6,
                //       Tue: 4,
                //       Wed: 5
                //     },
                //     202003: {
                //       Fri: 7,
                //       Mon: 3,
                //       Sat: 8,
                //       Sun: 2,
                //       Thu: 6,
                //       Tue: 4,
                //       Wed: 5
                //     }
                // };
                // arrayPastWeeks= [
                //     { "Year_Week":202001,
                //     "Fri": 7,
                //     "Mon": 3,
                //     "Sat": 8,
                //     "Sun": 2,
                //     "Thu": 6,
                //     "Tue": 4,
                //     "Wed": 5
                //     },
                //     { "Year_Week":202002,
                //     "Fri": 7,
                //     "Mon": 3,
                //     "Sat": 8,
                //     "Sun": 2,
                //     "Thu": 6,
                //     "Tue": 4,
                //     "Wed": 5
                //     },
                //     { "Year_Week":202003,
                //       "Fri": 7,
                //       "Mon": 3,
                //       "Sat": 8,
                //       "Sun": 2,
                //       "Thu": 6,
                //       "Tue": 4,
                //       "Wed": 5
                //     }
                // ];
                // arrayPastWeeks = JSON.stringify(arrayPastWeeks);


                // // Convert object to array for google chart
                arrayYearWeeks.sort(); // sort Year_Week
                // console.log('arrayYearWeeks: ', arrayYearWeeks);
                var dataByYearWeeks = [ ["Year_Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] ];   
                arrayYearWeeks.map(ind => {
                    // console.log('ind: ', ind);
                    dataByYearWeeks.push( [ ind.toString().slice(0, 4) + "_" + ind.toString().slice(4, 6), jsonPastWeeks[ind]['Sun'], jsonPastWeeks[ind]['Mon'], jsonPastWeeks[ind]['Tue'], jsonPastWeeks[ind]['Wed'], jsonPastWeeks[ind]['Thu'], jsonPastWeeks[ind]['Fri'], jsonPastWeeks[ind]['Sat']]); // data array for google chart like ['2020-01', 1,3,2,5,4,6,3]
                });


                dataByYearWeeks = JSON.stringify(dataByYearWeeks);
                this.setState({ dataByYearWeeks: dataByYearWeeks, didLoadChartData: true });

                // scoreTtl = 9999.7;
                if ( scoreTtl < 1000 ) {
                    scoreTtl = parseFloat(scoreTtl).toString().slice(0, parseFloat(scoreTtl).toString().indexOf('.') + 2 ); 
                } else { // >= 1000
                    // scoreTtl = parseFloat(scoreTtl).toString().slice(0, parseFloat(scoreTtl / 1000).toString().indexOf('.') + 2 ) + 'K';
                    scoreTtl = parseInt(scoreTtl).toString();
                }

                if ( playSumTtl < 60 * 60 * 100 ) { // less than 100 hour
                    playSumTtl = parseFloat(playSumTtl / 60 / 60).toString().slice(0, parseFloat(playSumTtl / 60 / 60).toString().indexOf('.') + 2 );
                } else { 
                    // playSumTtl = parseInt(playSumTtl / 60 / 60).toString();
                    playSumTtl = parseFloat(playSumTtl / 60 / 60).toString().slice(0, parseFloat(playSumTtl / 60 / 60).toString().indexOf('.') + 2 );
                }

                if ( playCnt < 1000 ) {
                    playCnt = parseInt(playCnt); // 
                } else if (scoreTtl > 1000000) { 
                    // playCnt = parseInt(playCnt / 1000) + 'K'; //
                    playCnt = parseInt(playCnt);
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
        const { scoreTtl, playSumTtl, playCnt, dataByYearWeeks, didLoadChartData, test, test2 } = this.state;
        console.log('scoreTtl, playSumTtl, playCnt: ', scoreTtl, playSumTtl, playCnt);
        console.log('dataByYearWeeks: ', dataByYearWeeks);

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
                        height: 100%;
                        // padding: 0;
                        // background-color: pink;
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
                    // var data = google.visualization.arrayToDataTable([
                    // ["Year-Week", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    // ['2020-12',  1000,      400,300,200,100,800,1000],
                    // ['2020-13',  1170,      460, 200, 800, 1200, 500, 400],
                    // ['2020-20',  1000,      400,300,200,100,800,1000]
                    // ]);
                    var data = google.visualization.arrayToDataTable( ${dataByYearWeeks} );

                    // var data = new google.visualization.DataTable();
                    // data.addColumn('string', 'Year-Week');
                    // data.addColumn('number', 'Sun');
                    // data.addColumn('number', 'Mon');
                    // data.addColumn('number', 'Tue');
                    // data.addColumn('number', 'Wed');
                    // data.addColumn('number', 'Thu');
                    // data.addColumn('number', 'Fri');
                    // data.addColumn('number', 'Sat');
                    // data.addRows([
                    //     ['2020-12',  1000,      400,300,200,100,800,1000],
                    //     ['2020-13',  1170,      460, 200, 800, 1200, 500, 400],
                    //     ['2020-14',  660,       1120, 2000, 3000,300,300,200],
                    //     ['2020-15',  1030,      540, 200,3000,400,30,300],
                    //     ['2020-16',  1000,      400,300,200,100,800,1000],
                    //     ['2020-17',  660,       1120, 2000, 3000,300,300,200],
                    //     ['2020-18',  1030,      540, 200,3000,400,30,300],
                    //     ['2020-20',  1000,      400,300,200,100,800,1000]
                    // ]);
                    // data.addRows( new Map({arrayPastWeeks}) );
                    // data.addColumn('string', 'Task');
                    // data.addColumn('number', 'Hours per Day');
                    // data.addRows([
                    // ['Work', 11],
                    // ['Eat', 2],
                    // ['Commute', 2],
                    // ['Watch TV', 2],
                    // ['Sleep', {v:7, f:'7.000'}]
                    // ]);

                    // var data = new google.visualization.DataView( {arrayPastWeeks}  );

                    // var data = google.visualization.DataView.fromJSON( {arrayPastWeeks} , viewAsJson );
                    
                    
            
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
                        hAxis: {title: 'Year_Week',  titleTextStyle: {color: '#333'}, slantedText: true, slantedTextAngle:90},
                        // animation: {startup: true, duration: 3},
                        // colors: ['red', 'yellow', 'orange', 'blue', 'green', 'purple', 'pink'],
                        // colors: ['#b37400', '#cc8400', '#ffa500', '#ffae1a', '#ffc04d', '#ffc967', '#ffdb9a'], // '#e69500', '#ffb733', '#ffd280',
                        // colors: ['#ffdb9a', '#ffc967', '#ffc04d', '#ffae1a', '#ffa500', '#cc8400', '#b37400'],
                        // colors: ['#fd6104', '#fd9a00', '#ffa500', '#ffae1a', '#ffce03', '#fef001', '#ffff00'],
                        colors: ['#fd6104','#f58c00', '#ff980f', '#ffa329', '#ffae42', '#ffdd42', '#ffff00', ], // '#ff9e42', '#ffa500',  '#ffbe42', 
                        areaOpacity: 1,
                        chartArea:{left:60, top:60, bottom: 80, right: 10}, // width:'50%',height:'75%'
                        

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

                { didLoadChartData ?
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
                :
                    null
                }


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
        fontSize: 26,
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


