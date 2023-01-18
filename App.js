import {StatusBar, StyleSheet, View} from 'react-native';
import React from 'react';
import MusicGallery from './Component/MusicGallery';

const App = () => {
  return (
    <View style={styles.Container}>
      <StatusBar barStyle={'light-content'} />
      <MusicGallery />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
});
