import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS } from './theme';

export const sharedStyles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 24,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    listContent: {
        padding: 0,
    },
    card: {
        borderWidth: 2,
        borderColor: COLORS.gray,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        marginBottom: 25,
        overflow: 'hidden',
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 15,
        fontFamily: FONTS.heading,
        color: COLORS.darkGray,
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    descriptionBox: {
        fontSize: 15,
        color: '#2C3E50',
        lineHeight: 22,
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.gray,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    gridBox: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
    },
    gridBoxLabel: {
        color: COLORS.darkGray,
        fontFamily: FONTS.bold,
        fontSize: 15,
        marginBottom: 4,
    },
    gridBoxValue: {
        fontSize: 16,
        color: COLORS.black,
        fontFamily: FONTS.heading,
    }
});