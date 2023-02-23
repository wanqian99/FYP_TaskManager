import React from 'react'
import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform, ScrollView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Context } from '../utilities/ContextManager.js';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, firebaseDB } from '../firebaseConfig';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import * as ImagePicker from 'expo-image-picker';
import { collection, getDocs, doc, getDoc, deleteDoc, setDoc } from "firebase/firestore"; 

const EditProfile = ({ navigation }) => {
    const { theme, darkmode,
        taskList_stateFilter, setTaskList_stateFilter,
        taskList_dateFilter, setTaskList_dateFilter,
        taskList_priorityFilter, setTaskList_priorityFilter,
        taskList_categoryFilter, setTaskList_categoryFilter,
        taskList_iconFilter, setTaskList_iconFilter,
    } = useContext(Context);
    

    const [image, setImage] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState(new Date('2000-01-01'));
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [updateImage, setUpdateImage] = useState(null);
    const [updateUsername, setUpdateUsername] = useState(null);
    const [updateUserEmail, setUpdateUserEmail] = useState(null);
    const [updateDob, setUpdateDob] = useState(null);
    const [updateNewPassword, setUpdateNewPassword] = useState(null);
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [reauthenticateModal, setReauthenticateModal] = useState(false);

    const [updatingProfile, setUpdatingProfile] = useState(false);

    // get user profile
    useEffect(() => {
        const userProfile = auth.currentUser;

        setImage(userProfile.photoURL);
        setUsername(userProfile.displayName);
        setEmail(userProfile.email);
        
        // fetch date of birth data stored
        const getDOB = async () => {
            const docRef = await getDoc(doc(firebaseDB, "user", userProfile.uid));
            if(docRef.exists()) {
                const dobDate = docRef.data().dob.seconds * 1000;
                setDob(new Date(dobDate));
            }
            else {
                setDob(dob);
            }
        }
        // call the function
        getDOB();
    }, [])

    useEffect(() => {
        if(updateImage && updateUsername && updateUserEmail && updateDob && updateNewPassword) {
            alert("User profile successfully updated");
            // opens drawer after updating
            navigation.openDrawer();
        }
    }, [updatingProfile])

    // attach image from gallery
    const attachImage = async () => {
        // get permission to launch camera
        let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        // show alert if permission is not granted
        if (permission.granted === false) {
            alert("Permission to access gallery is required");
            return;
        }

        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            //mediaTypes: ImagePicker.MediaTypeOptions.All,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            //allowsMultipleSelection: true,
            // aspect: [4, 3],
            quality: 0.2,
        });

        // set profile image
        setImage(result.assets[0].uri);
    };

    // update user profile to firebase auth and storage
    const updateUserProfile = async () => {
        const userProfile = auth.currentUser;

        // set all update state to true first
        setUpdateUsername(true);
        setUpdateImage(true);
        setUpdateUserEmail(true);
        setUpdateNewPassword(true);
        setUpdateDob(true);

        userProfile.reload()
            .then(async() => {
                // update displayName to firebase auth
                if(userProfile.displayName !== username) {
                    updateProfile(userProfile, {
                        displayName: username,
                    }).then(() => {
                        setUpdateUsername(true);
                        console.log("username updated");
                    }).catch((error) => {
                        setUpdateUsername(false);
                        console.log(error.message);
                        alert("Error updating username");
                    });
                }
                // update image to firebase auth
                if(userProfile.photoURL !== image) {
                    // update displayName to firebase auth
                    updateProfile(userProfile, {
                        photoURL: image,
                    }).then(() => {
                        setUpdateImage(true);
                        console.log("image updated");
                    }).catch((error) => {
                        setUpdateImage(false);
                        console.log(error.message);
                        alert("Error updating profile image");
                    });
                }
                // update email to firebase auth
                if(userProfile.email !== email) {
                    // re-authenticate the user with email and current password
                    const credential = EmailAuthProvider.credential(userProfile.email, password);

                    reauthenticateWithCredential(userProfile, credential)
                        .then(() => {
                            updateEmail(userProfile, 
                                email
                            ).then(() => {
                                setUpdateUserEmail(true);
                                console.log("email updated");
                            }).catch((error) => {
                                setUpdateUserEmail(false);
                                console.log(error.message);
                                alert("Error updating email");
                            });
                        })
                }
                // update password to firebase auth
                if(newPassword.length > 0) {
                    if(newPassword.length >= 6) {
                        // re-authenticate the user with email and current password
                        const credential = EmailAuthProvider.credential(userProfile.email, password);

                        reauthenticateWithCredential(userProfile, credential)
                        .then(() => {
                            // update password
                            updatePassword(userProfile, 
                                newPassword
                            ).then(() => {
                                setUpdateNewPassword(true);
                                console.log("password updated");
                            }).catch((error) => {
                                setUpdateNewPassword(false);
                                console.log(error.message);
                                alert("Error updating password");
                            });
                        }).catch((error) => {
                            console.log(error.message);
                            alert("Incorrect current password");
                        });
                    }
                    else {
                        alert("Password should be at least 6 characters");
                    }
                }
                // update dob to firebase db
                if(dob !== new Date('2000-01-01')) {
                    // update dob to firebase db
                    try {
                        await setDoc(doc(firebaseDB, "user", userProfile.uid), {dob: dob});
                        setUpdateDob(true);
                        console.log("dob updated");
                    } catch (error) {
                        setUpdateDob(false);
                        console.log(error.message);
                        alert("Error updating Date of Birth");
                    }
                }
            }).catch((error) => {
                console.log(error.message);
                alert("Error updating User profile");
            })

        setUpdatingProfile(!updatingProfile);
    }

    // revert to original user profile data
    const cancelUpdateUserProfile = () => {
        const userProfile = auth.currentUser;

        setImage(userProfile.photoURL);
        setUsername(userProfile.displayName);
        setEmail(userProfile.email);
        setDob(new Date('2000-01-01'));
    }

    const toggleDeleteUserProfile = () => {
        // make the re-authentication modal visible
        setReauthenticateModal(true);
    }

    const deleteUserProfile = async () => {
        const userProfile = auth.currentUser;

        // re-authenticate the user with email and current password
        const credential = EmailAuthProvider.credential(userProfile.email, password);

        reauthenticateWithCredential(userProfile, credential)
        .then(async() => {
            // delete user related account data from firebaseDB
            deleteUserDataFromFirebase();

            // delete user account
            deleteUser(userProfile)
            .then(() => {
                // User deleted.
                setReauthenticateModal(false);
                console.log("User account deleted");
                alert("User account " + userProfile.displayName + " has been deleted.");
                // redirect user to login screen
                navigation.navigate("Login");
            }).catch((error) => {
                console.log(error.message);
            });
        }).catch((error) => {
            console.log(error.message);
            alert("Error deleting user account. Check that login information has been entered correctly.");
            return;
        });
    }

    // deletes all user data when account is deleted
    const deleteUserDataFromFirebase = async () => {
        const userProfile = auth.currentUser;
        
        // Delete Mode
        const ModeDocRef = await doc(firebaseDB, "user", userProfile.uid, "Mode", "DarkMode");
        await deleteDoc(ModeDocRef);

        // Delete themes
        const ThemeDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "Themes"));
        ThemeDocRef.forEach(async(colDoc) => {
            const ThemeColorRef = await doc(firebaseDB, "user", userProfile.uid, "Themes", colDoc.data().color);
            await deleteDoc(ThemeColorRef);
        })

        // Delete filterCheckboxArray
        const FilterCheckboxDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "filterCheckboxArray"));
        FilterCheckboxDocRef.forEach(async(filterCheckbox) => {
            const FilterCategoryRef = await doc(firebaseDB, "user", userProfile.uid, "filterCheckboxArray", filterCheckbox.data().mode+"Filter");
            await deleteDoc(FilterCategoryRef);
        })

        // Delete iconItems
        const iconItemsDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "iconItems"));
        iconItemsDocRef.forEach(async(iconItems) => {
            const iconItemsRef = await doc(firebaseDB, "user", userProfile.uid, "iconItems", iconItems.data().label);
            await deleteDoc(iconItemsRef);
        })

        // Delete taskList_dateFilter
        taskList_dateFilter.map(async(mainFilter) => {
            const taskList_dateDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", mainFilter.header, mainFilter.header+"Filter"));
            taskList_dateDocRef.forEach(async(date) => {
                const dateRef = await doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", mainFilter.header, mainFilter.header+"Filter", date.data().title);
                await deleteDoc(dateRef);
            })
        })

        // Delete taskList_categoryFilter
        taskList_categoryFilter.map(async(mainFilter) => {
            const taskList_categoryDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "taskList_categoryFilter", mainFilter.header, mainFilter.header+"Filter"));
            taskList_categoryDocRef.forEach(async(category) => {
                const categoryRef = await doc(firebaseDB, "user", userProfile.uid, "taskList_categoryFilter", mainFilter.header, mainFilter.header+"Filter", category.data().title);
                await deleteDoc(categoryRef);
            })
        })

        // Delete taskList_priorityFilter
        taskList_priorityFilter.map(async(mainFilter) => {
            const taskList_priorityDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "taskList_priorityFilter", mainFilter.header, mainFilter.header+"Filter"));
            taskList_priorityDocRef.forEach(async(priority) => {
                const priorityRef = await doc(firebaseDB, "user", userProfile.uid, "taskList_priorityFilter", mainFilter.header, mainFilter.header+"Filter", priority.data().title);
                await deleteDoc(priorityRef);
            })
        })

        // Delete taskList_iconFilter
        taskList_iconFilter.map(async(mainFilter) => {
            const taskList_iconDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "taskList_iconFilter", mainFilter.header, mainFilter.header+"Filter"));
            taskList_iconDocRef.forEach(async(icon) => {
                const iconRef = await doc(firebaseDB, "user", userProfile.uid, "taskList_iconFilter", icon.data().icon, icon.data().icon+"Filter", icon.data().title);
                await deleteDoc(iconRef);
            })
        })
        
        // Delete taskList_stateFilter
        taskList_stateFilter.map(async(mainFilter) => {
            const taskList_stateDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", mainFilter.header, mainFilter.header+"Filter"));
            taskList_stateDocRef.forEach(async(state) => {
                const stateRef = await doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", mainFilter.header, mainFilter.header+"Filter", state.data().title);
                await deleteDoc(stateRef);
            })
        })
    }

    // sets the date when date input changes
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate;
        setShowDatePicker(false);
        setDob(currentDate);
    };

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: darkmode ? "#000000" : "#ffffff"}]}>
            <ScrollView style={{marginTop: "8%", marginHorizontal: "5%",}}>

                {/* ATTACH IMAGE */}
                <TouchableOpacity onPress={attachImage}
                                style={{marginTop: "8%", alignSelf: 'flex-end'}}>
                    <MaterialCommunityIcons name="image-edit" size={35} color={`${theme}`}/>
                </TouchableOpacity>
                {/* IMAGE */}
                {image == null ?
                    (
                        <FontAwesome name="user-circle-o" size={130} color={`${theme}`} style={{alignSelf: 'center', marginBottom: "8%"}}/>
                    ) : 
                    (
                        <Image source={{ uri: image}} style={[styles.profileImg, {borderColor: `${theme}`}]}/>
                    )
                }

                {/* USERNAME */}
                <Text style={[styles.inputLabel, {color: darkmode ? "#ffffff" : "#000000"}]}>Username:</Text>
                <View style={styles.inputContainer}>
                    <FontAwesome name="user-circle-o" size={30} color={`${theme}`} style={{marginRight: "2%"}}/>
                    <TextInput
                        placeholder='Username'
                        value={username}
                        onChangeText={text => setUsername(text)}
                        autoCapitalize='none'
                        style={[styles.input, {borderColor: `${theme}`, color: darkmode ? "#ffffff" : "#000000"}]}
                    />
                </View>

                {/* EMAIL */}
                <Text style={[styles.inputLabel, {color: darkmode ? "#ffffff" : "#000000"}]}>Email:</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email" size={30} color={`${theme}`} style={{marginRight: "2%"}}/>
                    <TextInput
                        placeholder='Email'
                        value={email}
                        onChangeText={text => setEmail(text)}
                        autoCapitalize='none'
                        style={[styles.input, {borderColor: `${theme}`, color: darkmode ? "#ffffff" : "#000000"}]}
                    />
                </View>
                {/* DATE OF BIRTH */}
                <Text style={[styles.inputLabel, {color: darkmode ? "#ffffff" : "#000000"}]}>Date of Birth:</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="calendar" size={30} color={`${theme}`} style={{marginRight: "2%"}}/>

                    {Platform.OS === 'ios' ?
                        (
                            <View>
                                <DateTimePicker
                                    value={dob}
                                    mode={'date'}
                                    display={'default'}
                                    onChange={onChange}
                                />
                            </View>
                        ) :
                        (
                            <View>
                                <TouchableOpacity style={[styles.dateText, {borderColor: `${theme}`}]}
                                                onPress={() => {setShowDatePicker(!showDatePicker)}} >
                                    <Text style={{fontSize: 14, color: `${theme}`}}>{dob.toDateString()}</Text>
                                </TouchableOpacity>
                                
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dob}
                                        mode={'date'}
                                        display={'default'}
                                        onChange={onChange}
                                    />
                                )}
                            </View>
                        )
                    }
                </View>
                {/* CURRENT PASSWORD */}
                <Text style={[styles.inputLabel, {color: darkmode ? "#ffffff" : "#000000"}]}>Current Password:</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock" size={30} color={`${theme}`} style={{marginRight: "2%"}}/>
                    <TextInput
                        placeholder='Password'
                        value={password}
                        onChangeText={text => setPassword(text)}
                        autoCapitalize='none'
                        onFocus= {() => setPassword('')}
                        secureTextEntry
                        style={[styles.input, {borderColor: `${theme}`, color: darkmode ? "#ffffff" : "#000000"}]}
                    />
                </View>
                {/* NEW PASSWORD */}
                <Text style={[styles.inputLabel, {color: darkmode ? "#ffffff" : "#000000"}]}>New Password:</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock" size={30} color={`${theme}`} style={{marginRight: "2%"}}/>
                    <TextInput
                        placeholder='New Password'
                        value={newPassword}
                        onChangeText={text => setNewPassword(text)}
                        autoCapitalize='none'
                        onFocus= {() => setNewPassword('')}
                        secureTextEntry
                        style={[styles.input, {borderColor: `${theme}`, color: darkmode ? "#ffffff" : "#000000"}]}
                    />
                </View>
                {/* BUTTONS */}
                <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: "5%"}}>
                    {/* CANCEL ADD NEW TASK BUTTON */}
                    <TouchableOpacity onPress={cancelUpdateUserProfile}
                                    style={styles.cancelButton}>
                        <FontAwesome name="remove" size={28} color={"crimson"} />
                    </TouchableOpacity>
                    {/* ADD NEW TASK BUTTON */}
                    <TouchableOpacity onPress={updateUserProfile}
                                    style={styles.updateButton}>
                        <FontAwesome5 name="check" size={28} color={"green"} />
                    </TouchableOpacity>
                </View>
                {/* TOGGLE DELETE ACCOUNT AUTHENTICATION MODAL */}
                <View>
                    <TouchableOpacity onPress={toggleDeleteUserProfile}
                                    style={styles.deleteButton}>
                        <MaterialCommunityIcons name="delete" size={28} color={"crimson"} />
                        <Text style={{fontSize: 16, color: 'crimson'}}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                {/* REAUTHENTICATE ACCOUNT */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={reauthenticateModal}
                    presentationStyle={'overFullScreen'}>
                    <View style={styles.overlayContainer}>
                        <View style={[styles.imageOverlay, {backgroundColor: darkmode ? "#000000":"#ffffff", borderColor: `${theme}`}]}>
                            {/* CLOSE MODAL BUTTON */}
                            <TouchableOpacity style={styles.closeModalBtn} onPress={() => {setReauthenticateModal(!reauthenticateModal)}}>
                                <MaterialCommunityIcons name="close-thick" size={32} color={`${theme}`} />
                            </TouchableOpacity>
                            {/* PREVIEW IMAGE MODAL */}
                            <View style={{flex: 1, marginHorizontal: "5%"}}>
                                <Text style={{fontSize: 18, marginBottom: "15%", color: darkmode ? "#ffffff":"#000000"}}>
                                    Enter login information to delete account
                                </Text>
                                {/* EMAIL */}
                                <Text style={[styles.inputLabel, {color: `${theme}`}]}>Email:</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons name="email" size={30} color={`${theme}`} style={{marginRight: "2%"}}/>
                                    <TextInput
                                        placeholder='Email'
                                        value={email}
                                        onChangeText={text => setEmail(text)}
                                        autoCapitalize='none'
                                        style={[styles.input, {borderColor: `${theme}`}]}
                                    />
                                </View>
                                {/* PASSWORD */}
                                <Text style={[styles.inputLabel, {color: `${theme}`}]}>Password:</Text>
                                <View style={styles.inputContainer}>
                                    <MaterialCommunityIcons name="lock" size={30} color={`${theme}`} style={{marginRight: "2%"}}/>
                                    <TextInput
                                        placeholder='Password'
                                        value={password}
                                        onChangeText={text => setPassword(text)}
                                        autoCapitalize='none'
                                        style={[styles.input, {borderColor: `${theme}`}]}
                                        secureTextEntry
                                    />
                                </View>

                                {/* DELETE MODAL */}
                                <TouchableOpacity onPress={deleteUserProfile}
                                    style={[styles.deleteButton, {alignSelf: 'flex-end'}]}>
                                    <MaterialCommunityIcons name="delete" size={28} color={"crimson"} />
                                    <Text style={{fontSize: 16, color: 'crimson'}}>Delete Account</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView>
    )
};

export default EditProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileImg: {
        width: 130,
        height: 130,
        borderWidth: 5,
        borderRadius: 65,
        resizeMode: 'cover',
        alignSelf: 'center',
        marginBottom: "8%",
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: "1%",
        marginBottom: "3%"
    },
    inputLabel: {
        fontSize: 16,
    },
    input: {
        flex: 1,
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 2,
        borderRadius: 10,
    },
    dateText: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 2,
        borderRadius: 10,
    },
    cancelButton: {
        width: 50,
        height: 50,
        borderWidth: 3,
        borderRadius: 25,
        borderColor: "crimson",
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: "3%",
    },
    updateButton: {
        width: 50,
        height: 50,
        borderWidth: 3,
        borderRadius: 25,
        borderColor: "green",
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        marginTop: '8%',
        flexDirection :'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderWidth: 3,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderColor: 'crimson',
    },
    closeModalBtn: {
        alignSelf: 'flex-end',
        margin: 10,
    },
    overlayContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center'
    },
    imageOverlay: {
        width: "90%",
        height: "45%",
        alignSelf:'center',
        borderWidth: 2,
        borderRadius: 15,
    },
    inputLabel: {
        fontSize: 16,
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
        borderRadius: 10,
    },
});
