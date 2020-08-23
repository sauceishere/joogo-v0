// 10=rightWrist, 9=leftwrist, 
// 16=rightAnkle, 15=leftAnkle, 

// ttlCW = 12; // total cell of width
// ttlCH = 6; // total cell of height

// cNW = 1; // cell number of width
// cNH = 1; // cell number of height


// ( (width * cNW/ttlCW) - (width * (cNW + 1)/ttlCW) ) / 2; // center of cell
// ( (height * cNH/ttlCH) - (height * (cNH + 1)/ttlCH) ) / 2; // center of cell


export const slow1 = {
	0: {
        xRW: 2, yRW: 2, // 10=rightWrist // Red
        xLW: 9, yLW: 2, // 9=leftwrist // Blue
        xRA: 5, yRA: 5, // 16=rightAnkle // Red
        xLA: 6, yLA: 5, // 15=leftAnkle // Blue  
	},
	1: {
        xRW: 2, yRW: 1, // 10=rightWrist // Red
        xLW: 9, yLW: 1, // 9=leftwrist // Blue
        xRA: 5, yRA: 4, // 16=rightAnkle // Red
        xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
	},
	2: {
        xRW: 2, yRW: 0, // 10=rightWrist // Red
        xLW: 9, yLW: 0, // 9=leftwrist // Blue
        xRA: 5, yRA: 3, // 16=rightAnkle // Red
        xLA: 6, yLA: 3, // 15=leftAnkle // Blue  
	},
	3: {
        xRW: 2, yRW: 1, // 10=rightWrist // Red
        xLW: 9, yLW: 1, // 9=leftwrist // Blue
        xRA: 5, yRA: 4, // 16=rightAnkle // Red
        xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
	},		
	4: {
        xRW: 2, yRW: 2, // 10=rightWrist // Red
        xLW: 9, yLW: 2, // 9=leftwrist // Blue
        xRA: 5, yRA: 5, // 16=rightAnkle // Red
        xLA: 6, yLA: 5, // 15=leftAnkle // Blue  
	},
	5: {
        xRW: 2, yRW: 1, // 10=rightWrist // Red
        xLW: 9, yLW: 1, // 9=leftwrist // Blue
        xRA: 5, yRA: 4, // 16=rightAnkle // Red
        xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
	},
	6: {
        xRW: 2, yRW: 0, // 10=rightWrist // Red
        xLW: 9, yLW: 0, // 9=leftwrist // Blue
        xRA: 5, yRA: 3, // 16=rightAnkle // Red
        xLA: 6, yLA: 3, // 15=leftAnkle // Blue  
	},
	7: {
        xRW: 2, yRW: 1, // 10=rightWrist // Red
        xLW: 9, yLW: 1, // 9=leftwrist // Blue
        xRA: 5, yRA: 4, // 16=rightAnkle // Red
        xLA: 6, yLA: 4, // 15=leftAnkle // Blue  
	},		

	ERR: {
        xRW: 11, yRW: 5, // 10=rightWrist // Red
        xLW: 11, yLW: 5, // 9=leftwrist // Blue
        xRA: 11, yRA: 5, // 16=rightAnkle // Red
        xLA: 11, yLA: 5, // 15=leftAnkle // Blue  
	},		
}

// [Expo/ReactNative]WebViewでCanvasを使ってみる https://qiita.com/mildsummer/items/14e10277d1d46ad09032
// https://docs.expo.io/versions/latest/sdk/svg/
// https://github.com/react-native-community/react-native-svg#polygon