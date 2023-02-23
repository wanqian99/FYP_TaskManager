import moment from 'moment';
import React, { useState, useContext, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TintCol } from '../utilities/theme.js';
import { Context } from '../utilities/ContextManager.js';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Agenda } from 'react-native-calendars';

const CalendarScreen = ({ navigation }) => {
    const { theme, 
        darkmode, setDarkMode,
        taskList_dateFilter, setTaskList_dateFilter,
        taskItemForScreen, setTaskItemForScreen,
} = useContext(Context);

    const tabBarHeight = useBottomTabBarHeight();

    const [items, setItems] = useState({});

    const todayDate = new Date();

    // Refresh the agenda by calling the loadItems function
    useEffect(() => {
        // get day to parse into loadItems
        todayDate.setHours(0, 0, 0, 0);
        const todayDate_formatted = moment(todayDate).format('YYYY-MM-DD');
        const day = { dateString: todayDate_formatted, day: todayDate.getDate(), 
                    month: todayDate.getMonth() + 1, timestamp: todayDate.getTime(), 
                    year: todayDate.getFullYear(8)}
        // call function to re-render
        loadItems(day);
    }, [taskList_dateFilter])
    

    const timeToString = (time) => {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }

    const rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    };

    const loadItems = (day) => {
        const tempArray = [...taskList_dateFilter];
        const items = {};
        
        setTimeout(() => {
            // initialise date dictionary
            for (let i = -15; i < 85; i++) {
                const time = day.timestamp + i * 24 * 60 * 60 * 1000;
                const strTime = timeToString(time);
                // if new items doesnt have the date dictionary
                if(!items[strTime]) {
                    // initialise date dictionary to be empty array
                    items[strTime] = [];
                }
            }

            tempArray.map((mainFilter) => {
                mainFilter.data.map((subFilter) => {
                    const taskStartDate_formatted = moment(subFilter.startDate, 'Do MMM YYYY').format('YYYY-MM-DD');

                    if(items[taskStartDate_formatted]) {
                        // push into array
                        items[taskStartDate_formatted].push(subFilter);
                    }
                })
            })

            const newItems = {};
            Object.keys(items).forEach(key => {
                newItems[key] = items[key];
            });
            // set as items
            setItems(newItems);
        }, 1000);
    }

    // view task detail in taskDetail screen
    const goTaskDetailScreen = (taskItem) => {
        // set the task data
        setTaskItemForScreen(taskItem);
        // navigate to task detail screen
        navigation.navigate("TaskDetail");
    }

    const renderItem = (item) => {
        return (
            <View style={styles.taskItemContainer_List}>
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
            </View>
        );
    };

    // returns darkmode and theme, so that it changes when state changes
    const keyRender = (darkmode, theme) => {
        return `${darkmode}-${theme}` 
    }

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: TintCol()}]}>
            <View style={{flex: 1, marginTop: "6%", marginBottom: tabBarHeight+25}}>
                <Agenda
                    key={keyRender(darkmode,theme)}
                    items={items}
                    loadItemsForMonth={loadItems}
                    selected={todayDate}
                    renderItem={renderItem}
                    rowHasChanged={rowHasChanged}
                    minDate={'2000-01-01'}
                    maxDate={'2100-01-01'}
                    showClosingKnob={true}
                    calendarStyle={{
                        borderTopWidth: 5,
                        borderBottomWidth: 5,
                        borderColor: `${theme}`,
                    }}
                    theme={{
                            // OVERRIDE AGENDA STYLE
                            // calendar
                            calendarBackground: darkmode ? "#000000" : "#ffffff",
                            // month
                            monthTextColor: darkmode ? "#ffffff" : "#000000",
                            // textMonthFontSize: 22,
                            // day names
                            textSectionTitleColor: `${theme}`,
                            // textDayHeaderFontSize: 14,
                            textDayHeaderFontWeight: 'bold',
                            // dates
                            dayTextColor: darkmode ? "#ffffff" : "#000000",
                            todayTextColor: `${theme}`,
                            // knob
                            expandableKnobColor: `${theme}`,
                            // selected date
                            selectedDayBackgroundColor: `${theme}`,
                            selectedDayTextColor: 'white',
                            // disabled date
                            textDisabledColor: 'grey',
                            // dot (marked date)
                            dotColor: `${theme}`,
                            selectedDotColor: 'white',
                            // agenda list
                            agendaDayTextColor: darkmode ? "#ffffff" : "#000000",
                            agendaDayNumColor: darkmode ? "#ffffff" : "#000000",
                            agendaTodayColor: `${theme}`,
                            agendaKnobColor: `${theme}`,
                            reservationsBackgroundColor: darkmode ? "#000000" : "#ffffff",
                    }}
                />
            </View>
        </SafeAreaView>
    )
};

export default CalendarScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    taskItemContainer_List:{
        flex: 1,
        flexDirection: 'row',
        marginRight: "5%",
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
    taskTitle_List: {
        width: "85%",
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    taskIcon_List: {
        width: "15%",
        fontSize: 26,
        textAlign: 'center',
        alignSelf: 'center',
    },
});
