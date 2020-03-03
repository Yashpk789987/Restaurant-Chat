import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import CustomWebView from './CustomWebView';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';
import {socketurl} from '../helpers/baseurl';
import io from 'socket.io-client';
import firebase from 'react-native-firebase';
import {Alert, Platform} from 'react-native';

const Stack = createStackNavigator();

class App extends React.Component {
  state = {
    socket_object: new io(),
    tables: [],
    username: '',
    table_name: '',
    table_id: -1,
  };

  componentDidMount() {
    this.checkPermission();
    this.messageListener();
  }

  checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getFcmToken();
    } else {
      this.requestPermission();
    }
  };

  getFcmToken = async () => {
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      console.log('token', fcmToken);
      this.showAlert('Your Firebase Token is:', fcmToken);
    } else {
      this.showAlert('Failed', 'No token received');

      requestPermission = async () => {
        try {
          await firebase.messaging().requestPermission();
        } catch (error) {}
      };
    }
  };

  messageListener = async () => {
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const local = new firebase.notifications.Notification()
          .setNotificationId('notificationId')
          .setTitle(notification.title)
          .setSubtitle('New Message')
          .setBody(notification.body)
          .setData({
            key1: 'value1',
            key2: 'value2',
          });
        local.android
          .setChannelId('channelId')
          .android.setSmallIcon('ic_launcher');
        firebase.notifications().displayNotification(local);
      });

    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const {subtitle, title, body} = notificationOpen.notification;
        this.showAlert(title, body);
      });

    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const {title, body} = notificationOpen.notification;
      console.log('I am calling 2', notificationOpen);
      this.showAlert(title, body);
    }

    this.messageListener = firebase.messaging().onMessage(message => {
      console.log(JSON.stringify(message));
    });
  };

  showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  };

  connectToSocketServer = async (table_id, table_name, username) => {
    const fcmToken = await firebase.messaging().getToken();
    await this.setState({username: username, table_name: table_name, table_id});
    this.socket = io(socketurl, {
      query: `table_id=${table_id}&table_name=${table_name}&username=${username}&token=${fcmToken}`,
    });

    await this.setState({socket_object: this.socket});
    this.socket.on(
      'self-acknowledge',
      function(data) {
        this.setState({tables: data.tables});
      }.bind(this),
    );

    this.socket.on(
      'add-tables',
      function(data) {
        console.log('I am calling ...', data);
        let newTables = data.tables.filter(item => {
          return item.username !== this.state.username;
        });

        this.setState({tables: newTables});
      }.bind(this),
    );

    this.socket.on(
      'remove-tables',
      function(data) {
        let newTables = data.tables.filter(item => {
          return item.username !== this.state.username;
        });

        this.setState({tables: newTables});
      }.bind(this),
    );
  };

  render() {
    return (
      <Stack.Navigator headerMode="none">
        <Stack.Screen name="Home">
          {props => (
            <CustomWebView
              {...props}
              connectToSocketServer={this.connectToSocketServer}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ChatList">
          {props => (
            <ChatList
              {...props}
              socketRef={this.state.socket_object}
              tables={this.state.tables}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ChatInterface">
          {props => (
            <ChatInterface
              {...props}
              table_id={this.state.table_id}
              table_name={this.state.table_name}
              username={this.state.username}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }
}

export default App;
