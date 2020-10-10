// // 'use strict';





// // Snippet based on https://github.com/hswolff/BetterWeather/blob/master/js/weather/WeatherGraph.js
// import React, { Component } from 'react';
// import { ART } from 'react-native';

// const { Group, Shape, Surface } = ART;

// export default class Chart extends Component {
//   render() {
//     return (
//       <Surface width={200} height={100}>
//         <Group x={0} y={0}>
//           <Shape d={this.props.linePath} stroke="#000" strokeWidth={1} />
//         </Group>
//       </Surface>
//     );
//   }
// }





/////////////////////////////////////////////////////////////////////////////////////////////////////////







// import React, {Component} from 'react';
// import { BarChart, XAxis } from 'react-native-svg-charts'; // 2.1.0
// import { View } from 'react-native';

// import {Svg} from "react-native-svg"; // Supported builtin module

// // export default class Stats extends React.PureComponent {
// export default class Stats extends Component {
//     render() {

//         const data    = [ 14, -1, 100, -95, -94, -24, -8, 85, -91, 35, -53, 53, -78, 66, 96, 33, -26, -32, 73, 8 ]
//         const barData = [
//             {
//                 values: data,
//                 positive: {
//                     fill: 'rgb(134, 65, 244)',
//                 },
//                 negative: {
//                     fill: 'rgba(134, 65, 244, 0.2)',
//                 },
//             },
//         ]

//         return (
//             <View style={ { height: 200 } }>
//                 <BarChart
//                     style={ { flex: 1 } }
//                     data={ barData }
//                 />
//                 <XAxis
//                     style={ { paddingVertical: 16 } }
//                     values={ data }
//                     formatLabel={ (value, index) => index }
//                     chartType={ XAxis.Type.BAR }
//                     labelStyle={ { 
//                       color: 'grey',
//                       transform:[{ rotateX: '45deg'}]
//                     } }
//                 />
//             </View>
//         )
//     }
// }




/////////////////////////////////////////////////////////////////////////////////////////////////////////




// import { StackedAreaChart } from 'react-native-svg-charts';
// import * as shape from 'd3-shape';
// import React, {Component} from 'react';
// // import * as React from 'react';
 
// //class StackedAreaExample extends React.PureComponent {
// export default class Stats extends Component {
//     render() {
//         const data = [
//             {
//                 month: new Date(2015, 0, 1),
//                 apples: 3840,
//                 bananas: 1920,
//                 cherries: 960,
//                 dates: 400,
//             },
//             {
//                 month: new Date(2015, 1, 1),
//                 apples: 1600,
//                 bananas: 1440,
//                 cherries: 960,
//                 dates: 400,
//             },
//             {
//                 month: new Date(2015, 2, 1),
//                 apples: 640,
//                 bananas: 960,
//                 cherries: 3640,
//                 dates: 400,
//             },
//             {
//                 month: new Date(2015, 3, 1),
//                 apples: 3320,
//                 bananas: 480,
//                 cherries: 640,
//                 dates: 400,
//             },
//         ]
 
//         const colors = ['#8800cc', '#aa00ff', '#cc66ff', '#eeccff']
//         const keys = ['apples', 'bananas', 'cherries', 'dates']
//         const svgs = [
//             { onPress: () => console.log('apples') },
//             { onPress: () => console.log('bananas') },
//             { onPress: () => console.log('cherries') },
//             { onPress: () => console.log('dates') },
//         ]
 
//         return (
//             <StackedAreaChart
//                 style={{ height: 200, paddingVertical: 16 }}
//                 data={data}
//                 keys={keys}
//                 colors={colors}
//                 curve={shape.curveNatural}
//                 showGrid={false}
//                 svgs={svgs}
//             />
//         )
//     }
// }



/////////////////////////////////////////////////////////////////////////////////////////////////////////




// // import * as React from 'react';
// import React, {Component} from 'react';
// import { Text, View, StyleSheet, Dimensions, StatusBar, Image, TouchableOpacity, SafeAreaView, ScrollView, Button, Platform, ActivityIndicator, } from 'react-native';
// // // import ChartItself from "../components/ChartItself";

// // // https://www.npmjs.com/package/react-native-svg-charts#stackedareachart
// // // import { StackedAreaChart } from 'react-native-svg-charts'
// // // import * as shape from 'd3-shape'

// // // import * as Svg from 'react-native-svg';
// import {Svg} from 'react-native-svg';
// // // // import Svg, { Circle, Rect } from 'react-native-svg';
// import { Circle, Rect } from 'react-native-svg';
// // // // import Circle from 'react-native-svg';
// // // // const { Circle, Rect } = Svg; // https://stackoverflow.com/questions/62114230/invariant-violation-using-react-native-svg


// export default class Stats extends Component {

// //     // constructor(props) {
// //     //     super(props);
// //     //     this.state = {
// //     //     }
// //     // }

//     render() {
//         return (
//             <View>
//                 <Svg height="20" width="20" >
//                     <Circle cx="10" cy="10" r="10" fill="red" />
//                 </Svg>
//             </View>
//         );
//     }
// }








/////////////////////////////////////////////////////////////////////////////////////////////////////////




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
import * as React from 'react';
import {Component} from 'react';
import { StyleSheet, View, Text, Dimensions} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";


// import d3 from '../assets/d3min';

// export default function App() {
export default class Stats extends Component {

