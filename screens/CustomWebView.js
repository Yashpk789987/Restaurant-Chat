import React from 'react';
import {ActivityIndicator, BackHandler, Alert} from 'react-native';

import {baseurl} from '../helpers/baseurl';
import {WebView} from 'react-native-webview';

function ActivityIndicatorLoadingView() {
  return (
    <ActivityIndicator
      color="#87CEEB"
      size={70}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '50%',
      }}
    />
  );
}

export default class CustomWebView extends React.Component {
  state = {
    url: baseurl,
    ref: null,
    isTimerRunning: false,
  };

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backHandler);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
  }

  timer = {
    ref: null,
  };

  backHandler = () => {
    if (this.state.isTimerRunning) {
      Alert.alert(
        'Exit App',
        'Do You Want To Exit App ??',
        [
          {
            text: 'No',
            onPress: () => console.log('No Pressed'),
            style: 'cancel',
          },
          {text: 'Yes', onPress: () => BackHandler.exitApp()},
        ],
        {cancelable: false},
      );
    }
    if (!this.state.isTimerRunning) {
      this.setState({isTimerRunning: true});
      this.timer.ref = setTimeout(() => {
        this.setState({isTimerRunning: false});
      }, 1000);
    }
    if (this.WEBVIEW_REF == null) {
      this.setState({workerLogin: false});
      return true;
    }
    this.WEBVIEW_REF.goBack();
    return true;
  };

  handleLinks = data => {
    if (data.url.includes('home.php')) {
      let params = data.url.split('/');
      let username = decodeURI(params[params.length - 1]);
      let table_name = decodeURI(params[params.length - 2]);
      let table_id = params[params.length - 3];
      this.props.connectToSocketServer(table_id, table_name, username);
    } else if (data.url.includes('chatcode')) {
      this.props.navigation.navigate('ChatList');
    }
    return true;
  };

  render() {
    return (
      <WebView
        ref={ref => {
          this.WEBVIEW_REF = ref;
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        onShouldStartLoadWithRequest={this.handleLinks}
        renderLoading={() => ActivityIndicatorLoadingView()}
        startInLoadingState={true}
        source={{uri: this.state.url}}
      />
    );
  }
}

//http://maitriwelfare.in/usabarchat/home.php/Preeti/Table%20No%201
