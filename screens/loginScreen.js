import React from 'react'
import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";


const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in
                const uid = user.uid;
                navigation.replace('Main');
                console.log("User is signed in");
            } else {
                // User is signed out
                console.log("User is signed out");
            }
        })
        return unsubscribe;
    }, [])

    const Login = () => {
        // check all input fields have data
        if(email == '' || password == '') {
            alert("Please fill in all fields");
        }
        else {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Logged in 
                const user = userCredential.user;
                console.log("Logged in to: ", user.displayName);
                navigation.replace('Main');
            })
            .catch((error) => {
                console.log(error.message)
                alert('Invalid login credentials. Try again.')
            });
        }
    }

    return (
        <SafeAreaView style={{flex: 1}}>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <View style={{marginTop: "30%"}}>
                    <FontAwesome name="user-circle-o" size={130} color="cornflowerblue" style={{alignSelf: 'center', marginBottom: "30%"}}/>
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
                    {/* BUTTONS */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: "20%"}}>
                        <TouchableOpacity style={styles.submitBtn}
                                        onPress={() => {navigation.navigate("Register")}}>
                            <Text style={{fontSize: 14, color: 'cornflowerblue'}}>Register Account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.submitBtn, {backgroundColor: 'cornflowerblue'}]}
                                        onPress={Login}>
                            <Text style={{fontSize: 14, color: 'white'}}>Let's go!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default LoginScreen

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
    submitBtn: {
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: 'cornflowerblue',
        borderRadius: 10,
    },
})