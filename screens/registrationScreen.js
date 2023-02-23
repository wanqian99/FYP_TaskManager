import React from 'react'
import { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";


const RegistrationScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const registerAccount = () => {
        // check all input fields have data
        if(username == '' || email == '' || password == '' || confirmPassword == '') {
            alert("Please fill in all fields");
        }
        // password should be longer than 6 characters
        else if (password.length < 6) {
            alert("Password should be at least 6 characters");
        }
        // check password fields match
        else if(password != confirmPassword) {
            alert("Password does not match");
        }
        else {
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Account created
                const user = userCredential.user;
                console.log("Registered with: ", user.username);
                
                // update display name
                updateProfile(userCredential.user, {
                    displayName: username,
                })
                .then((user) => {
                    // console.log(auth.currentUser);
                })

                alert('Account registered successfully');
                navigation.navigate('Login');
            })
            .catch((error) => {
                console.log(error.message)
                alert('Invalid registration credentials. Try again.')
            });
        }
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <ScrollView style={{marginTop: "8%"}}>
                    <FontAwesome name="user-circle-o" size={130} color="cornflowerblue" style={{alignSelf: 'center', marginBottom: "8%"}}/>
                    {/* USERNAME */}
                    <Text style={styles.inputLabel}>Username:</Text>
                    <View style={styles.inputContainer}>
                        <FontAwesome name="user-circle-o" size={30} color="cornflowerblue" style={{marginRight: "2%"}}/>
                        <TextInput
                            placeholder='Username'
                            value={username}
                            onChangeText={text => setUsername(text)}
                            autoCapitalize='none'
                            style={styles.input}
                        />
                    </View>
                    {/* EMAIL */}
                    <Text style={styles.inputLabel}>Email:</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="email" size={30} color="cornflowerblue" style={{marginRight: "2%"}}/>
                        <TextInput
                            placeholder='Email'
                            value={email}
                            onChangeText={text => setEmail(text)}
                            autoCapitalize='none'
                            style={styles.input}
                        />
                    </View>
                    {/* PASSWORD */}
                    <Text style={styles.inputLabel}>Password:</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock" size={30} color="cornflowerblue" style={{marginRight: "2%"}}/>
                        <TextInput
                            placeholder='Password'
                            value={password}
                            onChangeText={text => setPassword(text)}
                            autoCapitalize='none'
                            style={styles.input}
                            secureTextEntry
                        />
                    </View>
                    {/* CONFIRM PASSWORD */}
                    <Text style={styles.inputLabel}>Confirm Password:</Text>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock" size={30} color="cornflowerblue" style={{marginRight: "2%"}}/>
                        <TextInput
                            placeholder='Confirm Password'
                            value={confirmPassword}
                            onChangeText={text => setConfirmPassword(text)}
                            autoCapitalize='none'
                            style={styles.input}
                            secureTextEntry
                        />
                    </View>
                    {/* BUTTONS */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: "20%"}}>
                        {/* GO TO LOGIN PAGE */}
                        <TouchableOpacity onPress={() => {navigation.navigate("Login")}} 
                                        style={styles.submitBtn}>
                            <Text style={{fontSize: 14, color: 'cornflowerblue'}}>Back to Login</Text>
                        </TouchableOpacity>
                        {/* REGISTER BUTTON */}
                        <TouchableOpacity onPress={registerAccount} 
                                        style={[styles.submitBtn, {backgroundColor: 'cornflowerblue'}]}>
                            <Text style={{fontSize: 14, color: 'white'}}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default RegistrationScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: "5%",
    },
    inputLabel: {
        fontSize: 16,
        color: 'cornflowerblue',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: "1%",
        marginBottom: "3%"
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 2,
        borderColor: 'cornflowerblue',
        borderRadius: 10,
    },
    dateText: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 2,
        borderColor: 'cornflowerblue',
        borderRadius: 10,
    },
    submitBtn: {
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: 'cornflowerblue',
        borderRadius: 10,
    },
})