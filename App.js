import React from 'react';
import Screens from './screens';
import firebase from 'react-native-firebase';

console.disableYellowBox = true;

class App extends React.Component {
  componentDidMount() {
    const channel = new firebase.notifications.Android.Channel(
      'test-channel',
      'Test Channel',
      firebase.notifications.Android.Importance.Max,
    ).setDescription('My apps test channel');
    firebase.notifications().android.createChannel(channel);
  }
  render() {
    return <Screens />;
  }
}

export default App;
