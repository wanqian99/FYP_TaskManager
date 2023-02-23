import { useContext } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { Context } from '../utilities/ContextManager.js';

const taskTitleInput = ({titleInputRef, setInputTitle, title}) => {
    
    const { theme, darkmode } = useContext(Context);
    return (
        <TextInput
            ref={titleInputRef}
            style={[styles.titleInput, {borderColor: `${theme}`, color: darkmode ? "#ffffff":"#000000"}]}
            onChangeText={(title) => {setInputTitle(title)}}
            value={title}
            placeholder="Enter Task Title..."
            placeholderTextColor={darkmode ? "#ffffff":"lightgrey"}
        />
    );
}

export default taskTitleInput;

const styles = StyleSheet.create({
    titleInput: {
        fontSize: 16,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderWidth: 2,
        borderRadius: 10,
        marginBottom: "3%",
    },
})