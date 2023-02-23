import { useContext} from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { BackgroundCol, TintCol } from '../utilities/theme.js';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Context } from '../utilities/ContextManager.js';
import { doc, setDoc, deleteDoc } from "firebase/firestore"; 
import { auth, firebaseDB } from '../firebaseConfig.js';

const addIconItem = ({
    iconItems, setIconItems,
    setIconValue,
    iconModalVisible, setIconModalVisible,
    iconLabel, setInputIconLabel,
    icon, setInputIcon,
    iconsToDisplay, setIconsToDisplay,
}) => {

    const { theme, darkmode, 
            taskList_iconFilter, setTaskList_iconFilter, 
            filterCheckbox, setFilterCheckbox,
    } = useContext(Context);

    const userProfile = auth.currentUser;
    
    const addIconToFilterCheckbox = (icon, label) => {
        // add new icon to filterCheckbox
        const filterCheckboxArray = [...filterCheckbox];
        
        filterCheckboxArray.map(async(item) => {
            // add new icon into filter checkbox
            if(item.mode == "Icon") {
                // if currrent filter is icon filter
                if(item.checked) {
                    item.sub.push({id: item.sub.length, header: icon, label: label, checked: true});
                }
                else {
                    item.sub.push({id: item.sub.length, header: icon, label: label, checked: false});
                }
                
                // add filter checkbox array to firebase
                filterCheckboxArray.map(async(mainFilter) => {
                    await setDoc(doc(firebaseDB, "user", userProfile.uid, "filterCheckboxArray", mainFilter.mode+"Filter"), mainFilter);
                })
            }
        })
        setFilterCheckbox(filterCheckboxArray);
    }

    const closeIconModal = () => {
        // set modal visiblity to false
        setIconModalVisible(!iconModalVisible);

        //clears text input
        setInputIconLabel("");
        setInputIcon("");
    }

    const addNewIcon = async (icon, iconLabel) => {
        // check that text input for icon label is not empty
        if(iconLabel == "") {
            alert("Enter an icon label name");
            return;
        }
        // check that text input for icon is not empty
        else if(icon == "") {
            alert("Enter an emoji");
            return;
        }
        // if new icon label is in array
        else if (iconItems.some(el => el.label === iconLabel)) {
            //alert msg
            alert("The same icon label name has already been added");
            // get the index of the same icon label name
            const index = iconItems.findIndex(obj => obj.label === iconLabel)
            // set selected icon to the same icon
            setIconValue(iconItems[index].value)
        }
        // if new icon is in array
        else if (iconItems.some(el => el.value === icon)) {
            //alert msg
            alert("The same icon has already been added");
            // get the index of the same icon
            const index = iconItems.findIndex(obj => obj.value === icon)
            // set selected icon to the same icon
            setIconValue(iconItems[index].value)
        }
        else {
            const iconArray = [...iconItems];
            // push the new icon to the icons array
            iconArray.push({label: iconLabel, value: icon, icon: () => <Text>{icon}</Text>});
            // set icon items (for icon dropdown)
            setIconItems(iconArray);

            const iconFilterArray = [...taskList_iconFilter];
            // push the new icon into the icon filter array
            iconFilterArray.push({id: iconFilterArray.length, header: icon, label: iconLabel, data: []});
            // add to icon filter array 
            setTaskList_iconFilter(iconFilterArray);

            // set selected icon to newly added icon
            setIconValue(icon);

            // add the new icon to filter checkbox
            addIconToFilterCheckbox(icon, iconLabel);

            // Add a new document in collection iconItems
            const iconDocRef = doc(firebaseDB, "user", userProfile.uid, "iconItems", iconLabel);
            await setDoc((iconDocRef), {label: iconLabel, value: icon, icon: icon});
        }

        // closes the modal
        setIconModalVisible(!iconModalVisible);

        //clears text input
        setInputIconLabel("");
        setInputIcon("");
    }

    // renders icon values in the iconItems list
    const iconListItem = (icon) => {
        return (
            <View style={[styles.showIconItems, {borderColor: `${theme}`}]} key={icon.index}>
                <Text style={styles.iconItemStyle}>{icon.item.value}</Text>
                <Text style={[styles.iconLabelStyle, {color: `${theme}`}]}>{icon.item.label}</Text>
                {/* REMOVE ICON */}
                <TouchableOpacity onPress={() => removeIconFromList(icon.item.label, icon.index)}>
                    <FontAwesome name="remove" size={24} color={`${theme}`} style={{paddingVertical: 4, paddingHorizontal: 7}}/>
                </TouchableOpacity>
            </View>
        )
    }

    // remove icon from iconItems
    const removeIconFromList = async (iconLabel, index) => {
        const iconFilterArray = [...taskList_iconFilter];
        iconFilterArray.map((iconFilter) => {
            if(iconFilter.label == iconLabel) {
                if(iconFilter.data.length > 0) {
                    // alert to notify user that canvas has not been saved
                    Alert.alert(
                        "There are tasks using this icon.",
                        "Are you sure you want to delete this icon?",
                        [
                            {
                                text: "Yes",
                                onPress: () => {
                                    removeIcon(iconLabel, index);
                                },
                            },
                            {
                                text: "No",
                            },
                        ]
                    );
                }
                else {
                    removeIcon(iconLabel, index); 
                }
            }
        })
    }

    const removeIcon = async (iconLabel, index) => {
        const iconArray = [...iconItems];
        // increment index by 1, as the first item is null,
        // which is removed from the iconsToDisplay array
        // so in iconItems we need to take that first item into account,
        // and add one to the index
        iconArray.splice(index + 1, 1);
        setIconItems(iconArray);

        const tempArray = [...filterCheckbox];
        tempArray.map((mainFilter, mainFilterIndex) => {
            if(mainFilter.mode == "Icon") {
                mainFilter.sub.map((subFilter, subFilterIndex) => {
                    if(subFilter.label == iconLabel) {
                        tempArray[mainFilterIndex].sub.splice(subFilterIndex, 1);
                    }
                })

                // update filter checkbox array to firebase
                tempArray.map(async(filter) => {
                    await setDoc(doc(firebaseDB, "user", userProfile.uid, "filterCheckboxArray", 
                                    filter.mode+"Filter"), filter);
                })
            }
        })

        // delete the document in collection iconItems
        const docRef = doc(firebaseDB, "user", userProfile.uid, "iconItems", iconLabel);
        await deleteDoc(docRef);
    }

    return (
        <View>
            <TouchableOpacity onPress={() => {setIconModalVisible(!iconModalVisible)}}>
                <MaterialCommunityIcons name="plus-thick" size={32} color={BackgroundCol()} />
            </TouchableOpacity>
            
            <Modal
                animationType="fade"
                transparent={true}
                visible={iconModalVisible}
                presentationStyle={'overFullScreen'}>
                <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center'}}>
                    <View style={[styles.addIconOverlay, {backgroundColor: TintCol(), borderColor: BackgroundCol()}]}>
                        {/* CLOSE MODAL BUTTON */}
                        <TouchableOpacity style={styles.closeModalBtn} onPress={closeIconModal}>
                            <MaterialCommunityIcons name="close-thick" size={32} color={BackgroundCol()} />
                        </TouchableOpacity>

                        <View>
                            {/* ADD NEW ICON LABEL*/}
                            <Text style={[styles.textInputLabel, {color: BackgroundCol()}]}>Icon Label:</Text>
                            <TextInput
                                style={[styles.iconInput, {borderColor: BackgroundCol(), color: darkmode ? "#ffffff":"#000000"}]}
                                onChangeText={(iconLabel) => {setInputIconLabel(iconLabel)}}
                                value={iconLabel}
                                placeholder="Enter New Icon Label..."
                                placeholderTextColor={darkmode ? "#ffffff":"lightgrey"}
                            />
                            {/* ADD NEW ICON */}
                            <Text style={[styles.textInputLabel, {color: BackgroundCol()}]}>Icon: </Text>
                            <TextInput
                                style={[styles.iconInput, {borderColor: BackgroundCol(), color: darkmode ? "#ffffff":"#000000"}]}
                                onChangeText={(icon) => {setInputIcon(icon)}}
                                value={icon}
                                placeholder="Enter New Icon..."
                                placeholderTextColor={darkmode ? "#ffffff":"lightgrey"}
                            />
                            {/* EXISTING ICON ITEMS IN DROPDOWN PICKER */}
                            <Text style={[styles.textInputLabel, {color: BackgroundCol()}]}>Icon List:</Text>
                            <View style={{marginHorizontal: "5%"}}>
                                <FlatList
                                    columnWrapperStyle={{justifyContent: 'flex-start'}}
                                    numColumns={2}
                                    scrollEnabled={true}
                                    data={iconsToDisplay}
                                    renderItem={iconListItem}
                                    keyExtractor={(item, index) => index}
                                />
                            </View>
                        </View>
                        
                        {/* SUBMIT BUTTON */}
                        <TouchableOpacity style={[styles.addNewIconBtn, {backgroundColor: BackgroundCol()}]} 
                                        onPress={() => {addNewIcon(icon, iconLabel)}}>
                            <Text style={[styles.addNewIconText, {color: TintCol()}]}>Add New Icon</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default addIconItem;

const styles = StyleSheet.create({
    addIconOverlay: {
        marginHorizontal: "5%",
        borderWidth: 3,
        borderRadius: 15
    },
    closeModalBtn: {
        alignSelf: 'flex-end',
        margin: 10
    },
    addNewIconBtn: {
        alignSelf: 'flex-end',
        marginTop: "10%",
        marginRight: "5%",
        marginBottom: "5%",
        borderRadius: 10,
    },
    addNewIconText: {
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    textInputLabel: {
        fontSize: 18,
        width: "90%",
        alignSelf: 'center',
        marginBottom: "1%",
    },
    iconInput: {
        fontSize: 18,
        padding: 8,
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: "3%",
        width: "90%",
        alignSelf: 'center',
    },
    showIconItems: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: "2%",
        marginBottom: "2%",
        borderWidth: 2,
        borderRadius: 10,
    },
    iconItemStyle: {
        fontSize: 25,
        padding: 5,
    },
    iconLabelStyle: {
        fontSize: 16,
        paddingRight: 8,
    },
})