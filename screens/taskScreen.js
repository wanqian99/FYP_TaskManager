import moment from 'moment';
import { useContext, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, SectionList } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import {  FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'; 
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { BackgroundCol, TintCol } from '../utilities/theme.js';
import { Context } from '../utilities/ContextManager.js';
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc, setDoc } from "firebase/firestore"; 
import { auth, firebaseDB } from '../firebaseConfig.js';


const TaskScreen = ({ navigation }) => {
    const { theme, 
            darkmode, setDarkMode,
            viewMode, setViewMode, 
            taskList, setTaskList, 
            showTask, setShowTask,
            taskItemForScreen, setTaskItemForScreen,
            taskEditState, setTaskEditState,
            taskDeleteState, setTaskDeleteState,
            taskList_stateFilter, setTaskList_stateFilter,
            taskList_dateFilter, setTaskList_dateFilter,
            taskList_priorityFilter, setTaskList_priorityFilter,
            taskList_categoryFilter, setTaskList_categoryFilter,
            taskList_iconFilter, setTaskList_iconFilter,
            deleteTaskItems, setDeleteTaskItems,
    } = useContext(Context);

    const userProfile = auth.currentUser;

    const tabBarHeight = useBottomTabBarHeight();

    // fetch data when showTask changes (filter type changes)
    useEffect(() => {
        // fetch current mode
        fetchLightDarkMode();

        // fetch all filter data
        fetchData_Date();
        fetchData(taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
        fetchData(taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
        fetchData(taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
        fetchData_Icon();
    }, [])


    const fetchLightDarkMode = async () => {
        const docRef = await getDoc(doc(firebaseDB, "user", userProfile.uid, "Mode", "DarkMode"));

        // if there is no Themes collection in firebase yet, set one
        if(docRef.exists()) {
            // set mode
            setDarkMode(docRef.data().darkMode);
            // set mode
            setDarkMode(docRef.data().darkMode);
        }
        // else get from firebase and set to ThemeArray
        else {
            // update to firebase
            await setDoc(doc(firebaseDB, "user", userProfile.uid, "Mode", "DarkMode"), {darkMode: false})
            // set mode
            setDarkMode(false);
        }
    }


    // refilter data by date function
    const fetchData_Date = () => {
        // get date filter data
        const tempArray = [...taskList_dateFilter];

        // reset data array to empty array
        tempArray.map((filter) => {
            filter.data = [];
        })
        
        tempArray.map(async(mainFilter, mainFilterIndex) => {
            // get data from firebase and save to tempArray
            const filterDocs = await getDocs(collection(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", mainFilter.header, mainFilter.header+"Filter"));
            filterDocs.forEach((doc) => {
                tempArray[mainFilterIndex].data.push(doc.data());
            })

            mainFilter.data.map(async(taskItem, taskItemIndex) => {
                // Today's date
                const todayDate = new Date();
                const todayDate_formatted = moment(todayDate).format('YYYY-MM-DD');
                const taskEndDate_formatted = moment(taskItem.endDate, 'Do MMM YYYY').format('YYYY-MM-DD');

                // reorganise tasks by date
                // TODAY
                if(moment(todayDate_formatted).isSame(taskEndDate_formatted)) {
                    // remove from dateFilter
                    tempArray[mainFilterIndex].data.splice(taskItemIndex, 1);
                    // push into correct date filter (today)
                    tempArray[0].data.push(taskItem);
                    // remove from firebase (remove from wrong filter)
                    const oldDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", mainFilter.header, mainFilter.header+"Filter", taskItem.title);
                    await deleteDoc(oldDocRef);
                    // add to firebase (add to today filter)
                    const updatedDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Today", "TodayFilter", taskItem.title);
                    await setDoc(updatedDocRef, taskItem);
                }
                else if(moment(todayDate_formatted).isBefore(taskEndDate_formatted)) {
                    // TOMORROW
                    if(moment(todayDate_formatted).add(1, 'days').format('YYYY-MM-DD') == taskEndDate_formatted) {
                        // remove from dateFilter
                        tempArray[mainFilterIndex].data.splice(taskItemIndex, 1);
                        // push into correct date filter (overdue)
                        tempArray[1].data.push(taskItem);
                        // remove from firebase (remove from wrong filter)
                        const oldDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", mainFilter.header, mainFilter.header+"Filter", taskItem.title);
                        await deleteDoc(oldDocRef);
                        // add to firebase (add to tomorrow filter)
                        const updatedDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Tomorrow", "TomorrowFilter", taskItem.title);
                        await setDoc(updatedDocRef, taskItem);
                    }
                    // UPCOMING
                    else {
                        // remove from dateFilter
                        tempArray[mainFilterIndex].data.splice(taskItemIndex, 1);
                        // push into correct date filter (overdue)
                        tempArray[2].data.push(taskItem);
                        // remove from firebase (remove from wrong filter)
                        const oldDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", mainFilter.header, mainFilter.header+"Filter", taskItem.title);
                        await deleteDoc(oldDocRef);
                        // add to firebase (add to upcoming filter)
                        const updatedDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Upcoming", "UpcomingFilter", taskItem.title);
                        await setDoc(updatedDocRef, taskItem);
                    }
                }
                // OVERDUE
                else if (moment(todayDate_formatted).isAfter(taskEndDate_formatted)) {
                    // remove from dateFilter
                    tempArray[mainFilterIndex].data.splice(taskItemIndex, 1);
                    // push into correct date filter (overdue)
                    tempArray[3].data.push(taskItem);
                    // remove from firebase (remove from wrong filter)
                    const oldDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", mainFilter.header, mainFilter.header+"Filter", taskItem.title);
                    await deleteDoc(oldDocRef);
                    // add to firebase (add to overdue filter)
                    const updatedDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_dateFilter", "Overdue", "OverdueFilter", taskItem.title);
                    await setDoc(updatedDocRef, taskItem);
                }
                setTaskList_dateFilter(tempArray);
            })
        })
    }


    // fetch all filter data arrays
    const fetchData = (filterArray, setFilterArray, mainCollection) => {
        const filterArrayData = [...filterArray];

        // reset data array to empty array
        filterArrayData.map((filter) => {
            filter.data = [];
        })

        // get data from firebase
        filterArrayData.map(async(mainDoc, mainDocIndex) => {
            const filterDocs = await getDocs(collection(firebaseDB, "user", userProfile.uid, 
                                                        mainCollection, mainDoc.header, 
                                                        mainDoc.header+"Filter"));
            filterDocs.forEach((doc) => {
                filterArrayData[mainDocIndex].data.push(doc.data());
            })
        })
        // set to filter array
        setFilterArray(filterArrayData);
    }


    const fetchData_Icon = async () => {
        const tempArray = [];
        const iconItemsArray = [];
        const iconItemsDocs = await getDocs(collection(firebaseDB, "user", userProfile.uid, "iconItems"));
        iconItemsDocs.forEach(async(doc) => {
            iconItemsArray.push({label: doc.data().label, value: doc.data().value, icon: () => <Text>{doc.data().icon}</Text>});

            //setup the icon filter array
            tempArray.push({id: tempArray.length, header: doc.data().value, label: doc.data().label, data: []});
            
            const filterDocs = await getDocs(collection(firebaseDB, "user", userProfile.uid, 
                                                        "taskList_iconFilter", doc.data().value, 
                                                        doc.data().value+"Filter"));
            filterDocs.forEach((doc) => {
                tempArray.map((iconFilter, iconFilterIndex) => {
                    if(iconFilter.header == doc.data().icon) {
                        tempArray[iconFilterIndex].data.push(doc.data());
                    }
                })
            })
        })
        
        // set to filter array
        setTaskList_iconFilter(tempArray);    
    }


    // toggles the task complete state
    const toggleTaskComplete = (task) => {

        const taskDATA = [...showTask];
        
        taskDATA.map((taskItem) => {
            taskItem.data.map(async(item) => {
                if(item.title == task.title) {
                    task.complete = !task.complete;

                    // if task is complete
                    if(item.complete) {
                        // check all subtasks
                        item.subtask.map((subtaskItem) => {
                            subtaskItem.complete = true;
                        })

                        // delete task from incomplete state filter
                        deleteFromArrays(task, taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
                        // Add a new document in collection "CompleteFilter"
                        await setDoc(doc(firebaseDB, "user", userProfile.uid, 
                                        "taskList_stateFilter", "Complete", 
                                        "CompleteFilter", task.title), task);

                        // add to complete filter
                        const tempArray = [...taskList_stateFilter];
                        tempArray[0].data.push(item);
                        setTaskList_stateFilter(tempArray);
                    }
                    else {
                        // uncheck all subtasks
                        item.subtask.map((subtaskItem) => {
                            subtaskItem.complete = false;
                        })

                        // delete task from complete state filter
                        deleteFromArrays(task, taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
                        // Add a new document in collection "IncompleteFilter"
                        await setDoc(doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", "Incomplete", "IncompleteFilter", task.title), task);

                        // add to incomplete filter
                        const tempArray = [...taskList_stateFilter];
                        tempArray[1].data.push(item);
                        setTaskList_stateFilter(tempArray);
                    }
                }
            })
        });

        setShowTask(taskDATA);

        // update to firebase
        updateTaskCompleteState(task, taskList_dateFilter, setTaskList_dateFilter,"taskList_dateFilter");
        updateTaskCompleteState(task, taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
        updateTaskCompleteState(task, taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
        updateTaskCompleteState(task, taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");
    };

    // update task complete boolean to firebase
    const updateTaskCompleteState = async (task, filterArray, setFilterArray, mainCollection) => {
        const filterArrayData = [...filterArray];
        // map through all filter objects
        filterArrayData.map(async(mainFilter) => {
            mainFilter.data.map(async (taskItem) => {
                // if title is found in the taskItem
                if(taskItem.title == task.title) {
                    taskItem.complete = task.complete;
                    // update the doc
                    const docRef = doc(firebaseDB, "user", userProfile.uid, 
                                        mainCollection, mainFilter.header,
                                        mainFilter.header+"Filter", task.title)
                    await updateDoc(docRef, task);
                }
            })
        })
        setFilterArray(filterArrayData);
    }

    // view task detail in taskDetail screen
    const goTaskDetailScreen = (taskItem) => {
        if(taskDeleteState) {
            toggleDeleteState(taskItem);
        }
        else {
             // set the task data
            setTaskItemForScreen(taskItem);
            // navigate to task detail screen
            navigation.navigate("TaskDetail");
        }
    }

    // edit task in addTask screen
    const toggleEditState = (taskItem) => {
        // set task edit state to true
        setTaskEditState(true);
        // set the task data
        setTaskItemForScreen(taskItem);
        // navigate to task detail screen
        navigation.navigate("AddTask");
    }

    // toggles delete state (to select and delete multiple tasks at once)
    const toggleDeleteState = (taskItem) => {
        // get copy of items to delete
        const tempArray = [...deleteTaskItems];

        // if already includes item, means user wants to deselect it
        if(tempArray.includes(taskItem)) {
            const index = tempArray.indexOf(taskItem);
            tempArray.splice(index, 1);
        }
        else {
            // push task item into array
            tempArray.push(taskItem);
        }

        // set delete task items
        setDeleteTaskItems(tempArray);
    }

    // removes task data from arrays
    const deleteFromArrays = (item, filterData, setFilterData, mainCollection) => {
        const tempArray = [...filterData];

        tempArray.map((taskItem, taskItemIndex) => {
            taskItem.data.map(async (task, taskIndex) => {
                if(task.title == item.title) {
                    tempArray[taskItemIndex].data.splice(taskIndex, 1);
                    // delete the document, by referencing with the document id (which is the original task title)
                    const docRef = doc(firebaseDB, "user", userProfile.uid, 
                                        mainCollection, taskItem.header, 
                                        taskItem.header+"Filter", task.title);
                    await deleteDoc(docRef);
                }
            })
        })

        setFilterData(tempArray);
    }

    // delete task
    const deleteTask = (item) => {
        const tempArray = [...taskList];

        // map through task list to locate the task, and delete it from the array
        tempArray.map((taskItem, taskItemIndex) => {
            if(taskItem.title == item.title) {
                tempArray.splice(taskItemIndex,1);
            }
        })
        
        // set task list to temp array
        setTaskList(tempArray);

        // delete task item from the filter arrays
        deleteFromArrays(item, taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
        deleteFromArrays(item, taskList_dateFilter, setTaskList_dateFilter, "taskList_dateFilter");
        deleteFromArrays(item, taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
        deleteFromArrays(item, taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
        deleteFromArrays(item, taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");
    }

    // displays header and label for icons, 
    // else for other filters, display header only
    const taskCategory = ({ section: { header, label } }) => {
        return (
            <View style={[styles.headerContainer, {borderBottomColor: `${theme}`}]}>
                <Text style={[styles.headerText, {color: `${theme}`}]}>
                    {label} {header} 
                </Text>
            </View>
        );
    };

    const taskItem = ({ item, key }) => {
        // show delete and edit buttons when swiped right on each task (for list view)
        const renderRightActions = () => {
            return (
                <View style={{flexDirection: 'row', }}>
                    {/* DELETE BUTTON */}
                    <TouchableOpacity onPress={() => {deleteTask(item)}} key={key}
                                    style={styles.editIconContainer_List}>
                        <MaterialCommunityIcons name="delete" size={32} 
                                    color={
                                        item.priority == "High" ? "crimson" : 
                                        item.priority == "Medium" ? "gold" : 
                                        item.priority == "Low" ? "forestgreen" : 
                                        `${theme}`
                                    } />
                    </TouchableOpacity>
                    {/* EDIT BUTTON */}
                    <TouchableOpacity onPress={() => {toggleEditState(item)}} key={key}
                                    style={styles.editIconContainer_List}>
                        <FontAwesome5 name="edit" size={26} 
                                    color={
                                        item.priority == "High" ? "crimson" : 
                                        item.priority == "Medium" ? "gold" : 
                                        item.priority == "Low" ? "forestgreen" : 
                                        `${theme}`
                                    } />
                    </TouchableOpacity>
                </View>
            );
        };

        // if viewMode state is  "list", show tasks in list view
        if(viewMode == "list") {
            // if task complete is true, display 'check' icon
            return (
                <Swipeable renderRightActions={renderRightActions}>
                    <View style={styles.taskItemContainer_List}>
                        {/* CHECKBOX */}
                        <TouchableOpacity onPress={() => {toggleTaskComplete(item)}} key={key}
                                        style={[styles.taskCheckIcon_List, 
                                                { borderColor: 
                                                    item.priority == "High" ? "crimson" : 
                                                    item.priority == "Medium" ? "gold" : 
                                                    item.priority == "Low" ? "forestgreen" : 
                                                    BackgroundCol(), 
                                                backgroundColor: 
                                                    item.complete ? 
                                                    item.priority == "High" ? "crimson" : 
                                                    item.priority == "Medium" ? "gold" : 
                                                    item.priority == "Low" ? "forestgreen" : 
                                                    `${theme}`
                                                    :TintCol()
                                                }]}>
                            <FontAwesome5 name="check" size={26} color={"#ffffff"} 
                                        style={{alignSelf: 'center',
                                                display: item.complete ? "flex" : "none"}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {goTaskDetailScreen(item)}}
                                        style={[styles.taskTitleContainer_List, 
                                                { borderColor: 
                                                    item.priority == "High" ? "crimson" : 
                                                    item.priority == "Medium" ? "gold" : 
                                                    item.priority == "Low" ? "forestgreen" : 
                                                    BackgroundCol(),
                                                borderWidth: 
                                                    item.priority == null ? 1 : 2,
                                                backgroundColor:
                                                    deleteTaskItems.includes(item) ? BackgroundCol()+'70' : null,
                                                }
                                            ]}>
                            {/* TASK TITLE */}
                            <Text style={[styles.taskTitle_List, 
                                            {color: item.complete ? "darkgrey": darkmode ? "white":"#000000", 
                                            textDecorationLine: item.complete ? 'line-through':'none'}]}>
                                {item.title}
                            </Text>
                            {/* TASK ICON */}
                            <Text style={styles.taskIcon_List}>
                                {item.icon}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Swipeable>
            );
        }
        // if viewMode state is  "grid", show tasks in list view
        else if (viewMode == "grid") {
            let items = [];
            if(item.data) {
                items = item.data.map((task, key) => {
                    return (
                        <View style={[styles.taskTitleContainer_Grid, 
                                        { borderColor: 
                                            task.priority == "High" ? "crimson" : 
                                            task.priority == "Medium" ? "gold" : 
                                            task.priority == "Low" ? "forestgreen" : 
                                            `${theme}`,
                                        borderWidth: 
                                            task.priority == null ? 1 : 2,
                                        backgroundColor:
                                            deleteTaskItems.includes(task) ? `${theme}`+'70' : null,
                                        }
                                    ]} key={key}>
                            <View style={{flexDirection: 'row', marginTop: "5%", justifyContent: 'space-between'}}>
                                {/* CHECKBOX */}
                                <TouchableOpacity onPress={() => {toggleTaskComplete(task)}}
                                        style={[styles.taskCheckIcon_Grid, 
                                                    { borderColor: 
                                                        task.priority == "High" ? "crimson" : 
                                                        task.priority == "Medium" ? "gold" : 
                                                        task.priority == "Low" ? "forestgreen" : 
                                                        `${theme}`, 
                                                    backgroundColor: 
                                                        task.complete ? 
                                                        task.priority == "High" ? "crimson" : 
                                                        task.priority == "Medium" ? "gold" : 
                                                        task.priority == "Low" ? "forestgreen" : 
                                                        `${theme}`
                                                        :darkmode ? "#000000":"#ffffff"
                                                    }
                                                ]}>
                                    <FontAwesome5 name="check" size={26} color={"#ffffff"} 
                                                style={{alignSelf: 'center',
                                                        display: task.complete ? "flex" : "none"}}/>
                                </TouchableOpacity>
                                <View style={{flexDirection: 'row', marginRight: 3}}>
                                    {/* DELETE BUTTON */}
                                    <TouchableOpacity onPress={() => {deleteTask(task)}}
                                            style={styles.editIconContainer_Grid}>
                                        <MaterialCommunityIcons name="delete" size={32} 
                                                    color={
                                                        task.priority == "High" ? "crimson" : 
                                                        task.priority == "Medium" ? "gold" : 
                                                        task.priority == "Low" ? "forestgreen" : 
                                                        `${theme}`
                                                    } 
                                        />
                                    </TouchableOpacity>
                                    {/* EDIT BUTTON */}
                                    <TouchableOpacity onPress={() => {toggleEditState(task)}}
                                            style={styles.editIconContainer_Grid}>
                                        <FontAwesome5 name="edit" size={26} 
                                                    color={
                                                        task.priority == "High" ? "crimson" : 
                                                        task.priority == "Medium" ? "gold" : 
                                                        task.priority == "Low" ? "forestgreen" : 
                                                        `${theme}`
                                                    } 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* TASK TITLE */}
                            <TouchableOpacity onPress={() => {goTaskDetailScreen(task)}} 
                                                style={{flex: 1, justifyContent: 'flex-end',marginBottom: "5%"}}>
                                <Text style={[styles.taskTitle_Grid, 
                                    {color: task.complete ? "darkgrey": darkmode ? "white":"#000000", textDecorationLine: task.complete ? 'line-through':'none'}]}>
                                    {task.title}
                                </Text>
                            </TouchableOpacity>
                            {/* TASK ICON */}
                            <Text style={styles.taskIcon_Grid}>
                                {task.icon}
                            </Text>
                        </View>
                    )
                
                })
            }
            
            return (
                <View style={{flex: 1, flexDirection: 'column'}}>
                    <View style={[styles.headerContainer, {borderBottomColor: `${theme}`}]}>
                        <Text style={[styles.headerText, {color: `${theme}`}]}>
                        {item.label} {item.header}
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', flexWrap:'wrap', justifyContent: 'flex-start'}}>
                        {items}
                    </View>
                </View>
            ); 
        }
    };



    if(viewMode == "list"){
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: TintCol()}}>
                <View style={[styles.container, {marginBottom: tabBarHeight+25}]}>
                    <SectionList
                        sections={showTask}
                        keyExtractor={(item, index) => index}
                        renderSectionHeader={taskCategory}
                        renderItem={(item) => taskItem(item)}
                        stickySectionHeadersEnabled={false}
                    />
                </View>
            </SafeAreaView>
        )
    }
    else if (viewMode == "grid") {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: TintCol()}}>
                <View style={[styles.container, {marginBottom: tabBarHeight+25}]}>
                    <FlatList
                        data={showTask}
                        numColumns={1}
                        renderItem={taskItem}
                        keyExtractor={(item, index) => index}
                    />
                </View>
            </SafeAreaView>
        )
    }
};

export default TaskScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: "8%",
        marginHorizontal: "3%"
    },
    headerContainer: {
        borderBottomWidth: 1,
        marginTop: "5%",
        marginBottom: "2%",
    },
    headerText: {
        fontSize: 20,
    },
    taskItemContainer_List:{
        flex: 1,
        flexDirection: 'row',
    },
    taskItemContainer_Grid:{
        flex: 1,
    },
    taskCheckIcon_List: {
        width: 35,
        height: 35,
        borderWidth: 2,
        borderRadius: 25,
        marginRight: 12,
        marginVertical: 8,
        justifyContent:'center',
        alignSelf: 'center',
    },
    taskCheckIcon_Grid: {
        marginLeft: "5%",
        width: 35,
        height: 35,
        borderWidth: 2,
        borderRadius: 25,
        justifyContent:'center',
    },
    taskTitleContainer_List: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 10,
        marginVertical: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    taskTitleContainer_Grid: {
        aspectRatio: 1,
        width: "46%",
        height: "100%",
        borderRadius: 10,
        marginVertical: "2%",
        marginHorizontal: "2%",
        justifyContent: 'space-between',
    },
    taskTitle_List: {
        width: "85%",
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    taskTitle_Grid: {
        fontSize: 18,
        paddingVertical: 5,
        paddingHorizontal: 12,
        width: "80%",
    },
    taskIcon_List: {
        width: "15%",
        marginBottom: 5,
        fontSize: 26,
        textAlign: 'center',
        alignSelf: 'center',
    },
    taskIcon_Grid: {
        position: 'absolute',
        bottom: "5%",
        right: "5%",
        fontSize: 26,
        textAlign: 'center',
        alignSelf: 'flex-end'
    },
    editIconContainer_List: {
        marginHorizontal: 5,
        justifyContent:'center',
    },
    editIconContainer_Grid: {
        marginHorizontal: 5,
        justifyContent:'center',
    },
    closeModalBtn: {
        alignSelf: 'flex-end',
        margin: 10
    },
    deleteIcon: {
        backgroundColor: "blue",
    }
});
