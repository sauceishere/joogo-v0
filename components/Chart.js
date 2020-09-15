// 'use strict';
// import * as React from 'react';
import React, { Component } from 'react';
import { View, Text} from 'react-native';

// import ChartItself from "../components/ChartItself";

// https://www.npmjs.com/package/react-native-svg-charts#stackedareachart
// import { StackedAreaChart } from 'react-native-svg-charts'
// import * as shape from 'd3-shape'

import * as Svg from 'react-native-svg';
// import Svg from 'react-native-svg';
// import Svg, { Circle, Rect } from 'react-native-svg';
import { Circle, Rect } from 'react-native-svg';
// import Circle from 'react-native-svg';
// const { Circle, Rect } = Svg; // https://stackoverflow.com/questions/62114230/invariant-violation-using-react-native-svg


// export default class Chart extends Component {

// //     // constructor(props) {
// //     //     super(props);
// //     //     this.state = {
// //     //     }
// //     // }

//     render() {
//         return (
//             // <View>
//             //     <Text>deed</Text>
//             // </View>

//             <Svg height="20" width="20">
//                 <Circle cx="10" cy="10" r="10" fill="red" />
//             </Svg>            

//                 // <ChartItself/>
      
//         );
//     }
// }




export default function Chart() {
    return(
        <View>

            <Svg height="20" width="20">
                {/* <Circle cx="10" cy="10" r="10" fill="red" /> */}
            </Svg>

        </View>

    )
}



// const App = () => (
//     <ChartItself />
//   );
  
// //Export App - This line solved my issue
// export default App;
