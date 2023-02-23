import { useContext, useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Image, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { BackgroundCol,  } from '../utilities/theme.js';
import { Context } from '../utilities/ContextManager.js';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';

const attachmentComponent = ({
    image,
    setImage, 
    imageList,
    setImageList,
    file,
    setFile,
    fileList,
    setFileList
}) => {
    const { theme, darkmode } = useContext(Context);

    const [attachmentModal, setAttachmentModal] = useState(false);

    const [imageModal, setImageModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [currentImageFN, setCurrentImageFN] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(null);

    const [fileModal, setFileModal] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [currentFileFN, setCurrentFileFN] = useState("");
    const [currentFileIndex, setCurrentFileIndex] = useState(null);

    // get image from camera
    const imageFromCamera = async () => {
        // get permission to launch camera
        let permission = await ImagePicker.requestCameraPermissionsAsync();

        // show alert if permission is not granted
        if (permission.granted === false) {
            alert("Permission to access camera is required");
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        addImageToList(result);

        // closes the attachment modal
        setAttachmentModal(false);
    }

    // attach image from gallery
    const attachImage = async () => {
        // get permission to launch camera
        let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        // show alert if permission is not granted
        if (permission.granted === false) {
            alert("Permission to access gallery is required");
            return;
        }

        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            //mediaTypes: ImagePicker.MediaTypeOptions.All,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        addImageToList(result);

        // closes the attachment modal
        setAttachmentModal(false);
    };

    // add image to imageList
    const addImageToList = (result) => {
        if (!result.canceled) {
            //set image to current result's uri
            setImage(result.assets[0].uri);

            // make a copy of current image list
            const tempArray = [...imageList];
            
            // if file name is null, rename it
            if(result.assets[0].fileName == null) {
                // get the filename from the uri string
                var filename = result.assets[0].uri.substring(result.assets[0].uri.lastIndexOf('/') + 1, result.assets[0].uri.length);
                //console.log(filename)
                result.assets[0].fileName = filename;
            }
            
            // push result into temp array
            tempArray.push(result.assets[0]);
            // set image list to temp array
            setImageList(tempArray);
        }
    }

    // remove image from imageList
    const removeImageFromList = (index) => {
        // console.log(index);
        // close preview image modal
        setImageModal(false);

        // make a copy of current image list
        const tempArray = [...imageList];

        // remove uploaded image from list at the index
        tempArray.splice(index, 1);

        // if image array is empty, set image to null
        // this is to re-render the "no image uploaded" text
        if(tempArray.length == 0) {
            //set image to null
            setImage(null);
        }

        // set image list to temp array
        setImageList(tempArray);
    }

    // image modal to preview image
    const previewImage = (index) => {
        // open the modal
        setImageModal(true);

        // set current image uri
        setCurrentImage(imageList[index].uri);

        // set current image file name
        setCurrentImageFN(imageList[index].fileName);

        // set current image index
        setCurrentImageIndex(index);
    }

    // attach file
    const attachFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            // multiple: false,
            // type: ["*/*"],
            type: [
                "text/plain", 
                "text/csv", 
                "text/css", 
                "text/html", 
                "text/xml",
                "application/pdf", 
                "application/xml", 
                "video/*",
                "audio/*"
            ]
        })

        addFileToList(result);

        // closes the attachment modal
        setAttachmentModal(false);
    }

    // add file to fileList
    const addFileToList = (result) => {
        if (result.type != 'cancel') {
            //set file to current result's uri
            setFile(result.uri);
            // make a copy of current image list
            const tempArray = [...fileList];
            
            // if file name is null, rename it
            if(result.name == null) {
                // get the filename from the uri string
                var filename = result.uri.substring(result.uri.lastIndexOf('/') + 1, result.uri.length);
                //console.log(filename)
                result.name = filename;
            }
            
            // push result into temp array
            tempArray.push(result);
            // set image list to temp array
            setFileList(tempArray);
        }
    }

    // remove file from fileList
    const removeFileFromList = (index) => {
        // close preview file modal
        setFileModal(false);

        // make a copy of current image list
        const tempArray = [...fileList];

        // remove uploaded image from list at the index
        tempArray.splice(index, 1);

        // if image array is empty, set image to null
        // this is to re-render the "no image uploaded" text
        if(tempArray.length == 0) {
            //set image to null
            setFile(null);
        }

        // set image list to temp array
        setFileList(tempArray);
    }

    // file modal to preview file
    const previewFile = (index) => {
        // if on android devices, file opens up in the device's file viewer
        if(Platform.OS == "android") {
            FileSystem.getContentUriAsync(fileList[index].uri).then(cUri => {
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
            setCurrentFile(fileList[index].uri);

            // set current file name
            setCurrentFileFN(fileList[index].name);

            // set current image index
            setCurrentFileIndex(index);
        }
    }

    // share image or file
    const shareImageOrFile = async (curr) => {
        // allow sharing, so the file can be downloaded
        Sharing.shareAsync(curr);
    }

    // cancel attach, closes the modal
    const cancelAttach = () => {
        setAttachmentModal(false);
    }

    const attachmentOptions = [
        {
            id: 0,
            option: 'Take a photo',
            onPress: imageFromCamera,
            icon: <Entypo name="camera" size={30} color={BackgroundCol()} style={{marginLeft: "5%"}} />
        },
        {
            id: 1,
            option: 'Attach photo from Gallery',
            onPress: attachImage,
            icon: <Entypo name="image-inverted" size={30} color={BackgroundCol()} style={{marginLeft: "5%"}} />
        },
        {
            id: 2,
            option: 'Attach file',
            onPress: attachFile,
            icon: <MaterialCommunityIcons name="file-document" size={30} color={BackgroundCol()} style={{marginLeft: "5%"}} />
        },
        {
            id: 3,
            option: 'Cancel',
            onPress: cancelAttach,
            icon: <FontAwesome name="remove" size={30} color={BackgroundCol()} style={{marginLeft: "5%"}} />
        }
    ];

    // render atatchment options in bottom pop-up modal
    const attachmentOptionsItem = ({item}) => {
        return (
            <TouchableOpacity onPress={item.onPress}
                        style={[styles.optionsContainer, {borderColor: `${theme}`}]}>
                {item.icon}
                <Text style={[styles.optionText, {color: darkmode ? "#ffffff":"#000000"}]}>{item.option}</Text>
            </TouchableOpacity>
        );
    }

    // render item for flat list, renders uploaded image list
    const imageListItem = (imageList) => {
        return (
            <View>
                {/* IMAGE COVER, TAP TO OPEN IMAGE MODAL */}
                <TouchableOpacity onPress={() => previewImage(imageList.index)} 
                                style={styles.imageListCoverContainer}>
                    <Image source={{ uri: imageList.item.uri }} style={[styles.imageListCover, {borderColor: `${theme}`}]} />
                </TouchableOpacity>

                {/* REMOVE IMAGE */}
                <TouchableOpacity onPress={() => removeImageFromList(imageList.index)}
                                style={[styles.removeImgBtn, {backgroundColor: `${theme}`}]}>
                    <FontAwesome name="remove" size={20} color={"white"} style={{paddingVertical: 4, paddingHorizontal: 7}}/>
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
                                        {currentImageFN.length > 30 ? `...${currentImageFN.substring(currentImageFN.length-27, currentImageFN.length)}` : `${currentImageFN}`}
                                    </Text>
                                    <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                                        {/* DOWNLOAD IMAGE BUTTON */}
                                        <TouchableOpacity style={styles.downloadFileBtn} onPress={() => {shareImageOrFile(currentImage)}}>
                                            <MaterialCommunityIcons name="share" size={32} color={`${theme}`} />
                                        </TouchableOpacity>

                                        {/* DELETE IMAGE BUTTON */}
                                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => {removeImageFromList(currentImageIndex)}}>
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


    // render item for flat list, renders uploaded file list
    const fileListItem = (fileList) => {
        return (
            <View>
                {/* FILE NAME, TAP TO OPEN FILE MODAL */}
                <TouchableOpacity onPress={() => previewFile(fileList.index)} 
                                style={styles.imageListCoverContainer}>
                    <Text style={[styles.fileListCover, {borderColor: `${theme}`, color: darkmode ? "#ffffff":"#000000"}]}>{fileList.item.name}</Text>
                </TouchableOpacity>

                {/* REMOVE FILE */}
                <TouchableOpacity onPress={() => removeFileFromList(fileList.index)}
                                style={styles.removeFileBtn}>
                    <FontAwesome name="remove" size={24} color={`${theme}`} style={{paddingVertical: 4, paddingHorizontal: 7}}/>
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
                                    <Text style={{width: "70%", fontSize: 16, alignSelf: 'center', marginLeft: "5%",color: darkmode ? "#ffffff":"#000000"}}>
                                        {/* {currentFileFN} */}
                                        {currentFileFN.length > 30 ? `...${currentFileFN.substring(currentFileFN.length-27, currentFileFN.length)}` : `${currentFileFN}`}
                                    </Text>
                                    <View style={{width: "25%",flexDirection: 'row', alignItems: 'flex-end'}}>
                                        {/* DOWNLOAD FILE BUTTON */}
                                        <TouchableOpacity style={styles.downloadFileBtn} onPress={() => {shareImageOrFile(currentFile)}}>
                                            <MaterialCommunityIcons name="share" size={32} color={`${theme}`} />
                                        </TouchableOpacity>

                                        {/* DELETE FILE BUTTON */}
                                        <TouchableOpacity style={styles.closeModalBtn} onPress={() => {removeFileFromList(currentFileIndex)}}>
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


    
    // if no image is uploaded
    return (
        <View>
            {/* RENDERS ATTACHMENT LABEL AND BUTTON (FOR ATTACHMENT OPTIONS BOTTOM MODAL) */}
            <View style={styles.attachmentHeader}>
                {/* ATTACHMENT LABEL */}
                <Text style={[styles.attachmentLabel, {color: BackgroundCol()}]}>
                    Attachments:
                </Text>                
                
                <View style={styles.attachmentBtnContainer}>
                    {/* ATTACH FILE BUTTON */}
                    <TouchableOpacity onPress={() => {setAttachmentModal(!attachmentModal)}}
                                    style={[styles.attachmentButton, {transform: [{rotate: '135deg'}]}]}>
                        <MaterialIcons name="attachment" size={36} color={BackgroundCol()} />
                    </TouchableOpacity>                    

                    {/* ATTACHMENT BOTTOM MODAL */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={attachmentModal}
                        presentationStyle={'overFullScreen'}>
                        <View style={[styles.overlayContainer, {justifyContent: 'flex-end'}]}>
                            <View style={{width: "100%", height:"auto", backgroundColor: darkmode ? "#000000":"#ffffff"}}>
                                <FlatList
                                    data={attachmentOptions}
                                    renderItem={attachmentOptionsItem}
                                    keyExtractor={(item, index) => index}
                                />
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
            
            {/* DISPLAY IMAGE LIST ATTACHED */}
            {imageList.length > 0 ? (
                    <View>
                        <Text style={{fontSize: 16, textDecorationLine: 'underline', color: darkmode ? "#ffffff":"#000000"}}>
                            Images:
                        </Text>
                        <FlatList
                            horizontal={true}
                            scrollEnabled
                            showsHorizontalScrollIndicator={true}
                            data={imageList}
                            renderItem={imageListItem}
                            keyExtractor={(item, index) => index}
                            style={{marginTop: 5}}
                        />
                    </View>
                ):(
                    <Text style={{color: darkmode ? "#ffffff":"#000000"}}>No image uploaded</Text>
                )
            }

            {/* DISPLAY ATTACHED FILE */}
            {fileList.length > 0 ? (
                    <View>
                        <Text style={{fontSize: 16, textDecorationLine: 'underline', color: darkmode ? "#ffffff":"#000000"}}>
                            Files:
                        </Text>
                        <FlatList
                            horizontal={true}
                            scrollEnabled
                            showsHorizontalScrollIndicator={true}
                            data={fileList}
                            renderItem={fileListItem}
                            keyExtractor={(item, index) => index}
                            style={{marginTop: 5}}
                        />
                    </View>
                ):(
                    <Text style={{color: darkmode ? "#ffffff":"#000000"}}>No file uploaded</Text>
                )
            }
        </View>
    );
}

export default attachmentComponent;

const styles = StyleSheet.create({
    attachmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attachmentLabel: {
        fontSize: 20,
        width: "70%",
    },
    attachmentBtnContainer:{
        width: "30%",
        flexDirection: 'row',
        justifyContent:'flex-end'
    },
    attachmentButton: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: "7%",
    },
    imageListCoverContainer:{
        marginRight: 8,
        marginBottom: 15,
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
    fileOverlay: {
        width: "100%",
        height: "90%",
        alignSelf:'center',
        borderWidth: 2,
        borderRadius: 15,
    },
    previewImageLabel: {
        marginLeft: "5%",
        marginBottom: "5%",
    },
    previewImage:{
        width: "90%",
        height: "90%",
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    removeImgBtn: {
        position: 'absolute',
        top: "5%",
        right: "12%",
        borderRadius: 20,
    },
    removeFileBtn: {
        position: 'absolute',
        right: "5%",
        borderRadius: 20,
    },
    downloadFileBtn: {
        alignSelf: 'flex-end',
        margin: 10,
        marginRight: 0,
    },
    optionsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    optionText: {
        fontSize: 16,
        margin: "5%",
    }
})