import React, { useState, useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackgroundCol, TintCol } from '../utilities/theme.js';
import { Context } from '../utilities/ContextManager.js';
import { DrawerActions } from '@react-navigation/native';
import ColorPicker from 'react-native-wheel-color-picker';

import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"; 
import { auth, firebaseDB } from '../firebaseConfig.js';

// custom color picker
const CustomColorPicker = ({ navigation }) => {
    
    const { theme, setTheme, ThemeArray, setThemeArray } = useContext(Context);

    // state to save the color selected from the color picker
    const [swatch, setSwatch] = useState("");

    const userProfile = auth.currentUser;

    // adds new theme to array, to display in drawer
    const addTheme = async(color) => {
        const tempArray = [...ThemeArray];
        tempArray.push({color: color, state: false});
        setThemeArray(tempArray);

        // update to firebase
        await setDoc(doc(firebaseDB, "user", userProfile.uid, "Themes", color), {color: color, state: false});

        // opens drawer after theme is added
        navigation.dispatch(DrawerActions.openDrawer());
    }

    const setToDefaultTheme = async () => {
        const tempArray = [
            {color: '#dc143c', state: false},
            {color: '#db7093', state: false},
            {color: '#f08080', state: false},
            {color: '#ff7f50', state: false},
            {color: '#ffa07a', state: false},
            {color: '#f0e68c', state: false},
            {color: '#ffdead', state: false},
            {color: '#228b22', state: false},
            {color: '#5f9ea0', state: false},
            {color: '#6495ed', state: true},
            {color: '#191970', state: false},
            {color: '#9370db', state: false},
            {color: '#663399', state: false},
            {color: '#d8bfd8', state: false},
        ]
        // set theme array to default theme list
        setThemeArray(tempArray);

        // delete all themes from firebase
        const getThemes = await getDocs(collection(firebaseDB, "user", userProfile.uid, "Themes"));
        getThemes.forEach((col) => {
            deleteDoc(doc(firebaseDB, "user", userProfile.uid, "Themes", col.data().color))
        })

        // update to firebase
        tempArray.map(async(themeColor) => {
            // set doc for each colour
            await setDoc(doc(firebaseDB, "user", userProfile.uid, "Themes", themeColor.color), {color: themeColor.color, state: themeColor.state});
            
            // set to default theme
            if(themeColor.state == true) {
                setTheme(themeColor.color);
            }

            // opens drawer after theme swtaches switch to default list
            navigation.dispatch(DrawerActions.openDrawer());
        })
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: TintCol()}}>
            {/* Show list of themes currently available */}
            <View style={{marginTop: "10%", marginHorizontal: "5%"}}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: "2%"}}>
                    <Text style={{color: `${theme}`, fontSize: 20}}>
                        Themes list:
                    </Text>
                    {/* when pressed, it calls setToDefaultTheme */}
                    <TouchableOpacity onPress={() => {setToDefaultTheme()}}>
                        <Text style={[styles.revertThemeButton, 
                                    {color: BackgroundCol(), 
                                    backgroundColor: TintCol(), 
                                    borderColor: BackgroundCol()}]}>
                                        Revert to Default Themes
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {ThemeArray.map((col, key) => {
                        return (
                            <View style={[styles.themeButton, {backgroundColor: col.color}]} key={key}>
                            </View>
                        )
                    })}
                </View>
            </View>
            
            {/* color picker to customise app theme */}
            <View style={styles.colorPickerStyle}>
                <ColorPicker
                    row={false}
                    gapSize={0}
                    color={theme}
					thumbSize={40}
					sliderSize={40}
                    swatches={false}
                    shadeWheelThumb={true}
                    shadeSliderThumb={true}
                    onColorChange={(color) => {setSwatch(color)}}
				/>
            </View>

            {/* displays current selected color hex value */}
            <View style={styles.currentColorValue}>
                <Text style={{fontSize: 18, color: BackgroundCol()}}>
                    Color value: {theme}
                </Text>
            </View>

            
            {/* when pressed, it calls addTheme, 
            parsing in the swatch color selected on the color picker */}
            <TouchableOpacity onPress={() => {addTheme(swatch)}}>
                <Text style={[styles.addThemeButton, 
                            {color: BackgroundCol(), 
                            backgroundColor: TintCol(), 
                            borderColor: BackgroundCol()}]}>
                                Add to Themes
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
};

export default CustomColorPicker;

const styles = StyleSheet.create({
    themeButton: {
        width: 30,
        height: 30,
        borderRadius: 25,
        marginRight: 8,
        marginVertical: 5,
        backgroundColor: "white",
    },
    revertThemeButton: {
        fontSize: 14,
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf:"flex-end",
        textAlign:"center",
    },
    colorPickerStyle: {
        alignSelf:"center",
        width: "90%",
        height: "55%",
    },
    currentColorValue:{
        marginVertical: "8%",
        marginHorizontal: "5%"
    },
    addThemeButton: {
        fontSize: 18,
        borderWidth: 2,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignSelf:"center",
        alignContent: "center",
        textAlign:"center",
        marginTop: "3%",
    },
});