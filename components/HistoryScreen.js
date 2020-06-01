import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, Image, StatusBar, SafeAreaView, ScrollView } from 'react-native';


export default class HistoryScreen extends Component {

    render() {
    
        return (
            <SafeAreaView style={styles.container}>
                <Text>Under Construction Now, </Text>
                <Text>will be ready soon to view your Post & Exercise history.</Text>
            </SafeAreaView>
        )
    }

}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
      marginTop: 5,
    },
})
