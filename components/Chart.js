// 'use strict';



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



import * as React from 'react';
import {Component} from 'react';
import { Text, View, StyleSheet, Dimensions, StatusBar, Image, TouchableOpacity, SafeAreaView, ScrollView, Button, Platform, ActivityIndicator, } from 'react-native';
// // import ChartItself from "../components/ChartItself";

// // https://www.npmjs.com/package/react-native-svg-charts#stackedareachart
// // import { StackedAreaChart } from 'react-native-svg-charts'
// // import * as shape from 'd3-shape'

// // import * as Svg from 'react-native-svg';
// import {Svg} from 'react-native-svg';
// // // import Svg, { Circle, Rect } from 'react-native-svg';
// import { Circle, Rect } from 'react-native-svg';
// // // import Circle from 'react-native-svg';
// // // const { Circle, Rect } = Svg; // https://stackoverflow.com/questions/62114230/invariant-violation-using-react-native-svg


// export default class Chart extends Component {

// //     // constructor(props) {
// //     //     super(props);
// //     //     this.state = {
// //     //     }
// //     // }

//     render() {
//         return (
//             <View>
//                 <Text>deed</Text>
//             </View>

//             // <Svg height="20" width="20">
//             //     <Circle cx="10" cy="10" r="10" fill="red" />
//             // </Svg>            

//                 // <ChartItself/>
      
//         );
//     }
// }




// export default function Chart() {
//     return(
//         <View>

//             <Svg height="20" width="20">
//                 {/* <Circle cx="10" cy="10" r="10" fill="red" /> */}
//             </Svg>

//         </View>

//     )
// }



// // const App = () => (
// //     <ChartItself />
// //   );
  
// // //Export App - This line solved my issue
// // export default App;





export default class App extends Component {

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
    
    
    // // Check Directories & Files in current directory. // THIS IS FOR MANUAL ACTION 
    FileSystem.readDirectoryAsync( this.curDir + this.state.vidViewLogTemp ).then( content => {
      console.log('check this.curDir Dirs and Files: ', content); // how many localFiles in array
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
              <Text>deed</Text>
          </View>

          // <Svg height="20" width="20">
          //     <Circle cx="10" cy="10" r="10" fill="red" />
          // </Svg>            

              // <ChartItself/>
    
      );
  }


}




 

