// [Expo/ReactNative]WebViewでCanvasを使ってみる https://qiita.com/mildsummer/items/14e10277d1d46ad09032
// https://docs.expo.io/versions/latest/sdk/svg/
// https://github.com/react-native-community/react-native-svg#polygon

// 10=rightWrist, 9=leftwrist, 
// 16=rightAnkle, 15=leftAnkle, 

// ttlCW = 12; // total cell of width
// ttlCH = 6; // total cell of height

// ( (width * cNW/ttlCW) - (width * (cNW + 1)/ttlCW) ) / 2; // center of cell
// ( (height * cNH/ttlCH) - (height * (cNH + 1)/ttlCH) ) / 2; // center of cell


export const slow1 = {
        0: {
    xRW: 0.25, yRW: 0.25, // 10=rightWrist // Red
    xLW: 0.75, yLW: 0.25, // 9=leftwrist // Blue
    xRA: 0.40, yRA: 0.9, // 16=rightAnkle // Red
    xLA: 0.60, yLA: 0.9, // 15=leftAnkle // Blue  
  },
	1: {
    xRW: 0.25, yRW: 0.25, 
    xLW: 0.75, yLW: 0.25, 
    xRA: 0.40, yRA: 0.9, 
    xLA: 0.60, yLA: 0.9,  
  },
	2: {
    xRW: 0.25, yRW: 0.25, 
    xLW: 0.75, yLW: 0.25, 
    xRA: 0.40, yRA: 0.9, 
    xLA: 0.60, yLA: 0.9,  
  },
	3: {
    xRW: 0.25, yRW: 0.20, 
    xLW: 0.75, yLW: 0.20, 
    xRA: 0.40, yRA: 0.85, 
    xLA: 0.60, yLA: 0.85,  
  },
	4: {
    xRW: 0.25, yRW: 0.20, 
    xLW: 0.75, yLW: 0.20, 
    xRA: 0.40, yRA: 0.85, 
    xLA: 0.60, yLA: 0.85,  
  },
	5: {
    xRW: 0.25, yRW: 0.15, 
    xLW: 0.75, yLW: 0.15, 
    xRA: 0.40, yRA: 0.8, 
    xLA: 0.60, yLA: 0.8,  
  },
	6: {
    xRW: 0.25, yRW: 0.15, 
    xLW: 0.75, yLW: 0.15, 
    xRA: 0.40, yRA: 0.8, 
    xLA: 0.60, yLA: 0.8,  
  },
	7: {
    xRW: 0.25, yRW: 0.1, 
    xLW: 0.75, yLW: 0.1, 
    xRA: 0.40, yRA: 0.75, 
    xLA: 0.60, yLA: 0.75,  
  },
	8: {
    xRW: 0.25, yRW: 0.1, 
    xLW: 0.75, yLW: 0.1, 
    xRA: 0.40, yRA: 0.75, 
    xLA: 0.60, yLA: 0.75,  
  },
	9: {
    xRW: 0.25, yRW: 0.15, 
    xLW: 0.75, yLW: 0.15, 
    xRA: 0.40, yRA: 0.8, 
    xLA: 0.60, yLA: 0.8,  
  },
	10: {
    xRW: 0.25, yRW: 0.15, 
    xLW: 0.75, yLW: 0.15, 
    xRA: 0.40, yRA: 0.8, 
    xLA: 0.60, yLA: 0.8,  
  },
	11: {
    xRW: 0.25, yRW: 0.20, 
    xLW: 0.75, yLW: 0.20, 
    xRA: 0.40, yRA: 0.85, 
    xLA: 0.60, yLA: 0.85,  
  },
	12: {
    xRW: 0.25, yRW: 0.20, 
    xLW: 0.75, yLW: 0.20, 
    xRA: 0.40, yRA: 0.85, 
    xLA: 0.60, yLA: 0.85,  
  },  
	13: {
    xRW: 0.25, yRW: 0.25, 
    xLW: 0.75, yLW: 0.25, 
    xRA: 0.40, yRA: 0.9, 
    xLA: 0.60, yLA: 0.9,  
  },
	14: {
    xRW: 0.25, yRW: 0.25, 
    xLW: 0.75, yLW: 0.25, 
    xRA: 0.40, yRA: 0.9, 
    xLA: 0.60, yLA: 0.9,  
  },  

  
	ERR: {
    xRW: 1.2, yRW: 1.2, // 10=rightWrist // Red
    xLW: 1.2, yLW: 1.2, // 9=leftwrist // Blue
    xRA: 1.2, yRA: 1.2, // 16=rightAnkle // Red
    xLA: 1.2, yLA: 1.2, // 15=leftAnkle // Blue  
	},		
}


// export const slow1 = {
// 	0: {
//         xRW: 2, yRW: 2, // 10=rightWrist // Red
//         xLW: 9, yLW: 2, // 9=leftwrist // Blue
//         xRA: 5, yRA: 5, // 16=rightAnkle // Red
//         xLA: 6, yLA: 5, // 15=leftAnkle // Blue  
// 	},
// 	1: {
//         xRW: 2, yRW: 1, // 10=rightWrist // Red
//         xLW: 9, yLW: 1, // 9=leftwrist // Blue
//         xRA: 5, yRA: 4, // 16=rightAnkle // Red
//         xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
// 	},
// 	2: {
//         xRW: 2, yRW: 0, // 10=rightWrist // Red
//         xLW: 9, yLW: 0, // 9=leftwrist // Blue
//         xRA: 5, yRA: 3, // 16=rightAnkle // Red
//         xLA: 6, yLA: 3, // 15=leftAnkle // Blue  
// 	},
// 	3: {
//         xRW: 2, yRW: 1, // 10=rightWrist // Red
//         xLW: 9, yLW: 1, // 9=leftwrist // Blue
//         xRA: 5, yRA: 4, // 16=rightAnkle // Red
//         xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
// 	},		
// 	4: {
//         xRW: 2, yRW: 2, // 10=rightWrist // Red
//         xLW: 9, yLW: 2, // 9=leftwrist // Blue
//         xRA: 5, yRA: 5, // 16=rightAnkle // Red
//         xLA: 6, yLA: 5, // 15=leftAnkle // Blue  
// 	},
// 	5: {
//         xRW: 2, yRW: 1, // 10=rightWrist // Red
//         xLW: 9, yLW: 1, // 9=leftwrist // Blue
//         xRA: 5, yRA: 4, // 16=rightAnkle // Red
//         xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
// 	},
// 	6: {
//         xRW: 2, yRW: 0, // 10=rightWrist // Red
//         xLW: 9, yLW: 0, // 9=leftwrist // Blue
//         xRA: 5, yRA: 3, // 16=rightAnkle // Red
//         xLA: 6, yLA: 3, // 15=leftAnkle // Blue  
// 	},
// 	7: {
//         xRW: 2, yRW: 1, // 10=rightWrist // Red
//         xLW: 9, yLW: 1, // 9=leftwrist // Blue
//         xRA: 5, yRA: 4, // 16=rightAnkle // Red
//         xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
// 	},		

// 	ERR: {
//         xRW: 11, yRW: 5, // 10=rightWrist // Red
//         xLW: 11, yLW: 5, // 9=leftwrist // Blue
//         xRA: 11, yRA: 5, // 16=rightAnkle // Red
//         xLA: 11, yLA: 5, // 15=leftAnkle // Blue  
// 	},		
// }

