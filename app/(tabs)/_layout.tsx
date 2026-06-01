import { Tabs } from 'expo-router';
import { CalendarCheck, Store, House, MessagesSquare, Megaphone } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.green,
                headerShown: false,
                tabBarStyle: {
                    display: 'flex',
                    height: 80,
                    paddingHorizontal: 20,
                    borderTopWidth: 0,
                    elevation: 0,
                    borderTopColor: 'transparent',
                    backgroundColor: COLORS.white,
                },
            }}
        >
            <Tabs.Screen
                name="events"
                options={{
                    title: 'Wydarzenia',
                    tabBarIcon: ({ color }) => <CalendarCheck size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="trade"
                options={{
                    title: 'Giełda',
                    tabBarIcon: ({ color }) => <Store size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <House size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="forum"
                options={{
                    title: 'Forum',
                    tabBarIcon: ({ color }) => <MessagesSquare size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notices"
                options={{
                    title: 'Ogłoszenia',
                    tabBarIcon: ({ color }) => <Megaphone size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}