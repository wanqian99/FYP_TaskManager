import React, { useState, createContext } from 'react';

// use context to pass the props throughout the app
export const Context = createContext();

export const Provider = ({ children }) => {
    const [theme, setTheme] = useState("#6495ed");
    const [darkmode, setDarkMode] = useState(false);
    const [ viewMode, setViewMode ] = useState("list");

    // array of themes
    const [ThemeArray, setThemeArray] = useState([
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
    ]);

    const [ taskList, setTaskList ] = useState([]);

    const [ taskList_stateFilter, setTaskList_stateFilter ] = useState([
        {id: 0, header: 'Complete', data: [] },
        {id: 1, header: 'Incomplete', data: [] },
    ]);

    const [ taskList_dateFilter, setTaskList_dateFilter ] = useState([
        {id: 0, header: 'Today', data: [] },
        {id: 1, header: 'Tomorrow', data: [] },
        {id: 2, header: 'Upcoming', data: [] },
        {id: 3, header: 'Overdue', data: [] }
    ]);

    const [ taskList_priorityFilter, setTaskList_priorityFilter ] = useState([
        {id: 0, header: 'High', data: [] },
        {id: 1, header: 'Medium', data: [] },
        {id: 2, header: 'Low', data: [] },
    ]);

    const [ taskList_categoryFilter, setTaskList_categoryFilter ] = useState([
        {id: 0, header: 'Planning', data: [] },
        {id: 1, header: 'Creative', data: [] },
        {id: 2, header: 'Intellective', data: [] },
        {id: 3, header: 'Decision-Making', data: [] },
        {id: 4, header: 'Cognitive', data: [] },
        {id: 5, header: 'Miscellaneous', data: [] },
    ]);

    const [ taskList_iconFilter, setTaskList_iconFilter ] = useState([]);

    // sets task to show (filtered)
    const [ showTask, setShowTask ] = useState(taskList_dateFilter);
    
    // sets task edit state
    const [ taskEditState, setTaskEditState ] = useState(false);

    // sets task delete state
    const [ taskDeleteState, setTaskDeleteState ] = useState(false);
    // sets task delete state (single deletion)
    const [ taskDeleteState_single, setTaskDeleteState_single ] = useState(false);
    // selected items to delete
    const [ deleteTaskItems, setDeleteTaskItems ] = useState([]);

    // used to display filter checkbox
    const [filterCheckbox, setFilterCheckbox ] = useState([
        { id: 0, header: "Show Tasks by Complete State", mode: "State", checked: false,
          sub: [
            {id: 0, header: "Complete",  checked: false},
            {id: 1, header: "Incomplete",  checked: false},
          ]
        },
        { id: 1, header: "Show Tasks by Date", mode: "Date", checked: true,
          sub: [
            {id: 0, header: "Today",  checked: true},
            {id: 1, header: "Tomorrow",  checked: true},
            {id: 2, header: "Upcoming",  checked: true},
            {id: 3, header: "Overdue",  checked: true},
          ]
        },
        { id: 2, header: "Show Tasks by Priority", mode: "Priority", checked: false,
          sub: [
            {id: 0, header: "High",  checked: false},
            {id: 1, header: "Medium",  checked: false},
            {id: 2, header: "Low",  checked: false},
          ]
        },
        { id: 3, header: "Show Tasks by Category", mode: "Category", checked: false,
          sub: [
            {id: 0, header: "Planning",  checked: false},
            {id: 1, header: "Creative",  checked: false},
            {id: 2, header: "Intellective",  checked: false},
            {id: 3, header: 'Decision-Making',  checked: false},
            {id: 4, header: 'Cognitive', checked: false},
            {id: 5, header: 'Miscellaneous',  checked: false},
          ]
        },
        { id: 4, header: "Show Tasks by Icon", mode: "Icon", checked: false,
          sub: []
        },
    ])

    const [filterMode, setFilterMode] = useState();
    const [subFilterMode, setSubFilterMode] = useState([]);

    // used to toggle auto categorize task switch
    const [ autoCategorize, setAutoCategorize ] = useState(false);

    // task data for task detail screen
    const [ taskItemForScreen, setTaskItemForScreen ] = useState();

    return (
        <Context.Provider 
            value={{ 
                theme, setTheme, 
                darkmode, setDarkMode, 
                viewMode, setViewMode,
                ThemeArray, setThemeArray,
                taskList, setTaskList,
                taskList_stateFilter, setTaskList_stateFilter,
                taskList_dateFilter, setTaskList_dateFilter,
                taskList_priorityFilter, setTaskList_priorityFilter,
                taskList_categoryFilter, setTaskList_categoryFilter,
                taskList_iconFilter, setTaskList_iconFilter,
                showTask, setShowTask,
                filterCheckbox, setFilterCheckbox,
                autoCategorize, setAutoCategorize,
                taskItemForScreen, setTaskItemForScreen,
                taskEditState, setTaskEditState,
                taskDeleteState, setTaskDeleteState,
                taskDeleteState_single, setTaskDeleteState_single,
                deleteTaskItems, setDeleteTaskItems,
                filterMode, setFilterMode,
                subFilterMode, setSubFilterMode,
            }}>
            { children }
        </Context.Provider>
    );
}
