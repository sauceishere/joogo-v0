import * as React from 'react';
import { Component } from 'react';
import { Text, View } from 'react-native';

export default class Test1 extends Component {
 
  componentDidMount() {
    console.log('------------- componentDidMount Test1 started.');
  }

  render() {
 
    return (
      <View>
        <Text>
          Test1!{"\n"}ready?{"\n"}
        </Text>
      </View>
    );

  }


}