import * as React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {
  Content,
  List,
  ListItem,
  Body,
  Header,
  Item,
  Container,
  Input,
  Left,
  Right,
  Icon,
} from 'native-base';

class ChatList extends React.Component {
  openChatRoom = table => {
    this.props.navigation.navigate('ChatInterface', {
      table: table,
      socketRef: this.props.socketRef,
    });
  };
  render() {
    return (
      <Container>
        <Header searchBar rounded>
          <Body>
            <Item
              style={{backgroundColor: 'white', width: '165%', height: '75%'}}
              rounded>
              <Icon name="search" style={{color: 'black'}} />
              <Input placeholder="Search" rounded />
            </Item>
          </Body>

          <Right></Right>
        </Header>
        <Content style={{height: '0%'}}>
          <Text
            style={{
              color: 'white',
              padding: '2%',
              fontSize: 20,
              fontWeight: 'bold',
            }}>
            Online Users
          </Text>
          {this.props.tables.length === 0 ? (
            <Text style={{marginLeft: '25%', fontSize: 20}}>
              No Users Online ...
            </Text>
          ) : (
            <List>
              {this.props.tables.map((item, index) => {
                return (
                  <ListItem thumbnail>
                    <Left></Left>
                    <Body style={{width: '50%', flex: 1, flexDirection: 'row'}}>
                      <Text style={{fontSize: 16}}>{item.username + '  '}</Text>
                      <View
                        style={{
                          backgroundColor: 'green',
                          width: 15,
                          height: 15,
                          borderRadius: 18 / 2,
                        }}></View>
                    </Body>

                    <Right>
                      <TouchableOpacity onPress={() => this.openChatRoom(item)}>
                        <Text>Chat </Text>
                      </TouchableOpacity>
                    </Right>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Content>
      </Container>
    );
  }
}

export default ChatList;
