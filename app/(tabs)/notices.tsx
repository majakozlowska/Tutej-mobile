import { View, StyleSheet } from 'react-native';
import Heading from '../../components/Heading';
import MyText from '../../components/MyText';
import { COLORS } from '../../constants/theme';

export default function NoticesScreen() {
    return (
        <View style={styles.container}>
            <Heading text="Notices" />
            <MyText text="Ważne komunikaty i powiadomienia" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});