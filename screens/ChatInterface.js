import React from 'react';

import {TouchableOpacity, Keyboard} from 'react-native';
import {GiftedChat} from 'react-native-gifted-chat';
import EmojiInput from 'react-native-emoji-input';
import {Icon} from 'native-base';
import {
  Header,
  Left,
  Body,
  Right,
  Text,
  Icon as Icon_,
  Container,
} from 'native-base';

export default class ChatInterface extends React.Component {
  state = {
    name: '',
    user_id: -1,
    profile_id: -1,
    messages: [],
    emoji: '',
    text: '',
    emoji_modal: false,
    user: {},
  };

  componentDidMount = async () => {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    const {table} = this.props.route.params;
    await this.setState({
      table_name: this.props.table_name,
      username: this.props.username,
      sender_token: table.token,
      user_id: this.props.table_id,
      profile_id: table.table_id,
    });
    this.socket = this.props.route.params.socketRef;

    this.joinRoom();

    let thisRef = this;
    this.socket.on('receive-message', function(data) {
      const {message} = data;
      thisRef.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, {
          ...message,
          user: {
            _id: message.user._id,
          },
        }),
      }));
    });
  };

  joinRoom = () => {
    this.socket.emit('join-room', {
      room_name: `${this.state.user_id}-${this.state.profile_id}`,
    });
  };

  leaveRoom = () => {
    this.socket.emit('leave-room', {
      room_name: `${this.state.user_id}-${this.state.profile_id}`,
    });
  };

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.leaveRoom();
  }

  _keyboardDidShow = () => {
    this.setState({emoji_modal: false});
  };

  sendToSocket = message => {
    const data = {
      room_name: `${this.state.user_id}-${this.state.profile_id}`,
      message: message,
      username: this.state.username,
      table_name: this.state.table_name,
      sender_token: this.state.sender_token,
      sender_id: this.state.user_id,
      receiver_id: this.state.profile_id,
    };
    this.socket.emit('send-chat-message', data);
  };

  onSend(messages = []) {
    this.sendToSocket(messages[0]);
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  renderInput = () => {
    return (
      <>
        <TouchableOpacity
          style={{margin: 10}}
          onPress={() => {
            if (!this.state.emoji_modal) {
              Keyboard.dismiss();
            }
            this.setState(previousState => ({
              emoji_modal: !previousState.emoji_modal,
            }));
          }}>
          <Icon
            style={{color: 'grey', size: 10}}
            active
            name={this.state.emoji_modal ? 'keypad' : 'happy'}
          />
        </TouchableOpacity>
      </>
    );
  };

  render() {
    const {name} = this.state;
    return (
      <Container>
        <Header>
          <Left>
            <Icon
              style={{color: 'white'}}
              onPress={() => this.props.navigation.goBack()}
              name="arrow-round-back"
            />
          </Left>
          <Body>
            <Text style={{color: 'white', fontSize: 20}}>
              {this.props.route.params.table.username}
            </Text>
          </Body>

          <Right></Right>
        </Header>
        <GiftedChat
          text={this.state.text}
          messages={this.state.messages}
          onInputTextChanged={text => this.setState({text})}
          onSend={messages => this.onSend(messages)}
          renderActions={this.renderInput}
          user={{
            _id: this.state.user_id,
          }}
        />

        {this.state.emoji_modal ? (
          <Container style={{flex: 1}}>
            <EmojiInput
              numColumns={8}
              emojiFontSize={30}
              onEmojiSelected={emoji => {
                this.setState(previousState => ({
                  text: previousState.text + '  ' + emoji.char,
                }));
              }}
            />
          </Container>
        ) : (
          <></>
        )}
      </Container>
    );
  }
}
