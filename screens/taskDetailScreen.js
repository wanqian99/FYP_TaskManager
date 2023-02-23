import { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, FlatList, Modal, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { TintCol } from '../utilities/theme.js';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Context } from '../utilities/ContextManager.js';
import Checkbox from 'expo-checkbox';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore"; 
import { auth, firebaseDB } from '../firebaseConfig.js';

const TaskDetailScreen = ({ navigation }) => {
    const { 
        theme,
        darkmode,
        taskItemForScreen, setTaskItemForScreen,
        showTask, setShowTask,
        taskList, setTaskList,
        taskDeleteState_single, setTaskDeleteState_single,
        taskList_stateFilter, setTaskList_stateFilter,
        taskList_dateFilter, setTaskList_dateFilter,
        taskList_priorityFilter, setTaskList_priorityFilter,
        taskList_categoryFilter, setTaskList_categoryFilter,
        taskList_iconFilter, setTaskList_iconFilter,
    } = useContext(Context);

    const userProfile = auth.currentUser;

    const tabBarHeight = useBottomTabBarHeight();

    const [ subtaskMode, setSubtaskMode ] = useState([]);

    const [ canvasImageModal, setCanvasImageModal ] = useState(false);
    const [ currentCanvasImage, setCurrentCanvasImage ] = useState();

    const [ imageModal, setImageModal ] = useState(false);
    const [ currentImage, setCurrentImage ] = useState();
    const [currentImageFN, setCurrentImageFN] = useState("");

    const [ fileModal, setFileModal ] = useState(false);
    const [ currentFile, setCurrentFile ] = useState();
    const [ currentFileFN, setCurrentFileFN] = useState("");

    // check for delete state
    useEffect(() => {
        // if delete state is true, delete task
        if(taskDeleteState_single) {
            const tempArray = [...taskList];

            // map through task list to locate the task, and delete it from the array
            tempArray.map((taskItem, taskItemIndex) => {
                if(taskItem.title == taskItemForScreen.title) {
                    tempArray.splice(taskItemIndex,1);
                }
            })
            
            // set task list to temp array
            setTaskList(tempArray);

            deleteFromArrays(taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
            deleteFromArrays(taskList_dateFilter, setTaskList_dateFilter, "taskList_dateFilter");
            deleteFromArrays(taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
            deleteFromArrays(taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
            deleteFromArrays(taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");

            // reset task delete state
            setTaskDeleteState_single(false);

            // navigate to Task screen after deleting task
            navigation.navigate("Task");
        }
    }, [taskDeleteState_single])

    // removes task data from arrays
    const deleteFromArrays = (filterData, setFilterData, mainCollection) => {
        const tempArray = [...filterData];

        tempArray.map((taskItem, taskItemIndex) => {
            taskItem.data.map(async(task, taskIndex) => {
                if(task.title == taskItemForScreen.title) {
                    tempArray[taskItemIndex].data.splice(taskIndex, 1);
                    // delete the document, by referencing with the document id (which is the original task title)
                    const docRef = doc(firebaseDB, "user", userProfile.uid, mainCollection, taskItem.header, taskItem.header+"Filter", task.title);
                    await deleteDoc(docRef);
                }
            })
        })

        setFilterData(tempArray);
    }

    // toggles the task complete state
    const toggleTaskComplete = async(task) => {
        const tempArray = [];
        const taskDATA = [...showTask];
        
        taskDATA.map(async(taskItem) => {
            taskItem.data.map(async(item) => {
                if(item.title == task.title) {
                    // mark task as complete
                    task.complete = !task.complete;

                    // if task is complete
                    if(item.complete) {
                        // check all subtasks
                        item.subtask.map((subtaskItem) => {
                            subtaskItem.complete = true;
                        })

                        // delete task from incomplete state filter
                        deleteFromArrays(taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
                        // Add a new document in collection "CompleteFilter"
                        await setDoc(doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", "Complete", "CompleteFilter", task.title), task);

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
                        deleteFromArrays(taskList_stateFilter, setTaskList_stateFilter, "taskList_stateFilter");
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

        // sets the subtask array complete state
        setSubtaskMode(tempArray);
        // shows task data
        setShowTask(taskDATA);

        // update to firebase
        updateTaskCompleteToFirebase_State(task);
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
                    const docRef = doc(firebaseDB, "user", userProfile.uid, mainCollection, 
                                        mainFilter.header, mainFilter.header+"Filter", task.title)
                    await updateDoc(docRef, task);
                }
            })
        })
        setFilterArray(filterArrayData);
    }

    // toggles the subtask complete state
    const toggleSubtaskComplete = (subtask, key) => {
        const tempArray = [];
        const taskDATA = [...showTask];

        taskDATA.map((taskItem) => {
            taskItem.data.map((item) => {
                if(item.title == taskItemForScreen.title) {
                    // toggle subtask complete state
                    item.subtask[key].complete = !item.subtask[key].complete;
                    item.subtask.map((subtaskItem) => {
                        // add complete subtask to the list
                        if(subtaskItem.complete) {
                            tempArray.push(subtask.subtask);
                        }
                        // if the length of all subtasks is the same as the length of the list,
                        // set the task to be complete
                        if(item.subtask.length == tempArray.length) {
                            item.complete = true;
                        }
                        // else set it to false (not all subtask are complete)
                        else {
                            item.complete = false;
                        }
                    })
                }
            })
        })
        
        setShowTask(taskDATA);

        // update to firebase
        updateTaskCompleteToFirebase_State(taskDATA);
        updateTaskCompleteToFirebase(taskDATA, taskList_dateFilter, setTaskList_dateFilter, "taskList_dateFilter");
        updateTaskCompleteToFirebase(taskDATA, taskList_priorityFilter, setTaskList_priorityFilter, "taskList_priorityFilter");
        updateTaskCompleteToFirebase(taskDATA, taskList_categoryFilter, setTaskList_categoryFilter, "taskList_categoryFilter");
        updateTaskCompleteToFirebase(taskDATA, taskList_iconFilter, setTaskList_iconFilter, "taskList_iconFilter");
    };

    const updateTaskCompleteToFirebase_State = (subtask) => {
        const filterArrayData = [...taskList_stateFilter];
        // map through all filter objects
        filterArrayData.map((mainFilter) => {
            mainFilter.data.map(async (taskItem) => {
                // if title is found in the taskItem
                if(taskItem.title == taskItemForScreen.title) {
                    taskItem.complete = taskItemForScreen.complete;

                    // if task is complete
                    if(taskItem.complete) {
                        // delete doc from firebase
                        const deleteDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", 
                                                "Incomplete", "IncompleteFilter", taskItem.title)
                        await deleteDoc(deleteDocRef);
                        // update doc to complete
                        const docRef = doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", 
                                            "Complete", "CompleteFilter", taskItem.title)
                        await setDoc(docRef, taskItem);
                    }
                    else {
                        // delete doc from firebase
                        const deleteDocRef = doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", 
                                                "Complete", "CompleteFilter", taskItem.title)
                        await deleteDoc(deleteDocRef);
                        // set doc to incomplete
                        const docRef = doc(firebaseDB, "user", userProfile.uid, "taskList_stateFilter", 
                                            "Incomplete", "IncompleteFilter", taskItem.title)
                        await setDoc(docRef, taskItem);
                    }
                }
            })
        })
        setTaskList_stateFilter(filterArrayData);
    }

    const updateTaskCompleteToFirebase = (subtask, filterArray, setFilterArray, mainCollection) => {
        const filterArrayData = [...filterArray];
        // map through all filter objects
        filterArrayData.map((mainFilter) => {
            mainFilter.data.map(async (taskItem) => {
                // if title is found in the taskItem
                if(taskItem.title == taskItemForScreen.title) {
                    taskItem.complete = taskItemForScreen.complete;
                    // update the doc
                    const docRef = doc(firebaseDB, "user", userProfile.uid, mainCollection, mainFilter.header, mainFilter.header+"Filter", taskItem.title)
                    await updateDoc(docRef, taskItem);
                }
            })
        })
        setFilterArray(filterArrayData);
    }

    // image modal to preview image
    const previewCanvasImage = (index) => {
        // set current canvas image
        setCurrentCanvasImage(taskItemForScreen.canvas[index]);
        // open the modal
        setCanvasImageModal(true);
    }

    // image modal to preview image
    const previewImage = (index) => {
        // set current canvas image
        setCurrentImage(taskItemForScreen.images[index].uri);
        // set current image file name
        setCurrentImageFN(taskItemForScreen.images[index].fileName);
        // open the modal
        setImageModal(true);
    }

    // file modal to preview file
    const previewFile = (index) => {
        // if on android devices, file opens up in the device's file viewer
        if(Platform.OS == "android") {
            FileSystem.getContentUriAsync(taskItemForScreen.files[index].uri).then(cUri => {
                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: cUri,
                    flags: 1,
                    //type: 'application/pdf'
                    type: '*/*'
                 });
            });
        }
        // if on ios devices, file opens up in modal
        else if (Platform.OS == "ios") {
            // open the preview file modal
            setFileModal(true);

            // set current file uri
            setCurrentFile(taskItemForScreen.files[index].uri);

            // set current file name
            setCurrentFileFN(taskItemForScreen.files[index].name);
        }
    }

    // share canvas image
    const shareImageOrFile = async (curr) => {
        // allow sharing, so the file can be downloaded
        Sharing.shareAsync("file://" + curr);
    }

    const canvasImageListItem = (data) => {
        return (
            <View>
                {/* CANVAS IMAGE COVER */}
                <TouchableOpacity onPress={() => previewCanvasImage(data.index)}
                                style={styles.imageListCoverContainer}>
                    <Image source={{ uri: data.item }} style={[styles.imageListCover, {borderColor: `${theme}`}]}/>
                </TouchableOpacity>

                {/* PREVIEW CANVAS IMAGE MODAL */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={canvasImageModal}
                    presentationStyle={'overFullScreen'}>
                    <View style={styles.overlayContainer}>
                        <View style={[styles.imageOverlay, {backgroundColor: darkmode ? "#000000":"#ffffff", borderColor: `${theme}`}]}>
                            {/* CLOSE MODAL BUTTON */}
                            <TouchableOpacity style={styles.closeModalBtn} onPress={() => {setCanvasImageModal(!canvasImageModal)}}>
                                <MaterialCommunityIcons name="close-thick" size={32} color={`${theme}`} />
                            </TouchableOpacity>
                            {/* PREVIEW IMAGE MODAL */}
                            <View style={{flex: 1}}>
                                <Image source={{ uri: currentCanvasImage }} style={styles.previewImage} />
                                {/* SHARE CANVAS IMAGE BUTTON */}
                                <TouchableOpacity style={styles.downloadFileBtn} onPress={() => {shareImageOrFile(currentCanvasImage)}}>
                                    <MaterialCommunityIcons name="share" size={32} color={`${theme}`} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }

    const imageListItem = (data) => {
        return (
            <View>
                {/* IMAGE COVER */}
                <TouchableOpacity onPress={() => previewImage(data.index)}
                                style={styles.imageListCoverContainer}>
                    <Image source={{ uri: data.item.uri }} style={[styles.imageListCover, {borderColor: `${theme}`}]}/>
                </TouchableOpacity>

                {/* PREVIEW IMAGE MODAL */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={imageModal}
                    presentationStyle={'overFullScreen'}>
                    <View style={styles.overlayContainer}>
                        <View style={[styles.imageOverlay, {backgroundColor: darkmode ? "#000000":"#ffffff", borderColor: `${theme}`}]}>
                            {/* CLOSE MODAL BUTTON */}
                            <TouchableOpacity style={styles.closeModalBtn} onPress={() => {setImageModal(!imageModal)}}>
                                <MaterialCommunityIcons name="close-thick" size={32} color={`${theme}`} />
                            </TouchableOpacity>
                            {/* PREVIEW IMAGE MODAL */}
                            <View style={{flex: 1}}>
                                <Image source={{ uri: currentImage }} style={styles.previewImage} />
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    {/* IMAGE FILE NAME */}
                                    <Text style={{fontSize: 16, alignSelf: 'center', marginLeft: "5%",color: darkmode ? "#ffffff":"#000000"}}>
                                        {/* {currentImageFN} */}
                                        {currentImageFN.length > 30 ? `...${currentImageFN.substring(currentImageFN.length-27, currentImageFN.length)}` : `${currentImageFN}`}
                                    </Text>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                                        {/* DOWNLOAD IMAGE BUTTON */}
                                        <TouchableOpacity style={styles.downloadFileBtn} onPress={() => {shareImageOrFile(currentImage)}}>
                                            <MaterialCommunityIcons name="share" size={32} color={`${theme}`} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }

    // render item for flat list, renders uploaded file list
    const fileListItem = (data) => {
        return (
            <View>
                {/* FILE NAME, TAP TO OPEN FILE MODAL */}
                <TouchableOpacity onPress={() => previewFile(data.index)} 
                                style={styles.imageListCoverContainer}>
                    <Text style={[styles.fileListCover, {borderColor: `${theme}`, color: darkmode ? "#ffffff":"#000000"}]}>{data.item.name}</Text>
                </TouchableOpacity>

                {/* PREVIEW FILE MODAL */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={fileModal}
                    presentationStyle={'overFullScreen'}>
                    <View style={styles.overlayContainer}>
                        <View style={[styles.fileOverlay, {backgroundColor: darkmode ? "#000000":"#ffffff", borderColor: `${theme}`}]}>
                            {/* CLOSE MODAL BUTTON */}
                            <TouchableOpacity style={styles.closeModalBtn} onPress={() => {setFileModal(!fileModal)}}>
                                <MaterialCommunityIcons name="close-thick" size={32} color={`${theme}`} />
                            </TouchableOpacity>
                            {/* PREVIEW FILE MODAL */}
                            <View style={{flex: 1}}>
                                <WebView
                                    style={{flex:1}}
                                    originWhitelist={['*']}
                                    source={{uri: currentFile}}
                                />
                                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                    {/* FILE NAME */}
                                    <Text style={{fontSize: 16, alignSelf: 'center', marginLeft: "5%",color: darkmode ? "#ffffff":"#000000"}}>
                                        {/* {currentFileFN} */}
                                        {currentFileFN.length > 30 ? `...${currentFileFN.substring(currentFileFN.length-27, currentFileFN.length)}` : `${currentFileFN}`}
                                    </Text>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                                        {/* DOWNLOAD IMAGE BUTTON */}
                                        <TouchableOpacity style={styles.downloadFileBtn} onPress={() => {shareImageOrFile(currentFile)}}>
                                            <MaterialCommunityIcons name="share" size={32} color={`${theme}`} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: TintCol()}]}>
            <View style={[styles.taskContainer, {marginBottom: tabBarHeight+25}]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {/* TASK CHECKBOX FOR COMPLETE STATE */}
                    {/* TASK PRIORITY - checkbox colour */}
                    <TouchableOpacity onPress={() => {toggleTaskComplete(taskItemForScreen)}}
                                    style={[styles.taskCheckIcon, 
                                            { borderColor: 
                                                taskItemForScreen.priority == "High" ? "crimson" : 
                                                taskItemForScreen.priority == "Medium" ? "gold" : 
                                                taskItemForScreen.priority == "Low" ? "forestgreen" : 
                                                `${theme}`, 
                                            backgroundColor: 
                                                taskItemForScreen.complete ? 
                                                taskItemForScreen.priority == "High" ? "crimson" : 
                                                taskItemForScreen.priority == "Medium" ? "gold" : 
                                                taskItemForScreen.priority == "Low" ? "forestgreen" : 
                                                `${theme}`
                                                :TintCol()
                                            }]}>
                        <FontAwesome5 name="check" size={26} color={"#ffffff"} 
                                    style={{alignSelf: 'center',
                                            display: taskItemForScreen.complete ? "flex" : "none"}}/>
                    </TouchableOpacity>
                    
                    {/* TASK PRIORITY - bottom border colour */}
                    <View style={{ flex:1, flexDirection: 'row', borderBottomWidth: 2, alignItems: 'center', justifyContent: 'space-between',
                                    borderBottomColor: 
                                        taskItemForScreen.priority == "High" ? "crimson" : 
                                        taskItemForScreen.priority == "Medium" ? "gold" : 
                                        taskItemForScreen.priority == "Low" ? "forestgreen" : 
                                        `${theme}`, 
                                }}>
                        {/* TASK TITLE */}
                        {/* TASK PRIORITY - task title colour */}
                        <View style={{width: "85%"}}>
                            <Text style={{ fontSize: 20,
                                        color: 
                                            taskItemForScreen.complete ? "darkgrey":
                                            taskItemForScreen.priority == "High" ? "crimson" : 
                                            taskItemForScreen.priority == "Medium" ? "gold" : 
                                            taskItemForScreen.priority == "Low" ? "forestgreen" : 
                                            `${theme}`,
                                        textDecorationLine: taskItemForScreen.complete ? 'line-through':'none'}}>
                                {taskItemForScreen.title}
                            </Text>
                        </View>
                        
                        {/* TASK ICON */}
                        <View style={{width: "15%"}}>
                            <Text style={{fontSize: 28}}>{taskItemForScreen.icon}</Text>
                        </View>
                    </View>
                </View>

                {/* ROW CONTAINS TASK ENDDATE, CATEGORY, NOTIFY */}
                <View style={{marginVertical: "3%"}}>
                    <ScrollView horizontal={true}>
                        {/* TASK DATE */}
                        <View style={[styles.taskDateContainer, 
                                    { borderColor: `${theme}`, 
                                    backgroundColor: darkmode ? "#000000" : "white",
                                    shadowColor: darkmode ? "white" : "#000000",
                                    }]}>
                            <FontAwesome5 name="calendar-alt" size={20} color={`${theme}`} />
                            <Text style={[styles.taskText, {color: `${theme}`}]}>
                                {taskItemForScreen.endDate}
                            </Text>
                        </View>

                        {/* TASK CATEGORY */}
                        {taskItemForScreen.category &&
                            <View style={[styles.taskDateContainer, 
                                        { borderColor: `${theme}`, 
                                        backgroundColor: darkmode ? "#000000" : "white",
                                        shadowColor: darkmode ? "white" : "#000000",
                                        }]}>
                                <FontAwesome5 name="list-alt" size={20} color={`${theme}`} />
                                <Text style={[styles.taskText, {color: `${theme}`}]}>
                                    {taskItemForScreen.category}
                                </Text>
                            </View>
                        }
                        
                        {/* TASK NOTIFY */}
                        {taskItemForScreen.notify &&
                            <View style={[styles.taskDateContainer, 
                                        { borderColor: `${theme}`, 
                                        backgroundColor: darkmode ? "#000000" : "white",
                                        shadowColor: darkmode ? "white" : "#000000",
                                        }]}>
                                <MaterialCommunityIcons name="bell" size={20} color={`${theme}`} />
                                <Text style={[styles.taskText, {color: `${theme}`}]}>
                                    {taskItemForScreen.notify} before
                                </Text>
                            </View>
                        }
                    </ScrollView>
                </View>

                <View style={{flex: 1}}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        {/* TASK SUBTASKS */}
                        <View style={{borderBottomColor: `${theme}`, borderBottomWidth: 1, marginVertical: "2%"}}>
                            <Text style={[styles.subtaskLabel, {color: `${theme}`}]}>
                                Subtasks:
                            </Text>
                        </View>
                        {taskItemForScreen.subtask.length == 0 ? 
                            (
                                <Text style={[styles.taskText, {color: darkmode ? "white" : "#000000"}]}>
                                    No subtasks
                                </Text>
                            ) : (
                                taskItemForScreen.subtask.map((subtaskItem, key) => {
                                    return(
                                        <View style={{flexDirection: 'row', alignItems: 'center',}} key={key}>
                                            {/* SUBTASK CHECKBOX FOR COMPLETE STATE */}
                                            <Checkbox
                                                value={subtaskItem.complete}
                                                onValueChange={() => {toggleSubtaskComplete(subtaskItem, key)}}
                                                color={`${theme}`}
                                                style={[styles.subtaskCheckIcon, 
                                                    { borderColor: `${theme}`, 
                                                    backgroundColor: 
                                                    subtaskItem.complete ? `${theme}` : TintCol()
                                                }]}
                                            />
                                            <Text style={[styles.taskText, {color: darkmode ? "white" : "#000000"}]}>
                                                {subtaskItem.subtask}
                                            </Text>
                                        </View>
                                    )
                                })
                            )
                        }

                        {/* TASK CANVAS IMAGES */}
                        <View style={{borderBottomColor: `${theme}`, borderBottomWidth: 1, marginTop: "5%", marginBottom: "2%"}}>
                            <Text style={[styles.subtaskLabel, {color: `${theme}`}]}>
                                Sketches:
                            </Text>
                        </View>
                        {taskItemForScreen.canvas.length == 0 ?
                            (
                                <Text style={[styles.taskText, {color: darkmode ? "white" : "#000000"}]}>
                                    No canvas sketches
                                </Text>
                            ) : 
                            (
                                <FlatList
                                    horizontal={true}
                                    scrollEnabled
                                    showsHorizontalScrollIndicator={true}
                                    data={taskItemForScreen.canvas}
                                    renderItem={canvasImageListItem}
                                    keyExtractor={(item, index) => index}
                                />
                            )
                        }

                        {/* TASK IMAGES */}
                        <View style={{borderBottomColor: `${theme}`, borderBottomWidth: 1, marginTop: "5%", marginBottom: "2%"}}>
                            <Text style={[styles.subtaskLabel, {color: `${theme}`}]}>
                                Images:
                            </Text>
                        </View>
                        {taskItemForScreen.images.length == 0 ?
                            (
                                <Text style={[styles.taskText, {color: darkmode ? "white" : "#000000"}]}>
                                    No images
                                </Text>
                            ) : 
                            (
                                <FlatList
                                    horizontal={true}
                                    scrollEnabled
                                    showsHorizontalScrollIndicator={true}
                                    data={taskItemForScreen.images}
                                    renderItem={imageListItem}
                                    keyExtractor={(item, index) => index}
                                />
                            )
                        }

                        {/* TASK FILES */}
                        <View style={{borderBottomColor: `${theme}`, borderBottomWidth: 1, marginTop: "5%", marginBottom: "2%"}}>
                            <Text style={[styles.subtaskLabel, {color: `${theme}`}]}>
                                Files:
                            </Text>
                        </View>
                        {taskItemForScreen.files.length == 0 ?
                            (
                                <Text style={[styles.taskText, {color: darkmode ? "white" : "#000000"}]}>
                                    No files
                                </Text>
                            ) : 
                            (
                                <FlatList
                                    horizontal={true}
                                    scrollEnabled
                                    showsHorizontalScrollIndicator={true}
                                    data={taskItemForScreen.files}
                                    renderItem={fileListItem}
                                    keyExtractor={(item, index) => index}
                                />
                            )
                        }
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    )
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    taskContainer: {
        flex: 1,
        marginHorizontal: "5%",
    },
    taskCheckIcon: {
        width: 35,
        height: 35,
        borderWidth: 2,
        borderRadius: 25,
        marginRight: 12,
        justifyContent:'center',
        alignSelf: 'center',
    },
    taskDateContainer: {
        marginRight: 10,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        shadowOffset: { 
            width: 2,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,  
        elevation: 5,
    },
    taskText: {
        fontSize: 16,
        paddingLeft: 8,
    },
    subtaskLabel: {
        fontSize: 20,
    },
    subtaskCheckIcon: {
        width: 25,
        height: 25,
        marginBottom: 8,
        justifyContent:'center',
        alignSelf: 'center',
    },
    imageListCoverContainer:{
        marginRight: 8,
    },
    imageListCover:{
        width: 120,
        height: 120,
        borderWidth: 2,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    fileListCover:{
        fontSize: 16,
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        paddingRight: 35,
    },
    overlayContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center'
    },
    imageOverlay: {
        width: "90%",
        height: "70%",
        alignSelf:'center',
        borderWidth: 2,
        borderRadius: 15,
    },
    closeModalBtn: {
        alignSelf: 'flex-end',
        margin: 10,
    },
    previewImage:{
        width: "90%",
        height: "90%",
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    downloadFileBtn: {
        alignSelf: 'flex-end',
        margin: 10,
    },
    fileOverlay: {
        width: "100%",
        height: "90%",
        alignSelf:'center',
        borderWidth: 2,
        borderRadius: 15,
    },
    editTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: "2%",
        paddingLeft: 12,
        paddingRight: 10,
        borderWidth: 2,
        borderRadius: 8,
    }
});