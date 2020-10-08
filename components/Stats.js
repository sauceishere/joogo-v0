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

// import "react-native-svg"; // Supported builtin module

// export default class Chart extends React.PureComponent {

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
//                 {/* <XAxis
//                     style={ { paddingVertical: 16 } }
//                     values={ data }
//                     formatLabel={ (value, index) => index }
//                     chartType={ XAxis.Type.BAR }
//                     labelStyle={ { 
//                       color: 'grey',
//                    transform:[{ rotateX: '45deg'}]
//                     } }
//                 /> */}
//             </View>
//         )
//     }
// }




/////////////////////////////////////////////////////////////////////////////////////////////////////////


// // import * as React from 'react';
// import React, {Component} from 'react';
// import { StackedAreaChart } from 'react-native-svg-charts';
// import * as shape from 'd3-shape';
 
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




// import * as React from 'react';
import React, {Component} from 'react';
import { Text, View, StyleSheet, Dimensions, StatusBar, Image, TouchableOpacity, SafeAreaView, ScrollView, Button, Platform, ActivityIndicator, } from 'react-native';
import * as firebase from 'firebase';
import * as FileSystem from 'expo-file-system'; // https://docs.expo.io/versions/latest/sdk/filesystem/
// import { split } from '@tensorflow/tfjs';
import moment from 'moment'; // https://momentjs.com/docs/
import * as Localization from 'expo-localization';
// import * as RNLocalize from 'react-native-localize'; // https://dev.to/ugglr/react-native-getting-user-device-timezone-and-converting-utc-time-stamps-using-the-offset-3jh8
// import moment from 'moment-timezone'; // https://dev.to/ugglr/react-native-getting-user-device-timezone-and-converting-utc-time-stamps-using-the-offset-3jh8



export default class Stats extends Component {

    constructor(props) {
        super(props);
        this.state = {
          vidViewLogTemp: 'vidViewLogTemp_' + firebase.auth().currentUser.uid, //{vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
          vidViewLog: 'vidViewLog_' + firebase.auth().currentUser.uid, //{vidViewLogTemp}['vidViewLogTemp'], // Local storage directory name to keep vidViewLog
        }
    }

  
    async componentDidMount() {
  
      console.log('----------- _checkVidViewLogDirectory start' );
      // // check if vidViewLog local directory exists, if not then create directory. 
      this.curDir = FileSystem.documentDirectory; // get root directory
      // console.log('this.curDir: ', this.curDir);  
      
      const deviceTimeZone = Localization.timezone; // get device timezone
      console.log('deviceTimeZone: ', deviceTimeZone);
      
      // // Check Directories & Files in current directory. // THIS IS FOR MANUAL ACTION 
      FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLog ).then( content => {
        const files = content;
        // console.log('check this.curDir Dirs and Files: ', content); // how many localFiles in array
        // console.log(files);
        var ind;
        for (ind of files) {
            // text += person[x];
            // console.log(ind);
            console.log( parseFloat(ind.toString().split('_')[0]) ); // ts only in UNIX in int
            console.log( new Date( parseFloat(ind.toString().split('_')[0]) * 1000) ); // convert to datetime
            // console.log( moment(new Date( parseFloat(ind.toString().split('_')[0]) * 1000)).tz(deviceTimeZone) );
            // console.log( moment.utc( parseFloat(ind.toString().split('_')[0]) ).local().format() );
            console.log( new Date( parseFloat(ind.toString().split('_')[0]) * 1000).toLocaleString() );
            // console.log( new Date().getTimezoneOffset() );
            console.log( new Date( parseFloat(ind.toString().split('_')[0]) * 1000) + (new Date().getTimezoneOffset() * 60000) );

            // console.log( moment("12-25-1995", "MM-DD-YYYY").isoWeeks(Number) );
            // console.log( moment( new Date( parseFloat(ind.toString().split('_')[0]) * 1000).toLocaleString() ).isoWeek(Number) );
            // moment().isoWeek(); // Number
            // moment().isoWeeks(Number);
            // moment().isoWeeks(); // Number


        }
        // console.log(moment.now());
        console.log(moment().isoWeekYear());
        console.log( moment().week() );
        console.log( moment("10-08-2020", "MM-DD-YYYY").week() );
        


        // Make moment of right now, using the device timezone
        // const today = moment().tz(deviceTimeZone);
        // console.log('today: ', today);


          
      })
      
      // // Delete File // THIS IS FOR MANUAL ACTION AGAINST ERROR
      // FileSystem.deleteAsync( this.curDir  ).then( (dir) => {
      //   console.log('---------- File Deleted: ', dir);
      // }).catch(error => {
      //   console.log('error: ', error);
      // });   
  
  
    }
  
    render() {
        return (
            <View>
                <Text>_checkVidViewLogDirectory </Text>
            </View>
        );
    }
  }