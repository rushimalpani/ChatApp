import {SendbirdUIKitContainer} from '@sendbird/uikit-react-native';
import {MMKV} from 'react-native-mmkv';
import {platformServices} from './platformServices';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  useSendbirdChat,
  createGroupChannelListFragment,
  createGroupChannelCreateFragment,
  createGroupChannelFragment,
} from '@sendbird/uikit-react-native';
import {useGroupChannel, useConnection} from '@sendbird/uikit-chat-hooks';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Pressable, Text, View} from 'react-native';

const mmkv = new MMKV();
const RootStack = createNativeStackNavigator();

const GroupChannelListFragment = createGroupChannelListFragment();
const GroupChannelCreateFragment = createGroupChannelCreateFragment();
const GroupChannelFragment = createGroupChannelFragment();

const SignInScreen = () => {
  const navigation = useNavigation();
  const {connect} = useConnection();

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Pressable
        style={{
          width: 120,
          height: 30,
          backgroundColor: '#742DDD',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        }}
        onPress={() => {
          // Replace 'USER_ID' with your actual user ID
          connect('USER_ID', {accessToken: 'ACCESS_TOKEN'})
            .then(() => {
              navigation.replace('GroupChannelList');
            })
            .catch(error => {
              console.error('Connection failed:', error);
            });
        }}>
        <Text style={{color: 'white'}}>{'Sign in'}</Text>
      </Pressable>
    </View>
  );
};

const GroupChannelListScreen = () => {
  const navigation = useNavigation();
  return (
    <GroupChannelListFragment
      onPressCreateChannel={channelType => {
        navigation.navigate('GroupChannelCreate', {channelType});
      }}
      onPressChannel={channel => {
        navigation.navigate('GroupChannel', {channelUrl: channel.url});
      }}
    />
  );
};

const GroupChannelCreateScreen = () => {
  const navigation = useNavigation();

  return (
    <GroupChannelCreateFragment
      onCreateChannel={async channel => {
        navigation.replace('GroupChannel', {channelUrl: channel.url});
      }}
      onPressHeaderLeft={() => {
        navigation.goBack();
      }}
    />
  );
};

const GroupChannelScreen = () => {
  const navigation = useNavigation();
  const {params} = useRoute();

  const {sdk} = useSendbirdChat();
  const {channel} = useGroupChannel(sdk, params.channelUrl);
  if (!channel) return null;

  return (
    <GroupChannelFragment
      channel={channel}
      onChannelDeleted={() => {
        navigation.navigate('GroupChannelList');
      }}
      onPressHeaderLeft={() => {
        navigation.goBack();
      }}
      onPressHeaderRight={() => {
        navigation.navigate('GroupChannelSettings', {
          channelUrl: params.channelUrl,
        });
      }}
    />
  );
};

const Navigation = () => {
  const {currentUser} = useSendbirdChat();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{headerShown: false}}>
        {!currentUser ? (
          <RootStack.Screen name={'SignIn'} component={SignInScreen} />
        ) : (
          <>
            <RootStack.Screen
              name={'GroupChannelList'}
              component={GroupChannelListScreen}
            />
            <RootStack.Screen
              name={'GroupChannelCreate'}
              component={GroupChannelCreateScreen}
            />
            <RootStack.Screen
              name={'GroupChannel'}
              component={GroupChannelScreen}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SendbirdUIKitContainer
      appId={'APP_ID'} // Replace with your Sendbird application ID
      chatOptions={{localCacheStorage: mmkv}}
      platformServices={platformServices}>
      <Navigation />
    </SendbirdUIKitContainer>
  );
}
