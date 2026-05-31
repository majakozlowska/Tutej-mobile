import { View, StyleSheet } from 'react-native';
import Heading from '../../components/Heading';
import MyText from '../../components/MyText';
import { COLORS } from '../../constants/theme';

export default function TradeScreen() {
    return (
        <View style={styles.container}>
            <Heading text="Trade" />
            <MyText text="Lokalny rynek i wymiana sąsiedzka" />
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