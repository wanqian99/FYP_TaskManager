import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { BackgroundCol, TintCol } from '../utilities/theme.js';
import { Context } from '../utilities/ContextManager.js';
import Checkbox from 'expo-checkbox';
import { collection, getDocs, doc, getDoc, query, deleteDoc, updateDoc, setDoc, orderBy } from "firebase/firestore"; 
import { auth, firebaseDB } from '../firebaseConfig.js';


export const RightHeaderButtons = () => {
    const { theme, 
            viewMode, setViewMode, 
            taskList, setTaskList, 
            showTask, setShowTask,
            taskList_stateFilter, setTaskList_stateFilter,
            taskList_dateFilter, setTaskList_dateFilter,
            taskList_priorityFilter, setTaskList_priorityFilter, 
            taskList_categoryFilter, setTaskList_categoryFilter,
            taskList_iconFilter, setTaskList_iconFilter,
            filterCheckbox, setFilterCheckbox,
            taskDeleteState, setTaskDeleteState,
            deleteTaskItems, setDeleteTaskItems,
            filterMode, setFilterMode,
            subFilterMode, setSubFilterMode,
    } = useContext(Context);

    const userProfile = auth.currentUser;

    const [filterModalVisible, setFilterModalVisible] = useState(false);

    useEffect(() => {
        const fetchAllCheckbox = async () => {
            const subFilterCheckboxArray = [];

            const docRef = await getDoc(doc(firebaseDB, "user", userProfile.uid, 
                                            "filterCheckboxArray", "StateFilter"));

            // if firebase already contains filter checkbox array
            // retrieve checkbox array from firebase (which includes last filter checkbox mode [user preference])
            if (docRef.exists()) {
                const filterCheckboxArray = [];
                const checkboxArrayRef = await collection(firebaseDB, "user", userProfile.uid, 
                                                        "filterCheckboxArray");
                let q = await getDocs(query(checkboxArrayRef, orderBy("id", "asc")));
                q.forEach(async(doc) => {
                    // get filter checkbox data
                    filterCheckboxArray.push(doc.data());

                    // get filter mode
                    if(doc.data().checked) {
                        setFilterMode(doc.data().mode);
                    }
                    
                    // get subfiltermode
                    doc.data().sub.map((subFilter) => {
                        // for each checked subfilter, push it into the empty array
                        if(subFilter.checked) {
                            subFilterCheckboxArray.push(subFilter.header);
                        }
                    })
                })

                // set filter checkbox with icons included
                setFilterCheckbox(filterCheckboxArray);

                // set sub filter mode, so that it called the correct filter task to display
                setSubFilterMode(subFilterCheckboxArray);
            }
            // if firebase doesnt contain filter checkbox array
            // get filter checkbox state array, and add icon (if there is in iconItems) 
            // to sub filter checkbox, under main icon filter
            else {
                filterCheckboxArray = [...filterCheckbox];
                
                // reset sub icon filter array, so that same icons dont get added repeatedly
                filterCheckboxArray[4].sub = [];
                // get icon items docs
                const iconDocRef = await getDocs(collection(firebaseDB, "user", userProfile.uid, "iconItems"));
                iconDocRef.forEach((doc) => {
                    const iconData = {id: filterCheckboxArray[4].sub.length, header: doc.data().value, label: doc.data().label, checked: false};
                    filterCheckboxArray[4].sub.push(iconData);
                })

                filterCheckboxArray.map(async(mainFilter) => {
                    await setDoc(doc(firebaseDB,"user", userProfile.uid,  "filterCheckboxArray", mainFilter.mode+"Filter"), mainFilter);
                    mainFilter.sub.map((subFilter) => {
                        if(subFilter.checked) {
                            subFilterCheckboxArray.push(subFilter.header);
                        }
                    })
                })

                // set filter checbox with icons included
                setFilterCheckbox(filterCheckboxArray);

                // set sub filter mode, so that it called the correct filter task to display
                setSubFilterMode(subFilterCheckboxArray);
            }
        }
        
        fetchAllCheckbox();
    }, [])

    // if subfiltermode changes, run filtertasks function
    useEffect(() => {
        if(filterMode == "State") {
            filterTasks([...taskList_stateFilter]);
        }
        else if(filterMode == "Date") {
            filterTasks([...taskList_dateFilter]);
        }
        else if(filterMode == "Priority") {
            filterTasks([...taskList_priorityFilter]);            
        }
        else if(filterMode == "Category") {
            filterTasks([...taskList_categoryFilter]);
        }
        else if(filterMode == "Icon") {
            filterTasks([...taskList_iconFilter]);
        }
    }, [subFilterMode])

    // this function filters task by checking with the current subFilterMode
    const filterTasks = (filterData) => {
        // new array to store filtered tasks
        const tempArray = [];
        filterData.map((subFilter) => {
            if(subFilterMode.includes(subFilter.header)) {
                tempArray.push(subFilter);
            }
        })

        // show the filtered tasks
        setShowTask(tempArray);
    }

    // this function looks through the filterCheckbox array for checked sub filters,
    // and push them into subfiltermode state array
    const setSubFilterArrayToDisplayTasks = () => {
        // initialise temp array, to store checked sub checkboxes
        const tempArray = [];

        // array to copy filterCheckbox
        const filterCheckboxArray = [...filterCheckbox];

        // looks through filterCheckbox array for checked sub checkboxes,
        // to push into temp array
        filterCheckboxArray.map((mainFilter) => {
            mainFilter.sub.map((subFilter) => {
                if(subFilter.checked) {
                    tempArray.push(subFilter.header);
                }
                // check if current filterMode is main checkbox's mode
                if(filterMode == mainFilter.mode) {
                    // if all checkboxes are checked, check the main filter
                    if(mainFilter.sub.length == tempArray.length) {
                        mainFilter.checked = true;
                    }
                    // else, uncheck the main filter
                    else {
                        mainFilter.checked = false;
                    }
                }
            })
        })

        // update filter checkbox
        setFilterCheckbox(filterCheckboxArray);

        // set the subfiltermode to temp array
        setSubFilterMode(tempArray);
    }

    // handles main checkbox toggle
    const toggleFilterCheckboxMain = (filterItemMain) => {
        const tempArray = [];

        // if not checked, check the main checkbox, and uncheck all others
        if(!filterItemMain.checked) {
            // array to copy filterCheckbox
            const filterCheckboxArray = [...filterCheckbox];

            // uncheck all main checkboxes, and sub checkboxes
            filterCheckboxArray.map((mainFilter) => {
                mainFilter.checked = false;
                mainFilter.sub.map((subFilter) => {
                    subFilter.checked = false;
                })
            })

            // check the main checkbox
            filterItemMain.checked = true;

            // check all sub checkbox, under the same main checkbox
            filterItemMain.sub.map((subFilter) => {
                subFilter.checked = true;

                tempArray.push(subFilter.header);
            })

            // update filter checkbox
            setFilterCheckbox(filterCheckboxArray);

            filterCheckboxArray.map(async(mainFilter) => {
                // update document in collection "filterCheckboxArray"
                await updateDoc(doc(firebaseDB, "user", userProfile.uid, "filterCheckboxArray", mainFilter.mode+"Filter"), mainFilter);
            })

            setSubFilterMode(tempArray);

            // make modal visiblity false
            setFilterModalVisible(false);
        }
        else {
            alert("Select another checkbox to change filter type");
        }

        // set filter mode, used to determine which filter task to display
        setFilterMode(filterItemMain.mode);
    }

    // handles sub checkbox toggle
    const toggleFilterCheckboxSub = (filterItemMain, filterItemSub) => {
        // array to copy filterCheckbox
        const filterCheckboxArray = [...filterCheckbox];

        // if sub checkbox is not checked
        if(!filterItemSub.checked) {

            // if sub checkbox is not under same main checkbox
            if(filterItemMain.mode != filterMode) {

                // uncheck all main checkboxes
                filterCheckboxArray.map((mainFilter) => {
                    mainFilter.checked = false;
                    // uncheck sub filter checkbox (under 'unchecked' main filter)
                    mainFilter.sub.map((subFilter) => {
                        subFilter.checked = false;
                    })
                })
            }

            // set filtermode to new filter mode
            setFilterMode(filterItemMain.mode);

            // check sub checkbox
            filterItemSub.checked = true;

            // update filter checkbox
            setFilterCheckbox(filterCheckboxArray);

            setSubFilterArrayToDisplayTasks();
        }
        // if sub checkbox is checked
        else {
            // if there is more than 1 element in the subfiltermode
            if(subFilterMode.length > 1) {
                // uncheck sub checkbox
                filterItemSub.checked = false;
            }
            else {
                alert("Select at least one filter");
            }
            
            setSubFilterArrayToDisplayTasks();
        }

        filterCheckboxArray.map(async(mainFilter) => {
            // update document in collection "filterCheckboxArray"
            await updateDoc(doc(firebaseDB, "user", userProfile.uid, "filterCheckboxArray", mainFilter.mode+"Filter"), mainFilter);
        })
    }

    // removes task data from arrays
    const deleteFromArrays = (filterData, setFilterData, mainCollection) => {
        // copy items to delete
        const tasksToDelete = [...deleteTaskItems];

        // copy of filter data to delete from
        const tempArray = [...filterData];

        // maps through the delete task items array, and delete them from filter data temp array
        tasksToDelete.map((item) => {
            tempArray.map((taskItem, taskItemIndex) => {
                taskItem.data.map( async(task, taskIndex) => {
                    if(task.title == item.title) {
                        tempArray[taskItemIndex].data.splice(taskIndex, 1);
                        // delete the document, by referencing with the document id (which is the task title)
                        const docRef = doc(firebaseDB, "user", userProfile.uid, mainCollection, taskItem.header, taskItem.header+"Filter", item.title);
                        await deleteDoc(docRef);
                    }
                })
            })
        })

        setFilterData(tempArray);
    }

    const deleteTaskToggle = () => {
        // if task delete state is true
        if(taskDeleteState) {
            // copy items to delete
            const tasksToDelete = [...deleteTaskItems];

            // copy of task list to delete from
            const tempArray = [...taskList];
            
            // maps through the delete task items array, and delete them from task list array
            tasksToDelete.map((item) => {
                tempArray.map((taskItem, taskItemIndex) => {
                    if(taskItem.title == item.title) {
                        tempArray.splice(taskItemIndex,1);
                    }
                })
            })

            setTaskList(tempArray);

            // delete task item from the filter arrays
            deleteFromArrays(taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
            deleteFromArrays(taskList_dateFilter, setTaskList_dateFilter, "taskList_dateFilter");
            deleteFromArrays(taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
            deleteFromArrays(taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
            deleteFromArrays(taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");

            // reset delete task item array
            setDeleteTaskItems([]);
            // set to false
            setTaskDeleteState(false);
        }
        else {
            // set to true
            setTaskDeleteState(true);
        }
    }

    const FilterModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={filterModalVisible}
                presentationStyle={'overFullScreen'}>
                <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center'}}>
                    <View style={[styles.filterTasks, {backgroundColor: TintCol(), borderColor: BackgroundCol()}]}>
                        {/* CLOSE MODAL BUTTON */}
                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => {setFilterModalVisible(!filterModalVisible)}}>
                            <MaterialCommunityIcons name="close-thick" size={32} color={BackgroundCol()} />
                        </TouchableOpacity>

                        <ScrollView style={styles.checkboxContainer}>
                            {filterCheckbox.map((mainFilter) => {
                                // console.log(filterMode)
                                return (
                                    <View key={mainFilter.id}>
                                        {/* Filter checkbox main */}
                                        <View style={[styles.checkboxMain, {borderBottomColor: `${theme}`}]}>
                                            <Checkbox
                                                value={mainFilter.checked}
                                                onValueChange={() => {toggleFilterCheckboxMain(mainFilter)}}
                                                color={`${theme}`}
                                            />
                                            <Text style={[styles.checkBoxHeader, {color: `${theme}`}]}>{mainFilter.header}</Text>
                                        </View>

                                        {/* Filter checkbox sub */}
                                        {/* Displays header and label for icon filters,
                                        else only display header for other filters */}
                                        {mainFilter.sub.map((subFilter) => {
                                            return (
                                                <View style={[styles.checkboxSub, {borderBottomColor: `${theme}`}]} key={subFilter.id}>
                                                    <Checkbox
                                                        value={subFilter.checked}
                                                        onValueChange={() => {toggleFilterCheckboxSub(mainFilter, subFilter)}}
                                                        color={`${theme}`}
                                                    />
                                                    <Text style={[styles.checkBoxHeader, {color: `${theme}`}]}>{subFilter.header} {subFilter.label}</Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                )
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <View style={styles.viewIcon}>
            <TouchableOpacity onPress={() => {deleteTaskToggle()}} style={{paddingRight: 5}}>
                {!taskDeleteState ? (
                    <MaterialCommunityIcons name="checkbox-multiple-marked" size={35} color={BackgroundCol()} />
                ) : (
                    <MaterialCommunityIcons name="delete" size={35} color={BackgroundCol()} />
                )}
            </TouchableOpacity>
            {viewMode == "list" ? 
                (
                    <TouchableOpacity onPress={() => {setViewMode("grid")}}>
                        <MaterialCommunityIcons name="view-grid" size={35} color={BackgroundCol()} />
                    </TouchableOpacity>
                ):(
                    <TouchableOpacity onPress={() => {setViewMode("list")}}>
                        <MaterialCommunityIcons name="format-list-bulleted-square" size={35} color={BackgroundCol()} />
                    </TouchableOpacity>
                )
            }
            
            <TouchableOpacity onPress={() => {setFilterModalVisible(!filterModalVisible)}}>
                <MaterialCommunityIcons name="filter" size={35} color={BackgroundCol()} />
            </TouchableOpacity>

            {/* Filter Task Modal */}
            <FilterModal />
        </View>
    );
}

const styles = StyleSheet.create({
    viewIcon: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    filterTasks: {
        maxHeight: "70%",
        marginHorizontal: "5%",
        borderWidth: 3,
        borderRadius: 15
    },
    closeModalBtn: {
        alignSelf: 'flex-end',
        margin: 10
    },
    checkboxContainer: {
        width: "80%",
        alignSelf: 'center',
        marginBottom: "8%",
    },
    checkBoxHeader: {
        flex: 1,
        fontSize: 16,
        paddingLeft: 10,
        paddingBottom: 5,
        alignSelf: 'stretch',
    },
    checkboxMain: {
        flexDirection: 'row', 
        width: "100%",
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    checkboxSub: {
        flexDirection: 'row',
        width: "90%",
        marginBottom: 5,
        marginLeft: "10%",
    }
});
