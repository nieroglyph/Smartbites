import { Fontisto, AntDesign } from '@expo/vector-icons';
import { CameraCapturedPicture } from 'expo-camera';
import React from 'react';
import { 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  StyleSheet, 
  View, 
  Text  // Added Text import
} from 'react-native';

interface PhotoPreviewSectionProps {
    photo: CameraCapturedPicture;
    handleRetakePhoto: () => void;
    handleAcceptPhoto: () => void;
}

const PhotoPreviewSection = ({
    photo,
    handleRetakePhoto,
    handleAcceptPhoto
}: PhotoPreviewSectionProps) => (
    <SafeAreaView style={styles.container}>
        <View style={styles.box}>
            <Image
                style={styles.previewContainer}
                source={{ uri: 'data:image/jpg;base64,' + photo.base64 }}
            />
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity 
                style={[styles.button, styles.retakeButton]} 
                onPress={handleRetakePhoto}
            >
                <Fontisto name='trash' size={36} color='white' />
                <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.button, styles.acceptButton]} 
                onPress={handleAcceptPhoto}
            >
                <AntDesign name='check' size={36} color='white' />
                <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        borderRadius: 15,
        padding: 1,
        width: '95%',
        backgroundColor: 'darkgray',
        justifyContent: 'center',
        alignItems: "center",
    },
    previewContainer: {
        width: '95%',
        height: '85%',
        borderRadius: 15
    },
    buttonContainer: {
        marginTop: '4%',
        flexDirection: 'row',
        justifyContent: "space-around",
        width: '100%',
        paddingHorizontal: 20,
    },
    button: {
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        width: 150,
    },
    retakeButton: {
        backgroundColor: '#ff4444',
    },
    acceptButton: {
        backgroundColor: '#00C851',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
        fontWeight: 'bold',
    }
});

export default PhotoPreviewSection;