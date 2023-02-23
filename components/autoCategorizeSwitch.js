import { useContext } from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import { BackgroundCol } from '../utilities/theme.js';
import { Context } from '../utilities/ContextManager.js';

export const AutoCategorizeTasks = () => {
    const { autoCategorize, setAutoCategorize } = useContext(Context);
    return (
        <View style={{flexDirection:'row', marginRight: "7%"}}>
            <Text style={{fontSize: 16, color: BackgroundCol(), alignSelf:'center', marginRight: "5%"}}>
                Auto Categorization:
            </Text>
            <Switch
                trackColor={{true: BackgroundCol()}}
                thumbColor={"white"}
                onValueChange={() => {setAutoCategorize(!autoCategorize)}}
                value={autoCategorize}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    viewIcon: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
    },
})