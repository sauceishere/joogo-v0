// 10=rightWrist, 9=leftwrist, 
// 16=rightAnkle, 15=leftAnkle, 

ttlCW = 12; // total cell of width
ttlCH = 6; // total cell of height

cNW = 1; // cell number of width
cNH = 1; // cell number of height


( (width * cNW/ttlCW) - (width * (cNW + 1)/ttlCW) ) / 2; // center of cell
( (height * cNH/ttlCH) - (height * (cNH + 1)/ttlCH) ) / 2; // center of cell


export const slow = [
{
	"1": {
		"x10": 0, "y10": 0, // rightWrist
		"x9": 11, "y9": 0, // leftWrist
		"x16": 0, "y16": 5,	// rightAnkle	
		"x15": 11, "y15": 5 // leftWrist
	},
	"2": {
		"x10": 0, "y10": 1, // rightWrist
		"x9": 11, "y9": 1, // leftWrist
		"x16": 0, "y16": 4,	// rightAnkle	
		"x15": 11, "y15": 4 // leftWrist
	}
}
]

// [Expo/ReactNative]WebViewでCanvasを使ってみる https://qiita.com/mildsummer/items/14e10277d1d46ad09032
// https://docs.expo.io/versions/latest/sdk/svg/
// https://github.com/react-native-community/react-native-svg#polygon