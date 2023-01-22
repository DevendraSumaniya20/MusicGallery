/* eslint-disable react-hooks/exhaustive-deps */
import {
  SafeAreaView,
  StyleSheet,
  Image,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import React, {useEffect, useRef, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import songs from '../model/data';

const {width, height} = Dimensions.get('window');

const setUpPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });

    await TrackPlayer.add(songs);
  } catch (error) {
    console.log(error);
  }
};

const togglePlayback = async playbakeState => {
  const currentTrack = await TrackPlayer.getCurrentTrack();

  if (currentTrack !== null) {
    if (playbakeState == State.Paused) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }
  }
};

const MusicGallery = () => {
  const playbakeState = usePlaybackState();
  const progress = useProgress();

  const [trackArtwork, setTrackArtwork] = useState();
  const [trackArtist, setTrackArtist] = useState();
  const [trackTitle, setTrackTitle] = useState();

  const scrollX = useRef(new Animated.Value(0)).current;
  const [songIndex, setSongIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState('off');

  const songSlider = useRef(null);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      const {title, artist, image} = track;
      setTrackArtist(artist);
      setTrackTitle(title);
      setTrackArtwork(image);
    }
  });

  const repeatIcon = () => {
    if (repeatMode == 'off') {
      return 'repeat-off';
    }
    if (repeatMode == 'track') {
      return 'repeat-once';
    }
    if (repeatMode == 'repeat') {
      return 'repeat';
    }
  };

  const changeRepeatMode = () => {
    if (repeatMode == 'off') {
      TrackPlayer.setRepeatMode(RepeatMode.Track);
      setRepeatMode('track');
    }
    if (repeatMode == 'track') {
      TrackPlayer.setRepeatMode(RepeatMode.Queue);
      setRepeatMode('repeat');
    }
    if (repeatMode == 'repeat') {
      TrackPlayer.setRepeatMode(RepeatMode.Off);
      setRepeatMode('off');
    }
  };
  const skipTo = async trackId => {
    await TrackPlayer.skip(trackId);
  };

  useEffect(() => {
    setUpPlayer();
    scrollX.addListener(({value}) => {
      // console.log('scrollX', scrollX);
      // console.log(' Device width', width);

      const index = Math.round(value / width);
      skipTo(index);
      setSongIndex(index);

      // console.log('index', index);
    });
    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  const skipToNext = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex + 1) * width,
    });
  };

  const skipToPrevious = () => {
    songSlider.current.scrollToOffset({
      offset: (songIndex - 1) * width,
    });
  };

  const renderSongs = ({index, item}) => {
    return (
      <Animated.View
        style={{alignItems: 'center', width: width, justifyContent: 'center'}}>
        <View style={styles.artWrapper}>
          <Image source={trackArtwork} style={styles.artImg} />
        </View>
      </Animated.View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={{width: width}}>
          <Animated.FlatList
            ref={songSlider}
            data={songs}
            renderItem={renderSongs}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {x: scrollX},
                  },
                },
              ],
              {useNativeDriver: true},
            )}
          />
        </View>
        <View>
          <Text style={styles.title}>{trackTitle}</Text>
          <Text style={styles.artists}>{trackArtist}</Text>
        </View>
        <View>
          <Slider
            style={styles.progressContainer}
            value={progress.position}
            maximumValue={progress.duration}
            minimumValue={0}
            thumbTintColor="#ea3548"
            maximumTrackTintColor="#2e2e2e"
            minimumTrackTintColor="#ea3548"
            onSlidingComplete={async value => {
              await TrackPlayer.seekTo(value);
            }}
          />
        </View>
        <View style={styles.timeConatiner}>
          <Text style={styles.timeTxt1}>
            {new Date(progress.position * 1000).toISOString().substr(14, 5)}
          </Text>
          <Text style={styles.timeTxt}>
            {new Date((progress.duration - progress.position) * 1000)
              .toISOString()
              .substr(14, 5)}
          </Text>
        </View>
        <View style={styles.control}>
          <TouchableOpacity>
            <Ionicons
              name="play-skip-back"
              size={35}
              color={'#ea3548'}
              style={{marginTop: 30}}
              onPress={skipToPrevious}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => togglePlayback(playbakeState)}>
            <View style={styles.playPause}>
              <Ionicons
                name={playbakeState === State.Playing ? 'pause' : 'ios-play'}
                size={30}
                color={'#FFFFFF'}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons
              name="play-skip-forward"
              size={35}
              color={'#ea3548'}
              style={{marginTop: 30}}
              onPress={skipToNext}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.footerControl}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="list" size={30} color={'#ffffff'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="heart-outline" size={30} color={'#ffffff'} />
          </TouchableOpacity>

          <TouchableOpacity onPress={changeRepeatMode}>
            <MaterialCommunityIcons
              name={`${repeatIcon()}`}
              size={30}
              color={repeatMode !== 'off' ? '#ffffff' : '#ffffff'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="ellipsis-horizontal" size={30} color={'#ffffff'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MusicGallery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(51,51,51,255)',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    width: width,
    alignItems: 'center',
    paddingVertical: 15,
  },
  footerControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  artWrapper: {
    height: 350,
    width: 350,
    marginBottom: 29,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#fff',
    // shadowOffset: {
    //   height: 0.3,
    //   width: 0.1,
    // },
    // shadowOpacity: 1,
    // shadowRadius: 7,
  },
  artImg: {
    width: '99%',
    height: '99%',
    borderRadius: 19,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#fefefe',
  },
  artists: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    color: '#777777',
  },
  progressContainer: {
    width: 350,
    height: 40,
    marginTop: 25,
    flexDirection: 'row',
  },
  timeConatiner: {
    width: 340,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeTxt1: {
    color: '#db3b4c',
  },
  timeTxt: {
    color: '#989898',
  },
  control: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 15,
    alignItems: 'center',
  },
  playPause: {
    backgroundColor: '#ea3548',
    borderRadius: 50,
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 24,
    paddingRight: 22,
    marginTop: 33,
  },
});
