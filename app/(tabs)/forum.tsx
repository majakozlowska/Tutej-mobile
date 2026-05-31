import { View, StyleSheet } from 'react-native';
import Heading from '../../components/Heading';
import MyText from '../../components/MyText';
import { COLORS } from '../../constants/theme';

export default function ForumScreen() {
    return (
        <View style={styles.container}>
            <Heading text="Forum" />
            <MyText text="Dyskusje lokalnej społeczności" />
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