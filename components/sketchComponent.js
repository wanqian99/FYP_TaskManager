import { useContext, useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Dimensions, Animated, Image, FlatList, Alert } from 'react-native';
import { BackgroundCol, TintCol } from '../utilities/theme.js';
import { FontAwesome, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Context } from '../utilities/ContextManager.js';
import { Canvas, DrawingTool } from '@benjeau/react-native-draw';
import { BrushProperties, BrushPreview, DEFAULT_COLORS } from '@benjeau/react-native-draw-extras';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const sketchComponent = ({
    setCanvasImage,
    canvasImageList,
    setCanvasImageList,
}) => {
    const { theme, darkmode } = useContext(Context);
    const [canvasModal, setCanvasModal] = useState(false);

    const canvasRef = useRef();
    const exportCanvasRef = useRef();

    const [color, setColor] = useState(darkmode ? DEFAULT_COLORS[1][0][11]:DEFAULT_COLORS[1][0][0]);
    const [thickness, setThickness] = useState(5);
    const [opacity, setOpacity] = useState(1);
    const [tool, setTool] = useState(DrawingTool.Brush);
    const [visibleBrushProperties, setVisibleBrushProperties] = useState(false);
    
    const [currentCanvasImage, setCurrentCanvasImage] = useState(null);
    const [canvasImageModal, setCanvasImageModal] = useState(false);
    const [currentCanvasImageIndex, setCurrentCanvasImageIndex] = useState(null);

    const canvasWidth = Dimensions.get("screen").width * 0.98;
    const canvasHeight = Dimensions.get("screen").height * 0.70;

    // to change the brush color when darkmode changes
    useEffect(() => {
        // if darkmode is true and current brush color is black
        if(darkmode && color == DEFAULT_COLORS[1][0][0]) {
            // change to white brush
            setColor(DEFAULT_COLORS[1][0][11]);
        }
        // else if darkmode is false and current brush color is white
        else if (!darkmode && color == DEFAULT_COLORS[1][0][11]) {
            // change to black brush
            setColor(DEFAULT_COLORS[1][0][0]);
        }
        
    }, [darkmode])

    // undo canvas sketch
    const handleUndo = () => {
        canvasRef.current?.undo();
    };

    // clear canvas
    const handleClear = () => {
        canvasRef.current?.clear();
    };

    // switch between brush and eraser
    const handleToggleEraser = () => {
        setTool((prev) =>
          prev === DrawingTool.Brush ? DrawingTool.Eraser : DrawingTool.Brush
        );
    };

    const [overlayOpacity] = useState(new Animated.Value(0));

    // show brush properties modal
    const handleToggleBrushProperties = () => {
        if (!visibleBrushProperties) {
            setVisibleBrushProperties(true);

            Animated.timing(overlayOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(overlayOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setVisibleBrushProperties(false);
            });
        }
    };

    const closeCanvas = () => {
        // alert to notify user that canvas has not been saved
        Alert.alert(
            "Canvas have not been saved.",
            "Closing this modal will clear all sketches made. Proceed?",
            [
                {
                    text: "Yes",
                    onPress: () => {
                        //clear canvas, close the canvas modal
                        setCanvasModal(!canvasModal);

                        // ensure brush properties is closed for next use
                        setVisibleBrushProperties(false);
                },
                },
                {
                    text: "No",
                },
            ]
        );
    }

    const saveCanvas = async () => {
        // use captureRef to convert canvas into image
        const result = await captureRef(exportCanvasRef, {
            // result: 'data-uri',
            // height: pixels,
            // width: pixels,
            quality: 1,
            format: 'png',
        });

        addCanvasImageToList(result);

        // close the canvas modal
        setCanvasModal(!canvasModal);
    }

    const addCanvasImageToList = (result) => {
        // set current canvas image to result
        setCanvasImage(result);

        // temp array to copy canvas image list
        const tempArray = [...canvasImageList];

        //push results into temp array
        tempArray.push(result);

        //set canvas image list to temp array
        setCanvasImageList(tempArray);
    }

    // remove image from imageList
    const removeCanvasImageFromList = (index) => {
        // close preview image modal
        setCanvasImageModal(false);

        // make a copy of current image list
        const tempArray = [...canvasImageList];

        // remove uploaded image from list at the index
        tempArray.splice(index, 1);

        // if canvas image array is empty, set image to null
        // this is to re-render the "no canvas image uploaded" text
        if(tempArray.length == 0) {
            //set image to null
            setCanvasImage(null);
        }

        // set image list to temp array
        setCanvasImageList(tempArray);
    }

    // image modal to preview image
    const previewCanvasImage = (index) => {
        // open the modal
        setCanvasImageModal(true);

        // set current canvas image
        setCurrentCanvasImage(canvasImageList[index]);

        // set current canvas image index
        setCurrentCanvasImageIndex(index);
    }

    // share canvas image
    const shareImageOrFile = async (curr) => {
        // allow sharing, so the file can be downloaded
        Sharing.shareAsync("file://" + curr);
    }

    const canvasImageListItem = (canvasImageList) => {
        //console.log(canvasImageList);
        return (
            <View style={{marginTop: "2%"}}>
                <TouchableOpacity onPress={()=> {previewCanvasImage(canvasImageList.index)}} style={styles.canvasListCoverContainer}>
                    <Image source={{ uri: canvasImageList.item }} style={[styles.canvasImageCover, {borderColor: `${theme}`}]} />
                </TouchableOpacity>

                {/* REMOVE CANVAS IMAGE */}
                <TouchableOpacity onPress={() => removeCanvasImageFromList(canvasImageList.index)}
                                style={[styles.removeImgBtn, {backgroundColor: `${theme}`}]}>
                    <FontAwesome name="remove" size={20} color={"white"} style={{paddingVertical: 4, paddingHorizontal: 7}}/>
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
                                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                                        {/* SHARE CANVAS IMAGE BUTTON */}
                                        <TouchableOpacity style={styles.downloadFileBtn} onPress={() => {shareImageOrFile(currentCanvasImage)}}>
                                            <MaterialCommunityIcons name="share" size={32} color={`${theme}`} />
                                        </TouchableOpacity>

                                        {/* DELETE CANVAS IMAGE BUTTON */}
                                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => {removeCanvasImageFromList(currentCanvasImageIndex)}}>
                                            <MaterialCommunityIcons name="delete" size={32} color={`${theme}`} />
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
        <View style={{marginTop: "5%"}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center'}}>
                <Text style={[styles.sketchLabel, {color: BackgroundCol()}]}>
                    Sketch:
                </Text>
                <TouchableOpacity onPress={() => {setCanvasModal(!canvasModal)}} style={styles.openCanvasBtn}>
                    <Text style={[styles.openCanvasText, {color: BackgroundCol(), borderColor: BackgroundCol()}]}>
                        Open Canvas
                    </Text>
                </TouchableOpacity>
            </View>
            
            {canvasImageList.length > 0 ? (
                    <FlatList
                        horizontal={true}
                        scrollEnabled
                        showsHorizontalScrollIndicator={true}
                        data={canvasImageList}
                        renderItem={canvasImageListItem}
                        keyExtractor={(item, index) => index}
                    />
                ):(
                    <Text style={{color: darkmode ? "#ffffff":"#000000"}}>No canvas image uploaded</Text>
                )
            }

            {/* SKETCH CANVAS MODAL */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={canvasModal}
                presentationStyle={'overFullScreen'}>
                <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <View style={[styles.sketchOverlay, {backgroundColor: TintCol(), borderColor: BackgroundCol()}]}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            {/* SAVE CANVAS BUTTON */}
                            <TouchableOpacity style={styles.canvasCloseModalBtn} onPress={() => {saveCanvas()}}>
                                <MaterialIcons name="ios-share" size={32} color={BackgroundCol()} />
                            </TouchableOpacity>
                            {/* CLOSE MODAL BUTTON */}
                            <TouchableOpacity style={styles.canvasCloseModalBtn} onPress={() => {closeCanvas()}}>
                                <MaterialCommunityIcons name="close-thick" size={32} color={BackgroundCol()} />
                            </TouchableOpacity>
                        </View>

                        {/* DRAWING CANVAS */}
                        {/* collapsable have to be false for saving canvas on android to work */}
                        <View ref={exportCanvasRef} collapsable={false}>
                            <Canvas
                                ref={canvasRef}
                                width={canvasWidth}
                                height={canvasHeight}
                                color={color}
                                thickness={thickness}
                                opacity={opacity}
                                tool={tool}
                                style={{
                                    backgroundColor: darkmode ? "#000000":"#ffffff",
                                    borderTopWidth: StyleSheet.hairlineWidth,
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    borderColor: BackgroundCol(),
                                    alignSelf: 'center',
                                }}
                            />
                        </View>

                        {/* CANVAS CONTROLS */}
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            {/* CLEAR CANVAS BUTTON */}
                            <TouchableOpacity style={[styles.canvasBtn, {borderColor: BackgroundCol()}]} onPress={handleClear}>
                                <MaterialCommunityIcons name="delete" size={30} color={BackgroundCol()} />
                            </TouchableOpacity>

                            {/* UNDO BUTTON */}
                            <TouchableOpacity style={[styles.canvasBtn, {borderColor: BackgroundCol()}]} onPress={handleUndo}>
                                <FontAwesome5 name="undo-alt" size={30} color={BackgroundCol()} />
                            </TouchableOpacity>

                            {/* BRUSH PREVIEW */}
                            <BrushPreview 
                                color={color}
                                thickness={thickness}
                                opacity={opacity}
                                brushPreview='stroke'
                            />

                            {/* SWITCH BRUSH & ERASER BUTTON */}
                            <TouchableOpacity style={[styles.canvasBtn, {borderColor: BackgroundCol()}]} onPress={handleToggleEraser}>
                                {tool == DrawingTool.Brush ?
                                    <FontAwesome5 name="paint-brush" size={30} color={BackgroundCol()} />:
                                    <FontAwesome5 name="eraser" size={30} color={BackgroundCol()} />
                                }
                            </TouchableOpacity>

                            {/* COLOR PALETTE AND BRUSH PROPERTIES BUTTON */}
                            <TouchableOpacity style={[styles.canvasBtn, {borderColor: BackgroundCol()}]} onPress={handleToggleBrushProperties}>
                                <FontAwesome5 name="palette" size={30} color={BackgroundCol()} />
                            </TouchableOpacity>

                            {/* COLOR PALETTE & BRUSH PROPERTIES MODAL */}
                            {visibleBrushProperties && (
                                <BrushProperties
                                    color={color}
                                    thickness={thickness}
                                    opacity={opacity}
                                    onColorChange={setColor}
                                    onThicknessChange={setThickness}
                                    onOpacityChange={setOpacity}
                                    sliderColor={darkmode ? "#ffffff":"#000000"}
                                    style={{
                                        position: 'absolute',
                                        bottom: 80,
                                        left: 0,
                                        right: 0,
                                        padding: 10,
                                        backgroundColor: darkmode ? "#000000":"#ffffff",
                                        borderTopEndRadius: 10,
                                        borderTopStartRadius: 10,
                                        borderWidth: StyleSheet.hairlineWidth,
                                        borderColor: `${theme}`,
                                        opacity: overlayOpacity,
                                    }}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

export default sketchComponent;

const styles = StyleSheet.create({
    sketchLabel: {
        fontSize: 20,
    },
    sketchOverlay: {
        alignSelf:'center',
        borderWidth: 3,
        borderRadius: 15
    },
    openCanvasBtn:{
        marginRight: 5,
    },
    openCanvasText: {
        fontSize: 16,
        borderWidth: 2,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    canvasCloseModalBtn: {
        margin: 10
    },
    canvasContainer: {
        flex: 1,
    },
    canvasBtn: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 10,
        alignSelf: 'center',
    },
    canvasListCoverContainer:{
        marginRight: 8,
        marginBottom: 15,
    },
    canvasImageCover: {
        width: 120,
        height: 120,
        borderWidth: 2,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    removeImgBtn: {
        position: 'absolute',
        top: "5%",
        right: "12%",
        borderRadius: 20,
    },
    closeModalBtn: {
        alignSelf: 'flex-end',
        margin: 10,
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
    previewImage:{
        width: "90%",
        height: "90%",
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    downloadFileBtn: {
        alignSelf: 'flex-end',
        margin: 10,
        marginRight: 0,
    },
})