// import * as React from 'react';
import React, { Component, useState } from 'react';
import { StyleSheet, SafeAreaView, Image, View, ScrollView, Text, TouchableOpacity, TextInput, Button, Dimensions, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Modal, Picker } from 'react-native';
import * as firebase from 'firebase';
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuidv4 } from 'uuid';
import * as VideoThumbnails from 'expo-video-thumbnails';
import moment from "moment"; // for timestamp
import { countrylist } from '../assets/masters/countrylist'; // countrylist master
import { bodytags } from '../assets/masters/bodyTags'; // bodytags master
import {enCheckDuplicatedNickname} from '../shared/Consts';

// import * as functions from 'firebase/functions';
// import { flattenDiagnosticMessageText } from 'typescript';
// import {Picker} from '@react-native-community/picker'; // 20201005 because react native picker is deprecated.
// import RNPickerSelect from 'react-native-picker-select'; 

import ModalSelector from 'react-native-modal-selector';

import {LB_PER_KG} from '../shared/Consts';
// export const LB_PER_KG = 2.205; // pounds devided by kilograms



export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: firebase.auth().currentUser.uid,
      text: null,
      rawImage: null, // _pickImage uri
      rawImageWidth: null,
      rawImageHeight: null,
      compressedImage: null, // video uri after compressed 
      imageTn: null, // thumbsnail
      isUploading: false,
      allComplete: false, 
      en: {enCheckDuplicatedNickname}['enCheckDuplicatedNickname'], 

      DidGetProfileData: false,
      isEditing: this.props.navigation.getParam('isNewUser') ?? false, // become 'true' when 'Edit' button pressed. // isNewUser from Dashboard.js
      // profileData: null,
      ProfileEditId: uuidv4(),
      nname: null, // nickname input
      // cnlist: {countrylist}, // countrylist masteres
      nat: null, 
      // yrlist: [], 
      byr: null,
      gdr: null,
      // btlist: {bodytags},
      bt0: null,
      bt1: null,
      ts: null,
      llogin: null,
      lupdate: null,
      avatarRawUrl: null,
      isSigningOut: false,
      wval: null, 
      wunit: null, 
      hval: null, 
      hunit: null, 
      isNewUser: null, //this.props.navigation.getParam('isNewUser') ?? false,
    };
    this._onWValChange = this._onWValChange.bind(this);
    this._onWUnitValueChange = this._onWUnitValueChange.bind(this);
    this._onHValChange = this._onHValChange.bind(this);
    this._onHUnitValueChange = this._onHUnitValueChange.bind(this);    
    this._onGenderValueChange = this._onGenderValueChange.bind(this);
    this._onCountryValueChange = this._onCountryValueChange.bind(this);
    this._onYearValueChange = this._onYearValueChange.bind(this);
    this._onBodytags0ValueChange = this._onBodytags0ValueChange.bind(this);
    this._onBodytags1ValueChange = this._onBodytags1ValueChange.bind(this);
    this._getUsers = this._getUsers.bind(this);
  }




  TnTargetSize = 640 * 360; // 1920 * 1080, 1280 * 720, 854 * 480
  TnCompRate = null;
  // ProfileEditId = uuidv4();

  // profileData = [];
  cnlist = {countrylist}
  btlist = {bodytags}
  yrlist = []
  


  // // Get User Profile from Firestore
  _getUsers = async () => {
    console.log('------ _getUsers()');


    // getUserProfile-py
    const _getUserProfile = (idTokenCopied) => {
      console.log('----- Profile.js _getUserProfile.');
      // console.log('----- _getUserProfile idTokenCopied: ', idTokenCopied);
      fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/getUserProfile-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
        method: 'POST',
        headers: {
          // 'Accept': 'application/json', 
          'Content-Type' : 'application/json' // text/html text/plain application/json
        },
        // mode: "no-cors", // no-cors, cors, *same-origin
        body: JSON.stringify({
          id_token: idTokenCopied,
        })
      }).then( result => result.json() )
        .then( response => { 
          console.log('----- Profile.js _getUserProfile response.' );
          if (response["code"] == 'ok' || response["code"] == 'new_user' ) {
            // console.log('----- response[code] is ok or New User');

            if (response["authedUid"] == firebase.auth().currentUser.uid) {
              console.log('Correctly received "authedUid" ');

              if (response["code"] == 'ok') {
                console.log('==== Profile.js Existing user coming.');
                this.setState({
                  nname: response["userProfile"].NNAME.toString(),
                  wval: response["userProfile"].WVAL.toString(), 
                  wunit: response["userProfile"].WUNIT.toString(), 
                  hval: response["userProfile"].HVAL.toString(), 
                  hunit: response["userProfile"].HUNIT.toString(), 
                  nat: response["userProfile"].NAT.toString(), 
                  byr: response["userProfile"].BYR.toString(),
                  gdr: response["userProfile"].GDR.toString(),
                  bt0: response["userProfile"].FAVTAG["0"].toString(),
                  bt1: response["userProfile"].FAVTAG["1"].toString(),
                  ts: response["userProfile"].TS,
                  llogin: response["userProfile"].LLOGIN,
                  lupdate: response["userProfile"].UPD_AT,
                  // avatarRawUrl: response["userProfile"].AVTRURL,
                  DidGetProfileData: true, 
                  isNewUser: false,
                });

              } else if (response["code"] == 'new_user') {
                console.log('==== Profile.js New User coming.');
                this.setState({
                  nname: null, //'Fill our your Nickname'
                  wval: null, 
                  wunit: null,  
                  hval: null,  
                  hunit: null,                   
                  nat: null, //'Select Nationality'
                  byr: null, //'Select Birthyear'
                  gdr: null, //'Select Gender'
                  bt0: null, //'Select Body Part You Focus on'
                  bt1: null, //'Select Body Part You Focus on'
                  ts: Date.now()/1000,
                  llogin: Date.now()/1000,
                  lupdate: Date.now()/1000,
                  // avatarRawUrl: '',
                  DidGetProfileData: true, 
                  isNewUser: true,
                });
              }

            } else {
              console.log('Received wrong "authedUid". Please log-in again.');
              alert('Received wrong "authedUid". Please log-in again.');
            }
            
          } else { // response[code] is Error
            console.log('Received response[code] = error from functions.');
            alert('Received response[code] = error from functions., Please log-in again.');
          }
      }).catch( error => {
        console.log('Error _getUserProfile-py: ', error);
        alert('Error response from _getUserProfile, Please log-in again.');
      });
    }         


    // https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
      // Send token to your backend via HTTPS
      // console.log('----- Got idToken. ');
      const idTokenCopied = idToken;

      _getUserProfile(idTokenCopied); // run http trigger
      
    }).catch(function(error) {
      console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
    });    

  } // closing _getUsers


  async componentDidMount() {
    console.log('------------- componentDidMount Profile started 80.');
    // console.log('firebase.auth().currentUser.uid: ', firebase.auth().currentUser.uid);
    console.log('this.state.ProfileEditId: ', this.state.ProfileEditId);
    // console.log(this.props.navigation.getParam('nname'));

    
    // if (this.state.DidGetProfileData == false) {
    //   await this._getUsers();
    // };

    // to reduce calling Function, get param from Dashboard.js 20201018
    if ( !this.props.navigation.getParam('nname') ) {
      // console.log('NULL');
      this.setState({ 
        DidGetProfileData: true,
        isNewUser: true,
      });
    } else {
      // console.log('NOT NULL');
      this.setState({ 
        nname: this.props.navigation.getParam('nname'), 
        wval: this.props.navigation.getParam('wval'), 
        wunit: this.props.navigation.getParam('wunit'),  
        hval: this.props.navigation.getParam('hval'),  
        hunit: this.props.navigation.getParam('hunit'),                   
        nat: this.props.navigation.getParam('nat'), //'Select Nationality'
        byr: this.props.navigation.getParam('byr'), //'Select Birthyear'
        gdr: this.props.navigation.getParam('gdr'), //'Select Gender'
        bt0: this.props.navigation.getParam('bt0'), //'Select Body Part You Focus on'
        bt1: this.props.navigation.getParam('bt1'), //'Select Body Part You Focus on'
        ts: this.props.navigation.getParam('ts'),
        llogin: this.props.navigation.getParam('llogin'),
        lupdate: this.props.navigation.getParam('lupdate'),
        DidGetProfileData: true,
        isNewUser: false,
       });      
    }

    console.log('------------- componentDidMount Profile Completed.');
  }



  componentWillUnmount() {
    console.log('------------- componentWillUnmount Profile.');

    if (!this.state.nname) { // if nickname NOT filled out, then alert and block phasing out
      this.props.navigation.push('Profile', {isNewUser :true}); // block phasing out and back to Edit mode by {isNewUser:true}
      console.log('Please fill out Nickname.');
      alert('Please fill out Nickname.');
    }
  }


  _SignOut = async() => {
    if (!this.state.nname) { // if nickname NOT filled out, then alert and block phasing out
      // this.props.navigation.push('Profile'); // block phasing out
      // console.log('Please fill out Nickname.');
      // alert('Please fill out Nickname.');
      console.log('nothing');
    } else {

      this.setState({ isEditing: false, isSigningOut : true, DidGetProfileData: false });

      // whenLogOut-py
      const _whenLogOut = (idTokenCopied) => {
        console.log('----- _whenLogOut.');
        // console.log('----- _whenLogOut idTokenCopied: ', idTokenCopied);
        fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/whenLogOut-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
          method: 'POST',
          headers: {
            // 'Accept': 'application/json', 
            'Content-Type' : 'application/json' // text/html text/plain application/json
          },
          // mode: "no-cors", // no-cors, cors, *same-origin
          body: JSON.stringify({
            id_token: idTokenCopied,
          })
        }).then( result => result.json() )
          .then( response => { 
            console.log('----- _whenLogOut response:', response );
            if (response["code"] == 'ok') {
              console.log('----- response[code] is ok');
              if (response["authedUid"] == firebase.auth().currentUser.uid) {
                // this.setState({ authedUid: response["authedUid"], userProfile: response["userProfile"] });
                // this.setState({isSigningOut : false });
                console.log('Correctly received "authedUid".');
                firebase.auth().signOut(); // sign out
                console.log('-------------------------------------- Signed out.');
              } else {
                console.log('Received wrong "authedUid". Please log-in again.');
                alert('Received wrong "authedUid". Please log-in again.');
              }
              
            } else { // response[code] is Error
              console.log('Received response[code] = error from functions.');
              alert('Received response[code] = error from functions., Please log-in again.');
            }
        }).catch( error => {
          console.log('Error _whenLogOut-py: ', error);
          alert('Error response from _whenLogOut, Please log-in again.');
        });
      }         


      // https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
      firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
        // Send token to your backend via HTTPS
        // console.log('----- Got idToken. ');
        const idTokenCopied = idToken;

        _whenLogOut(idTokenCopied); // run http trigger
        
      }).catch(function(error) {
        console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
      });      



    }
  }; // closing SignOut


  _onNNameValueChange = async (nickname) =>  {
    await this.setState({ nname: nickname.toString() });
    console.log( 'this.state.nname: ', this.state.nname );
  }

  _onWValChange = async (weightVal) =>  {
    await this.setState({ wval: weightVal.toString() });
    console.log( 'this.state.wval: ', this.state.wval );
  }

  _onWUnitValueChange = async (unit) =>  {
    // console.log( 'unit: ', unit.key );
    await this.setState({ wunit: unit.key.toString() });
    console.log( 'this.state.wunit: ', this.state.wunit );
  }

  _onHValChange = async (heightVal) =>  {
    await this.setState({ hval: heightVal.toString() });
    console.log( 'this.state.hval: ', this.state.hval );
  }

  _onHUnitValueChange = async (unit) =>  {
    await this.setState({ hunit: unit.key.toString() });
    console.log( 'this.state.hunit: ', this.state.hunit );
  }

  _onGenderValueChange = async (gender) =>  {
    // console.log( 'gender: ', gender );
    await this.setState({ gdr: gender.key.toString() });
    console.log( 'this.state.gdr: ', this.state.gdr );
  }

  _onCountryValueChange = async (country) =>  {
    // console.log( 'country: ', country );
    await this.setState({ nat: country.key.toString() });
    console.log( 'this.state.nat: ', this.state.nat );
  }

  _onYearValueChange = async (year) =>  {
    // console.log( 'year: ', year );
    await this.setState({ byr: year.key.toString() });
    console.log( 'this.state.byr: ', this.state.byr );
  }

  _onBodytags0ValueChange = async (bt) =>  {
    // console.log( 'bt: ', bt );
    await this.setState({ bt0: bt.toString() });
    console.log( 'this.state.bt0: ', this.state.bt0 );
  }

  _onBodytags1ValueChange = async (bt) =>  {
    // console.log( 'bt: ', bt );
    await this.setState({ bt1: bt.toString() });
    console.log( 'this.state.bt1: ', this.state.bt1 );
  }


  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ // https://docs.expo.io/versions/latest/sdk/imagepicker/#imagepickermediatypeoptions
      mediaTypes: ImagePicker.MediaTypeOptions.Videos, 
      allowsEditing: true,
      aspect: [9, 16], // [3,4]
      quality: 1,
    });
    if (!result.cancelled) {
      this.setState({ rawImage: result.uri, rawImageWidth: result.width, rawImageHeight: result.height });
      console.log('_pickImage result: ', result);
    } else {
      alert('Failed to pick Video. Please try again.');
    }
  };


  _checkDuplicatedNickname = async () => {
    console.log('---------- _checkDuplicatedNickname');
    // console.log('uid, en: ', this.state.uid, this.state.en)

      const _BacktoViewPage = () => { 
        console.log('_BacktoViewPage');
        this.setState({ allComplete: false, isEditing: false}); // remove modal and back to view pages
        this._getUsers();
      }

      //// checkDuplicatedNickname-py
      const _checkDuplicatedNickname = (idTokenCopied) => {
        console.log('----- _checkDuplicatedNickname.');      

        fetch('https://asia-northeast1-joogo-v0.cloudfunctions.net/checkDuplicatedNickname-py', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
        // const myJson= fetch('https://asia-northeast1-getfit-f3a98.cloudfunctions.net/check_duplicated_nickname', { // https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch
          method: 'POST',
          headers: {
            // 'Accept': 'application/json', 
            'Content-Type' : 'application/json' // text/html text/plain application/json
          },
          // mode: "no-cors", // no-cors, cors, *same-origin
          body: JSON.stringify({
          // body: {
            // uid: firebase.auth().currentUser.uid,
            newNName: this.state.nname,
            wval: this.state.wval,
            wunit: this.state.wunit,
            hval: this.state.hval,  
            hunit: this.state.hunit,
            nat: this.state.nat,
            byr: this.state.byr,
            gdr: this.state.gdr,
            bt0: this.state.bt0, 
            bt1: this.state.bt1,                      
            en: this.state.en, 
            lupdate: Date.now() / 1000, // unix
            editId: this.state.ProfileEditId.toString(),
            id_token: idTokenCopied,
          })

        // }).then( result => console.log('result.json():  ', result.json()) )
        }).then( result => result.json() )
          // .then( response => { console.log('Success:', JSON.stringify(response) ) } )
          .then( response => { 
            console.log('----- response:', response );
            // console.log('----- response[code]:', response["code"] );

            if (response["code"] == 'ok') {
              console.log('----- response[code] is ok:  ' );
              this.setState({ isUploading: false, allComplete: true}); // remove ActivityIndicator, and show Completed text

              ////// set timer X seconds and then isEditing: false
              var countSec = 0;
              var countup = async function(){
                console.log(countSec++);
                _BacktoViewPage(); // move back
              } 
              setTimeout(countup, 3 * 1000); // milliseconds

            } else if (response["code"] == 'duplicated') {  
              console.log('----- Your Nickname is NOT Unique. Please fill out another Nickname ') ;
              alert('Your Nickname is NOT Unique. Please fill out another Nickname');
              this.setState({ isUploading: false});   

            } else if (response["code"] == 'error') {  
              console.log('----- response[code] is Error, ') ;
              alert('response[code] is Error');
              this.setState({ isUploading: false});    

            } else {
              console.log('Error fetching _checkDuplicatedNickname');
              alert('Error fetching _checkDuplicatedNickname');
              this.setState({ isUploading: false});
            }
            
          }).catch( error => {
            this.setState({ isUploading: false}); // remove ActivityIndicator, and show Completed text
            console.log(' Error _checkDuplicatedNickname: ', error );
            // console.log('response["detail"]: ', response["detail"] ); 
            alert(' Error _checkDuplicatedNickname: ');
          });
        }


        ///////////  checkDuplicatedNickname-py ////////////////////////////////////////////////// https://firebase.google.com/docs/auth/admin/verify-id-tokens?authuser=0#%E3%82%A6%E3%82%A7%E3%83%96
        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then( function(idToken) {
          // Send token to your backend via HTTPS
          console.log('----- Got idToken. ');
          const idTokenCopied = idToken;

          _checkDuplicatedNickname(idTokenCopied); // run http trigger
          
        }).catch(function(error) {
          console.log('Error xxxxxxxxxxxxxxxx Could not get idToken: ', error);
        });

  }  


  
  
  _handlePost = async() => {
    console.log('----------- _handlePost');
    // console.log('this.state: ', this.state);
    // console.log('this.state.text: ', typeof(this.state.text) );
    
    if (this.state.nname && this.state.wval && this.state.wunit) { // if nname, wval, wunit exists

        if (this.state.wunit == 'kg' & this.state.wval < 200) {
            console.log('weight is within limit in kg');
        } else if ( this.state.wunit == 'lb' & this.state.wval < 200 * {LB_PER_KG} ) {
            console.log('weight is within limit in lb');
        } else { // if too heavy or not number.
            console.log('Your weight may be wrong. ¥n Please fill out weight again');
            alert('Your weight may be wrong. ¥n Please fill out weight again');
        }

        if (this.state.bt0 && this.state.bt1) { // if both exists

            if (this.state.bt0 != this.state.bt1) { // if both are NOT the same value
                this.setState({ isUploading: true });
                console.log('>>>>>> isUploading: true.');
                await this._checkDuplicatedNickname();

            } else { // if both are the same value, 
                if (this.state.bt0 == '-' && this.state.bt1 == '-') { // except both are '-'
                    this.setState({ isUploading: true });
                    console.log('>>>>>> isUploading: true.');
                    await this._checkDuplicatedNickname();

                } else { // then alert to change
                    console.log('Please choose different Focus Body Tags.');
                    alert('Please choose different Focus Body Tags.');
                }
            }

        } else{
            this.setState({ isUploading: true });
            console.log('>>>>>> isUploading: true.');
            await this._checkDuplicatedNickname();     
        }

    } else {
        if (!this.state.nname) { // if nickname NOT filled out, then alert to change
            console.log('Please fill out Nickname.');
            alert('Please fill out Nickname.');
        } else if (!this.state.wval || !this.state.wunit) { // if weight NOT filled out, 
            console.log('Please fill out weight and unit.');
            alert('Please fill out weight and unit.');       
        } else {
            console.log('unknown error _handlePost.');
            alert('unknown error _handlePost.');
        }
    }

  };


  _pressEdit = async() => {
    console.log('---------- _pressEdit');
    this.setState({isEditing: true, isUploading: false, allComplete: false});
  };
 

  _pressCancelEdit = async () => {
    console.log('---------- _pressCancelEdit');
    if (!this.state.nname) { // if nickname NOT filled out, then alert and block phasing out
      this.props.navigation.push('Profile', {isNewUser :true}); // block phasing out and back to Edit mode by {isNewUser:true}
      // this.setState({isEditing: true});
      console.log('Please fill out Nickname.');
      alert('Please fill out Nickname.');
    } else {
      this.setState({isEditing: false, isUploading: false, allComplete: false});
      await this._getUsers(); // reset inputted data because inputted data should not be saved.
    }
  };




  render() {
    const { isUploading, allComplete, isEditing, DidGetProfileData, nname, gdr, byr, nat, bt0, bt1, ts, llogin, lupdate, isSigningOut, wval, wunit, hval, hunit, isNewUser } = this.state;
    // console.log('ts: ', ts);

    // from here, creating master for drop down menu. 20201006
    const master_weight_unit = [
      { key: 'kg', label: 'kg' },
      { key: 'lb', label: 'lb' }
    ];

    const master_height_unit = [
      { key: 'cm', label: 'cm' },
      { key: 'ft', label: 'ft' }
    ];    

    const master_gender = [
      { key: 'Male', label: 'Male' },
      { key: 'Female', label: 'Female' },
      { key: 'Other', label: 'Other' },
      { key: 'Not specified', label: 'Not specified' },
    ];    

    var master_countrylist = new Array();
      this.cnlist.countrylist.map( (obj) => 
        // { key: obj["Name"], label:obj["Name"] }
        // console.log( obj["Name"] )
        master_countrylist.push( { key: obj["Name"], label: obj["Name"] } )
      ) 
      master_countrylist.push( { key: 'Other', label: 'Other'} );
      master_countrylist.push( { key: 'Not specified', label: 'Not specified' } );
    // console.log('master_countrylist: ', master_countrylist);

    // // create year list 20200420
    let thisYear = new Date().getFullYear();
    var i;
    var master_byr = new Array();
    for (i = thisYear + 1; i > thisYear - 120; i--) { // current year - 120 yrlists
      this.yrlist.push( i.toString() ); // convert string for parsing array & append to array
      master_byr.push( {key: i.toString(), label: i.toString()})
      // console.log(i);
    }

    return (

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> 
        {/* <SafeAreaView style={styles.container}> */}
        <ScrollView style={styles.container}>

          <Modal visible={allComplete} animationType='fade' transparent={true}>
            <View style={styles.modal}>
              <Text style={styles.postedText}>
                Your Profile is Saved!{"\n"}
              </Text>
            </View>
          </Modal>



        { DidGetProfileData ?
          <View>

            {isNewUser ?
              <View style={styles.newUserAnnouncementContainer}>
                <Text style={styles.newUserAnnouncement}>Please fill out Nickname, Weight, Weight Unit. {"\n"}Please do NOT use your REAL name.</Text>
              </View>
            : 
              null
            }

            { isEditing ?
              <View style={styles.inputContainer}>
                <View style={{width: '100%', marginTop: Dimensions.get('window').height * 0.02, marginBottom: Dimensions.get('window').height * 0.03,}}>
                  


                    <Text style={styles.itemTitle10}><Text style={styles.itemMandatory}>* </Text>Nickname (Max 25 charactors)</Text>
                    <TextInput
                      multiline={false}
                      numberOfLines={1}
                      maxLength={25}
                      style={styles.itemField10}
                      defaultValue={nname}
                      onChangeText={text => this._onNNameValueChange(text) }
                      value={this.state.nname}
                    >
                    </TextInput>

                    <Text style={styles.itemTitle10}><Text style={styles.itemMandatory}>* </Text>Weight</Text>
                    <TextInput
                      multiline={false}
                      numberOfLines={1}
                      maxLength={10}
                      style={styles.itemField10}
                      defaultValue={wval}
                      onChangeText={text => this._onWValChange(text) }
                      value={this.state.wval}
                      keyboardType='numeric'
                    >
                    </TextInput>  

           
                    {/* <Text style={styles.itemTitle}><Text style={styles.itemMandatory}>* </Text>Weight Unit</Text>
                    <View style={styles.pickerView}>
                    <Picker
                      selectedValue= {wunit}
                      onValueChange = {(itemValue) => this._onWUnitValueChange(itemValue) }
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                      mode="dialog"
                    >
                      <Picker.Item label={wunit} value={wunit} key={wunit}/>
                      <Picker.Item label="kg" value="kg" key="kg"/>
                      <Picker.Item label="lb" value="lb" key="lb" />
                    </Picker>
                    </View> */}
                    <Text style={styles.itemTitle}><Text style={styles.itemMandatory}>* </Text>Weight Unit</Text>
                    <View style={styles.pickerView}>
                    <ModalSelector
                      data = {master_weight_unit}
                      initValue={wunit}
                      onChange={ (option) => this._onWUnitValueChange(option) } 
                      style={styles.picker}
                    />
                    </View>


                    <Text style={styles.itemTitle10}>Height</Text>
                      <TextInput
                        multiline={false}
                        numberOfLines={1}
                        maxLength={10}
                        style={styles.itemField10}
                        defaultValue= {hval}
                        onChangeText={text => this._onHValChange(text) }
                        value={this.state.hval}
                        keyboardType='numeric'
                      >
                    </TextInput>   

                    {/* <Text style={styles.itemTitle}>Height Unit</Text>
                    <View style={styles.pickerView}>
                      <Picker
                          selectedValue= {hunit}
                          onValueChange = {(itemValue) => this._onHUnitValueChange(itemValue) }
                          style={styles.picker}
                          itemStyle={styles.pickerItem}
                          mode="dialog">
                          <Picker.Item label={hunit} value={hunit} key={hunit}/>
                          <Picker.Item label="cm" value="cm" key="cm"/>
                          <Picker.Item label="ft" value="ft" key="ft" />
                      </Picker>
                    </View>  */}
                    <Text style={styles.itemTitle}>Height Unit</Text>
                    <View style={styles.pickerView}>
                    <ModalSelector
                      data = {master_height_unit}
                      initValue={hunit}
                      onChange={ (option) => this._onHUnitValueChange(option) } 
                      style={styles.picker}
                    />
                    </View> 

                    {/* <Text style={styles.itemTitle10}>Gender</Text>
                    <View style={styles.pickerView}>
                      <Picker
                        selectedValue= {gdr}
                        onValueChange = {(itemValue) => this._onGenderValueChange(itemValue) }
                        style={styles.picker}
                        itemStylestyle={styles.pickerItem}
                        mode="dialog">
                        <Picker.Item label={gdr} value={gdr} key={gdr}/>
                        <Picker.Item label="Male" value="Male" key="Male"/>
                        <Picker.Item label="Female" value="Female" key="Female"/>
                        <Picker.Item label="Other" value="Other" key="Other"/>
                        <Picker.Item label="Not specified" value="Not specified" key="Not specified" />
                      </Picker>
                    </View> */}
                    <Text style={styles.itemTitle}>Gender</Text>
                    <View style={styles.pickerView}>
                    <ModalSelector
                      data = {master_gender}
                      initValue={gdr}
                      onChange={ (option) => this._onGenderValueChange(option) } 
                      style={styles.picker}
                    />
                    </View> 

                    {/* <Text style={styles.itemTitle10}>Nationality</Text>
                    <View style={styles.pickerView}>
                      <Picker
                        selectedValue= {nat}
                        // onValueChange={country => this.setState({ nat: country }), console.log( this.state.country ) }
                        // onValueChange = {(country) => this.setState({ nat: country })}
                        onValueChange = {(itemValue) => this._onCountryValueChange(itemValue) }
                        style={styles.picker}
                        Style={styles.pickerItem}
                        mode="dialog">
                        <Picker.Item label={nat} value={nat}  key={nat} />
                        {this.cnlist.countrylist.map( (obj) => 
                          <Picker.Item label={obj["Name"]} value ={obj["Name"]} key={obj["Name"]}/>
                        )}
                        <Picker.Item label="Other" value="Other" key="Other"/>
                        <Picker.Item label="Not specified" value="Not specified" key="Not specified" />
                      </Picker>
                    </View> */}
                    <Text style={styles.itemTitle}>Nationality</Text>
                    <View style={styles.pickerView}>
                    <ModalSelector
                      data = {master_countrylist}
                      initValue={nat}
                      onChange={ (option) => this._onCountryValueChange(option) } 
                      style={styles.picker}
                    />
                    </View> 

                    {/* <Text style={styles.itemTitle10}>Birth Year</Text>
                    <View style={styles.pickerView}>
                      <Picker
                        selectedValue= {byr}
                        onValueChange = {(itemValue) => this._onYearValueChange(itemValue) }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        mode="dialog">
                        <Picker.Item label={byr} value={byr} key={byr}/>
                          {this.yrlist.map( (obj) => 
                            <Picker.Item label={obj} value ={obj} key={obj}/>
                          )}
                        <Picker.Item label="Other" value="Other" key="Other"/>
                        <Picker.Item label="Not specified" value="Not specified" key="Not specified" />
                      </Picker>
                    </View> */}
                    <Text style={styles.itemTitle}>Birth Year</Text>
                    <View style={styles.pickerView}>
                    <ModalSelector
                      data = {master_byr}
                      initValue={byr}
                      onChange={ (option) => this._onYearValueChange(option) } 
                      style={styles.picker}
                    />
                    </View> 

                    {/* <Text style={styles.itemTitle10}>Focus Body Parts (Max 2 tags)</Text>
                    <View style={styles.pickerView}>
                      <Picker
                        selectedValue= {bt0}
                        onValueChange = {(itemValue) => this._onBodytags0ValueChange(itemValue) }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        mode="dialog">
                        <Picker.Item label={bt0} value={bt0} key={bt0} />
                          {this.btlist.bodytags.map( (obj) => 
                            <Picker.Item label={obj} value ={obj} key={obj}/>
                          )}
                        <Picker.Item label="Not Specified" value="Not specified" key="Not specified" />  
                      </Picker>
                    </View>
                    <View style={styles.pickerViewBt1}>
                      <Picker
                        selectedValue= {bt1}
                        onValueChange = {(itemValue) => this._onBodytags1ValueChange(itemValue) }
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        mode="dialog">
                        <Picker.Item label={bt1} value={bt1} key={bt1} />
                          {this.btlist.bodytags.map( (obj) => 
                            <Picker.Item label={obj} value ={obj} key={obj}/>
                          )}
                        <Picker.Item label="Not Specified" value="Not specified." key="Not specified." />  
                      </Picker>
                    </View>                   */}
              


                  { allComplete ?
                    <View>
                    </View>  
                  :
                    <View>
                      { isUploading ?
               
                        <View style={styles.uploadingIndicator}>
                            <ActivityIndicator size="large" color='#ffa500'/>
                            <Text>Uploading....</Text>
                        </View>
                      :
                        <View>
                          <TouchableOpacity onPress={this._handlePost} style={styles.postButton} >
                            <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold',}}> Save </Text>
                          </TouchableOpacity>
        
                          <TouchableOpacity onPress={ this._pressCancelEdit }  style={styles.cancelEditButton}>
                            <Text style={{color: 'gray', fontSize: 16, paddingBottom: 20}}> Cancel </Text>
                          </TouchableOpacity>   
                        </View>
                      }
                    </View>
                  } 

                </View>



              </View>
            : 
              <View style={styles.inputContainer}>

              <TouchableOpacity onPress={ () => this._SignOut() } style={styles.signOutButton} >
                <Text style={{color: '#ffa500', fontSize: 16, fontWeight: 'bold',}}> Sign Out </Text>
              </TouchableOpacity>


                <View style={{width: '100%', marginTop: Dimensions.get('window').height * 0.05, marginBottom: Dimensions.get('window').height * 0.03,}}>
                
                  {/* <Image source={{uri: profileData.avatarFullUrl }} style={} resizeMode="cover" />  */}

                  
                  <Text style={styles.itemTitle}>Nickname</Text>
                  <Text style={styles.itemField00}>
                    { ((nname).length > 50) ? 
                        (((nname).substring(0, 50-3)) + '...') 
                    : 
                      nname 
                    }
                  </Text>

                  <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Weight</Text>
                    <Text style={styles.itemField00}>{wval} {wunit}</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Height</Text>
                    <Text style={styles.itemField00}>{hval} {hunit}</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Gender</Text>
                    <Text style={styles.itemField00}>{gdr}</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Nationality</Text>
                    <Text style={styles.itemField00}>
                      {nat}
                    </Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Birth Year</Text>
                    <Text style={styles.itemField00}>{byr}</Text>                  
                  </View>

                  {/* <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Focus Body Parts</Text>
                    <Text style={styles.itemField00}>{bt0}</Text>
                    <Text style={styles.itemField00}>{bt1}</Text>
                  </View> */}

                  <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Account Created</Text>
                    <Text style={styles.itemField00}>{moment.unix(ts).fromNow()}</Text>
                  </View>

                  <View style={styles.tableRow}>
                    <Text style={styles.itemTitle}>Last Update</Text>
                    <Text style={styles.itemField00}>{moment.unix(lupdate).fromNow()}</Text>
                  </View>

                  <TouchableOpacity onPress={this._pressEdit} style={styles.postButton} >
                    <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold',}}> Edit </Text>
                  </TouchableOpacity>

                </View>
              </View>        

            }

          </View>

        :

          <View style={styles.loadingIndicator}>
            <ActivityIndicator size='large' color='orange' />
            { isSigningOut ?
              <View>
                <Text> Signing Out...</Text>
              </View>
            :
              <View>
                <Text> Loading Data...</Text>
              </View>
            }
          </View> 


        }




        </ScrollView>
        {/* </SafeAreaView> */}
      </TouchableWithoutFeedback>  
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
  },
  signOutButton: {
    position: 'absolute',
    right: 1,
  },
  newUserAnnouncementContainer:{   
    // width: '90%',
    // backgroundColor: 'green',
  },
  newUserAnnouncement:{
    color: '#ffa500',
    fontSize: 15,
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',  
    textAlign: 'center'
  },
  inputContainer: {
    // marginVertical: Dimensions.get('window').height * 0.05,
    marginHorizontal: Dimensions.get('window').width * 0.05,
    flexDirection: "column",
    // justifyContent: 'flex-start'
  },  
  tableRow: {
    flex: 1, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  itemTitle:{
    marginTop: 7, //Dimensions.get('window').height * 0.01,
    color: 'gray',
    fontSize: 15,
    width: '30%',
  },
  itemTitle10:{
    marginTop: 7, //Dimensions.get('window').height * 0.01,
    color: 'gray',
    fontSize: 15,
    // width: '30%',
  },  
  itemMandatory: {
    color: 'red',
    fontWeight: 'bold',
  },
  itemField00: {
    // borderWidth: 1, 
    // borderColor: 'white', 
    // borderRadius: 5, 
    fontSize: 17,
    height: 35,
    color: 'dimgray',
    textAlignVertical: 'center',
    // paddingLeft: 30,
    textAlign: 'right',
  },
  itemField10: {
    borderWidth: 2, 
    borderColor: 'lightgray', 
    borderRadius: 5, 
    fontSize: 17,
    height: 35,
    color: 'lightgray', //'dimgray',
    textAlignVertical: 'center',
    textAlign: 'center',
    // paddingLeft: 10,
    backgroundColor: 'white',
    // textAlign: 'right',
    width: '80%',
    // position: 'absolute',
    // right: 0, // align to right
    marginLeft: '20%',
  },
  loadingIndicator: {
    // position: 'absolute',
    // top: '50%',
    // right: 20,
    flexGrow:1,
    height:null,
    width:null,    
    alignItems: 'center',
    justifyContent: 'center',    
  },
  pickerView: {
    height: 35, 
    // width: 200, 
    backgroundColor: 'white',
    borderWidth: 1, 
    borderColor: 'lightgray', 
    borderRadius: 5, 
    textAlignVertical: 'top',
    // fontSize: 18,
    // color: 'dimgray',
    paddingBottom: 10,
    // paddingLeft: 30,
    width: '80%',
    // position: 'absolute',
    // right: 0, // align to right
    marginLeft: '20%',
  },
  pickerViewBt1: {
    height: 35, 
    // width: 200, 
    backgroundColor: 'white',
    borderWidth: 1, 
    borderColor: 'lightgray', 
    borderRadius: 5, 
    textAlignVertical: 'top',
    // fontSize: 18,
    // color: 'dimgray',
    paddingBottom: 10,
    marginTop: 5,
    // paddingLeft: 30,
    width: '80%',
    // position: 'absolute',
    // right: 0, // align to right
    marginLeft: '20%',
  },  
  picker: {
    // height: Dimensions.get('window').height * 0.7, 
    // width: 200, 
    // backgroundColor: 'white',
    // borderWidth: 0.5, 
    borderColor: 'lightgray',
    // borderColor: 'lightgray', 
    borderRadius: 5, 
    // padding: 10, 
    // fontSize: 18,
    // color: 'dimgray',
    // textAlign: 'center',
    // textAlignVertical: 'bottom',
    // paddingBottom: 10,
    // backgroundColor: 'pink',
    // paddingLeft: 10,
    // paddingVertical: 0,
    height: 35,
    padding: 0,

  },  
  pickerItem: {
    // alignItems: 'center',
    // justifyContent: 'center',     
    // textAlignVertical: 'center',
    // textAlign: 'center',
    // fontSize: 18,
    color: 'green',
    // height: Dimensions.get('window').height * 0.7,
    // backgroundColor: 'green',
     
  },

  videoTitleTitle: {
    marginTop: Dimensions.get('window').height * 0.03,
    color: 'gray',
    fontSize: 15,
    //fontWeight: 'bold',
  }, 
  // avatar: {
  //     width: 48,
  //     height: 48,
  //     borderRadius: 24,
  //     marginRight: 16
  // },
  pickImage: {
    alignItems: "center",
    marginVertical: Dimensions.get('window').height * 0.02,
  },
  showImage: {
    // marginVertical: Dimensions.get('window').height * 0.05, 
    height: Dimensions.get('window').height * 0.35,
    alignItems: "center",
  },
  postButton: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',    
    backgroundColor: '#ffa500',
    // width: Dimensions.get('window').width * 0.7,
    borderRadius: 5,
    height: 40,
    shadowColor: 'black', // iOS
    shadowOffset: { width: 5, height: 5 }, // iOS
    shadowOpacity: 0.4, // iOS
    shadowRadius: 5, // iOS   
    elevation: 5, // Android
    marginTop: 40,
  },
  cancelEditButton: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center', 
    // paddingBottom: 20, // to increase tapping area
    marginBottom: 20,
  },
  uploadingIndicator: {
    // position: 'absolute',
    // top: 20,
    // right: 20,
    // marginTop: 15,
    flexGrow:1,
    height:null,
    width:null,    
    alignItems: 'center',
    justifyContent: 'center',    
  },
  postedText: {
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  modal: {
    // flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',  
    marginVertical: Dimensions.get('window').height * 0.3,     
    marginHorizontal: Dimensions.get('window').width * 0.1,
    height: Dimensions.get('window').height * 0.4,
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: '#ffa500', 
    borderRadius: 10,
    opacity: 1.0,
    shadowColor: 'black', // iOS
    shadowOffset: { width: 20, height: 20 }, // iOS
    shadowOpacity: 0.4, // iOS
    shadowRadius: 10, // iOS   
    elevation: 10, // Android
  },

});