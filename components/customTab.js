import React, { useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { Context } from "../utilities/ContextManager.js"
import { BackgroundCol } from "../utilities/theme.js"

import TaskScreen from "../screens/taskScreen";
import TaskDetailScreen from "../screens/taskDetailScreen";
import CalendarScreen from "../screens/calendarScreen";
import AddTask from "../screens/AddTask";
import SearchScreen from "../screens/searchScreen";
import TimerScreen from "../screens/timerScreen";

// initialise bottom tabs
const Tab = createBottomTabNavigator();

// custom new task button
const NewTask = ({ children, onPress }) => {
    return (
        <TouchableOpacity style={[styles.newTaskButtonPosition,styles.shadow]} onPress={onPress}>
            <View style={[styles.newTaskButtonStyle, {backgroundColor: BackgroundCol()}]}>
                {children}
            </View>
        </TouchableOpacity>
    );
}

// bottom navigation tab component
const NavTabs = () => {
    const { darkmode } = useContext(Context);

    return (
        <Tab.Navigator
            initialRouteName='Task'
            screenOptions={{
                tabBarShowLabel: true,
                headerShown: true,
                tabBarStyle: {
                    position: 'absolute',
                    width: "90%",
                    bottom: "3%",
                    left: "5%",
                    right: "5%",
                    elevation: 0,
                    backgroundColor: '#ffffff',
                    borderRadius: 10,
                    height: 80,
                    paddingTop: 10,
                    paddingBottom: 10,
                    ...styles.shadow
                },
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: BackgroundCol(),
                tabBarInactiveTintColor: "grey",
                tabBarLabelPosition: 'below-icon',
                tabBarLabelStyle: { fontSize: 15 },
            }}
        >
            <Tab.Group>
                {/* TASK TAB */}
                <Tab.Screen 
                    name="Task" 
                    component={TaskScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <FontAwesome5 name="tasks" size={32} color={color}/>
                        ),
                    }}
                />
                {/* CALENDAR TAB */}
                <Tab.Screen 
                    name="Calendar" 
                    component={CalendarScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <FontAwesome5 name="calendar-alt" size={32} color={color} />
                        ),
                    }}
                />
            </Tab.Group>

            {/* ADD TASK TAB */}
            <Tab.Group screenOptions={{ presentation: 'modal' }}>
                <Tab.Screen 
                    name="AddTask"
                    labeled={false}
                    component={AddTask}
                    options={{
                        headerShown: false,
                        tabBarIcon: () => (
                            <FontAwesome5 name="plus" size={32} color={"white"} />
                        ),
                        tabBarButton: (props) => (
                            <NewTask {...props}/>
                        ),
                        tabBarLabel: () => null,
                    }}
                />
            </Tab.Group>

            <Tab.Group>
                {/* SEARCH TAB */}
                <Tab.Screen 
                    name="Search" 
                    component={SearchScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome5 name="search" size={32} color={color} />
                        ),
                    }}
                />
                {/* TIMER TAB */}
                <Tab.Screen 
                    name="Timer" 
                    component={TimerScreen}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color, size }) => (
                            <FontAwesome5 name="clock" size={32} color={color} />
                        ),
                    }}
                />
            </Tab.Group>

            {/* TASK DETAIL TAB */}
            <Tab.Screen 
                    name="TaskDetail" 
                    component={TaskDetailScreen}
                    options={{
                        headerTitle: "",
                        headerStyle: {
                            backgroundColor: darkmode ? "#000000":"white",
                        },
                        headerShadowVisible: false,
                        tabBarButton: () => null
                    }}
            />
        </Tab.Navigator>
    );
}

export default NavTabs;

const styles = StyleSheet.create({
    shadow: {
      shadowColor: '#7F5DF0',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.5,
      elevation: 5
    },
    newTaskButtonPosition: {
        top: -30,
        justifyContent: 'center',
        alignContent: 'center',
    },
    newTaskButtonStyle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderRadius: 35,
        borderColor: "white",
    }
});