// 9=leftwrist, 10=rightWrist, 15=leftAnkle, 16=rightAnkle

ttlCW = 12; // total cell of width
ttlCH = 6; // total cell of height

cNW = 1; // cell number of width
cNH = 1; // cell number of height


( (width * cNW/ttlCW) - (width * (cNW + 1)/ttlCW) ) / 2; // center of cell
( (height * cNH/ttlCH) - (height * (cNH + 1)/ttlCH) ) / 2; // center of cell


export const slow = [
{
	"1": {
		"x9": 11,
		"y9": 0,
		"x10": 0,
		"y10": 0,
		"x15": 11,
		"y15": 5,
		"x16": 0,
		"y16": 5
	},
	"2": {
		"x9": 11,
		"y9": 0,
		"x10": 0,
		"y10": 0,
		"x15": 11,
		"y15": 5,
		"x16": 0,
		"y16": 5
	}
}
]

// [Expo/ReactNative]WebViewでCanvasを使ってみる https://qiita.com/mildsummer/items/14e10277d1d46ad09032
// https://docs.expo.io/versions/latest/sdk/svg/
// https://github.com/react-native-community/react-native-svg#polygon