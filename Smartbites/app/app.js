import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Splashscreen from "./splashscreen";
import Login from "./login";

export default function App() {
    const [isShowSplash, setIsShowSplash] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setIsShowSplash(false);
        }, 3000); // Show splash screen for 3000/3 seconds
    }, []);

    return (
        <>
            {isShowSplash ? <Splashscreen /> : <Login />}
        </>
    );
}
