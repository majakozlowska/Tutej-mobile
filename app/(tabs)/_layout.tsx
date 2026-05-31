import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 10,
                },
            }}
        >
            <Tabs.Screen
                name="events"
                options={{
                    title: 'Wydarzenia',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="trade"
                options={{
                    title: 'Giełda',
                    tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="forum"
                options={{
                    title: 'Forum',
                    tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notices"
                options={{
                    title: 'Ogłoszenia',
                    tabBarIcon: ({ color }) => <Ionicons name="megaphone" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}