    render() {  

    // const data = '[{"name":"E","value":0.12702},{"name":"T","value":0.09056},{"name":"A","value":0.08167},{"name":"O","value":0.07507},{"name":"I","value":0.06966},{"name":"N","value":0.06749},{"name":"S","value":0.06327},{"name":"H","value":0.06094},{"name":"R","value":0.05987},{"name":"D","value":0.04253},{"name":"L","value":0.04025},{"name":"C","value":0.02782},{"name":"U","value":0.02758},{"name":"M","value":0.02406},{"name":"W","value":0.0236},{"name":"F","value":0.02288},{"name":"G","value":0.02015},{"name":"Y","value":0.01974},{"name":"P","value":0.01929},{"name":"B","value":0.01492},{"name":"V","value":0.00978},{"name":"K","value":0.00772},{"name":"J","value":0.00153},{"name":"X","value":0.0015},{"name":"Q","value":0.00095},{"name":"Z","value":0.00074}]'
    // const data = '[ 5, 10, 15, 20, 25, 30, 50 ]';

    // const d3 = '';
    // <script src="https://d3js.org/d3.v6.min.js"></script>

    // <script src="https://cdn.jsdelivr.net/npm/@svgdotjs/svg.js@latest/dist/svg.min.js"></script>


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
                }
                div#chart_div{
                    border: solid 0.1em white;
                    border-radius: 0.5em;
                    // width: 95%; 
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
                    // height: 400,
                    // width: 400,
                    legend: {position: 'top', maxLines: 2},
                    vAxis: {title: 'Calories', minValue: 0},
                    hAxis: {title: 'Week',  titleTextStyle: {color: '#333'}, slantedText: true, slantedTextAngle:90},
                    // animation: {startup: true, duration: 3},
                    // colors: ['red', 'yellow', 'orange', 'blue', 'green', 'purple', 'pink'],
                    // colors: ['#b37400', '#cc8400', '#ffa500', '#ffae1a', '#ffc04d', '#ffc967', '#ffdb9a'], // '#e69500', '#ffb733', '#ffd280',
                    // colors: ['#ffdb9a', '#ffc967', '#ffc04d', '#ffae1a', '#ffa500', '#cc8400', '#b37400'],
                    colors: ['#fd6104', '#fd9a00', '#ffa500', '#ffae1a', '#ffce03', '#fef001', '#ffff00'],
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
                        <Text style={styles.tileItemField}>500</Text>    
                        <Text style={styles.tileItemTitle}>Total Calories Burned</Text>
                    </View>          

                    <View style={styles.tileItem}>
                        <Ionicons name='ios-time' size={22} style={styles.tileItemIcon}/>
                        <Text style={styles.tileItemField}>30</Text>  
                        <Text style={styles.tileItemTitle}>Total Hours Played</Text> 
                    </View>
                    
                    <View style={styles.tileItem}>
                        <Ionicons name='logo-youtube' size={22} style={styles.tileItemIcon}/>
                        <Text style={styles.tileItemField}>210</Text>  
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

                <Text>here</Text>


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
    chartArea :{
        backgroundColor: '#DCDCDC',
    },
});




// <View style={styles.trainerVideoContainer}>
// <WebView
//   ref={r => (this.webviewRef = r)}
//   source={{ html:  }}
//   // javaScriptEnabled = {true}
//   // injectedJavaScript=
//   //   {`
//   //   `}
//   style={styles.trainerVideo} 
//   // onMessage={this.onMessage}
//   onNavigationStateChange={this._vidDefault}
// />
// </View>



// var dataset = ${data};
// d3.select("body").selectAll("div")
// .data(dataset)
// .enter()
// .append("div")
// .attr("class", "bar")
// .style("height", function(d) {
// var barHeight = d * 5;  // 高さを5倍にする
// return barHeight + "px";
// });





{/* <script>

document.getElementById("target").innerHTML = "neeear";

var data = '[{"year":1880,"sex":"F","name":"Helen","n":636,"prop":0.0065161264},{"year":1880,"sex":"F","name":"Amanda","n":241,"prop":0.0024691611},{"year":1880,"sex":"F","name":"Betty","n":117,"prop":0.0011987214},{"year":1880,"sex":"F","name":"Dorothy","n":112,"prop":0.001147494},{"year":1880,"sex":"F","name":"Linda","n":27,"prop":0.000276628},{"year":1880,"sex":"F","name":"Deborah","n":12,"prop":0.0001229458},{"year":1880,"sex":"F","name":"Jessica","n":7,"prop":0.0000717184},{"year":1881,"sex":"F","name":"Helen","n":612,"prop":0.0061908856},{"year":1881,"sex":"F","name":"Amanda","n":263,"prop":0.0026604623},{"year":1881,"sex":"F","name":"Betty","n":112,"prop":0.0011329725},{"year":1881,"sex":"F","name":"Dorothy","n":109,"prop":0.0011026251},{"year":1881,"sex":"F","name":"Linda","n":38,"prop":0.0003844014},{"year":1881,"sex":"F","name":"Deborah","n":14,"prop":0.0001416216}]';


var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


var sumstat = d3.nest()
  .key(function(d) { return d.year;})
  .entries(data);


var mygroups = ["Helen", "Amanda", "Ashley"] // list of group names
var mygroup = [1,2,3] // list of group names
var stackedData = d3.stack()
  .keys(mygroup)
  .value(function(d, key){
    return d.values[key].n
  })
  (sumstat)
  
var x = d3.scaleLinear()
  .domain(d3.extent(data, function(d) { return d.year; }))
  .range([ 0, width ]);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(5));

var y = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return +d.n; })*1.2])
  .range([ height, 0 ]);
svg.append("g")
  .call(d3.axisLeft(y));

var color = d3.scaleOrdinal()
  .domain(mygroups)
  .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

svg
  .selectAll("mylayers")
  .data(stackedData)
  .enter()
  .append("path")
    .style("fill", function(d) { name = mygroups[d.key-1] ;  return color(name); })
    .attr("d", d3.area()
      .x(function(d, i) { return x(d.data.key); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })
  )

</script> */}