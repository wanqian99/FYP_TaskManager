import React, { useContext } from "react";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from "../components/drawerContent.js"
import { Context, Provider } from '../utilities/ContextManager.js'
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; 
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import Tab from "../components/customTab.js"
import EditProfile from "../screens/editProfile.js"
import CustomColorPicker from "../screens/colorPicker.js";

import { BackgroundCol, TintCol } from "../utilities/theme.js"
import { RightHeaderButtons } from "./rightHeaderButtons.js";
import { AutoCategorizeTasks } from "./autoCategorizeSwitch.js";

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// initialise drawer
const Drawer = createDrawerNavigator();

// custom menu button component
const MenuBtn = ({onPress}) => {
    return (
        <TouchableOpacity style={{paddingLeft: 10}} onPress={onPress}>
            <MaterialCommunityIcons name="menu" size={35} color={BackgroundCol()} />
        </TouchableOpacity>
    );
}

// custom task detail back button component
const TaskDetailBackBtn = ({onPress}) => {
    return (
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={onPress}>
            <MaterialIcons name="keyboard-arrow-left" size={30} color={BackgroundCol()} />
            <Text style={{fontSize: 18, color: BackgroundCol()}}>Back</Text>
        </TouchableOpacity>
    );
}

// custom task detail edit task button component
const DeleteOrEditTaskBtn = ({navigation}) => {
    // when user clicks on edit button, they will be navigated to addTask screen
    // addTask screen checks if edit state is true, prefill the form with task data
    const { taskEditState, setTaskEditState,
            taskDeleteState_single, setTaskDeleteState_single,
    } = useContext(Context);

    const toggleEditState = () => {
        setTaskEditState(true);
        navigation.navigate("AddTask");
    }

    const toggleDeleteState = () => {
        setTaskDeleteState_single(true);
    }

    return (
        <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 12}}>
            <TouchableOpacity onPress={() => {toggleDeleteState()}} style={{marginRight: 10}}>
                <MaterialCommunityIcons name="delete" size={35} color={BackgroundCol()}/>
            </TouchableOpacity>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => {toggleEditState()}}>
                <FontAwesome5 name="edit" size={28} color={BackgroundCol()}/>
            </TouchableOpacity>
        </View>
    );
}

// drawer navigation
const NavigationDrawerStructure = (props) => {

    // this function checks if the user is on the task screen, 
    // if so, it renders the right header icons
    const getHeaderRight = (route, navigation) => {
        // If the focused route is not found, we need to assume it's the initial screen
        // This can happen during if there hasn't been any navigation inside the screen
        // In our case, it's "Home" as that's the first screen inside the navigator
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
      
        switch (routeName) {
            case 'Home':
                return () => <RightHeaderButtons />;
            case 'Task':
                return () => <RightHeaderButtons />;
            case 'AddTask':
                return () => <AutoCategorizeTasks />;
            case 'TaskDetail':
                return () => <DeleteOrEditTaskBtn navigation={navigation}/>;
        }
    }

    // set the left header for the screens
    // default to drawer menu button
    // if on task detail screen, set to back button
    const getHeaderLeft = (route, navigation) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';

        switch (routeName) {
            default:
                return () => <MenuBtn onPress={navigation.toggleDrawer}/>;
            case 'TaskDetail':
                return () => <TaskDetailBackBtn onPress={() => navigation.navigate("Task")}/>;
        }
    }

    return (
        // theme provider is used so that all screens are able 
        // to access theme state and change theme easily
        <Provider>
            <Drawer.Navigator
                useLegacyImplementation={true}
                drawerContent={(props) => <DrawerContent {...props} />}
                screenOptions={({ navigation }) => ({
                    headerShown: true,
                    headerTransparent: true,
                    headerTitle: "",
                    drawerStyle: {
                        backgroundColor: TintCol(),
                        width: "80%",
                    },
                    drawerType: 'front',
                    drawerActiveBackgroundColor: BackgroundCol(),
                    drawerActiveTintColor: TintCol(),
                    drawerInactiveBackgroundColor: TintCol(),
                    drawerInactiveTintColor: BackgroundCol(),
                    headerLeft: () =>
                        <MenuBtn onPress={navigation.toggleDrawer}/>
                })}
            >
                <Drawer.Screen name="Home" component={Tab} 
                    options={({route, navigation}) => ({
                        headerRight: getHeaderRight(route, navigation),
                        headerLeft: getHeaderLeft(route, navigation),
                        drawerIcon: ({ color, size }) => (
                            <FontAwesome5 name="home" size={size} color={color} />
                        ),
                        drawerLabelStyle: {
                            fontSize: 16,
                        }
                    })}
                />
                <Drawer.Screen name="Edit Profile" component={EditProfile}
                    options={{
                        drawerIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="square-edit-outline" size={size} color={color} />
                        ),
                        drawerLabelStyle: {
                            fontSize: 16,
                        }
                    }}
                />
                {/* this is only used for navigation, as im customising this drawer tab */}
                <Drawer.Screen name="CustomColorPicker" component={CustomColorPicker}
                    options={{
                        drawerItemStyle: {
                            display: 'none'
                        }
                    }}
                />
            </Drawer.Navigator>
        </Provider>
    );
};

export default NavigationDrawerStructure;
