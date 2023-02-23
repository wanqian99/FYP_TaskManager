import { StatusBar } from 'expo-status-bar';
import { useContext, useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Context } from '../utilities/ContextManager.js';
import { BackgroundCol, TintCol } from '../utilities/theme.js';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'; 

const SearchScreen = ({ navigation }) => {
    const { theme, darkmode, 
            taskItemForScreen, setTaskItemForScreen,
            taskList_dateFilter, setTaskList_dateFilter,
    } = useContext(Context);

    const tabBarHeight = useBottomTabBarHeight();

    const [query, setQuery] = useState("");
    const [filteredTaskList, setFilteredTaskList] = useState([]);

    // view task detail in taskDetail screen
    const goTaskDetailScreen = (taskItem) => {
        // set the task data
        setTaskItemForScreen(taskItem);
        // navigate to task detail screen
        navigation.navigate("TaskDetail");
    }

    // search for task
    const searchTask = (query) => {
        setQuery(query);
        const tempArray = [...taskList_dateFilter];

        const result = []
        // filter to find task title
        tempArray.map((mainFilter) => {
            mainFilter.data.filter((subFilter) => {
                // check that query is not empty
                if(query != "") {
                    if(subFilter.title.toLowerCase().includes(query.toLowerCase())) {
                        // save task data
                        result.push(subFilter);
                    }
                }
            })
        });

        // set filtered task list to search results
        setFilteredTaskList(result);
    };

    // render search results
    const searchItem = ({item}) => {
        return (
            <TouchableOpacity onPress={() => {goTaskDetailScreen(item)}}
                            style={[styles.taskTitleContainer_List, 
                                    { borderColor: 
                                        item.priority == "High" ? "crimson" : 
                                        item.priority == "Medium" ? "gold" : 
                                        item.priority == "Low" ? "forestgreen" : 
                                        `${theme}`,
                                    borderWidth: 
                                        item.priority == null ? 1 : 2,
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
        );
    }

    
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: TintCol()}}>
            <View style={[styles.container, {marginBottom: tabBarHeight+25}]}>
                {/* SEARCH BAR */}
                <TextInput
                    style={[styles.searchInput, {borderColor: `${theme}`, color: darkmode ? "#ffffff":"#000000"}]}
                    onChangeText={searchTask}
                    value={query}
                    placeholder="Search for Task By Title..."
                    placeholderTextColor={darkmode ? "#ffffff":"lightgrey"}
                />
                {/* SEARCH RESULT LABEL */}
                <View style={{borderBottomWidth: 1, borderColor: `${theme}`, marginBottom: "5%"}}>
                    <Text style={{fontSize: 20, color: `${theme}`}}>
                        Search result:
                    </Text>
                </View>
                {/* SHOW SEARCH RESULTS */}
                {/* show search result if filteredTaskList is not empty */}
                {filteredTaskList.length > 0 ? 
                    (
                        <FlatList
                            data={filteredTaskList}
                            renderItem={searchItem}
                            keyExtractor={(item, index) => index}
                        />
                    ) : 
                    (
                        <Text style={{fontSize: 16, color: darkmode ? "#ffffff" : "#000000"}}>
                            No search results
                        </Text>
                    )
                }
            </View>
        </SafeAreaView>
    )
};

export default SearchScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: "8%",
        marginHorizontal: "3%"
    },
    searchInput: {
        fontSize: 16,
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderWidth: 2,
        borderRadius: 10,
        marginTop: "5%",
        marginBottom: "8%",
    },
    taskTitleContainer_List: {
        flex: 1,
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 10,
        marginVertical: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    taskTitle_List: {
        width: "85%",
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    taskIcon_List: {
        width: "15%",
        marginBottom: 5,
        fontSize: 26,
        textAlign: 'center',
        alignSelf: 'center',
    },
});
