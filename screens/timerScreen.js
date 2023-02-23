import { useContext, useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, Vibration, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TintCol } from '../utilities/theme.js';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Context } from '../utilities/ContextManager.js';

const TimerScreen = ({ navigation }) => {
    const { theme, darkmode
    } = useContext(Context);

    const tabBarHeight = useBottomTabBarHeight();

    const [mode, setMode] = useState("Timer");
    const [editTimer, setEditTimer] = useState(true);

    const [ timerRunning, setTimerRunning ] = useState(false);
    const timerRef = useRef(null);
    const [hours, setHours] = useState('00');
    const [minutes, setMinutes] = useState('00');
    const [seconds, setSeconds] = useState('00');
    const [remainingTime, setRemainingTime] = useState(0);

    const [ stopwatchRunning, setStopwatchRunning ] = useState(false);
    const [ elapsedTime, setElapsedTime ] = useState(0);
    const stopwatchRef = useRef(null);

    // timer countdown
    useEffect(() => {
        let interval;
        // check that there is remaining time and timer is running
        if (remainingTime > 0 && timerRunning) {
            // minus 1 from time at every second
            interval = setInterval(() => {
                setRemainingTime((prevRemainingTime) => prevRemainingTime - 1);
            }, 1000);

            // calculate hours, minutes and seconds
            const hrs = Math.floor(remainingTime / 3600);
            const mins = Math.floor((remainingTime % 3600) / 60);
            const secs = remainingTime % 60;
            // format them to strings to show on screen
            setHours(hrs.toString().padStart(2, '0'));
            setMinutes(mins.toString().padStart(2, '0'));
            setSeconds(secs.toString().padStart(2, '0'));

            // set text input edit timer to false
            setEditTimer(false);
        }
        // reset timer when remaining time reaches 0
        else {
            if(timerRunning) {
                setHours('00');
                setMinutes('00');
                setSeconds('00');
                alert("Time's up!");
                Vibration.vibrate();
            }
            
            setTimerRunning(false);
            setEditTimer(true);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [remainingTime]);

    

    const renderTimer = () => {
        const toggleTimer = () => {
            // if timer is running, clear the timer and timerRunning to false
            if (timerRunning) {
                setTimerRunning(false);
            // if timer is not running, set the time and timerRunning to true
            } else {
                const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
                setRemainingTime(totalSeconds);
                setTimerRunning(true);
            }
        };

        // resets the timer
        const resetTimer = () => {
            clearInterval(timerRef.current);
            setRemainingTime(0);
            setHours('00');
            setMinutes('00');
            setSeconds('00');
            setEditTimer(true);
            setTimerRunning(false);
        };

        return (
            <View style={{flex: 1, marginTop: "45%", justifyContent: 'space-between'}}>
                {/* TIME INPUT */}
                <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                    <TextInput
                        selectTextOnFocus={true}
                        editable={editTimer}
                        value={hours}
                        onChangeText={setHours}
                        keyboardType="numeric"
                        placeholder='00'
                        style={{ color: darkmode ? "#ffffff" : "#000000",
                                    fontSize: 70, textAlign: 'center' }}
                    />
                    <Text style={{ color: darkmode ? "#ffffff" : "#000000", fontSize: 70}}>
                        :
                    </Text>
                    <TextInput
                        selectTextOnFocus={true}
                        editable={editTimer}
                        value={minutes}
                        onChangeText={setMinutes}
                        keyboardType="numeric"
                        placeholder='00'
                        style={{ color: darkmode ? "#ffffff" : "#000000",
                                    fontSize: 70, textAlign: 'center' }}
                    />
                    <Text style={{ color: darkmode ? "#ffffff" : "#000000", fontSize: 70}}>
                        :
                    </Text>
                    <TextInput
                        selectTextOnFocus={true}
                        editable={editTimer}
                        value={seconds}
                        onChangeText={setSeconds}
                        keyboardType="numeric"
                        placeholder='00'
                        style={{ color: darkmode ? "#ffffff" : "#000000",
                                    fontSize: 70, textAlign: 'center' }}
                    />
                </View>
                {/* TIMER BUTTONS */}
                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: "15%"}}>
                    <TouchableOpacity onPress={resetTimer}
                                    style={[styles.stopwatchBtn, {borderColor: `${theme}`}]}>
                        <Text style={{fontSize: 20, color: `${theme}`}}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleTimer}
                                    style={[styles.stopwatchBtn, 
                                            {borderColor: `${theme}`, 
                                            backgroundColor: timerRunning ? `${theme}` : null}]}>
                        <Text style={{fontSize: 20, color: timerRunning ? "#ffffff" : `${theme}`}}>
                            {timerRunning ? ('Pause') : ('Start')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }


    const renderStopwatch = () => {
        // toggles the stopwatch
        const toggleStopwatch = () => {
            // if stopwatch is running, clear the timer and stopwatchRunning to false
            if (stopwatchRunning) {
                clearInterval(stopwatchRef.current);
                setStopwatchRunning(false);
            // if stopwatch is not running, set the time and stopwatchRunning to true
            } else {
                // add 1 to time every seconds
                const intervalId = setInterval(() => {
                    setElapsedTime((prevTime) => prevTime + 1);
                }, 1000);
                stopwatchRef.current = intervalId;
                setStopwatchRunning(true);
            }
        };
        
        // resets the stopwatch
        const resetStopwatch= () => {
            clearInterval(stopwatchRef.current);
            setElapsedTime(0);
            setStopwatchRunning(false);
        };

        // format time to show on screen
        const formatTime = (time) => {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
            return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        return (
            <View style={{flex: 1, marginTop: "45%", justifyContent: 'space-between'}}>
                {/* STOPWATCH TIME */}
                <View>
                    <Text style={{ color: darkmode ? "#ffffff" : "#000000",
                                    fontSize: 70, textAlign: 'center' }}>
                        {formatTime(elapsedTime)}
                    </Text>
                </View>
                {/* STOPWATCH BUTTONS */}
                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginBottom: "15%"}}>
                    <TouchableOpacity onPress={resetStopwatch}
                                    style={[styles.stopwatchBtn, {borderColor: `${theme}`}]}>
                        <Text style={{fontSize: 20, color: `${theme}`}}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleStopwatch}
                                    style={[styles.stopwatchBtn, 
                                            {borderColor: `${theme}`, 
                                            backgroundColor: stopwatchRunning ? `${theme}` : null}]}>
                        <Text style={{fontSize: 20, color: stopwatchRunning ? "#ffffff" : `${theme}`}}>
                            {stopwatchRunning ? ('Pause') : ('Start')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: TintCol()}}>
            <View style={[styles.container, {marginBottom: tabBarHeight+25}]}>
                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: "8%"}}>
                    <TouchableOpacity onPress={() => {setMode("Timer")}}
                                    style={[styles.tabBtn, 
                                            {borderColor: `${theme}`,
                                            backgroundColor: mode == 'Timer' ? `${theme}` : null,
                                            borderTopRightRadius: 0, borderBottomRightRadius: 0}]} >
                        <Text style={{fontSize: 20, color: mode == 'Timer' ? "#ffffff" : `${theme}`}}>
                            Timer
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {setMode("Stopwatch")}}
                                    style={[styles.tabBtn,
                                            {borderColor: `${theme}`,
                                            backgroundColor: mode == 'Stopwatch' ? `${theme}` : null,
                                            borderTopLeftRadius: 0, borderBottomLeftRadius: 0}]} >
                        <Text style={{fontSize: 20, color: mode == 'Stopwatch' ? "#ffffff" : `${theme}`}}>
                            Stopwatch
                        </Text>
                    </TouchableOpacity>
                </View>
                {/* CHANGES BETWEEN TIMER AND STOPWATCH */}
                {mode == 'Timer' ?
                    (
                        renderTimer()
                    ) : 
                    (
                        renderStopwatch()
                    )
                }
            </View>
        </SafeAreaView>
    )
};

export default TimerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: "8%",
        marginHorizontal: "3%",
    },
    tabBtn: {
        width: 170,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        paddingVertical: 8,
        borderRadius: 50,
    },
    stopwatchBtn: {
        width: 150,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        paddingVertical: 8,
        borderRadius: 50,
    }
});